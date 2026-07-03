import "server-only";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET;

/** Root folder for this project inside the shared bucket. */
export const R2_PROJECT = (process.env.R2_PROJECT_PREFIX || "laccadives-coral-trails").replace(/\/+$/, "");

/** True only when every R2 credential is present. */
export function r2Configured(): boolean {
  return Boolean(accountId && accessKeyId && secretAccessKey && bucket && process.env.R2_PUBLIC_BASE_URL);
}

let _client: S3Client | null = null;
function client(): S3Client {
  if (!r2Configured()) throw new Error("R2 is not configured — set R2_* env vars.");
  _client ??= new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: accessKeyId!, secretAccessKey: secretAccessKey! },
  });
  return _client;
}

/** Sanitize a path segment to [a-z0-9-] so keys are clean and traversal-safe. */
export function safeSegment(input: string, fallback = "misc"): string {
  const s = input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return s || fallback;
}

/** Build a key: <project>/<section>/<filename>. */
export function buildKey(section: string, filename: string): string {
  return `${R2_PROJECT}/${safeSegment(section)}/${filename}`;
}

/** Public URL for a stored key. */
export function publicUrl(key: string): string {
  const base = (process.env.R2_PUBLIC_BASE_URL || "").replace(/\/+$/, "");
  return `${base}/${key}`;
}

export async function uploadToR2(key: string, body: Buffer, contentType: string): Promise<string> {
  await client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
  return publicUrl(key);
}

export async function deleteFromR2(key: string): Promise<void> {
  await client().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

/** Recover the object key from a stored public URL (for deletes). */
export function keyFromUrl(url: string): string | null {
  const base = (process.env.R2_PUBLIC_BASE_URL || "").replace(/\/+$/, "");
  if (base && url.startsWith(base + "/")) return url.slice(base.length + 1);
  return null;
}
