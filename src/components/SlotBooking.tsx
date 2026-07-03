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

interface SlotBookingProps {
  servicesList?: string[];
}

export function SlotBooking({ servicesList = SERVICES_LIST }: SlotBookingProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [formData, setFormData] = useState({
    service: "",
    bookingDate: "",
    timeSlot: "",
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "Thiruvalla",
    pinCode: "689531",
    district: "",
    notes: ""
  });

  const [coordinates, setCoordinates] = useState<{ lat: string; lon: string } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lon = position.coords.longitude.toFixed(6);
        setCoordinates({ lat, lon });
        setGpsLoading(false);
        setGpsSuccess(true);

        try {
          // Reverse geocode via free OpenStreetMap Nominatim API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
            {
              headers: {
                "User-Agent": "CleanWorldSolutions/1.0"
              }
            }
          );
          if (response.ok) {
            const data = await response.json();
            if (data && data.address) {
              const road = data.address.road || data.address.suburb || data.address.neighbourhood || "";
              const city = data.address.city || data.address.town || data.address.village || "Thiruvalla";
              const postcode = data.address.postcode || "689531";
              
              // Match Kerala District
              const searchStr = ((data.address.county || "") + " " + data.display_name).toLowerCase();
              let matchedDistrict = "";
              for (const dist of DISTRICTS) {
                if (searchStr.includes(dist.toLowerCase())) {
                  matchedDistrict = dist;
                  break;
                }
              }

              setFormData((prev) => ({
                ...prev,
                address: road 
                  ? `${road}${data.address.suburb ? ", " + data.address.suburb : ""}`
                  : data.display_name.split(",").slice(0, 3).join(", ").trim(),
                city: city,
                pinCode: postcode,
                district: matchedDistrict || prev.district
              }));
            }
          }
        } catch (err) {
          console.error("Reverse geocoding error:", err);
        }
      },
      (error) => {
        console.error("GPS collection error:", error);
        alert("Failed to capture location coordinates. Please type it in the address fields.");
        setGpsLoading(false);
      }
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const fullAddress = `${formData.address.trim()}, ${formData.city.trim()} (${formData.district.trim()} Dist) - ${formData.pinCode.trim()}`;

    let token = "";
    try {
      const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!;
      token = await new Promise<string>((res) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).grecaptcha.ready(() =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).grecaptcha.execute(SITE_KEY, { action: "submit" }).then(res)
        )
      );
    } catch (tokenErr) {
      console.error("Token creation error:", tokenErr);
    }

    const data = new FormData();
    data.append("service", formData.service);
    data.append("bookingDate", formData.bookingDate);
    data.append("timeSlot", formData.timeSlot);
    data.append("name", formData.name);
    data.append("phone", formData.phone);
    data.append("email", formData.email);
    data.append("location", fullAddress);
    data.append("notes", formData.notes);
    data.append("company", ""); // Honeypot
    data.append("token", token);
    if (coordinates) {
      data.append("latitude", coordinates.lat);
      data.append("longitude", coordinates.lon);
    }

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
          `• Address: ${fullAddress}\n` +
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

  const handleCloseSuccess = () => {
    setSubmitted(false);
    // Reset all form inputs to default values
    setFormData({
      service: servicesList[0] || "",
      bookingDate: "",
      timeSlot: "",
      name: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      pinCode: "",
      district: DISTRICTS[0] || "",
      notes: ""
    });
    setCoordinates(null);
    setGpsSuccess(false);
  };

  return (
    <section id="book-slot" className="py-20 bg-slate-50 px-6 lg:px-12 scroll-mt-20">
      <Reveal>
      <div className="container mx-auto max-w-4xl">
        
        <div className="bg-white rounded-card shadow-soft border border-slate-200/50 p-8 md:p-12 space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-4 max-w-xl mx-auto">
            <span className="inline-block text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-4 py-1.5 rounded-badge">
              Reservations
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-900 font-display">
              Schedule Your Service Slot
            </h2>
            <p className="text-xs text-neutral-600">
              Book a convenient slot today. No upfront payment required. Confirm booking & redirect to WhatsApp.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {errorMsg && (
              <div className="p-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl">
                {errorMsg}
              </div>
            )}

            {/* Honeypot */}
            <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              
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
                  {servicesList.map((srv) => (
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
                  onClick={(e) => { try { (e.target as any).showPicker(); } catch (err) {} }}
                  onFocus={(e) => { try { (e.target as any).showPicker(); } catch (err) {} }}
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

              {/* Email */}
              <div className="flex flex-col space-y-2">
                <label className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  disabled={loading}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
                />
              </div>

              {/* Street Address */}
              <div className="flex flex-col space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street No, Apartment, Landmark..."
                  className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
                />
              </div>

              {/* City */}
              <div className="flex flex-col space-y-2">
                <label className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  City
                </label>
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
                />
              </div>

              {/* PIN Code */}
              <div className="flex flex-col space-y-2">
                <label className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  PIN Code
                </label>
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={formData.pinCode}
                  onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                  className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
                />
              </div>

              {/* Kerala Districts Selector */}
              <div className="flex flex-col space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Your District (Kerala)
                </label>
                <select
                  required
                  disabled={loading}
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
                >
                  <option value="">-- Choose your District --</option>
                  {DISTRICTS.map((dst) => (
                    <option key={dst} value={dst}>{dst} District</option>
                  ))}
                </select>
              </div>

              {/* Geolocation Button */}
              <div className="flex flex-col space-y-2 col-span-1 md:col-span-2">
                <label className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center justify-between">
                  <span>Service Location Coordinates</span>
                  {gpsSuccess && (
                    <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-wide">
                      ✓ Location Detected
                    </span>
                  )}
                </label>
                <div className="flex flex-wrap gap-3 items-center">
                  <button
                    type="button"
                    disabled={gpsLoading}
                    onClick={handleGetLocation}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 rounded-xl text-xs font-extrabold border border-slate-200 transition cursor-pointer select-none flex items-center gap-1.5"
                  >
                    📍 {gpsLoading ? "Detecting Location..." : gpsSuccess ? "Location Captured" : "Detect My Location"}
                  </button>
                  {coordinates && (
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-badge">
                      Latitude: {coordinates.lat}, Longitude: {coordinates.lon}
                    </span>
                  )}
                </div>
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

            <div className="pt-2 text-center space-y-3">
              <Button
                type="submit"
                disabled={loading}
                variant="solid"
                color="blue"
                className="w-full md:w-auto px-10 py-4 text-sm font-black shadow-md cursor-pointer"
              >
                {loading ? "Processing Booking..." : "Book My Service"}
              </Button>
              <p className="text-[10px] text-slate-400 max-w-sm mx-auto leading-relaxed select-none">
                This site is protected by reCAPTCHA and the Google{" "}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-500">Privacy Policy</a> and{" "}
                <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-500">Terms of Service</a> apply.
              </p>
            </div>

          </form>

          {/* Dynamic Success Modal Overlay */}
          {submitted && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
              <div className="bg-white border border-slate-200/80 rounded-card p-8 max-w-md w-full shadow-lg text-center space-y-6 animate-in zoom-in-95 duration-300 relative select-none">
                
                {/* Glowing success badge */}
                <span className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <Check className="w-8 h-8 stroke-[3]" />
                </span>
                
                {/* Messages */}
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 font-display">
                    Slot Reserved!
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Hi <strong className="text-slate-800">{formData.name}</strong>, your service slot for <strong className="text-slate-800">{formData.service}</strong> has been successfully booked.
                  </p>
                </div>

                {/* Summary card */}
                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50 text-left space-y-2.5 text-[11px] font-semibold text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date:</span>
                    <span className="text-slate-800">{formData.bookingDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Time Slot:</span>
                    <span className="text-slate-800">{formData.timeSlot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Location:</span>
                    <span className="text-slate-800">{formData.address}, {formData.city} ({formData.district} Dist)</span>
                  </div>
                </div>

                {/* Redirections */}
                <div className="space-y-3">
                  <a
                    href={`https://wa.me/${SITE_INFO.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      `Hi Clean World Solutions! I have booked a service slot online:\n\n` +
                      `• Name: ${formData.name}\n` +
                      `• Service: ${formData.service}\n` +
                      `• Date: ${formData.bookingDate}\n` +
                      `• Time: ${formData.timeSlot}\n` +
                      `• Address: ${formData.address}, ${formData.city} (${formData.district} Dist) - ${formData.pinCode}\n\n` +
                      `Please confirm my booking. Thank you!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-sm flex items-center justify-center gap-2 cursor-pointer transition select-none"
                  >
                    Coordinate via WhatsApp
                  </a>
                  
                  <button
                    onClick={handleCloseSuccess}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 transition cursor-pointer select-none"
                  >
                    Close & Return
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>
      </Reveal>
    </section>
  );
}
