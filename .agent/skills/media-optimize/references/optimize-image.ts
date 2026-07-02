import "server-only";
import sharp from "sharp";

export interface OptimizeOptions {
  /** Cap the longest edge (default 1600). */
  maxWidth?: number;
  /** "webp" (default, universal) or "avif" (smaller). */
  format?: "webp" | "avif";
  /** Target byte budget; quality/dimensions step down to fit (default 150 KB). */
  targetBytes?: number;
}

export interface OptimizedImage {
  data: Buffer;
  contentType: string;
  ext: "webp" | "avif";
  width: number;
  bytes: number;
}

const WEBP_Q = [82, 74, 66, 58, 50, 42];
const AVIF_Q = [55, 48, 42, 36, 30, 26];

/**
 * Resize + re-encode an image to fit a weight budget. Tries decreasing quality,
 * then shrinks dimensions if still over budget. Always strips metadata.
 */
export async function optimizeImage(input: Buffer, opts: OptimizeOptions = {}): Promise<OptimizedImage> {
  const maxWidth = opts.maxWidth ?? 1600;
  const format = opts.format ?? "webp";
  const targetBytes = opts.targetBytes ?? 150 * 1024;
  const qualities = format === "avif" ? AVIF_Q : WEBP_Q;

  const base = sharp(input, { failOn: "none" }).rotate(); // honour EXIF orientation
  const meta = await base.metadata();
  let width = Math.min(meta.width ?? maxWidth, maxWidth);

  const encode = (w: number, q: number) => {
    const pipe = sharp(input, { failOn: "none" }).rotate().resize({ width: w, withoutEnlargement: true });
    return (format === "avif" ? pipe.avif({ quality: q }) : pipe.webp({ quality: q })).toBuffer();
  };

  // 1) step quality down at full (capped) width
  let out = await encode(width, qualities[0]);
  for (const q of qualities) {
    out = await encode(width, q);
    if (out.byteLength <= targetBytes) break;
  }

  // 2) still over budget → shrink dimensions (never below 640px)
  const midQ = qualities[Math.floor(qualities.length / 2)];
  while (out.byteLength > targetBytes && width > 640) {
    width = Math.round(width * 0.82);
    out = await encode(width, midQ);
  }

  return {
    data: out,
    contentType: format === "avif" ? "image/avif" : "image/webp",
    ext: format,
    width,
    bytes: out.byteLength,
  };
}
