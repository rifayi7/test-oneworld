"use client";

import { Reveal } from "@/components/Reveal";
import { Users, CreditCard, PenTool, Clock, ShieldCheck, Home } from "lucide-react";

const WHY_CHOOSE_DATA = [
  {
    title: "Professional Team",
    desc: "Skilled technicians trained for every service to deliver top-notch results.",
    icon: Users
  },
  {
    title: "Transparent Pricing",
    desc: "No hidden charges. Upfront quotes so you know exactly what you are paying for.",
    icon: CreditCard
  },
  {
    title: "Quality Equipment",
    desc: "We use modern tools, safety gears, and heavy machinery to execute tasks safely.",
    icon: PenTool
  },
  {
    title: "On-Time Service",
    desc: "We value and respect your schedule. Prompt arrivals and efficient turnarounds.",
    icon: Clock
  },
  {
    title: "Verified Professionals",
    desc: "Reliable, background-checked, and trusted workforce for your peace of mind.",
    icon: ShieldCheck
  },
  {
    title: "Complete Home Solutions",
    desc: "Everything under one roof. Clean, repair, maintain, and secure your properties.",
    icon: Home
  }
];

export function WhyChoose() {
  return (
    <section id="why" className="py-20 bg-slate-50 px-6 lg:px-12 scroll-mt-20">
      <Reveal>
        <div className="container mx-auto max-w-7xl text-center space-y-12">

          {/* Header Block */}
          <div className="space-y-4 max-w-xl mx-auto">
            <span className="inline-block text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-4 py-1.5 rounded-badge">
              Why Us
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 font-display">
              Why Thousands Trust Clean World Solutions
            </h2>
          </div>

          {/* Grid List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {WHY_CHOOSE_DATA.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="border border-slate-200/40 bg-white rounded-card p-8 flex flex-col items-center sm:items-start text-center sm:text-left space-y-4 shadow-soft hover:-translate-y-1 transition-all duration-300">
                  <span className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shadow-sm">
                    <Icon className="w-6 h-6 stroke-[2.2]" />
                  </span>
                  <div className="space-y-2">
                    <h3 className="text-base font-extrabold text-neutral-900 font-display">
                      {item.title}
                    </h3>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </Reveal>
    </section>
  );
}
