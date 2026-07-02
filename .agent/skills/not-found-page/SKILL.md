---
name: not-found-page
description: Build a custom 404 / not-found page that inherits the site's existing design system — its color tokens, fonts, brand assets, hero imagery, and shared UI primitives (Button, Reveal) — instead of a generic error screen. Because it consumes the same role tokens and components as the rest of the site, it auto-updates whenever the main theme changes (no duplicated constants). Use when adding a 404 page, error/not-found route, "page not found" screen, or when a theme change should also restyle the 404.
---

# Design-aware 404 / not-found page

A 404 is a real surface of the brand — it should look like the site, not a
framework default. The rule that makes it **self-updating** when the theme
changes: build it from the project's *role tokens and shared primitives only*.
Never hardcode a hex, font, or copy of a value that already lives in the design
system. Then a token/font/brand change anywhere propagates to the 404 for free.

## Principle — derive, don't duplicate

The 404 must be a *consumer* of the design system, exactly like every other
section:

- **Colors** → role tokens (`bg-ink`, `text-bone`, `text-mist`, `text-accent`,
  `text-lagoon`, `bg-surface`, `border-border`). Never raw hex except over a
  photo, where a black/white wash is theme-independent.
- **Type** → the display / script / sans font tokens (`font-display`,
  `font-script`, `font-sans`). Never name a font family directly.
- **Brand + contact** → the single source of truth (`BRAND`, `CONTACT` in
  `content.ts`), not retyped strings.
- **Imagery** → the existing image pool / hero asset (`IMG.*`), so an image swap
  flows through.
- **Components** → reuse the real `Button`, `Reveal`, and any glass/eyebrow
  utilities. Don't re-implement them.

If all five hold, **a theme change requires no edits to the 404** — light↔dark,
a new accent color, a swapped display font, or rebranded copy all reflect
automatically. That is the deliverable.

## Step 1 — read the design system first

Before writing anything, inventory what the project actually exposes (names
differ per project — detect, don't assume):

1. `globals.css` / theme file → the role-token names + whether theming is
   `data-theme` driven (light/dark). See `design-system-tokens`.
2. The content source of truth (`content.ts`) → `BRAND` (name, logo, suffix),
   `CONTACT`, and the image pool (`IMG`).
3. Shared primitives → `Button` (does it take `href`? icon variants?), `Reveal`
   (scroll/mount motion). See `scroll-motion`.
4. The hero's visual language → is the site **image-led** (full-bleed photos,
   like the hero) or **flat/minimal** (token surfaces)? This picks the layout
   variant below.

## Step 2 — create the route (framework-aware)

- **Next.js App Router** → `src/app/not-found.tsx` (default export). Served
  automatically for unmatched routes and `notFound()` calls; returns a real
  **HTTP 404**. Mark `"use client"` only if it uses motion/interactivity.
- **Next.js Pages Router** → `pages/404.tsx`.
- **Remix** → a route `ErrorBoundary` / `CatchBoundary`.
- **Plain React Router** → a catch-all `<Route path="*">` element.

Keep it **standalone** (no navbar/footer) for a clean full-screen moment, unless
the site's pattern is to keep chrome on every page.

## Step 3 — pick the layout variant from the site's language

**A. Image-led** (matches an image-heavy hero): full-bleed hero image from the
pool + a legibility gradient wash + centered stack: brand logo → script eyebrow
→ giant `font-display` "404" (accent one digit) → on-brand line → subline →
primary `Button href="/"` + a contact link. White text sits over the photo wash
(theme-independent). This is the `references/not-found.template.tsx` starting
point.

**B. Token-surface** (flat/minimal sites): `bg-ink` (or `bg-surface`) full
screen, no photo. Same stack but text uses `text-bone` / `text-mist` /
`text-accent` so it flips with light/dark automatically. Optionally a faint
radial accent glow built from `bg-accent/[…]`.

Copy should carry the brand's voice, not "Error 404 — Page Not Found". Tie the
metaphor to the product (travel → "lost at sea / this island isn't on our map";
finance → "this account doesn't exist"; etc.).

## Step 4 — verify

- Build is clean; the not-found route is registered.
- Hitting a missing path returns **HTTP 404** (not 200) and renders the page.
- Toggle the theme (or change the accent token / display font) and confirm the
  404 restyles **with no edits** — the proof that it's wired to the system.

## Keeping it in sync (the self-updating contract)

- **Token / accent / font / light↔dark change** → nothing to do; the 404 reads
  the same CSS variables and re-renders.
- **Brand or contact change** → nothing to do; it reads `BRAND` / `CONTACT`.
- **Image pool swap** → nothing to do; it reads `IMG.*`.
- **Re-run this skill only for a *structural* shift** — e.g. the site moves from
  image-led to minimal (switch variant A↔B), or a new design language replaces
  the primitives. A pure restyle never needs a re-run; that's the whole point.

Anti-pattern that breaks sync: copy-pasting hex values, font names, the brand
string, or re-implementing `Button` inside the 404. If you find yourself typing
a color the theme already defines, stop and use the token.

## Correctness rules

- Real **404 status** (App Router `not-found.tsx` / Pages `404.tsx` do this;
  don't redirect a 200).
- **Role tokens only** for color/type; raw color allowed solely as a
  black/white wash over a photo.
- Reuse `Button` (`href="/"`), `Reveal`, brand logo, and contact data — no
  duplication.
- Accessible: real heading hierarchy, descriptive link text, `alt` on imagery,
  honor `prefers-reduced-motion` (the shared `Reveal` should already).
- Standalone layout unless the site keeps global chrome everywhere.

## Checklist

- [ ] Read the theme tokens, fonts, `BRAND`/`CONTACT`/`IMG`, and `Button`/`Reveal` first
- [ ] Route created for the right framework (`app/not-found.tsx` etc.); returns HTTP 404
- [ ] Layout variant chosen to match the site (image-led vs token-surface)
- [ ] Colors/type are role tokens; brand/contact/imagery come from the source of truth
- [ ] On-brand copy in the product's voice — not "Error 404"
- [ ] Build clean; missing path returns 404 and renders
- [ ] Theme toggle / accent change restyles the 404 with zero edits
