"use client";

import { Reveal } from "@/components/Reveal";
import { MapPin, Globe } from "lucide-react";

const FEATURED_DISTRICTS = [
  { name: "Ernakulam", coverage: "Kochi, Aluva, Kakkanad, Tripunithura, Angamaly" },
  { name: "Thiruvananthapuram", coverage: "Trivandrum City, Kazhakkoottam, Neyyattinkara" },
  { name: "Kottayam", coverage: "Kottayam Town, Changanassery, Pala, Kanjirappally" },
  { name: "Thrissur", coverage: "Thrissur City, Guruvayur, Chalakudy, Kunnamkulam" },
  { name: "Kozhikode", coverage: "Calicut City, Vadakara, Koyilandy, Ramanattukara" },
  { name: "Alappuzha", coverage: "Alappuzha Town, Cherthala, Kayamkulam, Harippad" }
];

export function ServiceAreas() {
  return (
    <section id="service-areas" className="py-20 bg-white px-6 lg:px-12 scroll-mt-20">
      <Reveal>
        <div className="container mx-auto max-w-7xl space-y-12">

          {/* Title Block */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="inline-block text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-4 py-1.5 rounded-badge">
              Coverage
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 font-display">
              Our Service Areas
            </h2>
            <p className="text-sm md:text-base text-neutral-600 leading-relaxed">
              Serving homes, apartments, villas, farms, and commercial properties across Kerala.
            </p>
          </div>

          {/* Coverage Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left: Interactive District Cards (7 Columns) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FEATURED_DISTRICTS.map((dist) => (
                <div
                  key={dist.name}
                  className="border border-slate-200/50 bg-white rounded-card p-6 flex gap-4 items-start shadow-soft hover:border-primary-200 transition-colors"
                >
                  <span className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 stroke-[2.2]" />
                  </span>
                  <div className="space-y-1.5 text-left">
                    <h3 className="text-sm font-extrabold text-neutral-900">
                      {dist.name} District
                    </h3>
                    <p className="text-[0.65rem] text-neutral-600 leading-normal">
                      {dist.coverage}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Premium Map Illustration Card (5 Columns) */}
            <div className="lg:col-span-5">
              <div className="border border-slate-200/50 bg-slate-50 rounded-card p-8 flex flex-col items-center justify-center text-center space-y-6 shadow-soft h-full min-h-[300px]">
                <span className="w-16 h-16 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center shadow-sm">
                  <Globe className="w-8 h-8 stroke-[2]" />
                </span>

                <div className="space-y-2">
                  <h3 className="text-lg font-black text-neutral-900 font-display">
                    Statewide Support
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed max-w-xs mx-auto">
                    Our mobile technician units are stationed across key districts, ensuring swift deployment for well cleaning, waterproofing, and farm maintenance services.
                  </p>
                </div>

                <div className="inline-flex items-center gap-1.5 text-[0.65rem] font-black uppercase text-primary-600 tracking-wider">
                  🟢 All Major Districts Covered
                </div>
              </div>
            </div>

          </div>

        </div>
      </Reveal>
    </section>
  );
}
