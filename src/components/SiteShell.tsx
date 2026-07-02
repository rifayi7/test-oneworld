"use client";

import { Navbar } from "@/components/Navbar";
import { Service } from "@/db/queries";
import { Hero } from "@/components/Hero";
import { ServicesOverview } from "@/components/ServicesOverview";
import { WhyChoose } from "@/components/WhyChoose";
import { Offers } from "@/components/Offers";
import { FeaturedServices } from "@/components/FeaturedServices";
import { HowItWorks } from "@/components/HowItWorks";
import { SlotBooking } from "@/components/SlotBooking";
import { BeforeAfter } from "@/components/BeforeAfter";
import { Reviews } from "@/components/Reviews";
import { ServiceAreas } from "@/components/ServiceAreas";
import { Faqs } from "@/components/Faqs";
import { FinalCta } from "@/components/FinalCta";
import { Footer } from "@/components/Footer";
import { useLenis } from "@/hooks/useLenis";
import { MotionConfig } from "motion/react";

export function SiteShell({ initialServices }: { initialServices: Service[] }) {
  useLenis();

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen flex flex-col justify-between selection:bg-primary-50">
        <Navbar />

        <main className="flex-grow">
          <Hero />
          <ServicesOverview initialServices={initialServices} />
          <WhyChoose />
          <Offers />
          <FeaturedServices />
          <HowItWorks />
          <SlotBooking servicesList={initialServices.map((s) => s.name)} />
          <BeforeAfter />
          <Reviews />
          <ServiceAreas />
          <Faqs />
          <FinalCta />
        </main>

        <Footer />
      </div>
    </MotionConfig>
  );
}
