---
name: seo-metadata
description: Add SEO, social-share metadata, structured data, and AI-search readiness to a Next.js App Router landing page — generateMetadata with a per-request metadataBase, OpenGraph/Twitter cards, valid JSON-LD schema, robots.ts/sitemap.ts, llms.txt + AI-crawler policy (GEO), and an optional dynamic OG image route. Use when setting up a page's <head>, fixing broken social share previews, adding structured data, making a page citable by AI search (ChatGPT/Perplexity/Google AI Overviews), or generating share cards.
---

# SEO, metadata & social sharing (App Router)

All metadata is defined in `app/layout.tsx`. Use the Metadata API, not manual
`<head>` tags.

## ⛔ Intake gate — collect ALL of this before writing metadata

Metadata is fact-bearing (titles, dates, domains, schema fields) — wrong values
ship broken share cards and invalid structured data. Ask the user for every
input below via `AskUserQuestion` before generating anything. Never invent a
domain, a Twitter handle, an analytics ID, or schema dates; if unknown, ask or
leave a clearly-flagged TODO and tell the user.

Required inputs:
1. **Page title + meta description** (and brand name). Confirm exact copy.
2. **OG/Twitter share copy** (can differ from the page title) + a Twitter/X
   handle if they have one.
3. **Domain & host strategy** — fixed production URL (use `NEXT_PUBLIC_SITE_URL`)
   or per-request host from headers? (The latter forces per-request rendering —
   flag the TTFB trade-off; see `web-performance`.)
4. **OG image** — dynamic `next/og` route or a static image? If dynamic, ask for
   the brand fonts + background image to bundle in `app/_og/`.
5. **Structured data type** — Event / Product / Organization / WebSite / none —
   and ALL its required fields (for Event: name, start/end dates, location,
   organizer, etc.). Get real values, not placeholders.
6. **Analytics** — provider (Clarity / GA4 / Plausible / none) and the project/
   measurement ID.
7. **Favicon / icons** — ship **PNG** (32 / 180 / 192, + optional 512), served
   from `public/` (see §1.1). Have a square brand mark, or generate from the logo.
   `robots` + `sitemap` should be added for any production site (use the native
   Next files in §5, not static text files).
8. **AI-search stance** — should AI crawlers (ChatGPT/Claude/Perplexity) be
   allowed to read + cite the page? Default **yes** for marketing pages (it's
   free visibility). Confirm before blocking.

Echo the resolved title, description, domain, schema type+fields, and analytics
ID back for confirmation before writing `layout.tsx` / `og/route.tsx`.

## 1. `generateMetadata` with a per-request `metadataBase`

OG/Twitter/canonical URLs must be **absolute**, but hardcoding a production host
breaks on preview deploys and custom domains. Derive the origin from the request
headers instead, so absolute URLs follow whatever domain actually serves the
page. (This requires the page to render per-request — see note at the end.)

```ts
import type { Metadata } from "next";
import { headers } from "next/headers";

async function getMetadataBase(): Promise<URL> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto")
    ?? (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
  return new URL(`${proto}://${host}`);
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: await getMetadataBase(),
    title: "Brand · Tagline · Date",
    description: "One-sentence value proposition with the key hook.",
    icons: {
      // PNG favicons (see "Favicons & app icons" below) — not SVG.
      icon: [
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
    openGraph: {
      title: "Brand: the headline people share",
      description: "Punchy share copy — scarcity / benefit driven.",
      type: "website",
      // Relative URL -> resolved against metadataBase above. Use "/og" if you
      // ship the dynamic OG route below; otherwise a static "/og.png".
      images: [{ url: "/og", width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", images: ["/og"] },
  };
}
```

Also export `viewport` separately (Next 16 wants it split out):

```ts
import type { Viewport } from "next";
export const viewport: Viewport = { width: "device-width", initialScale: 1 };
```

## 1.1 Favicons & app icons (PNG, not SVG)

Ship favicons as **PNG** — universal support, and it avoids SVG-favicon quirks in
some browsers/tools/crawlers. Declare them via `metadata.icons` and store them in
**`public/`** — favicons must be reliably **same-origin**; don't serve them from a
CDN / object store (keep them local even if the rest of the site's media lives on
R2/a CDN).

Sizes to ship:
- `favicon-32x32.png` — browser tab
- `favicon-192x192.png` — Android / PWA
- `apple-touch-icon.png` (180×180) — iOS home screen
- `icon-512.png` (optional) — PWA manifest / splash

```ts
icons: {
  icon: [
    { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
  ],
  apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
},
```

Generate them once from a **square** brand mark with `sharp` (rasterize per size):

```js
import sharp from "sharp";
// Solid brand-colour rounded square + ONE bold white glyph (a mark, not the
// wordmark — wordmarks turn to mush at 16px). viewBox 0 0 512 512.
const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="116" fill="#0b8c96"/>
  <!-- simple, high-contrast mark here -->
</svg>`);
for (const [name, size] of [["favicon-32x32.png",32],["favicon-192x192.png",192],
                            ["apple-touch-icon.png",180],["icon-512.png",512]])
  await sharp(svg).resize(size, size).png().toFile(`public/${name}`);
```

Design rule: legible at 16px → solid background + one simple shape, high contrast.
The `media-optimize` skill's `scripts/gen-brand-assets.mjs` does exactly this
(favicons → `public/`, OG card → R2) and is a ready template.

> Next also supports file-convention icons (`app/icon.png`, `app/apple-icon.png`)
> which auto-emit the `<link>` tags. Use **either** those **or** `metadata.icons`
> — not both. The explicit `metadata.icons` form above keeps everything visible in
> one place; verify the emitted `<link rel="icon" … type="image/png">` in the
> rendered `<head>`.

## 2. JSON-LD structured data

Inject a `<script type="application/ld+json">` in the layout body. Pick the
schema type that fits (`Event`, `Product`, `Organization`, `WebSite`). Example
for an event landing page:

```tsx
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "Brand: The First Chapter",
  startDate: "2026-09-01",
  endDate: "2026-09-07",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled",
  location: { "@type": "Place", name: "Kerala Backwaters",
    address: { "@type": "PostalAddress", addressLocality: "Kerala", addressCountry: "IN" } },
  description: "...",
  organizer: { "@type": "Organization", name: "Brand", url: "https://brand.in" },
};

// in <body>:
<script type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
```

Validate with Google's Rich Results Test before shipping. Keep facts (dates,
location) in sync with `content.ts`.

### Current schema rules (don't ship invalid/deprecated markup)

- **JSON-LD only** (`<script type="application/ld+json">`). Never Microdata/RDFa.
- `@context` must be **`https://schema.org`** (https, not http).
- **Dates ISO 8601**, **prices as strings**, **enum values as full schema.org
  URLs** (e.g. `https://schema.org/InStock`), **URLs absolute**.
- **Never mark up hidden / off-page content** — Google penalizes it. The data
  must be visible on the page.
- **No placeholder text** (`[Brand Name]`) in shipped schema.
- **FAQPage is restricted** to government/health authority sites — do NOT add it
  to a commercial landing page. **HowTo is deprecated** (rich results removed
  2023) — don't use it.
- Good types for landing pages: `Organization` (+ `sameAs` to socials), `WebSite`
  (+ `SearchAction` if there's site search), `Event`, `Product`, `BreadcrumbList`,
  `Person`/`ProfilePage` (author E-E-A-T). Add an `Article`/`BlogPosting` only on
  actual articles — with `author`, `datePublished`, `dateModified`.

## 3. Analytics (optional, belongs here)

Inject analytics with `next/script` using `strategy="afterInteractive"` so it
never blocks render. Microsoft Clarity example:

```tsx
import Script from "next/script";
<Script id="clarity" strategy="afterInteractive">{`(function(c,l,a,r,i,t,y){
  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window,document,"clarity","script","PROJECT_ID");`}</Script>
```

## 4. Dynamic OG image route (optional, recommended)

Generate the share card at `app/og/route.tsx` with `next/og` `ImageResponse`,
so it always matches the brand and is served from a stable `/og` URL (resolved
per-request against `metadataBase`). Bundle real fonts + a background image in
`app/_og/` and read them at request time:

```tsx
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const dynamic = "force-static"; // cache the generated card

export async function GET() {
  const [display, body, bg] = await Promise.all([
    readFile(join(process.cwd(), "src/app/_og/Display.ttf")),
    readFile(join(process.cwd(), "src/app/_og/Body.ttf")),
    readFile(join(process.cwd(), "src/app/_og/bg.jpg")),
  ]);
  const bgSrc = `data:image/jpeg;base64,${bg.toString("base64")}`;
  return new ImageResponse(
    ( /* 1200x630 JSX: bg <img>, wordmark, tagline — flat inline styles only */ ),
    { width: 1200, height: 630, fonts: [
      { name: "Display", data: display, style: "normal", weight: 400 },
      { name: "Body", data: body, style: "normal", weight: 500 },
    ] }
  );
}
```

Notes: ImageResponse JSX supports only a CSS subset — use `display:flex`,
absolute positioning, and inline styles; no external CSS/Tailwind. Keep the card
1200×630.

## 5. Robots, sitemap & AI-search readiness (GEO)

Use Next's **native file conventions** — typed, built, and always in sync — not
hand-written static text files.

```ts
// app/robots.ts
import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://brand.in";
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      // Allow AI search crawlers so the page can be CITED in AI answers.
      // (Remove these to keep default-allow; only list to be explicit or to block.)
      { userAgent: ["GPTBot", "OAI-SearchBot", "ChatGPT-User",
                    "ClaudeBot", "PerplexityBot", "Google-Extended"], allow: "/" },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
```

```ts
// app/sitemap.ts
import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://brand.in";
  return [{ url: base, lastModified: new Date(), changeFrequency: "monthly", priority: 1 }];
}
```

**Generative Engine Optimization (GEO)** — making the page citable by ChatGPT,
Perplexity, and Google AI Overviews. This is increasingly where landing pages get
discovered; brand mentions now correlate with AI visibility more than backlinks.

- **SSR is mandatory for AI crawlers** — they do **not** execute JavaScript. The
  meaningful copy must be in the server-rendered HTML, not injected client-side.
  A Server-Component page (this stack's default; see `web-performance`) is fine;
  a fully client-rendered hero with empty SSR HTML is invisible to them.
- **Citable content structure** (apply in copy / `content.ts`):
  - A clear, self-contained answer to "what is this / who is it for" in the
    first ~60 words, near the H1 (a short TL;DR).
  - Question-style H2s, with the answer in the first sentence after each.
  - Specific facts/numbers with context (vague marketing fluff isn't quotable).
- **`llms.txt`** — emerging standard giving AI crawlers a structured site map.
  Add `public/llms.txt`:
  ```
  # Brand
  > One-line description of what this is.

  ## Key pages
  - [Home](https://brand.in/): what the page covers
  ## Key facts
  - Date / location / who it's for
  ```
- Keep exactly one `<h1>` and a clean H1→H2→H3 hierarchy.

## Note on rendering strategy

The per-request `metadataBase` trick needs the route to render per-request. The
Tourify page used `export const dynamic = "force-dynamic"` for this. If you'd
rather stay statically rendered (better TTFB — see `web-performance`), set a
fixed `metadataBase` from an env var (`NEXT_PUBLIC_SITE_URL`) instead of reading
headers. Choose one; don't do both.

## Bundled audit script

The shared deterministic checker lives in the `web-performance` skill:
`python3 ../web-performance/scripts/landing_audit.py <dir>` — it flags
deprecated/invalid JSON-LD (`HowTo`/`FAQPage`, `http://` context) and missing
`robots.ts`/`sitemap.ts`/`llms.txt`. Run it, then validate live schema with the
Rich Results Test.

## Checklist

- [ ] `title`, `description`, `metadataBase`, `viewport` set
- [ ] PNG favicons (32/180/192) in `public/`; `metadata.icons` set; `<link rel="icon" type="image/png">` verified in head
- [ ] OG + Twitter tags with an absolute 1200×630 image
- [ ] JSON-LD present, valid, non-deprecated type, no hidden-content markup
      (Rich Results Test + validator.schema.org)
- [ ] Share preview verified (e.g. opengraph.xyz / platform debuggers)
- [ ] Analytics loads `afterInteractive`
- [ ] `app/robots.ts` + `app/sitemap.ts` present (native Next files)
- [ ] AI-search: key copy is in SSR HTML, single `<h1>`, `llms.txt` added,
      AI-crawler stance set in robots
