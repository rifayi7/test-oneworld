// Variant A — image-led 404 (Next.js App Router: src/app/not-found.tsx)
//
// Self-updating contract: every color is a ROLE TOKEN, every font is a font
// token, brand/contact/imagery come from the content source of truth, and it
// reuses the real Button + Reveal. Change the theme anywhere and this restyles
// for free. The only raw colors are the black wash + white text OVER the photo,
// which are theme-independent by design.
//
// Adapt the token/import names to the host project (detect them — they differ).

"use client";

import { BRAND, CONTACT, IMG } from "@/content";
import { Button } from "@/components/Button";
import { Reveal } from "@/components/Reveal";

export default function NotFound() {
  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden px-6 py-20">
      {/* Hero-language background from the existing image pool */}
      <img
        src={IMG.lagoon}
        alt="" /* decorative — set a real alt if it conveys meaning */
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Legibility wash — black/white over a photo is theme-independent */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/55 to-black/75" />

      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center text-center">
        <Reveal>
          <img
            src={BRAND.logoImage}
            alt={`${BRAND.packageName} ${BRAND.logoSuffix}`}
            className="h-11 md:h-12 w-auto object-contain mb-8 select-none"
          />
        </Reveal>

        {/* Script eyebrow — font token, accent-tinted */}
        <Reveal delay={0.05}>
          <span className="font-script text-3xl md:text-4xl text-lagoon font-normal tracking-wide leading-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
            lost in paradise
          </span>
        </Reveal>

        {/* Giant display 404 — display font token, one digit in the accent */}
        <Reveal delay={0.1}>
          <h1 className="font-display font-normal text-white text-7xl sm:text-8xl lg:text-9xl leading-none tracking-tight mt-3 drop-shadow-[0_6px_16px_rgba(0,0,0,0.5)]">
            4<span className="text-lagoon">0</span>4
          </h1>
        </Reveal>

        <Reveal delay={0.15}>
          <h2 className="font-display font-normal text-white text-2xl sm:text-3xl leading-snug mt-6 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            This island isn&apos;t on our map
          </h2>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="font-sans font-light text-white/90 text-base sm:text-lg max-w-md mt-4 leading-relaxed drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]">
            The page you&apos;re looking for drifted out to sea. Let&apos;s get you back to shore.
          </p>
        </Reveal>

        {/* Reuse the real Button + a contact link from the source of truth */}
        <Reveal delay={0.25} className="flex flex-col sm:flex-row items-center gap-5 mt-9">
          <Button label="Back to Home" href="/" iconDirection="right" />
          <a
            href={CONTACT.phoneUrls[0]}
            className="flex items-center gap-2 text-white hover:text-lagoon transition-colors duration-300 font-sans text-sm sm:text-base font-semibold"
          >
            {CONTACT.phones[0]}
          </a>
        </Reveal>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------------------
 * Variant B — token-surface 404 (flat / minimal sites, no photo)
 * Same stack, but text uses role tokens so it flips with light/dark:
 *
 *   <section className="relative min-h-screen flex items-center justify-center
 *     bg-ink px-6 py-20 text-center">
 *     <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,
 *       theme(colors.accent/8%),transparent_70%)]" />   // optional accent glow
 *     <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
 *       <span className="font-script text-3xl text-accent">page not found</span>
 *       <h1 className="font-display text-bone text-8xl mt-2">4<span className="text-accent">0</span>4</h1>
 *       <p className="font-sans text-mist mt-4">…on-brand line…</p>
 *       <Button label="Back to Home" href="/" className="mt-8" />
 *     </div>
 *   </section>
 * -------------------------------------------------------------------------- */
