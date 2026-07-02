"use client";

import { useState } from "react";
import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/Button";
import { useLead } from "@/lead";

interface GalleryItem {
  name: string;
  beforeDesc: string;
  afterDesc: string;
  img: string;
}

const GALLERY_DATA: Record<string, GalleryItem> = {
  "Water Tank": {
    name: "Water Tank Cleaning",
    beforeDesc: "Silt deposits, algae growth, and bacterial sludge gathered at the bottom and walls.",
    afterDesc: "High pressure jet washing, antibacterial sanitization, and spotless vacuumed surface.",
    img: "/services/water_tank.jpg"
  },
  "Grass Cutting": {
    name: "Grass & Wild Weed Clearing",
    beforeDesc: "Overgrown weed vegetation, safety hazard, potential snake/pest shelter.",
    afterDesc: "Neatly cut lawns, trimmed edges, clean visible compound boundaries.",
    img: "/services/grass_trimming.jpg"
  },
  "Roof Waterproofing": {
    name: "Roof Leakage Coating",
    beforeDesc: "Cracked concrete slab, water dampness, interior wall fungus build-up.",
    afterDesc: "Elastomeric multi-coat protective chemical sealing applied, leak-proof finish.",
    img: "/services/roof_waterproof.jpg"
  },
  "Deep Well": {
    name: "Deep Well Restoration",
    beforeDesc: "Fallen leaves, mud accumulation, murky colored drinking water.",
    afterDesc: "Debris vacuumed, descaled wall surface, clear clean groundwater.",
    img: "/services/home_services.jpg"
  }
};

export function BeforeAfter() {
  const { openModal } = useLead();
  const tabs = Object.keys(GALLERY_DATA);
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [sliderPosition, setSliderPosition] = useState(50); // percentage

  const activeItem = GALLERY_DATA[activeTab];

  return (
    <section id="gallery" className="py-20 bg-white px-6 lg:px-12 scroll-mt-20">
      <Reveal>
      <div className="container mx-auto max-w-7xl space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <span className="text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-4 py-1.5 rounded-badge">
            Results
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 font-display">
            Before & After Gallery
          </h2>
          <p className="text-sm text-neutral-600">
            Real proof of our cleaning and restoration work. Drag the slider to compare.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-b border-slate-100 pb-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 select-none cursor-pointer ${
                  isActive
                    ? "bg-primary-600 text-white shadow-md shadow-primary-600/10"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Comparison Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Slider Comparison - 7 Columns */}
          <div className="lg:col-span-7 relative h-[24rem] sm:h-[28rem] rounded-image overflow-hidden shadow-soft border border-slate-200/40 select-none">
            {/* After Image (Full width) */}
            <div className="absolute inset-0 w-full h-full">
              <Image
                src={activeItem.img}
                alt="After cleaning results"
                fill
                sizes="(max-width: 768px) 100vw, 650px"
                className="object-cover"
              />
              <span className="absolute bottom-4 right-4 bg-primary-600 text-white text-[0.65rem] font-black uppercase px-3 py-1 rounded-md z-20">
                After Clean
              </span>
            </div>

            {/* Before Image (Cropped by Slider Position) */}
            <div
              className="absolute inset-0 h-full overflow-hidden border-r-2 border-white z-10"
              style={{ width: `${sliderPosition}%` }}
            >
              <div className="absolute inset-0 w-[650px] h-full min-w-full">
                <Image
                  src={activeItem.img}
                  alt="Before cleaning state"
                  fill
                  sizes="(max-width: 768px) 100vw, 650px"
                  className="object-cover filter grayscale contrast-125 brightness-50 sepia-[15%]" // simulated dirty before look
                />
              </div>
              <span className="absolute bottom-4 left-4 bg-slate-900 text-white text-[0.65rem] font-black uppercase px-3 py-1 rounded-md z-20">
                Before Clean
              </span>
            </div>

            {/* Drag Handle Overlay */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
            />

            {/* Slider Center Line Drag Handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 pointer-events-none"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary-600 border-2 border-white text-white flex items-center justify-center shadow-md">
                ↔
              </div>
            </div>
          </div>

          {/* Details side info - 5 Columns */}
          <div className="lg:col-span-5 text-left space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-black text-primary-600 uppercase tracking-widest">
                Case Study
              </span>
              <h3 className="text-2xl font-black text-neutral-900 font-display">
                {activeItem.name}
              </h3>
            </div>

            <div className="space-y-4">
              <div className="border-l-4 border-slate-900 pl-4 space-y-1">
                <h4 className="text-xs font-extrabold text-neutral-900">
                  Before Treatment:
                </h4>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {activeItem.beforeDesc}
                </p>
              </div>

              <div className="border-l-4 border-primary-600 pl-4 space-y-1">
                <h4 className="text-xs font-extrabold text-primary-600">
                  After Treatment:
                </h4>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {activeItem.afterDesc}
                </p>
              </div>
            </div>

            <div className="pt-4">
              <Button onClick={openModal} variant="solid" color="blue">
                Request Similar Service
              </Button>
            </div>
          </div>

        </div>

      </div>
      </Reveal>
    </section>
  );
}
