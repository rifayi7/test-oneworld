"use client";

import { useState, FormEvent } from "react";
import { submitBooking } from "@/app/actions/submit-booking";
import { SITE_INFO } from "@/content";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/Button";
import { Check } from "lucide-react";

const SERVICES_LIST = [
  "Water Tank Cleaning",
  "Deep Well Cleaning",
  "Pond Cleaning",
  "UV Treatment Setup",
  "Pipeline Cleaning",
  "Water Purifier Installation",
  "Water Tank Filter Installation",
  "CCTV Installation",
  "Gas Leak Detector",
  "Roof Waterproofing",
  "Solar Installation",
  "Grass Cutting",
  "Weed Removal",
  "Compound Wall Cleaning",
  "Interlock Cleaning",
  "Termite Control",
  "Disinfection Spraying",
  "Coconut Planting",
  "Basin Making",
  "Coconut Plucking"
];

const TIME_SLOTS = [
  "Morning (09:00 AM - 12:00 PM)",
  "Afternoon (12:00 PM - 03:00 PM)",
  "Evening (03:00 PM - 06:00 PM)"
];

const DISTRICTS = [
  "Thiruvananthapuram",
  "Kollam",
  "Pathanamthitta",
  "Alappuzha",
  "Kottayam",
  "Idukki",
  "Ernakulam",
  "Thrissur",
  "Palakkad",
  "Malappuram",
  "Kozhikode",
  "Wayanad",
  "Kannur",
  "Kasaragod"
];

export function SlotBooking() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [formData, setFormData] = useState({
    service: "",
    bookingDate: "",
    timeSlot: "",
    name: "",
    phone: "",
    location: "",
    notes: ""
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const data = new FormData();
    data.append("service", formData.service);
    data.append("bookingDate", formData.bookingDate);
    data.append("timeSlot", formData.timeSlot);
    data.append("name", formData.name);
    data.append("phone", formData.phone);
    data.append("location", formData.location);
    data.append("notes", formData.notes);
    data.append("company", ""); // Honeypot

    try {
      const response = await submitBooking(data);
      if (response.ok) {
        setSubmitted(true);
        
        // Build whatsapp confirmation URL
        const cleanWaPhone = SITE_INFO.phone.replace(/[^0-9]/g, "");
        const waMsg = encodeURIComponent(
          `Hi Clean World Solutions! I have booked a service slot online:\n\n` +
          `• Name: ${formData.name}\n` +
          `• Service: ${formData.service}\n` +
          `• Date: ${formData.bookingDate}\n` +
          `• Time: ${formData.timeSlot}\n` +
          `• District: ${formData.location}\n` +
          `• Notes: ${formData.notes || "None"}\n\n` +
          `Please confirm my booking. Thank you!`
        );
        const waUrl = `https://wa.me/${cleanWaPhone}?text=${waMsg}`;
        
        setTimeout(() => {
          window.open(waUrl, "_blank");
        }, 1500);

      } else {
        setErrorMsg(response.error || "An error occurred. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="book-slot" className="py-20 bg-slate-50 px-6 lg:px-12 scroll-mt-20">
      <Reveal>
      <div className="container mx-auto max-w-4xl">
        
        <div className="bg-white rounded-card shadow-soft border border-slate-200/50 p-8 md:p-12 space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-4 max-w-xl mx-auto">
            <span className="text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-4 py-1.5 rounded-badge">
              Reservations
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-900 font-display">
              Schedule Your Service Slot
            </h2>
            <p className="text-xs text-neutral-600">
              Book a convenient slot today. No upfront payment required. Confirm booking & redirect to WhatsApp.
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {errorMsg && (
                <div className="p-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl">
                  {errorMsg}
                </div>
              )}

              {/* Honeypot */}
              <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Service Dropdown */}
                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    Select Service
                  </label>
                  <select
                    required
                    disabled={loading}
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
                  >
                    <option value="">-- Choose a Service --</option>
                    {SERVICES_LIST.map((srv) => (
                      <option key={srv} value={srv}>{srv}</option>
                    ))}
                  </select>
                </div>

                {/* Date Selector */}
                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    Select Preferred Date
                  </label>
                  <input
                    type="date"
                    required
                    disabled={loading}
                    value={formData.bookingDate}
                    onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                    className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
                  />
                </div>

                {/* Time Slot Selector */}
                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    Preferred Time Slot
                  </label>
                  <select
                    required
                    disabled={loading}
                    value={formData.timeSlot}
                    onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                    className="px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
                  >
                    <option value="">-- Choose a Time --</option>
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>

                {/* Kerala Districts Selector */}
                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    Your Location (Kerala District)
                  </label>
                  <select
                    required
                    disabled={loading}
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
                  >
                    <option value="">-- Choose your District --</option>
                    {DISTRICTS.map((dst) => (
                      <option key={dst} value={dst}>{dst} District</option>
                    ))}
                  </select>
                </div>

                {/* Name */}
                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    disabled={loading}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    disabled={loading}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter your phone number"
                    className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
                  />
                </div>

              </div>

              {/* Notes */}
              <div className="flex flex-col space-y-2">
                <label className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Additional Notes (Optional)
                </label>
                <textarea
                  disabled={loading}
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Tell us about specific water tank sizes, grass dimensions, or other details..."
                  className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition resize-none"
                />
              </div>

              <div className="pt-2 text-center">
                <Button
                  type="submit"
                  disabled={loading}
                  variant="solid"
                  color="blue"
                  className="w-full md:w-auto px-10 py-4 text-sm font-black shadow-md cursor-pointer"
                >
                  {loading ? "Processing Booking..." : "Book My Service"}
                </Button>
              </div>

            </form>
          ) : (
            <div className="text-center py-12 space-y-4">
              <span className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-500 flex items-center justify-center mx-auto shadow-sm">
                <Check className="w-8 h-8 stroke-[2.5]" />
              </span>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-900 font-display">
                  Booking Submitted!
                </h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Thank you, {formData.name}. We have saved your reservation details to the database and are opening WhatsApp to finalize your slot...
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
      </Reveal>
    </section>
  );
}
