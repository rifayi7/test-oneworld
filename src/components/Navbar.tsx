"use client";

import { useState } from "react";
import Image from "next/image";
import { SITE_INFO, NAV_LINKS } from "@/content";
import { useLead } from "@/lead";
import { Button } from "@/components/ui/Button";
import { Phone, ChevronDown } from "lucide-react";

export function Navbar() {
  const { openModal } = useLead();
  const [activeTab, setActiveTab] = useState("Home");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200/40 px-6 lg:px-12 py-3 flex items-center justify-between shadow-navbar transition-all duration-300">
      
      {/* Brand logo (Left side) - real CleanWorld mark */}
      <div className="flex items-center gap-2.5 select-none">
        <Image
          src="/brand/logo-mark.png"
          alt="CleanWorld logo"
          width={215}
          height={170}
          className="h-10 w-auto"
          priority
        />
        <div className="flex flex-col leading-none">
          <span className="text-lg font-black tracking-tight text-neutral-900">
            {SITE_INFO.brandName}
          </span>
          <span className="text-[0.6rem] font-extrabold tracking-[0.25em] text-primary-500 uppercase mt-0.5">
            {SITE_INFO.brandSuffix}
          </span>
        </div>
      </div>

      {/* Nav Links & CTAs (Right side) */}
      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-6">
          {NAV_LINKS.map((link) => {
            const isActive = activeTab === link.label;
            return (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setActiveTab(link.label)}
                className={`relative py-2 text-[0.85rem] font-bold transition-all duration-200 flex items-center gap-1 ${
                  isActive
                    ? "text-primary-600"
                    : "text-slate-600 hover:text-primary-600"
                }`}
              >
                {link.label}
                {link.label === "Services" && (
                  <ChevronDown className="w-3.5 h-3.5 opacity-70 stroke-[2.5]" />
                )}
                {/* Active Underline Indicator */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
                )}
              </a>
            );
          })}
        </div>

        {/* Contact Phone & Book buttons */}
        <div className="flex items-center gap-3">
          <Button
            href={`tel:${SITE_INFO.phone.replace(/\s+/g, "")}`}
            variant="outline"
            color="blue"
            className="hidden sm:inline-flex px-5 py-2.5 text-xs font-extrabold"
          >
            <Phone className="w-3.5 h-3.5 stroke-[2.5]" />
            {SITE_INFO.phone}
          </Button>

          <Button
            onClick={openModal}
            variant="solid"
            color="blue"
            className="px-6 py-2.5 text-xs font-extrabold shadow-primary-600/20"
          >
            {SITE_INFO.ctaLabel}
          </Button>
        </div>

      </div>
    </nav>
  );
}
