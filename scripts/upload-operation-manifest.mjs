// Uploads the GraphQL documents in src/api/buildQuery.js to the animl-api operation allowlist.
// Usage: node scripts/upload-operation-manifest.mjs <dev|staging|prod> [--dry-run]
import { createHash } from 'node:crypto';
import { parse, print } from 'graphql';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import queries from '../src/api/buildQuery.js';

// Frontend staging talks to the dev API (see src/config.js)
const API_STAGE = { dev: 'dev', staging: 'dev', prod: 'prod' };
// Keep operations from older bundles that may still be cached in users' browsers
const RETENTION_DAYS = 30;
const MANIFEST_KEY = 'operation-manifest.json';

const stage = process.argv[2];
const dryRun = process.argv.includes('--dry-run');
if (!API_STAGE[stage]) {
  console.error(
    `Usage: upload-operation-manifest.mjs <${Object.keys(API_STAGE).join('|')}> [--dry-run]`,
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
    return JSON.parse(await res.Body.transformToString());
  } catch (err) {
    if (err.name === 'NoSuchKey') return { version: 1, operations: {} };
    throw err;
  }
}

const current = collectOperations();
const now = new Date();
const cutoff = now.getTime() - RETENTION_DAYS * 24 * 60 * 60 * 1000;

const s3 = new S3Client({ region: 'us-west-2' });
const existing = await fetchExisting(s3);

const merged = {};
for (const [hash, entry] of Object.entries(existing.operations)) {
  if (!current[hash] && Date.parse(entry.lastSeen) >= cutoff) merged[hash] = entry;
}
for (const [hash, entry] of Object.entries(current)) {
  merged[hash] = { ...entry, lastSeen: now.toISOString() };
}

const manifest = { version: 1, updatedAt: now.toISOString(), operations: merged };
const retained = Object.keys(merged).length - Object.keys(current).length;
const pruned = Object.keys(existing.operations).filter((h) => !merged[h]).length;
console.log(
  `Operation manifest for s3://${bucket}/${MANIFEST_KEY}: ${Object.keys(current).length} current, ` +
    `${retained} retained from previous builds, ${pruned} pruned`,
);

if (dryRun) {
  console.log('Dry run, not uploading.');
} else {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: MANIFEST_KEY,
      Body: JSON.stringify(manifest, null, 2),
      ContentType: 'application/json',
    }),
  );
  console.log('Uploaded.');
}
