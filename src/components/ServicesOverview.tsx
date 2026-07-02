"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { Service } from "@/db/queries";

interface ServicesOverviewProps {
  initialServices: Service[];
}

export function ServicesOverview({ initialServices }: ServicesOverviewProps) {
  // Dynamically extract unique categories from initialServices database list
  const categories = initialServices.length > 0
    ? Array.from(new Set(initialServices.map((s) => s.category)))
    : [
        "Water Services",
        "Home Safety",
        "Outdoor Services",
        "Pest Control",
        "Farm Services",
      ];

  // Group the services by category
  const servicesByCategory = categories.reduce<Record<string, Service[]>>((acc, cat) => {
    acc[cat] = initialServices.filter((s) => s.category === cat);
    return acc;
  }, {});

  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const activeServices = servicesByCategory[activeCategory] || [];

  return (
    <section id="services" className="py-20 bg-white px-6 lg:px-12 scroll-mt-20">
      <Reveal>
        <div className="container mx-auto max-w-7xl text-center space-y-12">

          {/* Title Block */}
          <div className="space-y-4 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-4 py-1.5 rounded-badge">
              Services Catalog
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 font-display">
              Everything Your Home Needs
            </h2>
            <p className="text-sm md:text-base text-neutral-600 leading-relaxed">
              Professional housekeeping and maintenance solutions under one roof. Choose your category to explore.
            </p>
          </div>

          {/* Categories Tab Selector */}
          <div className="flex flex-wrap items-center justify-center gap-2 border-b border-slate-100 pb-2">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-3 rounded-xl text-xs font-extrabold transition-all duration-200 select-none cursor-pointer ${
                    isActive
                      ? "bg-primary-600 text-white shadow-md shadow-primary-600/10"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Grid List of Active Category Services */}
          {activeServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeServices.map((service) => (
                <div key={service.id} className="group border border-slate-200/50 bg-white rounded-card overflow-hidden shadow-soft flex flex-col h-full hover:-translate-y-1.5 transition-all duration-300">
                  {/* Image Container */}
                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                    <Image
                      src={service.img}
                      alt={service.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 300px"
                      className="object-cover"
                    />
                  </div>

                  {/* Details Container */}
                  <div className="p-6 flex-grow flex flex-col justify-between text-left space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-base font-extrabold text-neutral-900 font-display">
                        {service.name}
                      </h3>
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        {service.desc}
                      </p>
                      
                      {/* Price within card body */}
                      {(() => {
                        const offerVal = parseInt((service.offer_price || service.price).replace(/[^0-9]/g, "")) || 0;
                        const mrpStr = service.mrp_price || `₹${(offerVal + 1000).toLocaleString("en-IN")}`;
                        return (
                          <div className="flex items-center gap-2 pt-1 font-display">
                            <span className="text-xs text-slate-400 line-through font-semibold">
                              {mrpStr}
                            </span>
                            <span className="text-base font-black text-primary-600">
                              {service.offer_price || service.price}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold font-sans">
                              onwards
                            </span>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Link
                        href={`/services/${service.id}`}
                        className="w-1/2 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-[0.7rem] font-extrabold text-slate-700 transition cursor-pointer select-none text-center flex items-center justify-center"
                      >
                        View Details
                      </Link>
                      <Link
                        href={`/checkout?serviceId=${service.id}`}
                        className="w-1/2 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-[0.7rem] font-extrabold text-white shadow-sm transition cursor-pointer select-none text-center flex items-center justify-center"
                      >
                        Book Service
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center border border-dashed border-slate-200 rounded-card bg-slate-50/50">
              <p className="text-sm text-slate-400 font-bold">No services available in this category currently.</p>
            </div>
          )}

        </div>
      </Reveal>
    </section>
  );
}
