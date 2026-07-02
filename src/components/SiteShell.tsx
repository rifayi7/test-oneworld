"use client";

import { useState, FormEvent } from "react";
import { Navbar } from "@/components/Navbar";
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
import { useLead } from "@/lead";
import { submitLead } from "@/app/actions/submit-lead";
import { FOOTER_CONTENT } from "@/content";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import { Check } from "lucide-react";

export function SiteShell() {
  useLenis();
  const { isModalOpen, closeModal } = useLead();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(false);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    data.append("company", ""); // Honeypot field (kept blank)

    setLoading(true);

    try {
      const response = await submitLead(data);
      if (response.ok) {
        setSubmitted(true);
        
        const cleanWaPhone = FOOTER_CONTENT.phone.replace(/[^0-9]/g, "");
        const waMsg = encodeURIComponent(
          `Hi Clean World Solutions! I just booked a cleaning slot online. My name is ${formData.name}. Looking forward to connecting!`
        );
        const waUrl = `https://wa.me/${cleanWaPhone}?text=${waMsg}`;

        setTimeout(() => {
          window.open(waUrl, "_blank");
        }, 1500);
      } else {
        setErrorMsg(response.error || "An error occurred. Please try again.");
      }
    } catch (err) {
      console.error("Submission failed:", err);
      setErrorMsg("Failed to connect to database. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    closeModal();
    setTimeout(() => {
      setSubmitted(false);
      setErrorMsg("");
      setFormData({ name: "", email: "", phone: "" });
    }, 300);
  };

  return (
    <MotionConfig reducedMotion="user">
    <div className="relative min-h-screen flex flex-col justify-between selection:bg-primary-50">
      <Navbar />

      <main className="flex-grow">
        <Hero />
        <ServicesOverview />
        <WhyChoose />
        <Offers />
        <FeaturedServices />
        <HowItWorks />
        <SlotBooking />
        <BeforeAfter />
        <Reviews />
        <ServiceAreas />
        <Faqs />
        <FinalCta />
      </main>

      <Footer />

      {/* Lead Capture Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} // unslop-ignore — modal enter/exit communicates a state change; reduced-motion handled by MotionConfig
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} // unslop-ignore — modal enter/exit communicates a state change; reduced-motion handled by MotionConfig
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-md overflow-hidden rounded-card bg-white p-8 shadow-2xl border border-slate-200 z-10"
            >
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">
                      Book a Cleaning
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Enter your details below and our team will get in touch with you shortly.
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="p-3.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-button">
                      {errorMsg}
                    </div>
                  )}

                  {/* Honeypot field (hidden from users/screenreaders to catch spam bots) */}
                  <input
                    type="text"
                    name="company"
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        disabled={loading}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-button border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600 transition disabled:opacity-50"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        disabled={loading}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-button border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600 transition disabled:opacity-50"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        disabled={loading}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-button border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600 transition disabled:opacity-50"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={loading}
                      className="w-1/2 py-3 rounded-button border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition disabled:opacity-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-1/2 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-button font-semibold shadow-md shadow-primary-600/10 transition disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? "Submitting..." : "Submit"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8 stroke-[2.5]" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900">
                      Request Received!
                    </h3>
                    <p className="text-sm text-slate-500 max-w-xs mx-auto">
                      Thank you, {formData.name}. We have saved your request and are redirecting you to WhatsApp...
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="px-6 py-2.5 bg-slate-900 text-white font-semibold rounded-button text-sm hover:opacity-90 transition cursor-pointer"
                  >
                    Close Window
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    </MotionConfig>
  );
}
