"use client";

import { useEffect, useState } from "react";
import { Phone, X } from "lucide-react";
import { SITE_INFO } from "@/content";

export function CallModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-call-modal", handleOpen);

    // Escape key listener to close modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("open-call-modal", handleOpen);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 transition-opacity duration-200 animate-in fade-in"
      onClick={() => setIsOpen(false)}
    >
      <div 
        className="relative bg-white max-w-sm w-full p-6 rounded-card shadow-2xl border border-slate-100 flex flex-col space-y-5 animate-in zoom-in-95 duration-200 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Block */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-extrabold text-neutral-900 font-display">
              Contact Clean World
            </h3>
            <p className="text-[10px] text-slate-500 font-medium">
              Choose a phone line to place your call:
            </p>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Numbers List */}
        <div className="flex flex-col gap-2.5">
          {SITE_INFO.phones.map((phone, idx) => (
            <a
              key={phone}
              href={`tel:${phone.replace(/\s+/g, "")}`}
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-primary-200 hover:bg-primary-50/30 text-slate-800 hover:text-primary-700 transition duration-200 font-display"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-primary-100/60 text-primary-600 flex items-center justify-center text-xs font-black">
                  0{idx + 1}
                </span>
                <span className="text-[13px] font-bold tracking-wide">
                  {phone}
                </span>
              </div>
              <span className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-primary-600">
                <Phone className="w-3.5 h-3.5" />
              </span>
            </a>
          ))}
        </div>

        {/* Footer help notice */}
        <div className="text-[10px] text-slate-400 text-center leading-relaxed font-medium">
          Available 24/7 for support and scheduling.
        </div>
      </div>
    </div>
  );
}
