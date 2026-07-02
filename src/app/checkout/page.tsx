import { getAllServices } from "@/db/queries";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CheckoutForm } from "@/components/CheckoutForm";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const revalidate = 60; // ISR cache for 60 seconds

export default async function CheckoutPage() {
  const services = await getAllServices();

  return (
    <div className="relative min-h-screen flex flex-col justify-between selection:bg-primary-50 bg-slate-50/50">
      <Navbar />
      <main className="flex-grow pt-28 pb-16">
        <div className="container mx-auto max-w-7xl px-6 lg:px-12">
          <div className="space-y-2 max-w-3xl mx-auto text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-neutral-900 font-display">
              Secure Checkout & Booking
            </h1>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Complete your payment details to confirm your professional service partner allocation.
            </p>
          </div>
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                <span className="text-xs font-bold text-slate-500">Loading Checkout...</span>
              </div>
            }
          >
            <CheckoutForm services={services} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
