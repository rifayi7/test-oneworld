"use client";

import { useState } from "react";
import Image from "next/image";
import { useLead } from "@/lead";
import { Reveal } from "@/components/Reveal";

interface ServiceItem {
  name: string;
  desc: string;
  price: string;
  img: string;
}

const SERVICES_DATA: Record<string, ServiceItem[]> = {
  "Water Services": [
    { name: "Deep Well Cleaning", desc: "Complete debris removal and deep cleaning of domestic wells for clean water supply.", price: "₹2,499", img: "/services/home_services.jpg" },
    { name: "Pond Cleaning", desc: "Algae removal, water treatment, and ecosystem optimization for clean backyard ponds.", price: "₹3,999", img: "/services/home_services.jpg" },
    { name: "Water Tank Cleaning", desc: "High-pressure jet wash, disinfection, and vacuum cleaning of residential water tanks.", price: "₹799", img: "/services/water_tank.jpg" },
    { name: "UV Treatment Setup", desc: "Integration of modern UV sterilizers for biological disinfection of home water supply.", price: "₹4,499", img: "/services/home_services.jpg" },
    { name: "Pipeline Cleaning", desc: "Chemical-free descaling and high-pressure flushing of building water distribution pipelines.", price: "₹1,899", img: "/services/home_services.jpg" },
    { name: "Water Purifier Installation", desc: "RO / UV / RO+UV multi-stage domestic water purifier mounting and plumbing setup.", price: "₹999", img: "/services/home_services.jpg" },
    { name: "Water Tank Filter", desc: "Installation of sediment and iron filters at water tank inlet for suspended solids removal.", price: "₹1,599", img: "/services/home_services.jpg" }
  ],
  "Home Safety": [
    { name: "CCTV Installation", desc: "Premium HD smart home camera mounting, network configuration, and live monitoring setup.", price: "₹2,999", img: "/services/cctv_install.jpg" },
    { name: "Gas Leak Detector", desc: "LPG leakage alarm mounting and gas valve safety check for kitchen protection.", price: "₹1,299", img: "/services/home_services.jpg" },
    { name: "Roof Waterproofing", desc: "Multi-layered elastomeric chemical coating to stop slabs, roofs, and walls leaking.", price: "₹9,999", img: "/services/roof_waterproof.jpg" },
    { name: "Solar Installation", desc: "Rooftop solar panel integration and grid connectivity with subsidy assistance.", price: "₹45,000", img: "/services/home_services.jpg" }
  ],
  "Outdoor Services": [
    { name: "Grass Cutting", desc: "Quick commercial brushcutter trimming of tall grass and weeds in yard gardens.", price: "₹899", img: "/services/grass_trimming.jpg" },
    { name: "Weed Removal", desc: "Manual and roots weeding of unwanted grass, weeds, and wild creepers in garden boundaries.", price: "₹799", img: "/services/grass_trimming.jpg" },
    { name: "Compound Wall Cleaning", desc: "High-pressure water washing of concrete boundary walls to remove mold and stains.", price: "₹1,499", img: "/services/home_services.jpg" },
    { name: "Interlock Cleaning", desc: "Jet washing of paved pathways and interlock tiles to restore bright clean finish.", price: "₹1,299", img: "/services/home_services.jpg" }
  ],
  "Pest Control": [
    { name: "Termite Control", desc: "Chemical injection treatment at foundation walls and wood components to kill termites.", price: "₹3,499", img: "/services/home_services.jpg" },
    { name: "Disinfection Spraying", desc: "Full space sanitization spraying for commercial, apartments, and villas.", price: "₹1,199", img: "/services/home_services.jpg" }
  ],
  "Farm Services": [
    { name: "Coconut Planting", desc: "Soil preparation, organic manuring, and planting of hybrid high-yield coconut saplings.", price: "₹499", img: "/services/home_services.jpg" },
    { name: "Basin Making", desc: "Digging and circular bunding around coconut trees for water harvesting and fertilizer feeding.", price: "₹299", img: "/services/home_services.jpg" },
    { name: "Coconut Plucking", desc: "Safe climbing and mechanical plucking of ripe coconuts and dry fronds.", price: "₹199", img: "/services/home_services.jpg" }
  ]
};

export function ServicesOverview() {
  const { openModal } = useLead();
  const categories = Object.keys(SERVICES_DATA);
  const [activeCategory, setActiveCategory] = useState(categories[0]);

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES_DATA[activeCategory].map((service) => (
              <div key={service.name} className="group border border-slate-200/50 bg-white rounded-card overflow-hidden shadow-soft flex flex-col h-full hover:-translate-y-1.5 transition-all duration-300">
                {/* Image Container */}
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                  <Image
                    src={service.img}
                    alt={service.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 300px"
                    className="object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white/95 px-3 py-1 rounded-badge text-[0.7rem] font-bold text-primary-600 shadow-sm border border-slate-100 select-none">
                    Starting {service.price}
                  </div>
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
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={openModal}
                      className="w-1/2 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-[0.7rem] font-extrabold text-slate-700 transition cursor-pointer select-none"
                    >
                      View Details
                    </button>
                    <button
                      onClick={openModal}
                      className="w-1/2 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-[0.7rem] font-extrabold text-white shadow-sm transition cursor-pointer select-none"
                    >
                      Book Service
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </Reveal>
    </section>
  );
}
