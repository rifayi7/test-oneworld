"use client";

import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, ArrowRight } from "lucide-react";

const LEAD_CHECKLIST = [
  "Algae and mud vacuuming",
  "Eco-friendly disinfection",
  "Inlet filter setup",
  "pH test before handover",
];

const SUPPORTING = [
  {
    img: "https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/laccadives-coral-trails/services/cctv-install.webp",
    alt: "Technician installing a CCTV camera",
    eyebrow: "Power & security",
    title: "Solar power & CCTV",
    body: "System design, panel installation, and the KSEB subsidy paperwork handled for you. CCTV comes with night vision and motion alerts on your phone.",
    points: ["Up to 40% subsidy, paperwork included", "Live camera feed on mobile"],
    cta: "Get a solar quote",
    href: "/checkout?serviceId=24", // Solar Installation ID
  },
  {
    img: "https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/laccadives-coral-trails/services/grass-trimming.webp",
    alt: "Worker trimming an overgrown lawn with a brushcutter",
    eyebrow: "Home & outdoors",
    title: "Water purifiers & lawn care",
    body: "RO or UV purifier fitting with TDS calibration, and quick lawn trims with commercial brushcutters. We bag the cuttings and take them with us.",
    points: ["RO / UV setup with TDS calibration", "Lawn trimmed within 24 hours"],
    cta: "Book a lawn trim",
    href: "/checkout?serviceId=25", // Grass Cutting ID
  },
];

export function FeaturedServices() {
  return (
    <section id="featured" className="py-20 bg-slate-50 px-6 lg:px-12 scroll-mt-20">
      <Reveal>
        <div className="container mx-auto max-w-7xl space-y-14">

          {/* Header Block — left-aligned on purpose to break the centered rhythm of the surrounding sections */}
          <div className="max-w-2xl space-y-6 text-left">
            <span className="inline-block text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-4 py-1.5 rounded-badge">
              Most requested
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 font-display">
              The jobs we get called for most
            </h2>
            <p className="text-sm text-neutral-600">
              Three services make up most of our bookings. Here is exactly what each one includes.
            </p>
          </div>

          {/* Lead feature: Deep Well & Water Tank Cleaning */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 relative">
              <div className="relative h-[22rem] md:h-[26rem] rounded-image overflow-hidden shadow-soft border border-slate-200/25">
                <Image
                  src="https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/laccadives-coral-trails/services/water-tank.webp"
                  alt="Crew deep-cleaning a domestic water tank"
                  fill
                  sizes="(max-width: 1024px) 100vw, 640px"
                  className="object-cover"
                />
              </div>
              {/* Overlapping proof card, same language as the hero KPI card */}
              <div className="absolute -bottom-5 left-6 sm:left-10 bg-white rounded-card px-5 py-4 shadow-soft border border-slate-200/50 flex items-center gap-3 select-none">
                <span className="w-9 h-9 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                </span>
                <span className="text-xs font-extrabold text-neutral-900 leading-snug">
                  Deep sanitisation<br />guaranteed
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6 text-left">
              <div className="space-y-2">
                <span className="text-xs font-black text-primary-600 uppercase tracking-widest">
                  Water care
                </span>
                <h3 className="text-2xl font-black text-neutral-900 font-display leading-tight">
                  Deep well & water tank cleaning
                </h3>
              </div>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Wells and tanks collect silt, leaves, and algae through the year. We drain and vacuum out the sludge, pressure-jet the walls, sterilise with UV, and test the water before handing it back.
              </p>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-slate-700">
                {LEAD_CHECKLIST.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <ShieldCheck className="w-4.5 h-4.5 text-primary-600 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="pt-2">
                <Button href="/checkout?serviceId=3" variant="solid" color="blue">
                  Book tank cleaning
                </Button>
              </div>
            </div>
          </div>

          {/* Supporting features: compact media cards, link CTAs keep the lead CTA dominant */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
            {SUPPORTING.map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-card shadow-soft border border-slate-200/50 overflow-hidden flex flex-col sm:flex-row"
              >
                <div className="relative h-48 sm:h-auto sm:w-2/5 shrink-0 bg-slate-100">
                  <Image
                    src={item.img}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, 280px"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 sm:p-7 space-y-3 text-left">
                  <div className="space-y-1">
                    <span className="text-[0.65rem] font-black text-primary-600 uppercase tracking-widest">
                      {item.eyebrow}
                    </span>
                    <h3 className="text-lg font-black text-neutral-900 font-display leading-tight">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {item.body}
                  </p>
                  <ul className="space-y-1.5 text-xs font-semibold text-slate-700">
                    {item.points.map((point) => (
                      <li key={point} className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-primary-600 shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={item.href}
                    className="group inline-flex items-center gap-1.5 pt-1 text-sm font-extrabold text-primary-600 hover:text-primary-700 cursor-pointer"
                  >
                    {item.cta}
                    <ArrowRight className="w-4 h-4 stroke-[2.5] transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </Reveal>
    </section>
  );
}
