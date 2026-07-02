---
name: scroll-motion
description: Add smooth inertia scrolling (Lenis) and scroll-driven animation (Motion v12) to a landing page — the Reveal-on-scroll wrapper, scroll-progress math, shrink-on-scroll navbar, and reveal-on-scroll footer used on the Tourify site. Use when implementing scroll-triggered reveals, parallax, sticky/pinned sections, a smart navbar, or any scroll-linked motion.
---

# Scroll & motion

Two libraries: **Lenis** (smooth inertia scroll) + **Motion v12**
(`import { motion, useScroll, useTransform } from "motion/react"`). Every motion
component is `"use client"`. Every effect must degrade under reduced-motion (see
`web-performance` — this skill assumes that discipline).

## ⛔ Intake gate — confirm scope before adding motion

Motion is a taste decision and easy to overdo. Do **not** wire up effects the
user didn't ask for. Ask first via `AskUserQuestion` (multi-select is ideal for
the effect list). Confirm the selection before touching code.

Required inputs:
1. **Smooth scroll (Lenis)?** Yes/no. (Note the trade-off: it overrides native
   scroll; some users dislike it — confirm explicitly.)
2. **Which effects to include** (pick any): scroll-reveals (`Reveal`), parallax,
   pinned/sticky multi-slide sections, shrink-on-scroll navbar, reveal-on-scroll
   footer, ambient keyframes (marquee/float/flicker), scroll-scrubbed hero video
   (→ defer to the `video-scrub` skill).
3. **Which sections/elements** each chosen effect applies to.
4. **Motion intensity / feel** — subtle vs dramatic; any brand ease preference
   (default reveal `[0.22,1,0.36,1]`, UI `[0.16,1,0.3,1]`).
5. **Confirm reduced-motion is mandatory** (it always is — every effect must
   have a reduced-motion fallback; don't let the user opt out of that).

If the user just says "add nice animations", propose a specific shortlist mapped
to their sections and get confirmation before implementing.

## 1. Lenis smooth-scroll hook

A `useLenis()` hook initializes Lenis once, drives its RAF loop, hijacks in-page
anchor links, and tears down cleanly. Bail entirely under reduced-motion.

```ts
"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import { setLenis } from "@/lenisInstance";

export function useLenis() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true,
      touchMultiplier: 1.2, wheelMultiplier: 0.9 });
    setLenis(lenis);

    let raf = 0;
    const loop = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]');
      const id = a?.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (el) { e.preventDefault(); lenis.scrollTo(el as HTMLElement, { offset: -40 }); }
    };
    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onClick);
      setLenis(null); lenis.destroy();
    };
  }, []);
}
```

Expose the instance via a tiny module singleton (`lenisInstance.ts` with
`setLenis`/`getLenis`) so other code (e.g. a modal that needs `lenis.stop()`)
can reach it without prop-drilling. Call `useLenis()` once, in `SiteShell`.

Required CSS (in `globals.css`):

```css
html.lenis, html.lenis body { height: auto; }
.lenis.lenis-smooth { scroll-behavior: auto !important; }
.lenis.lenis-stopped { overflow: hidden; }
```

## 2. The `Reveal` wrapper

One shared component for "fade/blur/translate in when scrolled into view." Use a
premium ease curve and reveal **once**.

```tsx
"use client";
import { motion, type Variants } from "motion/react";

const variants: Variants = {
  hidden: { opacity: 0, y: 32, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
};

export function Reveal({ children, delay = 0, className }) {
  return (
    <motion.div className={className} variants={variants}
      initial="hidden" whileInView="show"
      viewport={{ once: true, margin: "-80px" }} transition={{ delay }}>
      {children}
    </motion.div>
  );
}
```

Stagger siblings by passing increasing `delay` (e.g. `0`, `0.08`, `0.16`).
Standard ease curves used across the site:
- Reveals / general: `[0.22, 1, 0.36, 1]`
- Apple-style UI transitions (navbar): `[0.16, 1, 0.3, 1]`

## 3. Scroll-linked effects with `useScroll`

For parallax / pinned-section scrubbing, drive values off `scrollYProgress`:

```tsx
const ref = useRef<HTMLElement>(null);
const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
```

Make the section taller than the viewport with a `sticky` inner stage, so the
extra scroll distance is "spent" on the effect instead of moving the page.

`utils/scrollEase.ts` provides the math for pinned multi-slide sections:
- `smoothstep(t)` — slow-in/slow-out easing
- `easedSlideIndex(progress, total)` — continuous eased index for a track
- `snappedSlideIndex(progress, total)` — nearest slide (active counter / snap)
- `scrollYForSlide(pinEl, i, total)` — scrollY to land on a given slide

## 4. Shrink-on-scroll navbar

A floating glass pill that collapses to an icon when scrolling **down** and
re-expands on scroll **up** or hover. Key techniques:
- Throttle the scroll handler with `requestAnimationFrame` + a `ticking` flag.
- Register the listener `{ passive: true }`.
- Use a jitter threshold (only flip direction past ~8px of movement).
- Animate `width`/`borderRadius`/child opacity with Motion; set the navbar
  subtree `data-theme="dark"` so it reads as glass over any hero.

```tsx
const isExpanded = !scrolled || scrollDirection === "up" || isHovered;
```

## 5. Reveal-on-scroll footer

The footer is pinned to the bottom at `z-0`; the opaque content layer (`z-10`)
scrolls up over it. A spacer the height of the footer reserves the scroll
distance to fully unveil it. Pattern lives in `SiteShell`:

```tsx
// measure footer height with a ResizeObserver -> footerHeight
<div className="relative z-10 bg-ink"><main>{sections}</main></div>
<div aria-hidden style={{ height: footerHeight }} />  {/* reserves scroll room */}
<div className="fixed inset-x-0 bottom-0 z-0"><Footer /></div>
```

## Reusable keyframe library

Keep ambient keyframes in `globals.css`: `marquee-left`/`marquee-right` (use a
duplicated row so `-50%` = one full set), `lamp-float`, `flame-flicker`. All are
auto-neutralized by the global reduced-motion rule.

## Hand-offs

- Scroll-scrubbed **video** specifically → use the `video-scrub` skill.
- Reduced-motion + listener-perf rules → `web-performance`.
