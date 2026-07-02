---
name: media-optimize
description: Optimize images and video for landing pages and store them efficiently — convert to WebP/AVIF under weight budgets, encode video for playback AND scroll-scrubbing (all-intra HEVC + H.264), extract posters, AND upload to Cloudflare R2 (S3-compatible) with a clean shared-bucket folder structure instead of shipping in /public. Two optimization paths: CLI (ffmpeg/cwebp/avifenc) for local/build-time prep, and runtime `sharp` for in-app admin uploads. Use whenever raw assets need to become web-ready files, assets are too heavy, or you need an upload-to-R2 / object-storage media pipeline.
---

# Media optimization

Two jobs: (1) make assets web-ready under a weight budget, and (2) **store them**
— either in `public/` (small static sites) or in **Cloudflare R2** (production /
shared media across landing pages). Pick the optimization path by context:

- **Local / build-time prep** → CLI tools on this machine: **ffmpeg 8**, **cwebp**,
  **avifenc**. Deterministic, batch-friendly. (No ImageMagick needed.)
- **Runtime, inside the app** (e.g. an admin upload form) → **`sharp`** (a Node
  lib already bundled with Next.js). A serverless/Node host has no `cwebp` shell,
  so the app does the encode itself. See "Runtime optimization" + "R2 storage".

## Bundled scripts (deterministic — prefer these over retyping commands)

- `scripts/encode-scrub.sh <input> <out-basename> [--width 1280] [--fps 24] [--crf 18]`
  — produces all-intra H.264 + HEVC (`hvc1`) scrub pair and verifies
  `has_b_frames=0`. The `--fps` MUST match the client scrub fps.
- `scripts/optimize-images.sh <src> <out-dir> [--width 2000] [--q 78] [--avif] [--budget-kb 200]`
  — batch WebP/AVIF convert + resize, reports before/after, exits non-zero on
  any over-budget image.

Still confirm the intake below before running them (sizes, names, usage).

## ⛔ Intake gate — confirm before encoding

Ask via `AskUserQuestion`; encoding is lossy and overwrites — don't guess.

Required inputs:
1. **Which source files** and where they live.
2. **Usage per asset** — full-bleed hero / section image / thumbnail / OG card /
   background video / **scroll-scrubbed** video. (Drives target size + recipe.)
3. **Max display size** the asset is shown at (so we don't ship 4K for a 600px
   slot — but keep a high-res variant for 4K heroes; see `responsive-design`).
4. **Output names + location** (default `public/<section>/<name>.<ext>`, or an
   R2 key `<project>/<section>/<name>.webp` when using object storage).
5. **Format target** — WebP (safe default) or AVIF (smaller, slightly slower
   decode) for images; confirm before overwriting originals.
6. **Storage destination** — `public/` (simple/static) or **Cloudflare R2**
   (production, shared bucket, editable without redeploy). If R2: confirm the
   bucket, the project prefix (root folder), and that you have the **S3** keys
   (Access Key ID + Secret Access Key — NOT a `cfat_` Cloudflare API token; see
   "R2 storage").
7. Confirm originals are kept (don't delete `media-src/`/`photos_gen/` sources).

Never delete source files. Write optimized copies; report before/after sizes.

## Images

Pick format: **WebP** = the safe default (great ratio, universal). **AVIF** =
~20-30% smaller, use for large hero stills where every KB matters.

### WebP (cwebp)

```bash
# Photo, quality 78 (good for photographic content; 75–82 range)
cwebp -q 78 input.jpg -o public/section/name.webp

# Resize to a max width while converting (height auto with 0)
cwebp -q 78 -resize 1600 0 input.jpg -o public/section/name.webp

# Slightly sharper/heavier for hero stills
cwebp -q 82 -resize 2000 0 hero.png -o public/hero.webp
```

### AVIF (avifenc)

```bash
# Quantizer range (0=lossless … 63=worst). 20–30 is a good photo band.
avifenc --min 24 --max 30 -s 6 input.png public/hero.avif
```

### Resize-only via ffmpeg (when cwebp resize isn't enough / for batch)

```bash
ffmpeg -i input.png -vf "scale=1600:-2" -c:v libwebp -q:v 78 out.webp
```

Guidance:
- Target weights: hero still **≤ ~200KB**, section image **≤ ~150KB**, thumb
  **≤ ~50KB**. If over, drop quality 3–5 or reduce dimensions.
- Provide a **high-res variant** (e.g. 2560px) for 4K heroes alongside the
  normal one; let `next/image` `sizes` pick.
- Keep dimensions even numbers; strip metadata (cwebp/avifenc do by default).

## Runtime optimization (sharp, in-app uploads)

When the optimize happens **inside the app** (admin upload, user avatar, a CMS),
there's no shell — use `sharp`. The robust pattern is a **budget loop**: cap the
longest edge, step quality down, then shrink dimensions if still over budget.
Always `.rotate()` first (honour EXIF) and strip metadata (sharp does by default).
See `references/optimize-image.ts` for the full implementation.

```ts
// gist — full version in references/optimize-image.ts
import sharp from "sharp";
const Q = [82, 74, 66, 58, 50, 42];                  // webp; AVIF band ~ [55..26]
export async function optimizeImage(input: Buffer, { maxWidth = 1600, targetBytes = 150*1024 } = {}) {
  const enc = (w: number, q: number) =>
    sharp(input, { failOn: "none" }).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: q }).toBuffer();
  let width = Math.min((await sharp(input).metadata()).width ?? maxWidth, maxWidth);
  let out = await enc(width, Q[0]);
  for (const q of Q) { out = await enc(width, q); if (out.byteLength <= targetBytes) break; }   // 1) quality
  while (out.byteLength > targetBytes && width > 640) { width = Math.round(width*0.82); out = await enc(width, 56); } // 2) dims
  return { data: out, contentType: "image/webp", bytes: out.byteLength, width };
}
```

Pick `maxWidth` by usage: hero/band/full-bleed `1920`, section/gallery `1400`,
thumb `640`. This reliably lands photographic content **≤150KB** (often ~100KB).
Run inside a server action (Node runtime) — `sharp` is not Edge-compatible.

## Cloudflare R2 storage (don't ship images in /public for production)

For production and for media **shared across multiple landing pages**, store
optimized files in **R2** (S3-compatible object storage) instead of `/public`.
Benefits: smaller deploys, editable content without a redeploy, one CDN URL.

**Folder structure — a shared bucket, namespaced per project:**
```
<bucket>/<project>/<section>/<name>.webp
  e.g. landing-pages/laccadives-coral-trails/gallery/lagoon.webp
              hero/ brand/ featured/ gallery/ band/ package-items/ …
```
Always prefix with the **project name** at the bucket root, then a **section**
folder, then the file. Sanitize each segment to `[a-z0-9-]` (traversal-safe).
New uploads get a short slug + hash suffix to avoid collisions in the shared bucket.

**Credentials (the #1 gotcha):** R2's S3 API needs an **Access Key ID** +
**Secret Access Key** (created in R2 → *Manage R2 API Tokens*), NOT the
`cfat_…` Cloudflare API token (that's for the REST API only). Endpoint is
`https://<account_id>.r2.cloudflarestorage.com`. Enable **public access**
(`*.r2.dev` URL or a custom domain) so images are servable. Env (server-only):
```
R2_ACCOUNT_ID=  R2_ACCESS_KEY_ID=  R2_SECRET_ACCESS_KEY=
R2_BUCKET=  R2_PUBLIC_BASE_URL=https://pub-xxxx.r2.dev  R2_PROJECT_PREFIX=<project>
```
Never `NEXT_PUBLIC_`. The S3 client + key/URL helpers are in `references/r2.ts`;
deps: `npm i @aws-sdk/client-s3 sharp`.

**Upload flow** (admin form → server action, `requireEditor`-guarded):
`validate (image mime, ≤25MB) → optimizeImage(sharp) → buildKey(section,name) →
PutObject (CacheControl: public, max-age=31536000, immutable) → return publicUrl`.
Store the returned **full URL** in the DB / `content.ts`; components use plain
`<img src={url}>` (no `next/image` remotePatterns needed). For `next/image`, add
the R2 host to `images.remotePatterns`.

**Migrating an existing /public site to R2:** re-optimize every asset (some
shipped over budget), upload under the structure above, update DB rows + the seed
migration + `content.ts` to the R2 URLs, then delete the `/public` copies. Use
`scripts/migrate-to-r2.mjs` (re-optimizes, uploads, rewrites DB, writes a
`old → new` map for the `content.ts` edits). It also pulls external (e.g.
Unsplash) URLs into R2 so every image is first-party.

## Video — two distinct jobs

### A) Normal playback / background video

Standard GOP, audio stripped, faststart for streaming. Keep it light.

```bash
ffmpeg -i media-src/clip.mov -an \
  -vf "scale=1920:-2" \
  -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p \
  -g 48 -movflags +faststart \
  public/clip.mp4
```

Also ship an HEVC variant for Apple (smaller) with `-c:v libx265 ... -tag:v hvc1`.
For mobile, serve a smaller/poster source (see `web-performance`).

### B) Scroll-scrubbed video (all-intra) — the key recipe

Scroll-scrubbing seeks to arbitrary frames. With a normal GOP, every seek must
decode from the previous keyframe → stutter. Fix: make **every frame a keyframe**
(all-intra: GOP=1, no B-frames). This balloons size, so it's intentionally
**short + downscaled (720p)**. Ship **HEVC for Apple + H.264 everywhere**; skip
VP9/AV1 (they ~3× when all-intra). This matches this repo's `spotlight-scrub*`
(720p, 24fps, `has_b_frames=0`).

**H.264 all-intra:**
```bash
ffmpeg -i media-src/master.mp4 -an \
  -vf "scale=1280:-2,fps=24" \
  -c:v libx264 -preset slow -crf 18 \
  -x264-params "keyint=1:min-keyint=1:no-scenecut=1:bframes=0" \
  -pix_fmt yuv420p -movflags +faststart \
  public/spotlight-scrub.mp4
```

**HEVC all-intra (Apple — `hvc1` tag is REQUIRED for Safari playback):**
```bash
ffmpeg -i media-src/master.mp4 -an \
  -vf "scale=1280:-2,fps=24" \
  -c:v libx265 -preset slow -crf 20 \
  -x265-params "keyint=1:min-keyint=1:no-scenecut=1:bframes=0" \
  -tag:v hvc1 -pix_fmt yuv420p -movflags +faststart \
  public/spotlight-scrub-hevc.mp4
```

Notes:
- Keep scrub clips **short** (a few seconds). All-intra 720p/24fps lands around
  ~1–1.5MB/sec — this repo's 8s clips are ~10–12MB. That's expected; gate them
  behind reduced-motion + capable devices.
- The **fps is fixed (24 here)** — the scrubbing client quantizes seeks to that
  frame grid (see `video-scrub` / `utils/videoScrub.ts`). Keep encode fps and the
  client's `fps` constant in sync.
- `-an` (drop audio), `+faststart` (moov atom first), `yuv420p` (compatibility).

## Poster frames

Every video needs a poster (LCP + perceived speed). Extract a frame, then webp it.

```bash
# First frame
ffmpeg -i public/clip.mp4 -frames:v 1 -update 1 frame.png
# Or at a timestamp
ffmpeg -ss 2 -i public/clip.mp4 -frames:v 1 -update 1 frame.png
cwebp -q 82 frame.png -o public/clip-poster.webp && rm frame.png
```

## Verify after encoding

```bash
# Confirm all-intra (must print has_b_frames=0) + dims/fps
ffprobe -v error -select_streams v:0 \
  -show_entries stream=codec_name,width,height,r_frame_rate,has_b_frames \
  -of default=noprint_wrappers=1 public/spotlight-scrub.mp4

# Sizes before/after
ls -lh public/spotlight-scrub*.mp4
```

Always report the before → after size and confirm `has_b_frames=0` for scrub
encodes.

## Bundled references & scripts

- `scripts/optimize-images.sh` — batch CLI WebP/AVIF convert + resize (local prep).
- `scripts/encode-scrub.sh` — all-intra scrub video pair.
- `scripts/migrate-to-r2.mjs` — re-optimize `/public` (+ external URLs) → upload to
  R2 → update DB → write an `old→new` map for `content.ts`. Run:
  `node --env-file=.env.local scripts/migrate-to-r2.mjs`.
- `references/optimize-image.ts` — the runtime `sharp` budget-loop optimizer.
- `references/r2.ts` — the R2 S3 client + key-structure / public-URL helpers.

## Output conventions

- **Static** web-ready files → `public/<section>/`. **Production / shared media**
  → R2 at `<project>/<section>/<name>.webp`.
- Sources stay in `media-src/` (video) / `photos_gen/` (stills) — gitignored or
  large; don't ship them.
- Reference final paths/URLs from `content.ts` (or the DB), never hardcode in
  components. Secrets (R2 keys) stay server-only.

## Checklist

- [ ] Format chosen per use (WebP default / AVIF for big heroes)
- [ ] Sized to display need; 4K variant for heroes; weights within budget
- [ ] Static → `public/<section>/`; production/shared → R2 `<project>/<section>/`
- [ ] Runtime/in-app encodes use `sharp` (budget loop); CLI for local prep
- [ ] R2: S3 keys (not `cfat_`), public access on, server-only env, key sanitized
- [ ] Upload action validated + guarded; full URL stored in DB/`content.ts`
- [ ] Migrating off /public: re-optimized, DB + seed + content.ts updated, /public deleted
- [ ] Playback video: faststart, audio stripped, HEVC + H.264
- [ ] Scrub video: all-intra (`has_b_frames=0`), 720p, HEVC `hvc1` + H.264,
      encode fps == client scrub fps
- [ ] Poster extracted for every video
- [ ] Verified (ffprobe / HTTP 200 on R2 URL); before/after sizes reported
- [ ] Final paths wired into `content.ts`; sources kept
