// Uploads the GraphQL documents in src/api/buildQuery.js to the animl-api operation allowlist.
// Usage: node scripts/upload-operation-manifest.mjs <dev|staging|prod> [--finalize] [--dry-run]
// Run without --finalize before deploying the bundle and with --finalize after it deploys successfully.
import { createHash } from 'node:crypto';
import { parse, print } from 'graphql';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import queries from '../src/api/buildQuery.js';

// Frontend staging talks to the dev API (see src/config.js)
const API_STAGE = { dev: 'dev', staging: 'dev', prod: 'prod' };
// Grace period for operations no stage's current bundle uses; users may still have older bundles cached
const RETENTION_DAYS = 30;
const MANIFEST_KEY = 'operation-manifest.json';
const MAX_ATTEMPTS = 5;

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
  const stats = { current: Object.keys(current).length, stillActive: 0, retired: 0, pruned: 0 };
  for (const [hash, { document, opKey, retiredAt }] of Object.entries(existing.operations)) {
    if (current[hash]) continue;
    if (active.has(hash)) {
      operations[hash] = { document, opKey };
      stats.stillActive++;
      continue;
    }
    const retired = retiredAt ?? now.toISOString();
    if (Date.parse(retired) < cutoff) {
      stats.pruned++;
      continue;
    }
    operations[hash] = { document, opKey, retiredAt: retired };
    stats.retired++;
  }
  Object.assign(operations, current);

  return {
    manifest: { version: 2, updatedAt: now.toISOString(), activeStages, operations },
    stats,
  };
}

function isWriteConflict(err) {
  const status = err.$metadata?.httpStatusCode;
  return err.name === 'PreconditionFailed' || status === 412 || status === 409;
}

const current = collectOperations();
const s3 = new S3Client({ region: 'us-west-2' });

for (let attempt = 1; ; attempt++) {
  const { manifest: existing, etag } = await fetchExisting(s3);
  const { manifest, stats } = mergeManifest(existing, current, new Date());
  console.log(
    `Operation manifest for s3://${bucket}/${MANIFEST_KEY} (${stage}${finalize ? ', finalize' : ''}): ` +
      `${stats.current} current, ${stats.stillActive} still active (previous bundle or other stages), ` +
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
    break;
  } catch (err) {
    if (!isWriteConflict(err) || attempt >= MAX_ATTEMPTS) throw err;
    console.log(`Manifest changed during upload (attempt ${attempt}); retrying...`);
    await new Promise((resolve) => setTimeout(resolve, 250 * attempt + Math.random() * 500));
  }
}
