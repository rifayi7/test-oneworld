"use client";

import Image from "next/image";
import { HERO_CONTENT } from "@/content";
import { useLead } from "@/lead";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/Button";
import { motion } from "motion/react";
import { ArrowUpRight, Shield, Clock, Award, Wallet } from "lucide-react";

export function Hero() {
  const { openModal } = useLead();

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-28 pb-16 overflow-hidden bg-gradient-to-b from-[#EEF3FF] to-[#FFFFFF] px-6 lg:px-12"
    >
      {/* Background ambient glowing circles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] rounded-full bg-blue-500/5 blur-[120px]" /> {/* unslop-ignore */}
        <div className="absolute bottom-10 right-1/4 translate-x-1/2 w-[30rem] h-[30rem] rounded-full bg-green-500/5 blur-[100px]" /> {/* unslop-ignore */}
      </div>

      <div className="container mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
        
        {/* Left Column (Copy and Primitives) - 45% approx width */}
        <div className="lg:col-span-5 space-y-6 text-left">
          
          {/* Tagline Badge */}
          <Reveal direction="up" delay={0.05}>
            <div className="inline-flex items-center bg-white border border-slate-200/40 rounded-full px-5 py-2 text-xs font-bold text-blue-600 shadow-navbar select-none" /* unslop-ignore */>
              {HERO_CONTENT.eyebrow}
            </div>
          </Reveal>

          {/* Main Heading */}
          <Reveal direction="up" delay={0.1}>
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.12] text-[#1F2744] font-display">
              {HERO_CONTENT.title}{" "}
              <span className="text-blue-600">
                {HERO_CONTENT.titleHighlight}
              </span>
            </h1>
          </Reveal>

          {/* Supporting Paragraph & Trust Statement */}
          <Reveal direction="up" delay={0.15}>
            <div className="space-y-4">
              <p className="text-base md:text-lg text-[#5E6475] leading-relaxed max-w-md">
                {HERO_CONTENT.description}
              </p>
              <p className="text-sm font-extrabold text-[#1F2744]">
                {HERO_CONTENT.descriptionExtra}
              </p>
            </div>
          </Reveal>

          {/* Primary CTA Row */}
          <Reveal direction="up" delay={0.2}>
            <div className="flex items-center gap-3">
              <Button
                onClick={openModal}
                variant="solid"
                color="blue"
                className="px-8 py-4 text-sm font-extrabold shadow-soft"
              >
                {HERO_CONTENT.primaryCta}
              </Button>
              
              {/* Circular blue icon button containing arrow */}
              <motion.button
                whileHover={{ scale: 1.05, rotate: 45 }} // unslop-ignore
                whileTap={{ scale: 0.95 }}
                onClick={openModal}
                className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-600/20 cursor-pointer"
              >
                <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
              </motion.button>
            </div>
          </Reveal>

          {/* Customer Proof (5 avatars) */}
          <Reveal direction="up" delay={0.25}>
            <div className="flex items-center gap-4 pt-2">
              {/* Avatar Group */}
              <div className="flex -space-x-3.5 select-none">
                <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-white bg-slate-200">
                  <Image src="/hero/avatar.jpg" alt="Customer avatar" fill className="object-cover" />
                </div>
                <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-white bg-slate-200">
                  <Image src="/hero/avatar2.jpg" alt="Customer avatar" fill className="object-cover" />
                </div>
                <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-white bg-slate-200">
                  <Image src="/hero/avatar.jpg" alt="Customer avatar" fill className="object-cover" />
                </div>
                <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-white bg-slate-200">
                  <Image src="/hero/avatar2.jpg" alt="Customer avatar" fill className="object-cover" />
                </div>
                <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-white bg-slate-200">
                  <Image src="/hero/avatar.jpg" alt="Customer avatar" fill className="object-cover" />
                </div>
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold border-2 border-white">
                  +
                </div>
              </div>
              
              {/* Trust Details */}
              <div className="flex flex-col text-left leading-none gap-1">
                <span className="text-xs font-extrabold text-[#1F2744]">
                  {HERO_CONTENT.customerCount}
                </span>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="w-3.5 h-3.5 text-amber-500 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Feature Trust Card (Horizontal float) */}
          <Reveal direction="up" delay={0.3}>
            <div className="border border-slate-200/40 bg-white rounded-card p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 shadow-soft">
              {HERO_CONTENT.valueProps.map((prop) => (
                <div key={prop.label} className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-2">
                  <span className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                    {prop.icon === "shield" && (
                      <Shield className="w-5 h-5 stroke-[2.5]" />
                    )}
                    {prop.icon === "clock" && (
                      <Clock className="w-5 h-5 stroke-[2.5]" />
                    )}
                    {prop.icon === "badge" && (
                      <Award className="w-5 h-5 stroke-[2.5]" />
                    )}
                    {prop.icon === "wallet" && (
                      <Wallet className="w-5 h-5 stroke-[2.5]" />
                    )}
                  </span>
                  <span className="text-[0.7rem] font-bold text-slate-700 leading-snug">
                    {prop.label}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>

        </div>

        {/* Right Column (Collage visual section) - 55% approx width */}
        <div className="lg:col-span-7 relative flex items-center justify-center">
          {/* Collage Container (Generous whitespace & overlapping layout) */}
          <div className="relative h-[650px] w-full max-w-[580px] mx-auto pb-12 pt-6 select-none">
            
            {/* 1. Main Vertical Image (Top Right, rounded corners 32px) */}
            <Reveal direction="left" delay={0.2}>
              <div className="absolute top-0 right-0 w-[380px] sm:w-[410px] h-[520px] rounded-image overflow-hidden shadow-soft border border-slate-200/10">
                <Image
                  src={HERO_CONTENT.images.cleaners}
                  alt="Window Cleaning Service"
                  fill
                  sizes="(max-width: 768px) 100vw, 410px"
                  className="object-cover object-center hover:scale-103 transition-transform duration-500" // unslop-ignore
                  priority
                />
              </div>
            </Reveal>

            {/* 2. Bottom Landscape Image (Bottom Center, rounded corners, overlaps vertical) */}
            <Reveal direction="up" delay={0.28}>
              <div className="absolute bottom-4 left-0 w-[360px] sm:w-[390px] h-[240px] rounded-image overflow-hidden border-8 border-white shadow-soft z-10">
                <Image
                  src={HERO_CONTENT.images.plumber}
                  alt="Appliance Repair Technician"
                  fill
                  sizes="(max-width: 768px) 100vw, 390px"
                  className="object-cover object-center hover:scale-103 transition-transform duration-500" // unslop-ignore
                />
              </div>
            </Reveal>

            {/* 3. Floating Arrow (Top-right corner, Circular Blue button) */}
            <Reveal direction="down" delay={0.32}>
              <div className="absolute top-[-1rem] right-[-1rem] z-20">
                <span className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md cursor-pointer hover:bg-blue-700 transition">
                  <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                </span>
              </div>
            </Reveal>

            {/* 5. Customer Satisfaction KPI Card (Bottom Right, Soft Blue BG) */}
            <Reveal direction="up" delay={0.6}>
              <div className="absolute bottom-[4%] right-[-1.5rem] sm:right-[-2.5rem] bg-[#EAF1FF] border border-blue-100 rounded-card p-5 w-40 text-center shadow-soft z-30">
                <span className="block text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest leading-none">
                  {HERO_CONTENT.satisfaction.label}
                </span>
                <span className="block text-4xl font-black text-blue-600 mt-2">
                  {HERO_CONTENT.satisfaction.value}
                </span>
              </div>
            </Reveal>

          </div>
        </div>

      </div>
    </section>
  );
}
