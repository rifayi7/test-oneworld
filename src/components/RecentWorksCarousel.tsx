"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { 
  ArrowLeft, 
  ArrowRight, 
  MapPin, 
  Sparkles, 
  Droplet, 
  Shield, 
  Zap, 
  Leaf, 
  Award, 
  Clock, 
  Sun, 
  Trash2, 
  Users, 
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Stat {
  label: string;
  value: string;
  iconType: "purity" | "debris" | "duration" | "efficiency" | "panels" | "safety" | "area" | "recycle" | "crew";
}

interface WorkItem {
  id: number;
  idString: string;
  title: string;
  category: string;
  categoryIcon: "water" | "safety" | "outdoor";
  description: string;
  image: string;
  location: string;
  stats: Stat[];
  tags: { label: string; iconType: "leaf" | "droplet" | "zap" | "recycle" }[];
}

const RECENT_WORKS: WorkItem[] = [
  {
    id: 1,
    idString: "01",
    title: "10,000L Underground Water Tank Sanitization",
    category: "Water Services",
    categoryIcon: "water",
    description: "Deep descaling, algae removal, and multi-stage antibacterial treatment for a residential storage tank. Restored drinking water to optimal purity levels using chemical-free sanitization.",
    image: "/portfolio/tank-cleaning.jpg",
    location: "Ernakulam, Kochi",
    stats: [
      { label: "Purity Index", value: "99.9%", iconType: "purity" },
      { label: "Debris Removed", value: "35 kg", iconType: "debris" },
      { label: "Duration", value: "3.5 Hrs", iconType: "duration" }
    ],
    tags: [
      { label: "Eco-Disinfection", iconType: "leaf" },
      { label: "High-Pressure Jetting", iconType: "droplet" }
    ]
  },
  {
    id: 2,
    idString: "02",
    title: "8kW Rooftop Solar Panel Cleaning & Inspection",
    category: "Home Safety & Energy",
    categoryIcon: "safety",
    description: "Full service cleaning and electrical safety inspection of rooftop solar arrays. Removed layers of atmospheric dust and bird droppings to restore peak photovoltaic performance.",
    image: "/portfolio/solar-cleaning.jpg",
    location: "Aluva, Kerala",
    stats: [
      { label: "Efficiency Gain", value: "+28%", iconType: "efficiency" },
      { label: "Panels Polished", value: "24 Units", iconType: "panels" },
      { label: "Safety Rating", value: "100%", iconType: "safety" }
    ],
    tags: [
      { label: "Power Restored", iconType: "zap" },
      { label: "Eco-Wash Tech", iconType: "droplet" }
    ]
  },
  {
    id: 3,
    idString: "03",
    title: "Suburban Estate Lawn Sculpting & Detailing",
    category: "Outdoor Services",
    categoryIcon: "outdoor",
    description: "Precision lawn trimming, landscape detailing, and organic weed control on a 3,000 sq ft villa property. Eco-friendly green waste bagging and removal included.",
    image: "/portfolio/garden-care.jpg",
    location: "Kakkanad, Kochi",
    stats: [
      { label: "Area Cleared", value: "3,000 sqft", iconType: "area" },
      { label: "Waste Recycled", value: "100%", iconType: "recycle" },
      { label: "Crew Size", value: "2 Vetted Pros", iconType: "crew" }
    ],
    tags: [
      { label: "Precision Edging", iconType: "leaf" },
      { label: "Green Disposal", iconType: "recycle" }
    ]
  }
];

export function RecentWorksCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const [isHovered, setIsHovered] = useState(false);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const slideNext = () => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % RECENT_WORKS.length);
  };

  const slidePrev = () => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + RECENT_WORKS.length) % RECENT_WORKS.length);
  };

  const goToSlide = (index: number) => {
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  };

  // Autoplay functionality
  useEffect(() => {
    if (!isHovered) {
      autoPlayTimerRef.current = setInterval(() => {
        slideNext();
      }, 7000);
    }
    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [isHovered, activeIndex]);

  const currentWork = RECENT_WORKS[activeIndex];

  // Fine-tuned spring transitions
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring" as const, stiffness: 160, damping: 22 },
        opacity: { duration: 0.35 }
      }
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0,
      transition: {
        x: { type: "spring" as const, stiffness: 160, damping: 22 },
        opacity: { duration: 0.25 }
      }
    })
  };

  // Dedicated vertical fade transitions for the details text to prevent horizontal clipping
  const textVariants = {
    enter: {
      y: 12,
      opacity: 0
    },
    center: {
      y: 0,
      opacity: 1,
      transition: {
        y: { type: "spring" as const, stiffness: 160, damping: 22 },
        opacity: { duration: 0.35 }
      }
    },
    exit: {
      y: -12,
      opacity: 0,
      transition: {
        y: { type: "spring" as const, stiffness: 160, damping: 22 },
        opacity: { duration: 0.25 }
      }
    }
  };

  // Helper to render Category icon
  const renderCategoryIcon = (type: "water" | "safety" | "outdoor") => {
    switch (type) {
      case "water":
        return <Droplet className="w-3.5 h-3.5" />;
      case "safety":
        return <Shield className="w-3.5 h-3.5" />;
      case "outdoor":
        return <Leaf className="w-3.5 h-3.5" />;
    }
  };

  // Helper to render tag icon
  const renderTagIcon = (type: "leaf" | "droplet" | "zap" | "recycle") => {
    switch (type) {
      case "leaf":
        return <Leaf className="w-3.5 h-3.5" />;
      case "droplet":
        return <Droplet className="w-3.5 h-3.5" />;
      case "zap":
        return <Zap className="w-3.5 h-3.5" />;
      case "recycle":
        return <RefreshCw className="w-3.5 h-3.5" />;
    }
  };

  // Helper to render Stat icon inside the circle badge
  const renderStatIcon = (type: Stat["iconType"]) => {
    switch (type) {
      case "purity":
        return <Award className="w-4 h-4" />;
      case "debris":
        return <Trash2 className="w-4 h-4" />;
      case "duration":
        return <Clock className="w-4 h-4" />;
      case "efficiency":
        return <Zap className="w-4 h-4" />;
      case "panels":
        return <Sun className="w-4 h-4" />;
      case "safety":
        return <Shield className="w-4 h-4" />;
      case "area":
        return <Sun className="w-4 h-4" />;
      case "recycle":
        return <RefreshCw className="w-4 h-4" />;
      case "crew":
        return <Users className="w-4 h-4" />;
    }
  };

  return (
    <section 
      className="pb-16 pt-0 bg-white border-b border-slate-100 scroll-mt-20 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="container mx-auto max-w-7xl px-6 lg:px-12 space-y-8">
        
        {/* Section Heading - minimalist */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 text-left">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-4 py-1.5 rounded-badge">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Portfolio
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-900 font-display">
              Recent Works in Action
            </h2>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {RECENT_WORKS.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  index === activeIndex ? "w-6 bg-primary-600" : "w-2 bg-slate-200 hover:bg-slate-300"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Mockup Frame Container (Snug-fitting white text box on left, image on right) */}
        <div className="relative w-full rounded-[24px] md:rounded-[32px] border border-slate-200/80 bg-[#0f172a] shadow-soft overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[500px]">
          
          {/* LEFT COLUMN: Snug White Details Card (5 Columns) */}
          <div className="lg:col-span-5 bg-white rounded-r-[32px] md:rounded-r-[40px] p-6 md:p-8 lg:p-10 flex flex-col justify-between text-left relative z-10 shadow-[8px_0_24px_-4px_rgba(0,0,0,0.06)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                variants={textVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-5 flex-grow flex flex-col justify-between"
              >
                <div>
                  {/* Mockup Header Row */}
                  <div className="flex items-center justify-between pb-2 mb-3">
                    <span className="text-[10px] font-black text-neutral-900 tracking-widest uppercase">
                      RECORD [ {currentWork.idString} / 0{RECENT_WORKS.length} ]
                    </span>
                    <span className="border border-primary-300/80 text-primary-600 px-3 py-1 rounded-badge text-[0.65rem] font-bold uppercase tracking-wider flex items-center gap-1">
                      {renderCategoryIcon(currentWork.categoryIcon)}
                      {currentWork.category}
                    </span>
                  </div>

                  {/* Location Info */}
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-slate-500 mb-2">
                    <MapPin className="w-3.5 h-3.5 text-primary-600" />
                    {currentWork.location}
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl md:text-[1.65rem] font-black text-neutral-900 font-display leading-tight mb-3">
                    {currentWork.title}
                  </h3>

                  {/* Mockup Teal Line */}
                  <div className="w-12 h-1 bg-primary-500 rounded-full mb-4" />

                  {/* Description */}
                  <p className="text-xs md:text-sm text-neutral-600 leading-relaxed font-medium">
                    {currentWork.description}
                  </p>

                  {/* Highlights / Tags - styled as green/teal pills */}
                  <div className="flex flex-wrap gap-2 pt-3">
                    {currentWork.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 bg-primary-50/70 border border-primary-100/60 px-3 py-1.5 rounded-full text-xs font-semibold text-primary-700"
                      >
                        {renderTagIcon(tag.iconType)}
                        {tag.label}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Fine Separator Line */}
                  <div className="border-t border-slate-100 w-full" />

                  {/* Outcomes / Stats Cards (Mockup White bordered cards) */}
                  <div className="grid grid-cols-3 gap-2.5">
                    {currentWork.stats.map((stat, i) => (
                      <div 
                        key={i} 
                        className="bg-white border border-slate-150 rounded-xl p-3 flex flex-col justify-between gap-2.5 shadow-sm"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary-50/70 text-primary-600 flex items-center justify-center shrink-0">
                          {renderStatIcon(stat.iconType)}
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-black text-slate-400 block uppercase tracking-wider leading-none">
                            {stat.label}
                          </span>
                          <span className="text-xs md:text-sm font-black text-neutral-900 font-display block leading-tight">
                            {stat.value}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT COLUMN: Project Image Container (Positioned absolutely on desktop to overlap behind the details card's rounded corners without grid collision) */}
          <div className="relative h-72 sm:h-96 lg:h-auto min-h-[300px] lg:col-span-7 lg:absolute lg:inset-y-0 lg:right-0 lg:left-[35%] lg:w-auto z-0">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={activeIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 w-full h-full"
              >
                <Image
                  src={currentWork.image}
                  alt={currentWork.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 800px"
                  className="object-cover"
                  priority
                />
              </motion.div>
            </AnimatePresence>

            {/* FLOATING CONTROLS: Floating dark arrow controls in bottom-right corner */}
            <div className="absolute right-6 bottom-6 flex items-center gap-2.5 z-10">
              <button
                onClick={slidePrev}
                className="w-11 h-11 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-sm flex items-center justify-center transition active:scale-95 cursor-pointer shadow-md select-none border border-white/5"
                aria-label="Previous project"
              >
                <ArrowLeft className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={slideNext}
                className="w-11 h-11 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-sm flex items-center justify-center transition active:scale-95 cursor-pointer shadow-md select-none border border-white/5"
                aria-label="Next project"
              >
                <ArrowRight className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
