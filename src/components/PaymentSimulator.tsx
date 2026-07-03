"use client";

import { useState } from "react";
import { payBookingBalanceAction } from "@/app/admin/actions";
import { CreditCard, Loader2, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export function PaymentSimulator({ bookingId, balanceDue }: { bookingId: number; balanceDue: number }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handlePay = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await payBookingBalanceAction(bookingId);
      if (res.success) {
        setSuccess(true);
        router.refresh();
      } else {
        setErrorMsg(res.error || "Payment simulation failed.");
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 text-emerald-800 text-xs font-semibold animate-in zoom-in-95 duration-200">
        <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-500 flex items-center justify-center mx-auto shadow-sm">
          <Check className="w-4 h-4 stroke-[3]" />
        </span>
        <p>Payment Successful! Receipt updated in real-time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {errorMsg && (
        <p className="text-[10px] font-bold text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100 text-left">
          {errorMsg}
        </p>
      )}
      
      <button
        onClick={handlePay}
        disabled={loading || balanceDue <= 0}
        className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-black shadow-md shadow-primary-600/10 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 select-none"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing UPI/Card Sandbox...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            Simulate Online Payment (₹{balanceDue.toLocaleString("en-IN")})
          </>
        )}
      </button>
    </div>
  );
}
