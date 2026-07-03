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

const ASSETS = [
  { old: "/hero/cleaners_window.jpg", file: "public/hero/cleaners_window.jpg", section: "hero", name: "cleaners-window" },
  { old: "/hero/plumber_sink.jpg", file: "public/hero/plumber_sink.jpg", section: "hero", name: "plumber-sink" },
  { old: "/hero/avatar.jpg", file: "public/hero/avatar.jpg", section: "hero", name: "avatar" },
  { old: "/hero/avatar2.jpg", file: "public/hero/avatar2.jpg", section: "hero", name: "avatar2" },
  { old: "/services/home_services.jpg", file: "public/services/home_services.jpg", section: "services", name: "home-services" },
  { old: "/services/water_tank.jpg", file: "public/services/water_tank.jpg", section: "services", name: "water-tank" },
  { old: "/services/cctv_install.jpg", file: "public/services/cctv_install.jpg", section: "services", name: "cctv-install" },
  { old: "/services/roof_waterproof.jpg", file: "public/services/roof_waterproof.jpg", section: "services", name: "roof-waterproof" },
  { old: "/services/grass_trimming.jpg", file: "public/services/grass_trimming.jpg", section: "services", name: "grass-trimming" },
  { old: "/brand/logo-mark.png", file: "public/brand/logo-mark.png", section: "brand", name: "logo-mark" },
  { old: "/brand/logo-wordmark.png", file: "public/brand/logo-wordmark.png", section: "brand", name: "logo-wordmark" },
  { old: "/brand/logo.png", file: "public/brand/logo.png", section: "brand", name: "logo" }
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
  const maxWidth = /^(hero|brand)$/.test(a.section) ? 1920 : 1400;
  const data = await optimize(input, maxWidth);
  const key = `${R2_PROJECT_PREFIX}/${a.section}/${a.name}.webp`;
  await s3.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: data, ContentType: "image/webp", CacheControl: "public, max-age=31536000, immutable" }));
  const url = `${base}/${key}`;
  map[a.old] = { url, kb: Math.round(data.byteLength / 1024) };
  console.log(`${Math.round(data.byteLength / 1024)} KB → ${key}`);
}

// Update DB references (services table) by old → new.
if (TURSO_DATABASE_URL && TURSO_AUTH_TOKEN) {
  const db = createClient({ url: TURSO_DATABASE_URL, authToken: TURSO_AUTH_TOKEN });
  let n = 0;
  for (const [old, { url }] of Object.entries(map)) {
    const a = await db.execute({ sql: "UPDATE services SET img = ? WHERE img = ?", args: [url, old] });
    n += (a.rowsAffected ?? 0);
  }
  console.log(`\nDB rows updated: ${n}`);
}

writeFileSync(join(root, "scripts/.r2-map.json"), JSON.stringify(map, null, 2));
console.log("\nMapping written to scripts/.r2-map.json — use it to update code references:");
for (const [old, v] of Object.entries(map)) {
  console.log(`  ${old}  →  ${v.url}  (${v.kb} KB)`);
}
