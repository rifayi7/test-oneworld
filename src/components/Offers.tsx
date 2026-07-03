"use client";

import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/Button";
import { Droplet, Scissors, ShieldCheck, Zap, AlertTriangle } from "lucide-react";

interface OfferItem {
  service: string;
  badge: string;
  discount: string;
  validity: string;
  img: string;
  desc: string;
  serviceId: number;
}

const OFFERS_DATA: OfferItem[] = [
  {
    service: "Water Tank Cleaning",
    badge: "Special Entry Rate",
    discount: "Starting from ₹799",
    validity: "Valid till July 31, 2026",
    img: "https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/clean-world-solutions/services/water-tank.webp",
    desc: "Complete disinfection and high pressure deep cleaning at lowest entry rates.",
    serviceId: 3
  },
  {
    service: "Grass Cutting Offer",
    badge: "Seasonal Deal",
    discount: "20% OFF Total Bill",
    validity: "Valid till July 15, 2026",
    img: "https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/clean-world-solutions/services/grass-trimming.webp",
    desc: "Clear out your compound and backyard gardens at customized discount rates.",
    serviceId: 25
  },
  {
    service: "Roof Waterproofing",
    badge: "Free Consultation",
    discount: "Free Inspection",
    validity: "Limited Slots Available",
    img: "https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/clean-world-solutions/services/roof-waterproof.webp",
    desc: "Schedule a complete roof dampness checkup and leakage report by engineers.",
    serviceId: 23
  },
  {
    service: "Solar Installation",
    badge: "Subsidy Support",
    discount: "Government Subsidy Available",
    validity: "Subject to KSEB approval",
    img: "https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/clean-world-solutions/services/home-services.webp",
    desc: "Get full subsidy integration guidance and custom capacity modeling free.",
    serviceId: 24
  },
  {
    service: "Gas Leak Detector",
    badge: "Home Protection",
    discount: "Free Safety Check",
    validity: "With any major cleaning",
    img: "https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/clean-world-solutions/services/home-services.webp",
    desc: "Get a free LPG kitchen gas valve safety inspection and sensor calibration.",
    serviceId: 22
  }
];

export function Offers() {
  const offerIcons: Record<string, React.ReactNode> = {
    "Water Tank Cleaning": <Droplet className="w-4.5 h-4.5 text-primary-600 stroke-[2.5]" />,
    "Grass Cutting Offer": <Scissors className="w-4.5 h-4.5 text-primary-600 stroke-[2.5]" />,
    "Roof Waterproofing": <ShieldCheck className="w-4.5 h-4.5 text-primary-600 stroke-[2.5]" />,
    "Solar Installation": <Zap className="w-4.5 h-4.5 text-primary-600 stroke-[2.5]" />,
    "Gas Leak Detector": <AlertTriangle className="w-4.5 h-4.5 text-primary-600 stroke-[2.5]" />
  };

  return (
    <section id="offers" className="py-20 bg-white px-6 lg:px-12 scroll-mt-20">
      <Reveal>
        <div className="container mx-auto max-w-7xl text-center space-y-12">

          {/* Title Header */}
          <div className="space-y-4 max-w-xl mx-auto">
            <span className="inline-block text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-4 py-1.5 rounded-badge">
              Promotions
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 font-display">
              Current Offers & Promotions
            </h2>
            <p className="text-sm text-neutral-600">
              Claim these active home service vouchers before they expire.
            </p>
          </div>

          {/* Grid List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {OFFERS_DATA.map((offer) => (
              <div key={offer.service} className="group border border-slate-200/50 bg-white rounded-card overflow-hidden shadow-soft flex flex-col h-full hover:-translate-y-1.5 transition-all duration-300">
                {/* Image & Badges */}
                <div className="relative h-56 w-full bg-slate-100 overflow-hidden">
                  <Image
                    src={offer.img}
                    alt={offer.service}
                    fill
                    sizes="(max-width: 768px) 100vw, 300px"
                    className="object-cover"
                  />

                  {/* Floating Left Badge */}
                  <div className="absolute top-4 left-4 bg-primary-600 text-white text-[0.65rem] font-black uppercase px-3.5 py-1.5 rounded-badge shadow-sm select-none">
                    {offer.badge}
                  </div>

                  {/* Floating Right Icon */}
                  <div className="absolute top-4 right-4 bg-white w-9 h-9 rounded-full flex items-center justify-center shadow-sm select-none">
                    {offerIcons[offer.service]}
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 flex-grow flex flex-col justify-between text-left space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-extrabold text-neutral-900 font-display">
                      {offer.service}
                    </h3>
                    <div className="text-primary-600 font-extrabold text-sm">
                      {offer.discount}
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      {offer.desc}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                    <span className="text-[0.65rem] font-bold text-slate-400 select-none">
                      {offer.validity}
                    </span>
                    <Button
                      href={`/checkout?serviceId=${offer.serviceId}`}
                      variant="solid"
                      color="blue"
                      className="px-5 py-2.5 text-[0.7rem] font-black shadow-sm"
                    >
                      Book Now
                    </Button>
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
