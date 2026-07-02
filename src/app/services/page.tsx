import { getAllServices } from "@/db/queries";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ServicesCatalog } from "@/components/ServicesCatalog";

export const revalidate = 60; // ISR cache for 60 seconds

export default async function ServicesPage() {
  const services = await getAllServices();

  return (
    <div className="relative min-h-screen flex flex-col justify-between selection:bg-primary-50 bg-slate-50/50">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <ServicesCatalog services={services} />
      </main>
      <Footer />
    </div>
  );
}

