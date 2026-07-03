"use client";

import { useState } from "react";
import { updateBookingPaymentAction, deleteBookingAction } from "@/app/admin/actions";
import { 
  Loader2, MapPin, Globe, Laptop, Smartphone, Tablet, 
  ExternalLink, Copy, Check, Edit3, Trash2, Calendar, Clock 
} from "lucide-react";
import { useRouter } from "next/navigation";

export interface BookingRow {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  location: string;
  service: string;
  booking_date: string;
  time_slot: string;
  notes: string | null;
  created_at: string;
  total_price: number;
  advance_paid: number;
  balance_due: number;
  payment_status: string;
  payment_link: string | null;
  latitude: string | null;
  longitude: string | null;
  ip_address: string | null;
  user_agent: string | null;
  device_type: string | null;
}

export function BookingsManager({ initialBookings }: { initialBookings: BookingRow[] }) {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingRow[]>(initialBookings);
  const [editingBooking, setEditingBooking] = useState<BookingRow | null>(null);
  
  // Edit Form States
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [advancePaid, setAdvancePaid] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<string>("Pending");
  const [paymentLink, setPaymentLink] = useState<string>("");
  
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const startEdit = (b: BookingRow) => {
    setEditingBooking(b);
    setTotalPrice(b.total_price);
    setAdvancePaid(b.advance_paid);
    setPaymentStatus(b.payment_status);
    setPaymentLink(b.payment_link || "");
  };

  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;
    setLoading(true);

    try {
      const res = await updateBookingPaymentAction(
        editingBooking.id,
        totalPrice,
        advancePaid,
        paymentStatus,
        paymentLink
      );

      if (res.success) {
        setEditingBooking(null);
        router.refresh();
      } else {
        alert(res.error || "Failed to update payments");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this booking log?")) return;
    setDeletingId(id);
    try {
      const res = await deleteBookingAction(id);
      if (res.success) {
        setBookings(bookings.filter((b) => b.id !== id));
        router.refresh();
      } else {
        alert(res.error || "Failed to delete");
      }
    } catch (e) {
      console.error(e);
      alert("Network error.");
    } finally {
      setDeletingId(null);
    }
  };

  const copyInvoiceLink = (id: number) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/payment-link/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 select-none font-sans">
      
      {/* Bookings Table List */}
      <div className="overflow-hidden border border-slate-200 bg-white rounded-card shadow-soft text-left text-xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[0.65rem]">ID / Client</th>
                <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[0.65rem]">Contact Details</th>
                <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[0.65rem]">Service & Slot</th>
                <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[0.65rem]">Payment Stats</th>
                <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[0.65rem]">Visitor Metadata</th>
                <th className="px-6 py-4 font-bold text-slate-400 uppercase tracking-wider text-[0.65rem] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                    No bookings logged yet.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/40 transition">
                    
                    {/* Client Name & ID */}
                    <td className="px-6 py-5">
                      <div className="leading-tight">
                        <span className="block text-slate-900 font-extrabold text-sm">#{b.id} {b.name}</span>
                        <span className="block text-[10px] text-slate-400 mt-1">
                          Log: {new Date(b.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </td>

                    {/* Contact details & Location */}
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <a href={`tel:${b.phone}`} className="block text-primary-600 hover:underline">
                          {b.phone}
                        </a>
                        {b.email && (
                          <a href={`mailto:${b.email}`} className="block text-[10px] text-slate-500 hover:underline select-all">
                            {b.email}
                          </a>
                        )}
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{b.location}</span>
                          {b.latitude && b.longitude && (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${b.latitude},${b.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-1.5 p-1 bg-primary-50 text-primary-600 rounded hover:bg-primary-100 shrink-0"
                              title="View GPS on Google Maps"
                            >
                              📍 GPS
                            </a>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Service Slot Details */}
                    <td className="px-6 py-5">
                      <div className="leading-tight space-y-1">
                        <span className="block text-slate-800 font-extrabold">{b.service}</span>
                        <div className="flex items-center gap-2.5 text-[10px] text-slate-400 font-bold">
                          <span className="flex items-center gap-0.5">
                            <Calendar className="w-3 h-3" /> {b.booking_date}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-3 h-3" /> {b.time_slot}
                          </span>
                        </div>
                        {b.notes && (
                          <span className="block text-[10px] italic text-slate-400 font-normal line-clamp-1 max-w-[200px]" title={b.notes}>
                            &ldquo;{b.notes}&rdquo;
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Payment Summary */}
                    <td className="px-6 py-5">
                      <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-400">Total:</span>
                          <span className="text-slate-800">₹{b.total_price.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-400">Paid:</span>
                          <span className="text-emerald-600">-₹{b.advance_paid.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between gap-4 font-extrabold border-t border-slate-100 pt-0.5">
                          <span className="text-slate-400">Balance:</span>
                          <span className="text-primary-600">₹{b.balance_due.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="pt-1.5">
                          <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                            b.payment_status === "Paid"
                              ? "bg-emerald-50 text-emerald-600"
                              : b.payment_status === "Partially Paid"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-red-50 text-red-600"
                          }`}>
                            {b.payment_status}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Visitor Stats (IP, browser) */}
                    <td className="px-6 py-5">
                      <div className="space-y-1 text-[10px] text-slate-400 font-semibold">
                        <div className="flex items-center gap-1">
                          <Globe className="w-3 h-3 text-slate-300" />
                          <span>IP: {b.ip_address || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {b.device_type === "Mobile" ? (
                            <Smartphone className="w-3 h-3 text-slate-300" />
                          ) : b.device_type === "Tablet" ? (
                            <Tablet className="w-3 h-3 text-slate-300" />
                          ) : (
                            <Laptop className="w-3 h-3 text-slate-300" />
                          )}
                          <span className="truncate max-w-[120px]" title={b.user_agent || "Desktop"}>
                            {b.device_type || "Desktop"} ({b.user_agent?.split(" ")[0] || "Agent"})
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Actions panel */}
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        {/* Copy Payment Link */}
                        <button
                          onClick={() => copyInvoiceLink(b.id)}
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg hover:text-slate-800 transition cursor-pointer select-none"
                          title="Copy Customer Payment Link"
                        >
                          {copiedId === b.id ? (
                            <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        {/* Customer View */}
                        <a
                          href={`/payment-link/${b.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg hover:text-slate-800 transition flex items-center"
                          title="Open Customer Invoice"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        {/* Edit Payment info */}
                        <button
                          onClick={() => startEdit(b)}
                          className="p-2 bg-primary-50 hover:bg-primary-100 text-primary-600 rounded-lg transition cursor-pointer select-none"
                          title="Update Bill / Payments"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete Log */}
                        <button
                          disabled={deletingId === b.id}
                          onClick={() => handleDelete(b.id)}
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition disabled:opacity-50 cursor-pointer select-none"
                          title="Delete Booking Log"
                        >
                          {deletingId === b.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Payment Overlay/Modal */}
      {editingBooking && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-card p-6 md:p-8 max-w-md w-full shadow-lg text-left space-y-6 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 font-display">
                Update Booking Payment #{editingBooking.id}
              </h3>
              <button
                onClick={() => setEditingBooking(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleUpdatePayment} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                {/* Total Price */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Total Charges (₹)
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      required
                      min={0}
                      value={totalPrice}
                      onChange={(e) => setTotalPrice(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
                    />
                  </div>
                </div>

                {/* Advance Paid */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Advance Paid (₹)
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      required
                      min={0}
                      value={advancePaid}
                      onChange={(e) => setAdvancePaid(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Payment Status
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
                >
                  <option value="Pending">Pending Collection</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Paid">Fully Paid</option>
                </select>
              </div>

              {/* Gateway Link */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Custom Payment Gateway Link (Optional)</span>
                  <span className="text-[9px] text-slate-400 font-semibold normal-case">Razorpay/Stripe URL</span>
                </label>
                <input
                  type="url"
                  placeholder="https://rzp.io/i/..."
                  value={paymentLink}
                  onChange={(e) => setPaymentLink(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
                />
              </div>

              <div className="pt-2 text-right">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-black shadow-md shadow-primary-600/10 flex items-center justify-center gap-1.5 transition cursor-pointer select-none"
                >
                  {loading && <Loader2 className="w-4.5 h-4.5 animate-spin" />}
                  Save Payment Parameters
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
