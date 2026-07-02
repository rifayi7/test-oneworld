"use client";

import { useState } from "react";
import { Reveal } from "@/components/Reveal";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS_DATA: FaqItem[] = [
  {
    question: "Do you provide same-day service?",
    answer: "Yes, depending on slot availability and location. For urgent requests (e.g. emergency water tank overflow or pipe blockage), please call us directly to book an immediate slot."
  },
  {
    question: "Do you work on Sundays?",
    answer: "Yes, our cleaning and technician teams operate 7 days a week, including Sundays and public holidays, to ensure minimal disruption to your routine."
  },
  {
    question: "Are your staff verified?",
    answer: "Absolutely. All technicians undergo strict background verification, professional skill training, and safety audits before they are deployed to your premises."
  },
  {
    question: "Do you provide warranty?",
    answer: "Yes. Major services like roof waterproofing include structured warranties. Standard maintenance services include a satisfaction period: if you're not happy, we will rectify it."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept UPI (GPay, PhonePe, Paytm), credit/debit cards, net banking, and cash on delivery after service completion."
  },
  {
    question: "How do I book?",
    answer: "You can book directly using our website's slot booking form. Once submitted, your details will be synchronized and a staff member will contact you on WhatsApp to confirm."
  }
];

export function Faqs() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faqs" className="py-20 bg-slate-50 px-6 lg:px-12 scroll-mt-20">
      <Reveal>
        <div className="container mx-auto max-w-4xl space-y-12">

          {/* Title */}
          <div className="text-center space-y-4 max-w-xl mx-auto">
            <span className="text-xs font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-4 py-1.5 rounded-badge">
              Faq
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 font-display">
              Frequently Asked Questions
            </h2>
          </div>

          {/* Accordions */}
          <div className="space-y-4">
            {FAQS_DATA.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={faq.question}
                  className="border border-slate-200/50 bg-white rounded-card overflow-hidden shadow-soft transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none cursor-pointer"
                  >
                    <span className="text-sm font-extrabold text-neutral-900">
                      {faq.question}
                    </span>
                    <span className="text-slate-400">
                      {isOpen ? (
                        <ChevronUp className="w-4.5 h-4.5 stroke-[2.5]" />
                      ) : (
                        <ChevronDown className="w-4.5 h-4.5 stroke-[2.5]" />
                      )}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="px-6 pb-6 text-xs text-neutral-600 leading-relaxed border-t border-slate-50 pt-4">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </Reveal>
    </section>
  );
}
