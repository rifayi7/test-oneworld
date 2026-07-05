"use client";

import { SITE_INFO } from "@/content";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/Button";
import { Phone, Calendar, MessageCircle } from "lucide-react";

export function FinalCta() {
  const handleWhatsApp = () => {
    const cleanWaPhone = SITE_INFO.phone.replace(/[^0-9]/g, "");
    const waMsg = encodeURIComponent("Hi Clean World Solutions! I'd like to ask about your services.");
    window.open(`https://wa.me/${cleanWaPhone}?text=${waMsg}`, "_blank");
  };

  return (
    <section className="py-20 bg-white px-6 lg:px-12">
      <Reveal>
        <div className="container mx-auto max-w-5xl">

          <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-card p-10 md:p-16 text-center text-white space-y-8 shadow-xl relative overflow-hidden select-none">
            {/* Accent blur shapes inside CTA block */}
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" /> {/* unslop-ignore — ambient ellipse is circular by definition */}
            <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-white/5 blur-2xl pointer-events-none" /> {/* unslop-ignore — ambient ellipse is circular by definition */}

            {/* Heading block */}
            <div className="space-y-4 relative z-10">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight font-display">
                Need Professional Home Services?
              </h2>
              <p className="text-base md:text-lg text-primary-100 font-extrabold max-w-xl mx-auto leading-relaxed">
                നിങ്ങളുടെ വീട്ടിലെ എല്ലാ ആവശ്യങ്ങൾക്കും ഇനി Clean World Solutions.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">

              {/* Call Now Button */}
              <Button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("open-call-modal"));
                }}
                variant="outline"
                color="white"
                className="px-8 py-4 text-sm font-extrabold bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                <Phone className="w-4 h-4 stroke-[2.5]" />
                Call Now
              </Button>

              {/* Book Service Button */}
              <Button
                href="/services"
                variant="solid"
                color="white"
                className="px-8 py-4 text-sm font-extrabold bg-white hover:bg-slate-50 text-primary-600 shadow-lg"
              >
                <Calendar className="w-4 h-4 stroke-[2.5]" />
                Book Service
              </Button>

              {/* WhatsApp Button */}
              <Button
                onClick={handleWhatsApp}
                variant="outline"
                color="white"
                className="px-8 py-4 text-sm font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-md"
              >
                <MessageCircle className="w-4.5 h-4.5 stroke-[2.5] fill-current" />
                WhatsApp
              </Button>

            </div>

          </div>

        </div>
      </Reveal>
    </section>
  );
}
