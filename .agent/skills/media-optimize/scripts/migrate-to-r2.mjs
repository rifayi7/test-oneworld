// ============================================================================
// TEMPLATE — adapt before running. This is the migration used for one project;
// copy it into a project's scripts/ and EDIT:
//   • the ASSETS array (file paths, sections, names, external URLs to pull in)
//   • the DB UPDATE statements to match your tables/columns (or remove them)
// Generic bits (R2 client, sharp budget-loop, key layout, env) work as-is.
// Deps: npm i sharp @aws-sdk/client-s3 @libsql/client
// ============================================================================
// One-off: re-optimize current assets, upload to Cloudflare R2 under
// <project>/<section>/<name>.webp, update DB rows, and write a mapping file
// (scripts/.r2-map.json) for the content.ts edits.
//
// Usage: node --env-file=.env.local scripts/migrate-to-r2.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@libsql/client";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const {
  R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET,
  R2_PUBLIC_BASE_URL, R2_PROJECT_PREFIX = "laccadives-coral-trails",
  TURSO_DATABASE_URL, TURSO_AUTH_TOKEN,
} = process.env;

for (const [k, v] of Object.entries({ R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_BASE_URL })) {
  if (!v) { console.error(`Missing ${k} in .env.local`); process.exit(1); }
}

const U = (id, w) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

// old = the string currently referenced in content.ts / DB. section/name = R2 layout.
const ASSETS = [
  { old: "/hero-bg.png?v=2",          file: "public/hero-bg.png",        section: "hero",     name: "hero-bg",       hero: true },
  { old: "/laccadive-logo.png",       file: "public/laccadive-logo.png", section: "brand",    name: "logo" },
  { old: "/img/agatti-aerial.webp",   file: "public/img/agatti-aerial.webp", section: "featured", name: "agatti-aerial" },
  { old: "/img/bungalow.webp",        file: "public/img/bungalow.webp",  section: "featured", name: "bungalow" },
  { old: "/img/lagoon.webp",          file: "public/img/lagoon.webp",    section: "gallery",  name: "lagoon" },
  { old: "/img/palm-beach.webp",      file: "public/img/palm-beach.webp",section: "gallery",  name: "palm-beach" },
  { old: "/img/turtle.webp",          file: "public/img/turtle.webp",    section: "gallery",  name: "turtle" },
  { old: "/img/waves.webp",           file: "public/img/waves.webp",     section: "gallery",  name: "waves" },
  { old: "/img/snorkel.webp",         file: "public/img/snorkel.webp",   section: "gallery",  name: "snorkel" },
  { old: "/img/sunset-band.webp",     file: "public/img/sunset-band.webp", section: "band",   name: "sunset" },
  // External placeholders currently in the gallery — pull into R2 too.
  { old: U("1530053969600-caed2596d242", 1400), url: U("1530053969600-caed2596d242", 1600), section: "gallery", name: "island-aerial" },
  { old: U("1507525428034-b723cf961d3e", 1000), url: U("1507525428034-b723cf961d3e", 1600), section: "gallery", name: "beach-clear" },
  { old: U("1471922694854-ff1b63b20054", 1200), url: U("1471922694854-ff1b63b20054", 1600), section: "gallery", name: "beach-wide" },
];

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});
const base = R2_PUBLIC_BASE_URL.replace(/\/+$/, "");
const QUAL = [82, 74, 66, 58, 50, 42];

async function optimize(input, maxWidth, targetBytes = 150 * 1024) {
  const enc = (w, q) => sharp(input, { failOn: "none" }).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: q }).toBuffer();
  const meta = await sharp(input).metadata();
  let width = Math.min(meta.width ?? maxWidth, maxWidth);
  let out = await enc(width, QUAL[0]);
  for (const q of QUAL) { out = await enc(width, q); if (out.byteLength <= targetBytes) break; }
  while (out.byteLength > targetBytes && width > 640) { width = Math.round(width * 0.82); out = await enc(width, 56); }
  return out;
}

async function loadInput(a) {
  if (a.file) return readFileSync(join(root, a.file));
  const r = await fetch(a.url);
  if (!r.ok) throw new Error(`fetch ${a.url} -> ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

const map = {};
for (const a of ASSETS) {
  process.stdout.write(`• ${a.section}/${a.name} … `);
  const input = await loadInput(a);
  const maxWidth = /^(hero|band|featured)$/.test(a.section) ? 1920 : 1400;
  const data = await optimize(input, maxWidth);
  const key = `${R2_PROJECT_PREFIX}/${a.section}/${a.name}.webp`;
  await s3.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: data, ContentType: "image/webp", CacheControl: "public, max-age=31536000, immutable" }));
  const url = `${base}/${key}`;
  map[a.old] = { url, kb: Math.round(data.byteLength / 1024), hero: !!a.hero };
  console.log(`${Math.round(data.byteLength / 1024)} KB → ${key}`);
}

// Update DB references (gallery + package items) by old → new.
if (TURSO_DATABASE_URL && TURSO_AUTH_TOKEN) {
  const db = createClient({ url: TURSO_DATABASE_URL, authToken: TURSO_AUTH_TOKEN });
  let n = 0;
  for (const [old, { url }] of Object.entries(map)) {
    const a = await db.execute({ sql: "UPDATE gallery_images SET src = ? WHERE src = ?", args: [url, old] });
    const b = await db.execute({ sql: "UPDATE package_items SET image = ? WHERE image = ?", args: [url, old] });
    n += (a.rowsAffected ?? 0) + (b.rowsAffected ?? 0);
  }
  console.log(`\nDB rows updated: ${n}`);
}

writeFileSync(join(root, "scripts/.r2-map.json"), JSON.stringify(map, null, 2));
console.log("\nMapping written to scripts/.r2-map.json — use it to update content.ts:");
for (const [old, v] of Object.entries(map)) console.log(`  ${old}  →  ${v.url}  (${v.kb} KB)`);
