"use client";

import { useState, useEffect } from "react";
import { MessageSquare, X, Send, Phone, Mail, Mic } from "lucide-react";
import { SITE_INFO } from "@/content";
import Image from "next/image";

export function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false);
  const [pulse, setPulse] = useState(true);

  // Stop pulsing after drawer is opened once
  useEffect(() => {
    if (isOpen) {
      setPulse(false);
    }
  }, [isOpen]);

  const cleanPhone = SITE_INFO.phone.replace(/[^0-9]/g, "");
  const waLink = `https://wa.me/${cleanPhone}?text=Hi%20Clean%20World%20Solutions,%20I%20want%20to%20inquire%20about%20your%20services%20(Deep%20Well%20Cleaning,%20Solar%20Installation,%20Water%20Tank%20Cleaning,%20etc.)`;

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none font-sans">
      
      {/* Drawer */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white border border-slate-200 rounded-card shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="bg-primary-600 px-5 py-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/20 bg-primary-700">
                <Image
                  src="https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/laccadives-coral-trails/hero/avatar.webp"
                  alt="Support Representative"
                  fill
                  className="object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-primary-600 animate-pulse" />
              </div>
              <div className="text-left leading-tight">
                <h4 className="text-xs font-black tracking-tight">Clean World Agent</h4>
                <span className="text-[10px] font-semibold text-primary-200">Online • Typically replies instantly</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4 bg-slate-50 text-left max-h-[300px] overflow-y-auto">
            {/* Chat Bubble 1 */}
            <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none p-3.5 shadow-sm max-w-[85%] text-xs space-y-1">
              <p className="text-slate-700 font-medium">
                Hello! Welcome to <strong>Clean World Solutions</strong>. 
              </p>
              <p className="text-slate-600 font-normal">
                How can we help you today with deep well cleaning, roof waterproofing, solar installations, or farm services?
              </p>
            </div>

            {/* Chat Bubble 2 (WhatsApp Voice Chatting Highlight) */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl rounded-tl-none p-3.5 shadow-sm max-w-[85%] text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                <Mic className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>WhatsApp Voice Chatting</span>
              </div>
              <p className="text-emerald-800 font-normal">
                You can send us a <strong>voice note</strong> on WhatsApp! Speak your requirement in Malayalam or English for a fast booking & quote.
              </p>
            </div>
          </div>

          {/* Quick Channels / Action Panel */}
          <div className="p-4 bg-white border-t border-slate-100 space-y-2">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Send className="w-4 h-4 fill-white" />
              Chat on WhatsApp
            </a>

            <div className="grid grid-cols-2 gap-2">
              <a
                href={`tel:${cleanPhone}`}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[10px] font-extrabold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-primary-600" />
                Call Direct
              </a>
              <a
                href={`mailto:${SITE_INFO.email}`}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[10px] font-extrabold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-red-500" />
                Email Us
              </a>
            </div>
          </div>

        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full text-white flex items-center justify-center shadow-lg transition duration-300 cursor-pointer ${
          isOpen
            ? "bg-slate-800 hover:bg-slate-900"
            : "bg-emerald-600 hover:bg-emerald-700"
        } ${pulse && !isOpen ? "animate-bounce" : ""}`}
        aria-label="Open Communication Center"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative">
            <MessageSquare className="w-6 h-6 stroke-[2.2] fill-white" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-emerald-600">
              1
            </span>
          </div>
        )}
      </button>

    </div>
  );
}
