---
name: web-performance
description: Enforce the performance and accessibility rules that keep a motion-heavy cinematic landing page smooth on all devices — reduced-motion support, compositor-safe effects, image/video budgets, and efficient scroll listeners. Use when auditing a landing page for performance, fixing scroll jank/stutter, adding heavy visual effects, or before shipping. Acts as a checklist + audit skill.
---

# Web performance & accessibility (landing pages)

A motion-heavy page only feels premium if it stays at 60fps on a mid-range
phone. Apply these rules when building, and run the checklist before shipping.

## ⛔ Intake gate — establish scope and targets first

Before auditing or changing anything, confirm what you're optimizing and against
what budget. Ask via `AskUserQuestion`; don't start ripping out effects or
rewriting code on assumption.

Required inputs:
1. **Mode** — audit an existing page (report findings first, fix after
   approval), or enforce these rules while building something new?
2. **Target devices / floor** — which low-end device or browser must stay
   smooth (e.g. "mid-range Android", "iPhone SE", "must work offline-ish on 3G").
3. **Performance budget / goals** — target Lighthouse scores, max image/video
   weight, LCP/CLS targets, or "just make scroll smooth".
4. **What heavy effects are present or planned** (video, glass, grain, parallax)
   so the audit knows where to look.
5. **For fixes: permission to change behavior** — confirm before removing or
   downgrading any effect the user may care about (e.g. disabling autoplay).

When auditing, always present findings + proposed fixes and get the go-ahead
before applying changes that alter visual behavior.

## 1. Respect `prefers-reduced-motion` — non-negotiable

Global CSS kill-switch in `globals.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }
}
```

And bail in JS for the expensive stuff:

```ts
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reduced) return; // skip Lenis init, video scrubbing, autoplay carousels
```

Every effect (Lenis, video scrub, hero carousel auto-advance, parallax) must
have a reduced-motion early-return.

## 2. Compositor-safe effects (the #1 cause of scroll jank)

- **Never put `mix-blend-mode` on a fixed, full-viewport layer** (e.g. film
  grain). It forces the GPU to re-blend the entire viewport every scroll frame.
  Use a plain low-opacity overlay instead.
- Animate only **compositor-friendly** properties: `transform` and `opacity`.
  Avoid animating `width`/`height`/`top`/`left`/`filter` on scroll-frequency
  paths (one-shot reveals are fine).
- Be sparing with `backdrop-filter` (glass) — it's expensive; keep blurred
  surfaces small (navbar, modal) rather than full-screen.
- Use `overflow-x: clip` (not `hidden`) on body to avoid a scroll container.

## 3. Efficient event listeners

- Throttle scroll/resize handlers with `requestAnimationFrame` + a `ticking`
  flag — never run layout reads/writes raw on every scroll event.
- Register scroll/touch listeners `{ passive: true }`.
- Add a movement threshold before reacting (e.g. ignore <8px) to kill jitter.
- Measure dynamic element sizes with `ResizeObserver`, not resize+reflow loops.

## 4. Images

- Ship **WebP** (or AVIF) for photos; keep section images well under ~300KB.
- Lazy-load everything below the fold; eager-load only the LCP hero image.
- Always set width/height (or aspect-ratio) to prevent layout shift (CLS).
- Group assets in `public/<section>/` and reference paths via `content.ts`.
- If using remote images, allowlist hosts in `next.config.ts`
  (`images.remotePatterns`).

## 5. Video (hero / background)

- Prefer a still WebP poster + on-demand video; don't autoplay multi-MB video
  on mobile data.
- For scroll-scrubbed video, follow the `video-scrub` skill (all-intra encode,
  seek coalescing) — naive `currentTime` scrubbing stutters badly.
- Provide HEVC (Apple) + H.264 (everywhere) sources; skip VP9/AV1 for all-intra
  (they balloon ~3×).

## 6. Fonts

- `next/font` with `display: "swap"`; subset to `latin`; load only used weights.
- Reference fonts via CSS variables (see `design-system-tokens`).

## 7. Rendering strategy

- Keep `page.tsx` a Server Component; push `"use client"` down to leaf
  interactive components only.
- A data-less marketing page should be **statically rendered** (default) for the
  fastest TTFB. Only use `dynamic = "force-dynamic"` when you genuinely read
  per-request data (e.g. host-derived `metadataBase`); otherwise leave it static.

## Bundled audit script (run first when auditing)

`scripts/landing_audit.py` is a deterministic, read-only checker shared by
`web-performance`, `responsive-design`, and `seo-metadata`. Run it before the
manual checklist so review effort goes to layout/taste, not mechanical tells.

```bash
python3 scripts/landing_audit.py <project-dir>            # full report + score
python3 scripts/landing_audit.py <dir> --severity high    # only strong signals
python3 scripts/landing_audit.py <dir> --json             # machine-readable (CI)
```

It flags: `mix-blend-mode` on fixed layers, missing `prefers-reduced-motion`,
raw `<img>`, px font-sizes, deprecated/invalid JSON-LD, over-budget images/video,
missing `robots.ts`/`sitemap.ts`/`llms.txt`. Exit code = HIGH count (CI gate).
Add `audit-ignore` on a line to suppress a deliberate choice. It catches only
regex-able issues — eyeball layout, spacing, and contrast yourself.

## Pre-ship audit checklist

- [ ] `prefers-reduced-motion` disables Lenis, video scrub, autoplay, parallax
- [ ] No `mix-blend-mode` on fixed full-screen layers
- [ ] Scroll/resize handlers are rAF-throttled + passive
- [ ] LCP hero image eager + sized; everything else lazy + sized (no CLS)
- [ ] All photos are WebP/AVIF and within budget; video has poster + dual codec
- [ ] Fonts use `display: swap`, subset, minimal weights
- [ ] `next build` clean; run Lighthouse (mobile) — aim 90+ Perf, 100 A11y/SEO
- [ ] Test scroll smoothness on a real mid-range phone, not just desktop
- [ ] Keyboard focus + visible focus states on nav, CTAs, modal
