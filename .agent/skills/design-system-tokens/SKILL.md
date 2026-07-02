---
name: design-system-tokens
description: Set up the Tailwind v4 CSS-first design-token system, light/dark theming via a data-theme attribute, variable web fonts, and the reusable cinematic utilities (glass, eyebrow, film-grain, custom scrollbar) used on the Tourify landing page. Use when defining a landing page's visual system, adding a color/typography token system, wiring next/font, or building a theme switcher.
---

# Design system & tokens (Tailwind v4)

Tailwind v4 is configured **in CSS**, not JS. Everything lives in `globals.css`.

## ⛔ Intake gate — collect ALL of this before writing any token

Do **not** invent a palette or pick fonts blindly. Ask the user for every input
below first via `AskUserQuestion` (offer sensible options/previews where it
helps). If the user gives a brand kit, reference image, or existing site, ask
for it and derive tokens from that. Never ship an arbitrary color scheme without
confirmation; if you must propose, present it and get a yes before writing.

Required inputs:
1. **Brand / accent color(s)** and overall mood (e.g. cinematic-dark, clean
   minimal, warm editorial). Ask for hexes if they have them, else propose a
   palette and confirm.
2. **Background + text base** — dark-on-light, light-on-dark, or both.
3. **Theming** — single theme, or light **and** dark? Which is the default?
4. **Typography** — display font + body font, and the source (Google Fonts via
   `next/font`, or self-hosted files). Ask for specific families; if unknown,
   propose a pairing and confirm. Confirm which weights are actually needed.
5. **Which utilities to include** — `glass` (backdrop blur), film-`grain`,
   `eyebrow` label, custom scrollbar, `text-balance`. Don't add effects the user
   didn't ask for.
6. **Radius / corner style** (sharp, soft, pill).
7. **Any exact tokens to match** an existing design system, if one exists.

Echo the resolved palette + font pairing back to the user before generating
`globals.css`.

## 1. Tokens via `@theme`

Declare design tokens as CSS variables inside `@theme`. Tailwind auto-generates
utilities from them (`--color-gold` → `bg-gold`, `text-gold`; `--font-display`
→ `font-display`; `--radius-pill` → `rounded-pill`).

```css
@import "tailwindcss";

@theme {
  /* Palette — name by ROLE, not hue, so re-skinning is a value swap */
  --color-ink: #0a0f0c;          /* page background */
  --color-bone: #f4efe6;         /* primary text */
  --color-mist: rgba(244, 239, 230, 0.72); /* muted text */
  --color-emerald: #3f7d5a;
  --color-gold: #d9a441;         /* accent */
  --color-surface: #f4efe6;
  --color-contrast: #0a0f0c;     /* text on accent */

  --font-display: var(--font-fraunces), ui-serif, Georgia, serif;
  --font-sans: var(--font-outfit), ui-sans-serif, system-ui, sans-serif;

  --radius-pill: 999px;
}
```

Rule of thumb: tokens are **semantic** (`--color-surface`, `--color-contrast`),
not literal (`--color-green-500`). Sections then never reference raw hexes.

## 2. Light/dark via `data-theme` attribute

Do **not** rely on `prefers-color-scheme` alone. Set `data-theme` on `<html>`
(or any subtree) and redefine the same token variables under each theme. This
lets you theme a single component (e.g. a dark navbar on a light page) by
putting `data-theme="dark"` on just that element.

```css
:root { color-scheme: light; }

[data-theme="light"] {
  color-scheme: light;
  --color-ink: #f3efea;
  --color-bone: #121816;
  --color-mist: rgba(18, 24, 22, 0.62);
  /* ...redefine every token that flips... */
}

[data-theme="dark"] {
  color-scheme: dark;
  --color-ink: #0a0f0c;
  --color-bone: #f4efe6;
  /* ... */
}
```

In `layout.tsx`, set the default: `<html data-theme="light">`. A theme toggle
just rewrites the attribute. Add a smooth transition on `body`:

```css
body {
  background: var(--color-ink);
  color: var(--color-bone);
  transition: background-color .45s ease, color .45s ease;
}
```

## 3. Variable fonts via `next/font`

Load fonts in `layout.tsx`, expose them as CSS variables, and reference those
variables in the `@theme` font tokens.

```ts
import { Fraunces, Outfit } from "next/font/google";

const fraunces = Fraunces({ subsets: ["latin"], axes: ["opsz"],
  variable: "--font-fraunces", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], weight: ["300","400","500","600"],
  variable: "--font-outfit", display: "swap" });

// <html className={`${fraunces.variable} ${outfit.variable}`}>
```

Always use `display: "swap"` (avoids invisible-text FOIT — a CWV concern).
Pull only the weights/subsets you use.

## 4. Reusable utilities (`@utility`)

Define custom utilities with `@utility` so they compose with Tailwind variants.

```css
@utility glass {
  background: rgba(20, 36, 27, 0.35);
  backdrop-filter: blur(12px) saturate(140%);
  -webkit-backdrop-filter: blur(12px) saturate(140%);
  border: 1px solid rgba(244, 239, 230, 0.12);
  transition: background-color .45s ease, border-color .45s ease;
}

@utility text-balance { text-wrap: balance; }
```

Theme-aware glass — redefine per theme, and match BOTH nested and self cases so
an element that *is* the glass (e.g. the navbar with `data-theme="dark"`) gets
the right look:

```css
[data-theme="light"] .glass, [data-theme="light"].glass { /* light glass */ }
[data-theme="dark"]  .glass, [data-theme="dark"].glass  { /* dark glass */ }
```

The `eyebrow` label style (small uppercase tracked accent text above headings):

```css
.eyebrow {
  font-family: var(--font-sans); font-weight: 500;
  letter-spacing: 0.32em; text-transform: uppercase;
  font-size: 0.72rem; color: var(--color-gold-soft);
}
```

## 5. Cinematic finishing touches

- **Film grain** — a fixed full-screen `::after` speckle for filmic texture.
  IMPORTANT: do NOT use `mix-blend-mode` on it — a blended fixed layer forces
  the compositor to re-blend the whole viewport every scroll frame and causes
  stutter. Use a plain low-opacity (`0.03–0.04`) SVG `feTurbulence` data-URI.

  ```css
  .grain::after {
    content: ""; position: fixed; inset: 0; pointer-events: none;
    z-index: 60; opacity: 0.04;
    background-image: url("data:image/svg+xml,%3Csvg ...feTurbulence...%3E");
  }
  ```

- **Custom scrollbar** — thin, themed, to preserve the cinematic feel
  (`::-webkit-scrollbar { width: 8px }`, themed track + rounded thumb).

- **Global polish** — `-webkit-font-smoothing: antialiased`,
  `text-rendering: optimizeLegibility`, `overflow-x: clip` on body,
  `::selection` in brand colors.

## Hand-offs

- Reduced-motion handling for these effects lives in `web-performance`.
- Lenis-related CSS classes (`html.lenis`, `.lenis-smooth`) come from
  `scroll-motion`.
