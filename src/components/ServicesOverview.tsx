"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { Service } from "@/db/queries";
import { parsePriceString } from "@/lib/price-utils";

interface ServicesOverviewProps {
  initialServices: Service[];
}

export function ServicesOverview({ initialServices }: ServicesOverviewProps) {
  // Transform services to map to the new category structure dynamically
  const transformedServices = initialServices.map((service) => {
    // 1. Separate Roof Waterproofing to its own category
    if (service.name === "Roof Waterproofing") {
      return { ...service, category: "Rooftop Waterproofing Services for Leakages" };
    }
    // 2. Map other categories to display names
    if (service.category === "Water Services") {
      return { ...service, category: "Drinking Water Services" };
    }
    if (service.category === "Home Safety") {
      return { ...service, category: "Home Safety Services" };
    }
    if (service.category === "Outdoor Services") {
      return { ...service, category: "Courtyard & Backyard Services" };
    }
    if (service.category === "Pest Control") {
      return { ...service, category: "Home Cleaning Services" };
    }
    return service;
  });

  // Group the services by the new category structure
  const categories = [
    "Drinking Water Services",
    "Home Safety Services",
    "Rooftop Waterproofing Services for Leakages",
    "Courtyard & Backyard Services",
    "Farm Services",
    "Home Cleaning Services",
  ].filter((cat) => transformedServices.some((s) => s.category === cat));

  const servicesByCategory = categories.reduce<Record<string, Service[]>>((acc, cat) => {
    acc[cat] = transformedServices.filter((s) => s.category === cat);
    return acc;
  }, {});

  const [activeCategory, setActiveCategory] = useState(categories[0] || "Drinking Water Services");
  const activeServices = servicesByCategory[activeCategory] || [];

  return (
    <section id="services" className="py-20 bg-white px-6 lg:px-12 scroll-mt-20">
      <Reveal>
        <div className="container mx-auto max-w-7xl text-center space-y-12">

          {/* Title Block */}
          <div className="space-y-4 max-w-2xl mx-auto">
            <span className="inline-block text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-4 py-1.5 rounded-badge">
              Service Catalogue
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 font-display">
              Every Home Care Service as You Desired
            </h2>
            <p className="text-sm md:text-base text-neutral-600 leading-relaxed">
              Professional housekeeping and hygiene solutions under one roof. Choose your category to explore
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
                        const { mainPrice, note } = parsePriceString(service.offer_price || service.price);
                        const offerVal = parseInt(mainPrice.replace(/[^0-9]/g, "")) || 0;
                        const mrpStr = service.mrp_price || `₹${(offerVal + 1000).toLocaleString("en-IN")}`;
                        return (
                          <div className="flex flex-col gap-1 pt-1 text-left">
                            <div className="flex items-center gap-2 font-display">
                              <span className="text-xs text-slate-400 line-through font-semibold">
                                {mrpStr}
                              </span>
                              <span className="text-base font-black text-primary-600">
                                {mainPrice}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold font-sans">
                                onwards
                              </span>
                            </div>
                            {note && (
                              <div className="text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg w-fit mt-1 select-none tracking-wide">
                                {note}
                              </div>
                            )}
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
