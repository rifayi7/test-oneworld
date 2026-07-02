"use client";

import Link from "next/link";
import Image from "next/image";
import { SITE_INFO } from "@/content";
import { Reveal } from "@/components/Reveal";

export default function NotFound() {
  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden px-6 py-20 bg-slate-50 text-center">
      {/* Ambient background glow matching design tokens */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(23,130,143,0.06),transparent_70%)] z-0 pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center">
        
        {/* Brand Header */}
        <Reveal direction="down" delay={0.05}>
          <div className="flex items-center gap-2.5 mb-10 select-none">
            <Image
              src="/brand/logo-mark.png"
              alt="CleanWorld logo"
              width={215}
              height={170}
              className="h-9 w-auto"
            />
            <div className="flex flex-col leading-none text-left">
              <span className="text-base font-black tracking-tight text-neutral-900">
                {SITE_INFO.brandName}
              </span>
              <span className="text-[0.55rem] font-extrabold tracking-[0.25em] text-primary-500 uppercase mt-0.5">
                {SITE_INFO.brandSuffix}
              </span>
            </div>
          </div>
        </Reveal>

        {/* Script Eyebrow */}
        <Reveal direction="up" delay={0.1}>
          <span className="text-sm font-extrabold uppercase tracking-widest text-primary-600">
            Swept Away
          </span>
        </Reveal>

        {/* Giant Display 404 */}
        <Reveal direction="up" delay={0.15}>
          <h1 className="text-8xl sm:text-9xl font-black tracking-tighter text-neutral-900 mt-4 leading-none">
            4<span className="text-primary-600">0</span>4
          </h1>
        </Reveal>

        {/* On-brand Heading */}
        <Reveal direction="up" delay={0.2}>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-6">
            This space has been swept clean
          </h2>
        </Reveal>

        {/* Metaphorical description */}
        <Reveal direction="up" delay={0.25}>
          <p className="text-neutral-600 text-base sm:text-lg max-w-md mt-4 leading-relaxed">
            The page you are looking for has been dust-busted. Let&apos;s get you back to the main lobby.
          </p>
        </Reveal>

        {/* Action Button */}
        <div className="mt-10">
          <Reveal direction="up" delay={0.3}>
            <Link
              href="/"
              className="inline-block px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-button font-bold shadow-lg shadow-primary-600/20 transition-all duration-200"
            >
              Back to Lobby
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
