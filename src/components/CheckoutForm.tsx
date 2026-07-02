"use client";

import { useState, useMemo, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Service } from "@/db/queries";
import { submitBooking } from "@/app/actions/submit-booking";
import { SITE_INFO } from "@/content";
import Image from "next/image";
import Link from "next/link";
import {
  CreditCard,
  QrCode,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  FileText,
  User,
  Phone,
  Mail,
  CheckCircle,
  Loader2,
  Lock,
  ArrowRight,
  ExternalLink,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CheckoutFormProps {
  services: Service[];
}

const TIME_SLOTS = [
  "09:00 AM - 12:00 PM",
  "12:00 PM - 03:00 PM",
  "03:00 PM - 06:00 PM",
];

const BANKS = [
  { id: "sbi", name: "State Bank of India" },
  { id: "hdfc", name: "HDFC Bank" },
  { id: "icici", name: "ICICI Bank" },
  { id: "gpay", name: "Google Pay UPI / BHIM" },
];

export function CheckoutForm({ services }: CheckoutFormProps) {
  const searchParams = useSearchParams();

  // Parse params
  const serviceIdParam = searchParams.get("serviceId");
  const urlName = searchParams.get("name") || "";
  const urlEmail = searchParams.get("email") || "";
  const urlPhone = searchParams.get("phone") || "";

  // Locate starting service
  const initialService = useMemo(() => {
    const sId = parseInt(serviceIdParam || "");
    return services.find((s) => s.id === sId) || services[0];
  }, [services, serviceIdParam]);

  // Form states
  const [selectedService, setSelectedService] = useState<Service | undefined>(initialService);
  const [name, setName] = useState(urlName);
  const [email, setEmail] = useState(urlEmail);
  const [phone, setPhone] = useState(urlPhone);
  const [bookingDate, setBookingDate] = useState("");
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Kochi");
  const [pinCode, setPinCode] = useState("");
  const [notes, setNotes] = useState("");

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "netbanking">("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [upiId, setUpiId] = useState("");
  const [selectedBank, setSelectedBank] = useState(BANKS[0].id);

  // Status states
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [transactionId, setTransactionId] = useState("");

  // Auto-switch service selection
  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const s = services.find((srv) => srv.name === e.target.value);
    setSelectedService(s);
  };

  // Price calculations
  const priceStats = useMemo(() => {
    if (!selectedService) return { mrp: 0, offer: 0, tax: 0, total: 0 };
    
    // Parse numeric prices from e.g. "₹2,499"
    const parsePrice = (priceStr: string | null) => {
      if (!priceStr) return 0;
      return parseInt(priceStr.replace(/[^0-9]/g, "")) || 0;
    };

    const offer = parsePrice(selectedService.offer_price || selectedService.price);
    const mrp = parsePrice(selectedService.mrp_price) || (offer + 1000);
    const tax = Math.round(offer * 0.18); // 18% GST
    const total = offer + tax;

    return { mrp, offer, tax, total };
  }, [selectedService]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!selectedService) {
      setErrorMsg("Please select a service.");
      return;
    }
    if (!bookingDate) {
      setErrorMsg("Please select a booking date.");
      return;
    }
    const fullAddress = `${address.trim()}, ${city.trim()} - ${pinCode.trim()}`;
    if (!address.trim() || !pinCode.trim()) {
      setErrorMsg("Please enter your complete address and pin code.");
      return;
    }

    // Payment validation
    if (paymentMethod === "card") {
      if (cardNumber.replace(/\s+/g, "").length !== 16) {
        setErrorMsg("Please enter a valid 16-digit Card Number.");
        return;
      }
      if (!cardExpiry.includes("/")) {
        setErrorMsg("Please enter Card Expiry in MM/YY format.");
        return;
      }
      if (cardCvv.length !== 3) {
        setErrorMsg("Please enter a valid 3-digit CVV.");
        return;
      }
    } else if (paymentMethod === "upi") {
      if (!upiId.includes("@")) {
        setErrorMsg("Please enter a valid UPI ID (e.g. name@okhdfc).");
        return;
      }
    }

    setProcessing(true);

    // Simulate payment authorization (2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const data = new FormData();
    data.append("service", selectedService.name);
    data.append("bookingDate", bookingDate);
    data.append("timeSlot", timeSlot);
    data.append("name", name);
    data.append("phone", phone);
    data.append("location", fullAddress);
    data.append("notes", notes);
    data.append("company", ""); // Honeypot

    try {
      const response = await submitBooking(data);
      if (response.ok) {
        const txnId = `TXN-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
        setTransactionId(txnId);
        setCompleted(true);
      } else {
        setErrorMsg(response.error || "Failed to process booking transaction.");
        setProcessing(false);
      }
    } catch (err) {
      console.error("Checkout failed:", err);
      setErrorMsg("Payment connection failed. Please check your internet connection.");
      setProcessing(false);
    }
  };

  const formattedTotal = `₹${priceStats.total.toLocaleString("en-IN")}`;
  const formattedOffer = `₹${priceStats.offer.toLocaleString("en-IN")}`;
  const formattedMrp = `₹${priceStats.mrp.toLocaleString("en-IN")}`;
  const formattedTax = `₹${priceStats.tax.toLocaleString("en-IN")}`;

  const handleWhatsAppRedirect = () => {
    if (!selectedService) return;
    const cleanPhone = SITE_INFO.phone.replace(/[^0-9]/g, "");
    
    const waMsg = encodeURIComponent(
      `Hi Clean World Solutions!\n\n` +
      `I just booked my home care service online with successful payment.\n\n` +
      `*Transaction Receipt*:\n` +
      `- *Service*: ${selectedService.name}\n` +
      `- *Schedule*: ${bookingDate} (${timeSlot})\n` +
      `- *Booking Name*: ${name}\n` +
      `- *Phone*: ${phone}\n` +
      `- *Address*: ${address}, ${city} - ${pinCode}\n` +
      `- *Paid Amount*: ${formattedTotal}\n` +
      `- *Transaction ID*: ${transactionId}\n\n` +
      `Please coordinate the professional allocation. Thank you!`
    );

    window.open(`https://wa.me/${cleanPhone}?text=${waMsg}`, "_blank");
  };

  // SUCCESS SCREEN
  if (completed && selectedService) {
    return (
      <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-card p-8 md:p-12 shadow-soft text-center space-y-8 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle className="w-10 h-10 stroke-[2.5]" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-neutral-900 font-display">
            Booking & Payment Successful!
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Your payment of <strong className="text-slate-900">{formattedTotal}</strong> was processed securely. We have confirmed your service partner slot.
          </p>
        </div>

        {/* Receipt details */}
        <div className="border border-slate-200/80 rounded-card p-6 bg-slate-50/50 text-left space-y-4 max-w-md mx-auto text-xs">
          <div className="flex justify-between pb-3 border-b border-slate-200/60 font-bold">
            <span className="text-slate-400 uppercase tracking-wider">Transaction ID</span>
            <span className="text-slate-900 font-mono text-[13px]">{transactionId}</span>
          </div>
          <div className="space-y-2 font-semibold text-slate-600">
            <div className="flex justify-between">
              <span>Service:</span>
              <span className="text-slate-900">{selectedService.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span className="text-slate-900">{bookingDate}</span>
            </div>
            <div className="flex justify-between">
              <span>Time Slot:</span>
              <span className="text-slate-900">{timeSlot}</span>
            </div>
            <div className="flex justify-between">
              <span>Client Name:</span>
              <span className="text-slate-900">{name}</span>
            </div>
            <div className="flex justify-between">
              <span>Paid Amount:</span>
              <span className="text-emerald-600 font-extrabold">{formattedTotal}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 max-w-sm mx-auto">
          <button
            onClick={handleWhatsAppRedirect}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-button text-xs font-black shadow-md shadow-emerald-600/10 transition cursor-pointer flex items-center justify-center gap-2"
          >
            Confirm on WhatsApp
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          
          <Link
            href="/"
            className="inline-block text-xs font-bold text-slate-500 hover:text-primary-600 transition"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      
      {/* Checkout Form Card (Left Column) */}
      <div className="lg:col-span-8 bg-white border border-slate-200/60 rounded-card p-6 md:p-8 shadow-soft text-left">
        
        {/* Back Link */}
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
        </Link>

        <form onSubmit={handleSubmit} className="space-y-8">
          {errorMsg && (
            <div className="p-3.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-button">
              {errorMsg}
            </div>
          )}

          {/* Section 1: Service Selection */}
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-neutral-900 font-display flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center text-xs font-black select-none">
                1
              </span>
              Select Service & Booking Slot
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col space-y-1.5 sm:col-span-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Service
                </label>
                <select
                  disabled={processing}
                  value={selectedService?.name || ""}
                  onChange={handleServiceChange}
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.offer_price || s.price})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col space-y-1.5 sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Preferred Date
                </label>
                <div className="relative flex items-center">
                  <Calendar className="absolute left-4 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    required
                    disabled={processing}
                    min={new Date().toISOString().split("T")[0]}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Time Slot
                </label>
                <div className="relative flex items-center">
                  <Clock className="absolute left-4 w-4 h-4 text-slate-400" />
                  <select
                    disabled={processing}
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot.split(" ")[0]} {slot.split(" ")[1]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Personal Details */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h3 className="text-base font-extrabold text-neutral-900 font-display flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center text-xs font-black select-none">
                2
              </span>
              Billing & Contact Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-4 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    disabled={processing}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Phone Number
                </label>
                <div className="relative flex items-center">
                  <Phone className="absolute left-4 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    disabled={processing}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1.5 sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    disabled={processing}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1.5 sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Street Address
                </label>
                <div className="relative flex items-center">
                  <MapPin className="absolute left-4 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    disabled={processing}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street No, Apartment, Landmark..."
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  City
                </label>
                <input
                  type="text"
                  required
                  disabled={processing}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  PIN Code
                </label>
                <input
                  type="text"
                  required
                  disabled={processing}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="682001"
                  className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
                />
              </div>

              <div className="flex flex-col space-y-1.5 sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Special Notes / Instructions (Optional)
                </label>
                <div className="relative flex items-start">
                  <FileText className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                  <textarea
                    disabled={processing}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Parking instructions or safety guidelines..."
                    rows={2}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Secure Payment */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h3 className="text-base font-extrabold text-neutral-900 font-display flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center text-xs font-black select-none">
                3
              </span>
              Secure Payment Method
            </h3>

            {/* Payment Tabs Selector */}
            <div className="flex rounded-xl bg-slate-100 p-1 gap-1">
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`flex-1 py-2.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  paymentMethod === "card"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <CreditCard className="w-4 h-4" /> Card
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("upi")}
                className={`flex-1 py-2.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  paymentMethod === "upi"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <QrCode className="w-4 h-4" /> UPI / QR
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("netbanking")}
                className={`flex-1 py-2.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  paymentMethod === "netbanking"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Lock className="w-3.5 h-3.5" /> Net Banking
              </button>
            </div>

            {/* Tab Panels */}
            <div className="p-5 border border-slate-200/60 rounded-xl bg-slate-50/50 min-h-[140px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {paymentMethod === "card" && (
                  <motion.div
                    key="card"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="grid grid-cols-1 sm:grid-cols-4 gap-4"
                  >
                    <div className="flex flex-col space-y-1 sm:col-span-4">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        Card Number
                      </label>
                      <input
                        type="text"
                        required={paymentMethod === "card"}
                        disabled={processing}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 16))}
                        placeholder="4111 2222 3333 4444"
                        className="px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
                      />
                    </div>
                    <div className="flex flex-col space-y-1 sm:col-span-2">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        required={paymentMethod === "card"}
                        disabled={processing}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value.slice(0, 5))}
                        placeholder="MM/YY"
                        className="px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
                      />
                    </div>
                    <div className="flex flex-col space-y-1 sm:col-span-2">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        CVV
                      </label>
                      <input
                        type="password"
                        required={paymentMethod === "card"}
                        disabled={processing}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))}
                        placeholder="***"
                        className="px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
                      />
                    </div>
                  </motion.div>
                )}

                {paymentMethod === "upi" && (
                  <motion.div
                    key="upi"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex flex-col sm:flex-row gap-5 items-center"
                  >
                    <div className="w-24 h-24 bg-white p-2 border border-slate-200 rounded-lg flex items-center justify-center shrink-0 shadow-sm select-none">
                      <QrCode className="w-full h-full text-slate-800" />
                    </div>
                    <div className="flex-grow space-y-3 w-full">
                      <div className="flex flex-col space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                          Enter UPI ID
                        </label>
                        <input
                          type="text"
                          required={paymentMethod === "upi"}
                          disabled={processing}
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value.trim())}
                          placeholder="username@upi"
                          className="px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition w-full"
                        />
                      </div>
                      <div className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                        Scan QR Code or enter your UPI address. You will receive a secure collect request in your UPI application.
                      </div>
                    </div>
                  </motion.div>
                )}

                {paymentMethod === "netbanking" && (
                  <motion.div
                    key="netbanking"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex flex-col space-y-1.5"
                  >
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      Select Popular Bank
                    </label>
                    <select
                      disabled={processing}
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
                    >
                      {BANKS.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={processing}
              className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-black shadow-md shadow-primary-600/10 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Securing Connection...
                </>
              ) : (
                <>
                  Pay {formattedTotal} & Confirm Booking
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Order Summary (Right Column) */}
      <div className="lg:col-span-4 bg-white border border-slate-200/60 rounded-card p-6 md:p-8 shadow-soft text-left space-y-6">
        <h3 className="text-sm font-extrabold text-neutral-900 font-display pb-3 border-b border-slate-100">
          Order Summary
        </h3>

        {selectedService ? (
          <div className="space-y-4">
            {/* Selected Service Card */}
            <div className="flex gap-4 items-center">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/40 shrink-0 shadow-sm">
                <Image
                  src={selectedService.img}
                  alt={selectedService.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="leading-tight">
                <span className="text-[9px] font-black text-primary-600 uppercase tracking-wider">
                  {selectedService.category}
                </span>
                <h4 className="text-xs font-extrabold text-neutral-900 font-display line-clamp-1 mt-0.5">
                  {selectedService.name}
                </h4>
                <span className="inline-block mt-1 text-[10px] text-slate-400 font-bold">
                  Profession Slot Allocation
                </span>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="border-t border-slate-100 pt-4 space-y-2.5 text-xs font-semibold text-slate-500">
              <div className="flex justify-between text-slate-400 font-normal">
                <span>Regular Price:</span>
                <span className="line-through">{formattedMrp}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Price:</span>
                <span className="text-slate-800 font-bold">{formattedOffer}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18%):</span>
                <span className="text-slate-800 font-bold">{formattedTax}</span>
              </div>
              
              <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline text-sm">
                <span className="text-neutral-900 font-black font-display">Amount Payable:</span>
                <span className="text-primary-600 font-black font-display text-lg">
                  {formattedTotal}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-400 font-semibold border border-dashed border-slate-200 rounded-xl">
            Please choose a service...
          </div>
        )}

        {/* Security & Guarantees */}
        <div className="border-t border-slate-100 pt-5 space-y-4">
          <div className="flex gap-3 items-center text-[10px] font-semibold text-slate-600">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-neutral-900 font-bold">SSL Secured Payment</div>
              <div className="text-slate-400 font-normal mt-0.5">End-to-end 256-bit encryption.</div>
            </div>
          </div>

          <div className="flex gap-3 items-center text-[10px] font-semibold text-slate-600">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="text-neutral-900 font-bold">100% Satisfaction Check</div>
              <div className="text-slate-400 font-normal mt-0.5">Assurance guidelines by Clean World.</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
