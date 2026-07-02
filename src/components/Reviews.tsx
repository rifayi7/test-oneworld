"use client";

import { Reveal } from "@/components/Reveal";
import Image from "next/image";

interface ReviewItem {
  rating: number;
  quote: string;
  author: string;
  location: string;
  service: string;
  avatar: string;
}

const REVIEWS_DATA: ReviewItem[] = [
  {
    rating: 5,
    quote: "Excellent water tank cleaning service. The team arrived on time with professional machinery. The tank is now completely spotless and sanitized.",
    author: "Ragesh Nair",
    location: "Kochi, Ernakulam",
    service: "Water Tank Cleaning",
    avatar: "https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/laccadives-coral-trails/hero/avatar2.webp"
  },
  {
    rating: 5,
    quote: "Very professional team. They cleared the wild grass and creepers in my compound wall within hours. Highly reliable and transparent pricing.",
    author: "Anitha Kurian",
    location: "Kottayam",
    service: "Grass Cutting & Weed Removal",
    avatar: "https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/laccadives-coral-trails/hero/avatar.webp"
  },
  {
    rating: 5,
    quote: "Affordable pricing and timely service. They set up my CCTV security camera network and explained the mobile app interface very clearly.",
    author: "Deepak Menon",
    location: "Trivandrum",
    service: "CCTV Installation",
    avatar: "https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/laccadives-coral-trails/hero/avatar2.webp"
  }
];

export function Reviews() {
  return (
    <section id="reviews" className="py-20 bg-slate-50 px-6 lg:px-12 scroll-mt-20">
      <Reveal>
      <div className="container mx-auto max-w-7xl text-center space-y-12">
        
        {/* Title */}
        <div className="space-y-4 max-w-xl mx-auto">
          <span className="text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-4 py-1.5 rounded-badge">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 font-display">
            What Our Customers Say
          </h2>
        </div>

        {/* Grid List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {REVIEWS_DATA.map((item) => (
            <div key={item.author} className="border border-slate-200/40 bg-white rounded-card p-8 flex flex-col justify-between text-left space-y-6 shadow-soft h-full">

              {/* Quote and Stars */}
              <div className="space-y-4">
                {/* Star rating row */}
                <div className="flex items-center gap-0.5 select-none">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-500 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <p className="text-xs italic text-neutral-600 leading-relaxed">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-4 border-t border-slate-100 pt-4">
                <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-slate-100">
                  <Image
                    src={item.avatar}
                    alt={item.author}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
                <div className="leading-tight">
                  <span className="block text-xs font-extrabold text-neutral-900">
                    {item.author}
                  </span>
                  <span className="block text-[0.65rem] text-slate-400 mt-0.5">
                    {item.location} • <span className="text-primary-600 font-bold">{item.service}</span>
                  </span>
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
