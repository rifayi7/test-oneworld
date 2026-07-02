---
name: responsive-design
description: Make a landing page look intentional across the full range — from 4K/ultrawide desktops down to small mobile — using fluid type/space, constrained containers, and a defined breakpoint ladder in Tailwind v4. Use when building or auditing responsiveness, fixing layouts that stretch or break on large/small screens, sizing typography, or adding breakpoints. Covers mobile-first build AND large-screen (1920px/2560px+) handling that default Tailwind ignores.
---

# Responsive design (4K → mobile)

Two failure modes this skill prevents: (1) content that **stretches absurdly**
on 1920px+ / 4K monitors because nothing caps it, and (2) layouts that **break
or crowd** on small phones. Build mobile-first, cap at the top, and let type +
space flow fluidly between.

## ⛔ Intake gate — confirm targets before changing layout

Ask via `AskUserQuestion`; don't restyle on assumption.

Required inputs:
1. **Mode** — build responsively from the start, or audit/fix an existing page
   (report findings first, then fix on approval)?
2. **Target range** — confirm the floor and ceiling. Default: **320px → 2560px+**
   (small mobile to 4K/ultrawide). Any specific devices that MUST be perfect?
3. **Max content width** — how wide should the readable content get before it
   stops growing and just centers (e.g. ~1280–1440px)? Hero/media can go
   full-bleed; text columns should not.
4. **Behavior intent per breakpoint** — e.g. when do multi-column grids collapse
   to one column, when does the nav become a menu, what hides on mobile.
5. **For fixes:** permission before changing visual behavior the user may care
   about.

Echo the chosen range + max-width + collapse points back before editing.

## Breakpoint ladder (Tailwind v4)

Tailwind's defaults stop at `2xl` (1536px) — **too low for 4K**. Add large-screen
breakpoints in `@theme` (in `globals.css`):

```css
@theme {
  --breakpoint-3xl: 1920px;  /* 1080p / large desktop */
  --breakpoint-4xl: 2560px;  /* 1440p / 4K-class, ultrawide */
}
```

Full ladder then: `sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536 · 3xl 1920 ·
4xl 2560`. Build **mobile-first** (unprefixed = smallest; add `md:` / `lg:` /
`3xl:` upward). Never design desktop-down.

## Constrain the content (the #1 4K fix)

Wrap readable content in a centered max-width container; let only full-bleed
media escape it.

```tsx
// Content column — caps growth, centers on big screens, padded on mobile
<div className="mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-12">
  ...
</div>

// Full-bleed media (hero/marquee) — spans viewport, but text inside still
// sits in its own max-width container
<section className="w-full"> <img className="w-full" /> </section>
```

Rules:
- Text columns: cap line length (~`max-w-[65ch]` for prose) so reading doesn't
  span a 4K width.
- Use `mx-auto` + `max-w-*`; don't let sections be raw `w-full` with content.
- Pick ONE canonical container width and reuse it everywhere for alignment.

## Fluid typography & spacing with `clamp()`

Prefer fluid `clamp()` over many breakpoint font-size overrides — it scales
smoothly across the whole range instead of jumping at each breakpoint.

```css
/* clamp(MIN, PREFERRED (vw-based), MAX) */
.h1 { font-size: clamp(2.25rem, 5vw, 5rem); line-height: 1.05; }
.h2 { font-size: clamp(1.75rem, 3.5vw, 3rem); }
.lead { font-size: clamp(1rem, 1.4vw, 1.375rem); }
```

Or define fluid steps as tokens in `@theme` and use them as utilities:

```css
@theme {
  --text-display: clamp(2.5rem, 6vw, 6rem);
  --space-section: clamp(4rem, 8vw, 9rem);   /* vertical rhythm between sections */
  --space-gutter: clamp(1.25rem, 3vw, 3rem);
}
```

Guidelines:
- Always set a `MAX` so 4K doesn't get cartoonishly large type.
- Always set a `MIN` so phones stay readable (body text ≥ 16px).
- Use `rem` (respects user zoom); avoid fixed `px` for type and major spacing.
- Use `vw` in the preferred term sparingly and always bounded by clamp.

## Images & media across the range

- Serve responsive sizes (WebP/AVIF) with `next/image` `sizes` so phones don't
  download 4K assets; provide a high-res source so 4K isn't upscaled-blurry.
- Full-bleed hero: `object-fit: cover` + a sensible `object-position`; check the
  focal point holds on both ultrawide and tall-portrait mobile.
- Consider art direction (`<picture>` / different crop) when a wide hero crop
  looks empty on mobile.
- Background video: cap with `object-cover`; mobile gets a poster/lighter source
  (see `media-pipeline` / `web-performance`).

## Mobile-specific must-dos

- **Touch targets ≥ 44×44px**; spacing between tappable items.
- Test the **smallest** real width (~320–360px) — the usual break point for
  overflow, clipped wordmarks, and cramped nav.
- Watch text **contrast over imagery** on mobile (scrims/overlays often need to
  be stronger on small screens — a recurring fix on this project).
- Guard against horizontal overflow: `overflow-x: clip` on body; avoid fixed
  widths wider than the viewport; mind oversized display type and `letter-spacing`.
- Respect safe areas on notched devices (`env(safe-area-inset-*)`) for fixed
  bars.
- Collapse multi-column grids to one column; convert horizontal nav to a menu.

## Ultrawide / 4K must-dos

- Content capped and centered (above); generous side gutters, not edge-to-edge
  text.
- Bump max image resolution so heroes stay crisp at 2560px+.
- At `3xl:`/`4xl:`, optionally step up type/spacing tokens or widen the grid —
  but keep reading width sane.
- Verify fixed/sticky elements (navbar pill, modals) stay centered and don't
  drift to one side.

## Test matrix (check before shipping)

Resize through, or use devtools device presets, at minimum:
`360 · 414 · 768 · 1024 · 1280 · 1536 · 1920 · 2560` px wide — plus one
**ultrawide** (3440) and one **short-landscape mobile**. At each: no horizontal
scroll, no clipped text, focal points hold, tap targets fine, type readable,
content not stretched.

## Bundled audit script

The shared deterministic checker lives in the `web-performance` skill:
`python3 ../web-performance/scripts/landing_audit.py <dir>` — it flags raw
`<img>` and hardcoded px font-sizes (the responsive tells it can see). Run it,
then walk the test matrix by eye (regex can't judge layout).

## Checklist

- [ ] Mobile-first classes; large-screen breakpoints (`3xl`/`4xl`) added
- [ ] Content in a centered max-width container; only media is full-bleed
- [ ] Fluid `clamp()` type/space with both MIN and MAX bounds (rem-based)
- [ ] Responsive image `sizes`; high-res source for 4K; focal points verified
- [ ] Touch targets ≥44px; contrast over imagery holds on mobile
- [ ] No horizontal overflow at 320px or 2560px+
- [ ] Walked the full test matrix
