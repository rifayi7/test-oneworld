---
name: landing-scaffold
description: Scaffold the BASE of a new landing site — folder structure, stack/config, base design system, plumbing, and one starter Hero section. Does NOT generate full page sections (those need a design reference and are built later, one at a time). Use when starting a new landing/teaser/marketing page from scratch, or when a project needs the Next.js 16 + React 19 + Tailwind v4 + TypeScript-strict skeleton and content-as-source-of-truth layout.
---

# Landing site scaffold

Bootstraps the **foundation only** — the skeleton every other landing-page skill
builds on: `design-system-tokens`, `scroll-motion`, `web-performance`,
`seo-metadata`.

## Scope — what this skill builds, and what it deliberately does NOT

You **cannot** build real landing-page sections without a design/style reference
(an image, a Figma, a competitor link, or a detailed visual brief). So this skill
stops at the base. It sets up:

- ✅ The **folder structure** + config (Next/TS/Tailwind/ESLint/PostCSS).
- ✅ The **base design system** — wire up `globals.css` with the `@theme` token
  scaffold and fonts (hand off to `design-system-tokens` to fill real values).
- ✅ Base plumbing: `layout.tsx`, trivial `page.tsx`, `SiteShell`, the shared
  `Reveal`, `content.ts` (empty shape), and the global context if there's a CTA.
- ✅ **One starter section** (a Hero placeholder) so `npm run dev` shows
  something and there's a pattern to copy.

It does **NOT**:

- ❌ Generate the full set of page sections (Vision, Features, Teaser, …).
- ❌ Invent copy, imagery, or layout for sections without a reference.

**After scaffolding, stop.** Tell the user the base is ready and that each
further section needs its own design reference. Build sections one at a time,
only once the user provides that reference — never batch-generate them blind.

## ⛔ Intake gate — collect ALL of this before writing any file

Do **not** scaffold blindly. Ask the user for every input below first — use the
`AskUserQuestion` tool, batching related questions. If an answer is missing,
ambiguous, or "I don't know", ASK; never silently assume, never insert
placeholder values without flagging them. Only start creating files once the
user has confirmed the answers (echo a short summary back and get a yes).

Required inputs:
1. **Project / package name** (e.g. `acme-landing`).
2. **New project or layer onto an existing repo?** (and the target directory).
3. **What is the site?** product / event / teaser / waitlist / portfolio — and
   single-page or multi-page.
4. **Brand name + tagline / one-line value proposition.**
5. **Key date or deadline**, if the page is time-bound (launch, event date).
6. **Planned sections (names only, for context)** — just so `content.ts` and
   `SiteShell` are shaped sensibly. Do NOT build them now; only the Hero starter
   is created. Note that each will be built later from its own design reference.
7. **Primary CTA / conversion goal** — lead modal, buy, signup, WhatsApp,
   newsletter, or none. (Drives whether `lead.tsx` context is scaffolded.)
8. **Remote image/asset hosts** that need allowlisting in `next.config.ts`
   (e.g. Unsplash, a CDN) — or "local assets only".
9. **Version policy** — pin to the versions below, or use current latest-stable
   (in which case verify them first).

If the user wants to delegate look/feel, motion, SEO, etc., note that those are
separate skills (`design-system-tokens`, `scroll-motion`, `seo-metadata`) and
their own intake will run when invoked — don't guess those answers here.

## Stack (pin these)

- **Next.js 16** (App Router) + **React 19** + **react-dom 19**
- **TypeScript 5.7+** in `strict` mode
- **Tailwind CSS v4** — CSS-first config, no `tailwind.config.js`
- **Motion v12** (`motion` package, import from `motion/react`) for animation
- **Lenis** for smooth inertia scroll
- ESLint 9 flat config via `eslint-config-next`

`package.json` dependencies should look like:

```json
{
  "dependencies": {
    "lenis": "^1.1.20",
    "motion": "^12.0.0",
    "next": "16.x",
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.0.0",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.x",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.7.2"
  }
}
```

Scripts: `dev: next dev`, `build: next build`, `start: next start`, `lint: eslint`.

## Folder structure (replicate exactly)

```
src/
  app/
    layout.tsx        # fonts, metadata, analytics, providers (see seo-metadata)
    page.tsx          # renders a single <SiteShell />, nothing else
    globals.css       # Tailwind import + @theme tokens (see design-system-tokens)
    og/route.tsx      # dynamic OG image (optional; see seo-metadata)
    _og/              # fonts + bg image bundled for the OG route
  components/
    SiteShell.tsx     # "use client" — composes sections; starts with just Hero
    Navbar.tsx        # base shell
    Hero.tsx          # the ONE starter section (placeholder until a design ref)
    Footer.tsx        # base shell
    Reveal.tsx        # shared scroll-reveal wrapper (see scroll-motion)
    # further sections added later, one per design reference
  hooks/              # e.g. useLenis.ts
  utils/              # pure helpers (scrollEase.ts, videoScrub.ts, ...)
  content.ts          # SINGLE SOURCE OF TRUTH for all copy + image paths
  lead.tsx            # global React context (modal/CTA state), if there's a CTA
public/               # static assets, grouped in subfolders by section
```

## Core conventions

1. **`content.ts` is the only place copy and asset URLs live.** Export typed
   objects (`HERO`, `EVENT`, `NAV`, `THEMES`, `IMAGES`, ...). Components import
   from it; they never hardcode strings. This makes re-skinning the page for a
   new client a single-file edit.

2. **`page.tsx` stays trivial** — it renders one client `SiteShell` component.
   Keep server/client boundary clean: the page is a Server Component; the shell
   and anything using hooks/motion is `"use client"`.

3. **`SiteShell` composes sections in narrative order** and owns page-level
   concerns (Lenis init, footer-reveal scaffolding, modal mount).

4. **One component per section**, named for the section. Sections read their
   content from `content.ts` and wrap reveals with the shared `Reveal`.

5. **Global UI state via a small typed context** (`lead.tsx` pattern): a
   provider in `layout.tsx`, a `useX()` hook that throws if used outside the
   provider. Use for the CTA/modal open-state, theme, etc.

## tsconfig essentials

- `"strict": true`, plus `noUnusedLocals`, `noUnusedParameters`,
  `noFallthroughCasesInSwitch`
- `"moduleResolution": "bundler"`, `"module": "esnext"`, `"jsx": "react-jsx"`
- Path alias: `"paths": { "@/*": ["./src/*"] }` — import as `@/components/...`

## ESLint flat config

```js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
```

## PostCSS

```js
const config = { plugins: { "@tailwindcss/postcss": {} } };
export default config;
```

## Steps to scaffold (base only)

1. Create the Next 16 app (or lay the structure over an existing one).
2. Write `package.json`, `tsconfig.json`, `postcss.config.mjs`,
   `eslint.config.mjs`, `next.config.ts` (add `images.remotePatterns` if pulling
   remote images).
3. Create the `src/` tree: `layout.tsx`, trivial `page.tsx`, `SiteShell`,
   `Navbar`/`Footer` base shells, `Reveal`, the global context (if a CTA), and
   an **empty-shape `content.ts`**.
4. Set up the **base design system**: run `design-system-tokens` to establish
   `globals.css` (`@theme` tokens + fonts). Then `seo-metadata` for `layout.tsx`
   and `scroll-motion` for the Lenis hook + `Reveal`.
5. Build **one starter Hero section** as a placeholder so `npm run dev` renders.
   `SiteShell` composes only that for now.
6. Verify it builds (`npm run build`) and runs, then **STOP**.

Then report: "Base is ready. Each section from here needs a design reference —
give me one (image / Figma / brief) and I'll build that section." Do not proceed
to generate more sections without one.

Always confirm the actual latest stable Next/React/Tailwind versions before
pinning — bump the numbers above if newer stable releases exist.
