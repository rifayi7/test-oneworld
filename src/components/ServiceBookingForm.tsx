"use client";

import { useState, FormEvent } from "react";
import { submitLead } from "@/app/actions/submit-lead";
import { Check, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface ServiceBookingFormProps {
  serviceName: string;
  servicePrice: string;
  contactPhone: string;
}

export function ServiceBookingForm({
  serviceName,
  servicePrice,
  contactPhone,
}: ServiceBookingFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    data.append("company", ""); // Honeypot field (kept blank)

    try {
      const response = await submitLead(data);
      if (response.ok) {
        setSubmitted(true);
        
        const cleanPhone = contactPhone.replace(/[^0-9]/g, "");
        const waMsg = encodeURIComponent(
          `Hi Clean World Solutions! I just booked a slot for "${serviceName}" (starting at ${servicePrice}) online. My name is ${formData.name}. Looking forward to connecting!`
        );
        const waUrl = `https://wa.me/${cleanPhone}?text=${waMsg}`;

        setTimeout(() => {
          window.open(waUrl, "_blank");
        }, 1500);
      } else {
        setErrorMsg(response.error || "An error occurred. Please try again.");
      }
    } catch (err) {
      console.error("Booking form submission failed:", err);
      setErrorMsg("Failed to connect to database. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-6 px-4 bg-emerald-50/50 border border-emerald-100 rounded-card space-y-4">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <Check className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div className="space-y-1.5">
          <h4 className="text-base font-bold text-slate-900">Booking Requested!</h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Thanks, {formData.name}! We&apos;ve saved your details. We are now redirecting you to WhatsApp to coordinate your schedule.
          </p>
        </div>
        <div className="text-[10px] text-slate-400">
          Not redirecting? <a href={`https://wa.me/${contactPhone.replace(/[^0-9]/g, "")}`} className="underline font-bold text-primary-600">Click here</a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <h4 className="text-sm font-extrabold text-neutral-900 font-display">
          Quick Booking
        </h4>
        <p className="text-xs text-slate-500">
          Reserve your service. No payment required upfront.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-button">
          {errorMsg}
        </div>
      )}

      {/* Honeypot */}
      <input
        type="text"
        name="company"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      <div className="space-y-3">
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Full Name
          </label>
          <input
            type="text"
            required
            disabled={loading}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-primary-600 transition disabled:opacity-50"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Email Address
          </label>
          <input
            type="email"
            required
            disabled={loading}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-primary-600 transition disabled:opacity-50"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            required
            disabled={loading}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-primary-600 transition disabled:opacity-50"
            placeholder="+91 98765 43210"
          />
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={loading}
        className="w-full mt-2 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-md shadow-primary-600/10 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
      >
        {loading ? "Requesting..." : "Request Booking"}
        <ArrowRight className="w-3.5 h-3.5" />
      </motion.button>
    </form>
  );
}
