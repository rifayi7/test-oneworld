"use client";

import { Reveal } from "@/components/Reveal";
import { Search, Calendar, CheckSquare, ShieldCheck, CheckCircle, ShieldAlert } from "lucide-react";

const STEPS = [
  {
    step: "Step 1",
    title: "Choose Your Service",
    desc: "Browse our catalogs and select the home or farming solutions you need.",
    icon: Search
  },
  {
    step: "Step 2",
    title: "Select Date & Time",
    desc: "Pick a date and convenient time slot that fits your schedule.",
    icon: Calendar
  },
  {
    step: "Step 3",
    title: "Confirm Booking",
    desc: "Verify details and submit. Our support team will confirm within 15 minutes.",
    icon: CheckSquare
  },
  {
    step: "Step 4",
    title: "Our Team Visits",
    desc: "Trained and verified specialists arrive at your doorstep with equipment.",
    icon: ShieldCheck
  },
  {
    step: "Step 5",
    title: "Service Completed",
    desc: "We perform the task with high standards and clean up the workspace.",
    icon: CheckCircle
  },
  {
    step: "Step 6",
    title: "Pay Securely",
    desc: "Verify the completed service and pay securely online or via cash.",
    icon: ShieldAlert
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-white px-6 lg:px-12 scroll-mt-20">
      <Reveal>
      <div className="container mx-auto max-w-7xl text-center space-y-16">
        
        {/* Title */}
        <div className="space-y-4 max-w-xl mx-auto">
          <span className="inline-block text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-4 py-1.5 rounded-badge">
            Process
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 font-display">
            How It Works
          </h2>
          <p className="text-sm text-neutral-600">
            Six simple steps to get professional service delivered at your doorstep.
          </p>
        </div>

        {/* Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 relative">
          
          {/* Connecting Line (Only visible on large screens) */}
          <div className="hidden lg:block absolute top-1/4 left-8 right-8 h-0.5 bg-slate-100 z-0" />

          {STEPS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="relative z-10">
                <div className="flex flex-col items-center space-y-4">
                  {/* Icon Circle */}
                  <span className="w-14 h-14 rounded-full bg-white border-2 border-slate-100 text-primary-600 flex items-center justify-center shadow-soft relative group-hover:border-primary-600 transition duration-300">
                    <Icon className="w-6 h-6 stroke-[2.2]" />
                    {/* Step Number Overlay */}
                    <span className="absolute -top-1.5 -right-1.5 bg-primary-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[0.6rem] font-bold">
                      {index + 1}
                    </span>
                  </span>

                  {/* Step copy */}
                  <div className="space-y-1.5">
                    <span className="text-[0.65rem] font-black uppercase text-primary-600 tracking-wider">
                      {item.step}
                    </span>
                    <h3 className="text-xs font-black text-neutral-900 font-display leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-[0.65rem] text-neutral-600 leading-relaxed max-w-[140px] mx-auto">
                      {item.desc}
                    </p>
                  </div>
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
