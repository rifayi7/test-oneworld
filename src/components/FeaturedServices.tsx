"use client";

import { useState } from "react";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/Button";
import { ServiceImageCarousel } from "@/components/ServiceImageCarousel";
import { 
  ShieldCheck, 
  ArrowRight, 
  Droplet, 
  Zap, 
  Leaf,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const SPOTLIGHT_SERVICES = [
  {
    id: 3, // Water Tank Cleaning ID
    name: "Deep Well & Water Tank Cleaning",
    category: "Water Care",
    categoryIcon: Droplet,
    desc: "Wells and tanks collect silt, leaves, and algae through the year. We drain and vacuum out the sludge, pressure-jet the walls, sterilise with UV, and test the water before handing it back.",
    price: "₹799",
    mrp_price: "₹1,799",
    images: [
      "https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/clean-world-solutions/services/water-tank.webp",
      "/portfolio/tank-cleaning.jpg",
      "/services/water_tank.jpg",
      "/services/home_services.jpg"
    ],
    points: [
      "Complete mud and debris vacuuming",
      "Chemical-free disinfection & UV checks",
      "High-pressure wall jet washing",
      "pH quality test before handover"
    ],
    badgeText: "Deep sanitisation guaranteed",
    btnLabel: "Book Tank Cleaning"
  },
  {
    id: 24, // Solar Installation ID
    name: "Solar Panel & CCTV Integration",
    category: "Power & Security",
    categoryIcon: Zap,
    desc: "Make your home self-sufficient and secure. We handle complete solar system design, panel mounting, and KSEB subsidy registration. CCTV includes HD night vision and active mobile notifications.",
    price: "₹2,999",
    mrp_price: "₹3,999",
    images: [
      "https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/clean-world-solutions/services/cctv-install.webp",
      "/portfolio/solar-cleaning.jpg",
      "/services/cctv_install.jpg"
    ],
    points: [
      "Up to 40% government subsidy paperwork",
      "Full network pairing & mobile app feed",
      "Night-vision HD motion sensors",
      "Authorized warranty certificates"
    ],
    badgeText: "KSEB registered partners",
    btnLabel: "Book Solar & CCTV"
  },
  {
    id: 25, // Grass Cutting ID
    name: "Lawn Care & Water Purifiers",
    category: "Home & Outdoors",
    categoryIcon: Leaf,
    desc: "Keep your property pristine inside and out. We install domestic RO or UV water purifiers with strict TDS calibration. We also handle precision lawn trimming with commercial-grade brushcutters.",
    price: "₹899",
    mrp_price: "₹1,899",
    images: [
      "https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/clean-world-solutions/services/grass-trimming.webp",
      "/portfolio/garden-care.jpg",
      "/services/grass_trimming.jpg"
    ],
    points: [
      "Multi-stage RO/UV mounting & plumbing",
      "Precision brushcutter lawn trims",
      "Green waste bagging & debris disposal",
      "Post-work garden cleanup included"
    ],
    badgeText: "Same-day booking available",
    btnLabel: "Book Lawn & Purifiers"
  }
];

export function FeaturedServices() {
  const [activeTab, setActiveTab] = useState(0);

  const activeService = SPOTLIGHT_SERVICES[activeTab];

  // Animation variants for details switching
  const detailsVariants = {
    initial: { opacity: 0, x: 25 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
    exit: { opacity: 0, x: -25, transition: { duration: 0.25, ease: "easeIn" as const } }
  };

  return (
    <section id="featured" className="py-20 bg-slate-50 px-6 lg:px-12 scroll-mt-20 overflow-hidden">
      <Reveal>
        <div className="container mx-auto max-w-7xl space-y-10">

          {/* Header Block */}
          <div className="max-w-2xl space-y-4 text-left">
            <span className="inline-block text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-4 py-1.5 rounded-badge">
              Service Spotlight
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 font-display">
              The jobs we get called for most
            </h2>
            <p className="text-sm text-neutral-600">
              Three premium services make up most of our bookings. Switch tabs below to explore details, view real-work images, and book instantly.
            </p>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-3 pb-2 border-b border-slate-200/60 scrollbar-none overflow-x-auto">
            {SPOTLIGHT_SERVICES.map((service, index) => {
              const Icon = service.categoryIcon;
              const isActive = activeTab === index;
              return (
                <button
                  key={service.name}
                  onClick={() => {
                    setActiveTab(index);
                  }}
                  className="relative px-5 py-3 rounded-xl text-xs font-extrabold transition-all duration-300 cursor-pointer flex items-center gap-2 select-none outline-none"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeSpotlightTab"
                      className="absolute inset-0 bg-primary-600 rounded-xl"
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    />
                  )}
                  <span className={`relative z-10 flex items-center gap-2 transition-colors duration-300 ${
                    isActive ? "text-white" : "text-slate-600 hover:text-slate-900"
                  }`}>
                    <Icon className={`w-4 h-4 transition-colors duration-300 ${isActive ? "text-white" : "text-primary-600"}`} />
                    <span>{service.category}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Spotlight Layout Box */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            
            {/* LEFT COLUMN: Autoplay Image Carousel (7 Columns) */}
            <div className="lg:col-span-7 relative h-[16rem] sm:h-[22rem] md:h-[28rem] shrink-0 z-10">
              {/* Reset key resets state of Carousel when tab changes */}
              <div className="w-full h-full rounded-image overflow-hidden shadow-soft border border-slate-200/25">
                <ServiceImageCarousel key={activeService.id} images={activeService.images} alt={activeService.name} />
              </div>
              
              {/* Overlapping proof card */}
              <div className="absolute -bottom-4 left-6 sm:left-10 bg-white rounded-card px-5 py-4 shadow-soft border border-slate-200/50 flex items-center gap-3 select-none z-20">
                <span className="w-9 h-9 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                </span>
                <span className="text-xs font-extrabold text-neutral-900 leading-snug">
                  {activeService.badgeText}
                </span>
              </div>
            </div>

            {/* RIGHT COLUMN: Service Details Stack (5 Columns) */}
            <div className="lg:col-span-5 flex flex-col justify-between text-left">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  variants={detailsVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-6 flex-grow flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest block">
                        {activeService.category} Spotlight
                      </span>
                      <h3 className="text-2xl md:text-3xl font-black text-neutral-900 font-display leading-tight">
                        {activeService.name}
                      </h3>
                    </div>

                    <p className="text-sm text-neutral-600 leading-relaxed">
                      {activeService.desc}
                    </p>

                    {/* Inclusion bullet points */}
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-slate-700 pt-2">
                      {activeService.points.map((point) => (
                        <li key={point} className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </span>
                          <span className="text-neutral-700 font-medium leading-normal">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pricing and Booking Action */}
                  <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-slate-200/60 mt-6">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Starting price
                      </span>
                      <div className="flex items-baseline gap-2 mt-0.5 font-display">
                        <span className="text-sm text-slate-400 line-through font-semibold">
                          {activeService.mrp_price}
                        </span>
                        <div className="text-3xl font-black text-primary-600">
                          {activeService.price}
                        </div>
                      </div>
                      <span className="text-[9px] text-slate-400 block mt-0.5">
                        Inclusive of professional tools, safety gear, and setup.
                      </span>
                    </div>

                    <div className="flex-grow sm:flex-grow-0 min-w-[200px]">
                      <Button
                        href={`/checkout?serviceId=${activeService.id}`}
                        variant="solid"
                        color="blue"
                        className="w-full py-4 text-xs font-black shadow-md shadow-primary-600/10 flex items-center justify-center gap-2 group cursor-pointer select-none"
                      >
                        {activeService.btnLabel}
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>

        </div>
      </Reveal>
    </section>
  );
}
