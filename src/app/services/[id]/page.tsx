import { getServiceById, getAllServices } from "@/db/queries";
import { parsePriceString } from "@/lib/price-utils";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";
import { ServiceImageCarousel } from "@/components/ServiceImageCarousel";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Star,
  Clock,
  Check,
  HelpCircle,
  ChevronRight,
  Award,
} from "lucide-react";

export const revalidate = 60; // ISR cache for 60 seconds

// Dynamic SEO metadata generation
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const service = await getServiceById(parseInt(resolvedParams.id));
  if (!service) {
    return {
      title: "Service Not Found - Clean World Solutions",
    };
  }
  return {
    title: `${service.name} - Professional ${service.category} | Clean World Solutions`,
    description: `${service.desc} Starting at ${service.offer_price || service.price}. Book professional, background-verified technicians today.`,
  };
}

const INCLUSIONS_BY_CATEGORY: Record<string, string[]> = {
  "Water Services": [
    "Complete water drainage and debris vacuuming",
    "High-pressure jet washing of internal walls",
    "Biological disinfection and UV treatment check",
    "Final water quality and pH testing before handover",
    "Eco-friendly, chemical-free sanitization agents",
  ],
  "Home Safety": [
    "Precision mounting and alignment of safety gear",
    "Full network pairing and mobile app configuration",
    "Comprehensive electrical safety and wiring test",
    "Interactive walkthrough and client calibration training",
    "Authorized warranty documentation handover",
  ],
  "Outdoor Services": [
    "High-speed trimming and neat edge cutting",
    "Manual root weeding of wild creepers and thickets",
    "Eco-safe debris bagging and removal from premises",
    "High-pressure washing of interlocks and paved tiles",
    "Detailed clean-up and landscaping audit",
  ],
  "Pest Control": [
    "Deep foundation chemical injection barrier",
    "Application of low-odor, eco-friendly pesticides",
    "Targeted nest/infestation point neutralization",
    "Post-treatment safety and pet guidelines audit",
    "Extended prevention warranty certificate",
  ],
  "Farm Services": [
    "Soil quality evaluation and aeration prep",
    "High-grade organic fertilizer supply and application",
    "Use of specialized professional harvesting safety rigs",
    "Tree basin water harvesting bunding setup",
    "Debris clearing, sorting, and pile organization",
  ],
};

const DEFAULT_INCLUSIONS = [
  "Background-verified professional service partners",
  "Equipped with specialized commercial-grade tools",
  "Post-service cleanup and debris removal included",
  "Full insurance coverage for any accidental damage",
  "100% Satisfaction check and feedback capture",
];

const FAQS_BY_CATEGORY: Record<string, { q: string; a: string }[]> = {
  "Water Services": [
    {
      q: "How long does a typical well/tank cleaning take?",
      a: "Most residential tanks take 2–3 hours. Deep wells may take 4–6 hours depending on the depth, silt buildup, and ease of access.",
    },
    {
      q: "Do you use chemicals that make water unsafe?",
      a: "No. We use chemical-free, food-grade disinfection agents and high-pressure steam/jets. The water is thoroughly flushed and tested before we sign off.",
    },
    {
      q: "How often should I clean my water tank?",
      a: "Health authorities recommend cleaning domestic water storage tanks at least once every 6 months to prevent bacterial growth and silt buildup.",
    },
  ],
  "Home Safety": [
    {
      q: "Will the CCTV cameras record if the power goes out?",
      a: "If connected to a home UPS or inverter, they will record. We can also configure cameras with built-in battery backups or configure solar-powered setups.",
    },
    {
      q: "Is the solar panel installation eligible for government subsidy?",
      a: "Yes, we handle all grid registration and subsidy paperwork for eligible domestic connections to save you the hassle.",
    },
    {
      q: "Can I monitor the security cameras on multiple phones?",
      a: "Yes. During installation, we will set up the primary account and share access to family members' devices securely.",
    },
  ],
  "Outdoor Services": [
    {
      q: "Do you clear and dispose of the cut grass?",
      a: "Yes, our team bags all cut grass, weeds, and garden trimmings and disposes of them off-site as part of the service.",
    },
    {
      q: "Do you supply the interlock cleaning chemicals?",
      a: "Yes, we bring all high-pressure jet wash equipment and specialized eco-safe tile cleaners to remove mold and moss without damaging the paved tiles.",
    },
    {
      q: "Can you trim grass during heavy rain?",
      a: "Light rain is fine, but for safety reasons and to avoid damaging your lawn's soil, we may reschedule in case of heavy downpours.",
    },
  ],
  "Pest Control": [
    {
      q: "Are the pesticides safe for pets and children?",
      a: "Yes. We use advanced, low-toxicity green products that are targeted at pests. We will provide simple safety precautions for children and pets during application.",
    },
    {
      q: "How long do I need to stay out of the house?",
      a: "For standard spraying, you can remain home or step out for just 1-2 hours. For intensive termite control, we'll advise based on the area size.",
    },
    {
      q: "Do you offer a warranty on pest control?",
      a: "Yes, our termite and general pest control services come with a written warranty. If pests return during that period, we re-treat at zero cost.",
    },
  ],
  "Farm Services": [
    {
      q: "What tools do you use for coconut plucking?",
      a: "We use professional mechanical tree climbers and safety harness rigs, ensuring the pluckers' safety and protecting the tree's bark.",
    },
    {
      q: "Do you provide fertilizer along with basin making?",
      a: "We can provide organic manures and fertilizers on request, or feed fertilizers that you have already purchased during the bunding process.",
    },
    {
      q: "Do you clean the farm area after the work is done?",
      a: "Yes. We gather harvested crops in a designated location and clear dry fronds or tree trimmings away from pathways.",
    },
  ],
};

const DEFAULT_FAQS = [
  {
    q: "How do I pay for the service?",
    a: "You pay after the service is fully completed. We accept UPI, bank transfers, and cash directly.",
  },
  {
    q: "Can I reschedule or cancel my booking?",
    a: "Yes, you can reschedule or cancel at any time up to 12 hours before the appointment at no charge.",
  },
  {
    q: "Are your service partners background-verified?",
    a: "Absolutely. All professionals undergo strict criminal background checks and identity verification prior to onboarding.",
  },
];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const serviceId = parseInt(resolvedParams.id);

  if (isNaN(serviceId)) {
    notFound();
  }

  const service = await getServiceById(serviceId);
  if (!service) {
    notFound();
  }

  // Fetch all services to generate recommendations
  const allServices = await getAllServices();

  // Filter for related services (same category, excluding current service)
  let related = allServices.filter(
    (s) => s.category === service.category && s.id !== service.id,
  );

  // If we have fewer than 3, pad with other services
  if (related.length < 3) {
    const idsToExclude = [service.id, ...related.map((r) => r.id)];
    const extraServices = allServices.filter(
      (s) => !idsToExclude.includes(s.id),
    );
    related = [...related, ...extraServices].slice(0, 3);
  } else {
    related = related.slice(0, 3);
  }

  const inclusions =
    INCLUSIONS_BY_CATEGORY[service.category] || DEFAULT_INCLUSIONS;
  const faqs = FAQS_BY_CATEGORY[service.category] || DEFAULT_FAQS;

  // Generate list of images for the spotlight carousel (main service image + two common banners)
  const galleryImages = [
    service.img,
    "/services/common-banner-1.webp",
    "/services/common-banner-2.webp",
  ];

  return (
    <div className="relative min-h-screen flex flex-col justify-between selection:bg-primary-50 bg-slate-50/50">
      <Navbar />

      <main className="flex-grow pt-28 pb-20">
        <div className="container mx-auto max-w-7xl px-6 lg:px-12">
          {/* Breadcrumbs & Back Nav */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary-600 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back to Catalog
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold select-none">
              <Link href="/" className="hover:text-slate-600">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link href="/services" className="hover:text-slate-600">
                Services
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-600 font-bold truncate max-w-[200px]">
                {service.name}
              </span>
            </div>
          </div>

          {/* Service Header / Hero Banner */}
          <div className="bg-white rounded-card border border-slate-200/60 p-6 md:p-8 lg:p-10 shadow-soft mb-12 flex flex-col lg:flex-row gap-8 items-center">
            <div className="relative h-72 sm:h-96 w-full lg:w-2/5 shrink-0 bg-slate-100 rounded-image overflow-hidden shadow-sm">
              <ServiceImageCarousel images={galleryImages} alt={service.name} />
            </div>

            <div className="flex-grow space-y-5 text-left w-full">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="bg-primary-50 border border-primary-100 px-3 py-1 rounded-badge text-[0.65rem] font-black text-primary-600 uppercase tracking-wider">
                  {service.category}
                </span>
                <span className="bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-badge text-[0.65rem] font-black text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Fully Insured
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-black text-neutral-900 font-display leading-tight">
                {service.name}
              </h1>

              <p className="text-sm md:text-base text-neutral-600 leading-relaxed">
                {service.desc}
              </p>

              {/* Pricing & Booking Action */}
              <div className="flex flex-wrap items-center justify-between gap-6 pt-5 border-t border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Starting price
                  </span>
                  {(() => {
                    const { mainPrice, note } = parsePriceString(service.offer_price || service.price);
                    const offerVal = parseInt(mainPrice.replace(/[^0-9]/g, "")) || 0;
                    const mrpStr =
                      service.mrp_price ||
                      `₹${(offerVal + 1000).toLocaleString("en-IN")}`;
                    return (
                      <div className="space-y-2 mt-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm text-slate-400 line-through font-semibold">
                            {mrpStr}
                          </span>
                          <div className="text-3xl font-black text-primary-600 font-display">
                            {mainPrice}
                          </div>
                          <span className="text-xs text-slate-400 font-bold">
                            onwards
                          </span>
                        </div>
                        {note && (
                          <div className="text-xs font-black text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1 rounded-xl w-max tracking-wide">
                            {note}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  <span className="text-[9px] text-slate-400 block mt-0.5">
                    Inclusive of raw materials, labor, and local taxes.
                  </span>
                </div>
                <div className="flex-grow sm:flex-grow-0 min-w-[200px]">
                  <Button
                    href={`/checkout?serviceId=${service.id}`}
                    variant="solid"
                    color="blue"
                    className="w-full py-4 text-xs font-black shadow-md shadow-primary-600/10 flex items-center justify-center gap-2"
                  >
                    Book This Service
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Quick Trust Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <Clock className="w-4.5 h-4.5 text-primary-600 shrink-0" />
                  <span>On-Time Arrival</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4.5 h-4.5 text-primary-600 shrink-0" />
                  <span>4.9/5 Star Rating</span>
                </div>
                <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                  <Award className="w-4.5 h-4.5 text-primary-600 shrink-0" />
                  <span>Verified Experts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            {/* Left side (8 cols): Inclusions */}
            <div className="lg:col-span-8">
              {/* Inclusions Card */}
              <div className="bg-white border border-slate-200/60 rounded-card p-6 md:p-8 shadow-soft text-left h-full">
                <h3 className="text-lg font-extrabold text-neutral-900 font-display mb-6 pb-3 border-b border-slate-100 flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary-600" /> What is
                  included in this service?
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-semibold text-slate-700">
                  {inclusions.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100"
                    >
                      <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                      </span>
                      <span className="leading-snug text-neutral-700 font-medium text-xs">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right side (4 cols): How the Service Works timeline */}
            <div className="lg:col-span-4">
              <div className="bg-white border border-slate-200/60 rounded-card p-6 md:p-8 shadow-soft text-left h-full">
                <h3 className="text-lg font-extrabold text-neutral-900 font-display mb-6 pb-3 border-b border-slate-100">
                  How the service works
                </h3>
                <div className="space-y-8 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  <div className="flex gap-4 relative">
                    <div className="w-10 h-10 rounded-xl bg-primary-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-md shadow-primary-600/10 z-10">
                      01
                    </div>
                    <div className="space-y-1 mt-1">
                      <h4 className="text-xs font-extrabold text-neutral-900 font-display">
                        Book Slot
                      </h4>
                      <p className="text-[10px] text-neutral-500 leading-relaxed">
                        Fill out the checkout form. We&apos;ll coordinate your
                        date via WhatsApp/Call.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 relative">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm z-10">
                      02
                    </div>
                    <div className="space-y-1 mt-1">
                      <h4 className="text-xs font-extrabold text-neutral-900 font-display">
                        Expert Execution
                      </h4>
                      <p className="text-[10px] text-neutral-500 leading-relaxed">
                        Vetted and verified professionals arrive with advanced
                        machinery.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 relative">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm z-10">
                      03
                    </div>
                    <div className="space-y-1 mt-1">
                      <h4 className="text-xs font-extrabold text-neutral-900 font-display">
                        Quality Check & Pay
                      </h4>
                      <p className="text-[10px] text-neutral-500 leading-relaxed">
                        Verify the completed work and pay securely. 100%
                        satisfaction guaranteed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Full-width FAQs block */}
          <div className="bg-white border border-slate-200/60 rounded-card p-6 md:p-8 shadow-soft text-left mb-16">
            <h3 className="text-lg font-extrabold text-neutral-900 font-display mb-6 pb-3 border-b border-slate-100 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary-600" /> Frequently
              Asked Questions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqs.map((faq) => (
                <div
                  key={faq.q}
                  className="space-y-1.5 bg-slate-50/30 p-5 rounded-xl border border-slate-100/50"
                >
                  <h4 className="text-sm font-extrabold text-neutral-900 leading-snug">
                    {faq.q}
                  </h4>
                  <p className="text-[13px] text-slate-500 leading-relaxed font-medium">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Related / Other Services Recommendations Panel */}
          <div className="mt-20 space-y-8 text-left">
            <div className="space-y-2">
              <span className="text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-4 py-1.5 rounded-badge">
                Recommendations
              </span>
              <h3 className="text-2xl font-extrabold text-neutral-900 font-display">
                Other Services You Might Need
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/services/${item.id}`}
                  className="group border border-slate-200/40 bg-white rounded-card overflow-hidden shadow-soft flex flex-col h-full hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    <Image
                      src={item.img}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 240px"
                      className="object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                    <div className="absolute top-3.5 right-3.5 bg-white/95 px-2.5 py-0.5 rounded-badge text-[0.65rem] font-bold text-primary-600 shadow-sm border border-slate-100 select-none">
                      {item.price}
                    </div>
                  </div>
                  <div className="p-5 flex-grow flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                        {item.category}
                      </span>
                      <h4 className="text-sm font-extrabold text-neutral-900 font-display group-hover:text-primary-600 transition-colors line-clamp-1">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-neutral-500 leading-relaxed line-clamp-2">
                        {item.desc}
                      </p>
                    </div>
                    <div className="text-xs font-bold text-primary-600 flex items-center gap-1 group-hover:gap-1.5 transition-all pt-1">
                      Explore Details{" "}
                      <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
