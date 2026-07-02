"use client";

import Link from "next/link";
import { SITE_INFO } from "@/content";
import { Reveal } from "@/components/Reveal";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden px-6 py-20 bg-slate-50 text-center">
      {/* Ambient background glow matching design tokens */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(45,91,255,0.06),transparent_70%)] z-0 pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center">
        
        {/* Brand Header */}
        <Reveal direction="down" delay={0.05}>
          <div className="flex items-center gap-2.5 mb-10 select-none">
            <span className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-green-500 flex items-center justify-center text-white relative shadow-sm">
              <Home className="w-5 h-5 stroke-[2.5]" />
            </span>
            <div className="flex flex-col leading-none text-left">
              <span className="text-base font-black tracking-tight text-blue-900">
                {SITE_INFO.brandName}
              </span>
              <span className="text-[0.55rem] font-extrabold tracking-[0.25em] text-green-500 uppercase mt-0.5">
                {SITE_INFO.brandSuffix}
              </span>
            </div>
          </div>
        </Reveal>

        {/* Script Eyebrow */}
        <Reveal direction="up" delay={0.1}>
          <span className="text-sm font-extrabold uppercase tracking-widest text-blue-600">
            Swept Away
          </span>
        </Reveal>

        {/* Giant Display 404 */}
        <Reveal direction="up" delay={0.15}>
          <h1 className="text-8xl sm:text-9xl font-black tracking-tighter text-[#1F2744] mt-4 leading-none">
            4<span className="text-blue-600">0</span>4
          </h1>
        </Reveal>

        {/* On-brand Heading */}
        <Reveal direction="up" delay={0.2}>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2744] mt-6">
            This space has been swept clean
          </h2>
        </Reveal>

        {/* Metaphorical description */}
        <Reveal direction="up" delay={0.25}>
          <p className="text-[#5E6475] text-base sm:text-lg max-w-md mt-4 leading-relaxed">
            The page you are looking for has been dust-busted. Let&apos;s get you back to the main lobby.
          </p>
        </Reveal>

        {/* Action Button */}
        <div className="mt-10">
          <Reveal direction="up" delay={0.3}>
            <Link
              href="/"
              className="glow-hover inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-[16px] font-bold shadow-lg shadow-blue-600/20 transition-all duration-200" // unslop-ignore
            >
              Back to Lobby
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
