// Uploads the GraphQL documents in src/api/buildQuery.js to the animl-api operation allowlist.
// Usage: node scripts/upload-operation-manifest.mjs <dev|staging|prod> [--finalize] [--dry-run]
// Run without --finalize before deploying the bundle and with --finalize after it deploys successfully.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { parse, print } from 'graphql';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import queries from '../src/api/buildQuery.js';

// Frontend staging talks to the dev API (see src/config.js)
const API_STAGE = { dev: 'dev', staging: 'dev', prod: 'prod' };
// Grace period for operations no stage's current bundle uses; users may still have older bundles cached
const RETENTION_DAYS = 30;
const MANIFEST_KEY = 'operation-manifest.json';
const MAX_ATTEMPTS = 5;
// animl-api re-reads the manifest on an unknown operation at most this often (missRefreshMs in operationAllowlist.ts)
const API_MISS_REFRESH_SECONDS = 30;

const stage = process.argv[2];
const dryRun = process.argv.includes('--dry-run');
const finalize = process.argv.includes('--finalize');
if (!API_STAGE[stage]) {
  console.error(
    `Usage: upload-operation-manifest.mjs <${Object.keys(API_STAGE).join('|')}> [--finalize] [--dry-run]`,
  );
  process.exit(1);
}
const bucket = `animl-operation-allowlist-${API_STAGE[stage]}`;
const frontendBucket = `animl-frontend-${stage}`;

// Factories only need inputs to build variables; any property access on this stub returns the stub
const stubInput = new Proxy(
  {},
  { get: (target, prop) => (prop === Symbol.toPrimitive ? () => '' : stubInput) },
);

function collectOperations() {
  const operations = {};
  for (const [opKey, factory] of Object.entries(queries)) {
    const { template } = factory(stubInput);
    const document = print(parse(template));
    const hash = createHash('sha256').update(document).digest('hex');
    operations[hash] = { document, opKey };
  }
  return operations;
}

async function fetchExisting(s3) {
  try {
    const res = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: MANIFEST_KEY }));
    return { manifest: JSON.parse(await res.Body.transformToString()), etag: res.ETag };
  } catch (err) {
    if (err.name === 'NoSuchKey') return { manifest: { operations: {} }, etag: null };
    throw err;
  }
}

// index.html references the build's content-hashed assets, so it identifies which bundle is live
async function isBuildLive(s3) {
  const local = readFileSync(new URL('../build/index.html', import.meta.url), 'utf8');
  try {
    const res = await s3.send(new GetObjectCommand({ Bucket: frontendBucket, Key: 'index.html' }));
    return (await res.Body.transformToString()) === local;
  } catch (err) {
    // Another deploy may be mid-upload (serverless-finch empties the bucket first)
    if (err.name === 'NoSuchKey') return false;
    throw err;
  }
}

// Operations in any stage's active set stay allowed; others are pruned RETENTION_DAYS after they leave every active set.
// Before deploy, the stage's previous set stays active alongside the new one, so a failed deploy retires nothing.
function mergeManifest(existing, current, now) {
  const previous = existing.activeStages?.[stage];
  const hashes = finalize
    ? Object.keys(current)
    : [...new Set([...(previous?.hashes ?? []), ...Object.keys(current)])];
  const activeStages = {
    ...existing.activeStages,
    [stage]: { deployedAt: finalize ? now.toISOString() : previous?.deployedAt, hashes },
  };
  const active = new Set(Object.values(activeStages).flatMap((s) => s.hashes));
  const cutoff = now.getTime() - RETENTION_DAYS * 24 * 60 * 60 * 1000;

  const operations = {};
  const stats = {
    current: Object.keys(current).length,
    added: Object.keys(current).filter((h) => !existing.operations[h]).length,
    stillActive: 0,
    retired: 0,
    pruned: 0,
  };
  for (const [hash, { document, opKey, addedAt, retiredAt }] of Object.entries(
    existing.operations,
  )) {
    if (current[hash]) continue;
    if (active.has(hash)) {
      operations[hash] = { document, opKey, addedAt };
      stats.stillActive++;
      continue;
    }
    const retired = retiredAt ?? now.toISOString();
    if (Date.parse(retired) < cutoff) {
      stats.pruned++;
      continue;
    }
    operations[hash] = { document, opKey, addedAt, retiredAt: retired };
    stats.retired++;
  }
  for (const [hash, entry] of Object.entries(current)) {
    // Entries from before addedAt was tracked have been in the manifest long enough to need no wait
    const addedAt = existing.operations[hash]
      ? existing.operations[hash].addedAt
      : now.toISOString();
    operations[hash] = { ...entry, addedAt };
  }

  return {
    manifest: { version: 2, updatedAt: now.toISOString(), activeStages, operations },
    stats,
  };
}

// Measured from when each operation first entered the manifest (by any deploy), so overlapping deploys and retries still wait
function cooldownRemainingMs(manifest, current, nowMs) {
  const addedTimes = Object.keys(current)
    .map((h) => Date.parse(manifest.operations[h]?.addedAt))
    .filter((t) => !Number.isNaN(t));
  if (!addedTimes.length) return 0;
  return Math.max(0, Math.max(...addedTimes) + (API_MISS_REFRESH_SECONDS + 5) * 1000 - nowMs);
}

function isWriteConflict(err) {
  const status = err.$metadata?.httpStatusCode;
  return err.name === 'PreconditionFailed' || status === 412 || status === 409;
}

const current = collectOperations();
const s3 = new S3Client({ region: 'us-west-2' });

for (let attempt = 1; ; attempt++) {
  const { manifest: existing, etag } = await fetchExisting(s3);

  // Checked after each read so a deploy that lands mid-finalize fails the conditional write and is re-checked
  if (finalize && !(await isBuildLive(s3))) {
    console.log(
      `Skipping finalize: build/index.html is not the live bundle in s3://${frontendBucket} ` +
        '(another deploy replaced it). Operations stay active until a live bundle is finalized.',
    );
    break;
  }

  const { manifest, stats } = mergeManifest(existing, current, new Date());
  console.log(
    `Operation manifest for s3://${bucket}/${MANIFEST_KEY} (${stage}${finalize ? ', finalize' : ''}): ` +
      `${stats.current} current (${stats.added} new), ${stats.stillActive} still active (previous bundle or other stages), ` +
      `${stats.retired} retired (in grace period), ${stats.pruned} pruned`,
  );

  if (dryRun) {
    console.log('Dry run, not uploading.');
    break;
  }

  try {
    // Conditional write so concurrent deploys can't overwrite each other's changes
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: MANIFEST_KEY,
        Body: JSON.stringify(manifest, null, 2),
        ContentType: 'application/json',
        ...(etag ? { IfMatch: etag } : { IfNoneMatch: '*' }),
      }),
    );
    console.log('Uploaded.');
  } catch (err) {
    if (!isWriteConflict(err) || attempt >= MAX_ATTEMPTS) throw err;
    console.log(`Manifest changed during upload (attempt ${attempt}); retrying...`);
    await new Promise((resolve) => setTimeout(resolve, 250 * attempt + Math.random() * 500));
    continue;
  }

  if (!finalize) {
    const waitMs = cooldownRemainingMs(manifest, current, Date.now());
    if (waitMs > 0) {
      console.log(
        `Waiting ${Math.ceil(waitMs / 1000)}s for API containers to be able to pick up recently added operations...`,
      );
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }
  break;
}
