import { db } from "@/db/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PaymentSimulator } from "@/components/PaymentSimulator";
import { ShieldCheck, Calendar, Clock, MapPin, CheckCircle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { SITE_INFO } from "@/content";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerPaymentPage({ params }: PageProps) {
  const { id } = await params;
  const bookingId = parseInt(id);

  // Fetch booking details
  const res = await db.execute({
    sql: `SELECT id, service, booking_date, time_slot, name, phone, email, location, notes, 
                 total_price, advance_paid, balance_due, payment_status, payment_link 
          FROM bookings WHERE id = ?`,
    args: [bookingId],
  });

  if (res.rows.length === 0) {
    return (
      <div className="relative min-h-screen flex flex-col justify-between bg-slate-50">
        <Navbar />
        <main className="flex-grow flex items-center justify-center pt-28 pb-16 px-6">
          <div className="bg-white border border-slate-200 p-8 rounded-card max-w-md w-full shadow-soft text-center space-y-4">
            <h2 className="text-xl font-black text-slate-800 font-display">Receipt / Payment Link Not Found</h2>
            <p className="text-xs text-slate-500">
              The booking ID <strong>#{bookingId}</strong> does not exist or has been removed. Please verify your invoice details.
            </p>
            <Link href="/" className="inline-block text-xs font-bold text-primary-600 hover:underline">
              Return to Homepage
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const booking = res.rows[0];
  const name = String(booking.name);
  const phone = String(booking.phone);
  const location = String(booking.location);
  const service = String(booking.service);
  const bookingDate = String(booking.booking_date);
  const timeSlot = String(booking.time_slot);
  const notes = booking.notes ? String(booking.notes) : null;
  const totalPrice = Number(booking.total_price ?? 0);
  const advancePaid = Number(booking.advance_paid ?? 0);
  const balanceDue = Number(booking.balance_due ?? 0);
  const paymentStatus = String(booking.payment_status ?? "Pending");
  const paymentLink = booking.payment_link ? String(booking.payment_link) : null;

  // Prefilled WhatsApp coordinate message
  const cleanPhone = SITE_INFO.phone.replace(/[^0-9]/g, "");
  const waMsg = encodeURIComponent(
    `Hi Clean World Solutions!\n\n` +
    `I am checking my invoice for Booking ID: *#${bookingId}*\n` +
    `- Service: ${service}\n` +
    `- Amount Payable: ₹${totalPrice}\n` +
    `- Balance Due: ₹${balanceDue}\n` +
    `- Payment Status: *${paymentStatus}*\n\n` +
    `Please coordinate my slot date confirmation.`
  );
  const waInvoiceLink = `https://wa.me/${cleanPhone}?text=${waMsg}`;

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-slate-50/50">
      <Navbar />
      <main className="flex-grow pt-28 pb-16">
        <div className="container mx-auto max-w-4xl px-6 lg:px-12">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Invoice Summary (Left, 7 cols) */}
            <div className="md:col-span-7 bg-white border border-slate-200/60 rounded-card p-6 md:p-8 shadow-soft space-y-6 text-left">
              
              {/* Header */}
              <div className="flex justify-between items-start pb-5 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">
                    Receipt & Invoice
                  </span>
                  <h1 className="text-xl font-extrabold text-neutral-900 font-display mt-0.5">
                    Booking #{bookingId}
                  </h1>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1.5 rounded-badge text-[9px] font-black uppercase tracking-wider ${
                    paymentStatus === "Paid" 
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      : paymentStatus === "Partially Paid"
                      ? "bg-amber-50 text-amber-600 border border-amber-100"
                      : "bg-red-50 text-red-600 border border-red-100"
                  }`}>
                    {paymentStatus}
                  </span>
                </div>
              </div>

              {/* Customer Particulars */}
              <div className="space-y-3.5 text-xs">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Client & Service Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                  <div className="space-y-1">
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">Client Name</span>
                    <span className="text-slate-800 font-extrabold">{name}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">Phone Number</span>
                    <span className="text-slate-800 font-bold">{phone}</span>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase">Location Address</span>
                    <div className="flex items-start gap-1 text-slate-700 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{location}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Slot details */}
              <div className="space-y-3.5 text-xs">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Reserved Schedule
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-slate-100 p-4 rounded-xl">
                  <div className="flex items-center gap-2.5 text-slate-700 font-medium">
                    <Calendar className="w-4 h-4 text-primary-500 shrink-0" />
                    <div>
                      <span className="block text-[9px] text-slate-400 uppercase font-semibold">Date</span>
                      <span className="font-bold">{bookingDate}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-700 font-medium">
                    <Clock className="w-4 h-4 text-primary-500 shrink-0" />
                    <div>
                      <span className="block text-[9px] text-slate-400 uppercase font-semibold">Time Slot</span>
                      <span className="font-bold">{timeSlot}</span>
                    </div>
                  </div>
                  {notes && (
                    <div className="sm:col-span-2 pt-2 border-t border-slate-50 text-[11px] text-slate-500 font-medium">
                      <strong>Notes:</strong> {notes}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Bill Summary & Payments (Right, 5 cols) */}
            <div className="md:col-span-5 space-y-6 text-left">
              
              {/* Payment Summary Box */}
              <div className="bg-white border border-slate-200/60 rounded-card p-6 md:p-8 shadow-soft space-y-6">
                <h3 className="text-sm font-extrabold text-neutral-900 font-display pb-3 border-b border-slate-100">
                  Billing Details
                </h3>

                {totalPrice === 0 ? (
                  <div className="py-4 text-center space-y-2">
                    <p className="text-xs font-bold text-slate-700">Awaiting Price Confirmation</p>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Our coordinator is reviewing your details to estimate total service charges. We will update this invoice shortly.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2.5 text-xs font-semibold text-slate-500">
                      <div className="flex justify-between">
                        <span>Total Service Price:</span>
                        <span className="text-slate-800 font-bold">₹{totalPrice.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>Advance Paid:</span>
                        <span>-₹{advancePaid.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline text-sm">
                        <span className="text-neutral-900 font-black font-display">Balance Collection:</span>
                        <span className="text-primary-600 font-black font-display text-lg">
                          ₹{balanceDue.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Gateways and simulation */}
                {paymentStatus !== "Paid" && totalPrice > 0 && (
                  <div className="border-t border-slate-100 pt-5 space-y-3">
                    
                    {/* Render customized payment gateway link if specified by Admin */}
                    {paymentLink ? (
                      <a
                        href={paymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-sm flex items-center justify-center gap-2 transition cursor-pointer select-none"
                      >
                        Proceed to Payment Gateway
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <PaymentSimulator bookingId={bookingId} balanceDue={balanceDue} />
                    )}
                  </div>
                )}

                {paymentStatus === "Paid" && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-xs font-bold">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>No outstanding balance. Thank you!</span>
                  </div>
                )}
              </div>

              {/* Coordinate Support Box */}
              <div className="bg-white border border-slate-200/60 rounded-card p-6 md:p-8 shadow-soft text-left space-y-4">
                <div className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Assurance Guarantee</h4>
                    <p className="text-[10px] text-slate-400">100% verified home service partners.</p>
                  </div>
                </div>

                <a
                  href={waInvoiceLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 border border-emerald-500 text-emerald-600 hover:bg-emerald-50/50 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer select-none"
                >
                  Verify Bill on WhatsApp
                </a>
              </div>

            </div>

          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
