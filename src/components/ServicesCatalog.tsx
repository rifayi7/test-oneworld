"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Service } from "@/db/queries";
import { Search, Sparkles, Shield, Wrench, Clock, Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ServicesCatalogProps {
  services: Service[];
}

const CATEGORIES = [
  "All",
  "Water Services",
  "Home Safety",
  "Outdoor Services",
  "Pest Control",
  "Farm Services",
];

export function ServicesCatalog({ services }: ServicesCatalogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch =
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.desc.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory =
        selectedCategory === "All" || service.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [services, searchTerm, selectedCategory]);

  return (
    <div className="container mx-auto max-w-7xl px-6 lg:px-12 py-12 space-y-12">
      {/* Title block */}
      <div className="space-y-6 max-w-3xl mx-auto text-center">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-4 py-1.5 rounded-badge">
          <Sparkles className="w-3.5 h-3.5" /> Professional Catalog
        </span>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-neutral-900 font-display">
          Our Professional Services
        </h1>
        <p className="text-sm md:text-base text-neutral-600 leading-relaxed max-w-2xl mx-auto">
          From deep well sanitization to farm maintenance and smart home setups, find background-verified experts ready to assist you.
        </p>
      </div>

      {/* Trust Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-slate-200/60 bg-white/50 backdrop-blur-sm rounded-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-black text-neutral-900 leading-tight">Verified Staff</div>
            <div className="text-xs text-slate-500">100% background checks</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-black text-neutral-900 leading-tight">Advanced Tools</div>
            <div className="text-xs text-slate-500">Commercial equipment</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-black text-neutral-900 leading-tight">On-Time Arrival</div>
            <div className="text-xs text-slate-500">Prompt and scheduled</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-sm font-black text-neutral-900 leading-tight">4.9/5 Rating</div>
            <div className="text-xs text-slate-500">Top-rated in quality</div>
          </div>
        </div>
      </div>

      {/* Filters & Search Controls */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        {/* Search bar */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search services (e.g. Well, Solar, Pluck...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-button border border-slate-200/80 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all shadow-sm text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category filtering scroll (highly touch-friendly) */}
        <div className="w-full md:w-auto overflow-x-auto flex items-center gap-2 pb-2 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4.5 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-primary-600 text-white shadow-md shadow-primary-600/10"
                    : "bg-white text-slate-600 border border-slate-200/60 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of services */}
      <div className="relative min-h-[300px]">
        <AnimatePresence mode="popLayout">
          {filteredServices.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredServices.map((service) => (
                <motion.div
                  key={service.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="group border border-slate-200/50 bg-white rounded-card overflow-hidden shadow-soft flex flex-col h-full hover:-translate-y-1.5 transition-all duration-300"
                >
                  {/* Image Container */}
                  <div className="relative h-52 w-full bg-slate-100 overflow-hidden">
                    <Image
                      src={service.img}
                      alt={service.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 360px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-badge text-[0.65rem] font-extrabold text-white tracking-wide uppercase select-none">
                      {service.category}
                    </div>
                  </div>

                  {/* Details Container */}
                  <div className="p-6 flex-grow flex flex-col justify-between text-left space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-base font-extrabold text-neutral-900 font-display">
                        {service.name}
                      </h3>
                      <p className="text-xs text-neutral-600 leading-relaxed line-clamp-3">
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

                    <div className="flex gap-3 pt-2">
                      <Link
                        href={`/services/${service.id}`}
                        className="w-1/2 py-2.5 rounded-xl border border-slate-200/80 hover:bg-slate-50 text-[0.7rem] font-extrabold text-slate-700 transition cursor-pointer select-none text-center flex items-center justify-center"
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
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-24 text-center border border-dashed border-slate-200/80 rounded-card bg-white shadow-sm"
            >
              <div className="max-w-xs mx-auto space-y-3">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-neutral-900">No Services Found</h3>
                <p className="text-xs text-slate-500">
                  We couldn&apos;t find any services matching &ldquo;{searchTerm}&rdquo; in {selectedCategory}. Try searching for something else or clearing the search.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("All");
                  }}
                  className="px-4 py-2 bg-primary-600 text-white text-xs font-bold rounded-xl hover:bg-primary-700 transition cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
