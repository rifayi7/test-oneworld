"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_INFO, NAV_LINKS } from "@/content";
import { Button } from "@/components/ui/Button";
import { Phone, ChevronDown, Menu, X } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200/40 px-6 lg:px-12 py-3 flex items-center justify-between shadow-navbar transition-all duration-300">
      
      {/* Brand logo (Left side) - Clickable link to home */}
      <Link href="/" className="flex items-center gap-2.5 select-none hover:opacity-90 transition-opacity shrink-0">
        <Image
          src="https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/clean-world-solutions/brand/logo-mark.webp"
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
      </Link>

      {/* Nav Links & CTAs (Right side) */}
      <div className="flex items-center gap-6">
        
        {/* Desktop Navigation Links: Only visible on desktop viewports (>= 1024px) */}
        <div className="hidden lg:flex items-center gap-6">
          {NAV_LINKS.map((link) => {
            let href = link.href;
            let isActive = false;

            if (link.label === "Services") {
              href = "/services";
              isActive = pathname.startsWith("/services");
            } else if (link.label === "Home") {
              href = "/";
              isActive = pathname === "/";
            } else {
              href = isHome ? link.href : `/${link.href}`;
              isActive = false; // Only highlight primary top-level routes
            }

            return (
              <Link
                key={link.label}
                href={href}
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
              </Link>
            );
          })}
        </div>

        {/* Contact Phone & Book buttons: Visible from 640px (sm) and up */}
        <div className="hidden sm:flex items-center gap-3">
          <Button
            onClick={() => {
              window.dispatchEvent(new CustomEvent("open-call-modal"));
            }}
            variant="outline"
            color="blue"
            className="px-5 py-2.5 text-xs font-extrabold"
          >
            <Phone className="w-3.5 h-3.5 stroke-[2.5]" />
            {SITE_INFO.phone}
          </Button>

          <Button
            href="/checkout"
            variant="solid"
            color="blue"
            className="px-6 py-2.5 text-xs font-extrabold shadow-primary-600/20"
          >
            {SITE_INFO.ctaLabel}
          </Button>
        </div>

        {/* Hamburger Menu Button: Visible on screens < 1024px (lg:hidden) */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden p-2 text-slate-600 hover:text-primary-600 hover:bg-slate-50 rounded-xl transition cursor-pointer flex items-center justify-center"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer (Dropdown Panel): Only visible below 1024px (lg:hidden) */}
      {menuOpen && (
        <div className="absolute top-[64px] left-0 right-0 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-lg px-6 py-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-5 duration-200 lg:hidden z-40">
          <div className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => {
              let href = link.href;
              let isActive = false;

              if (link.label === "Services") {
                href = "/services";
                isActive = pathname.startsWith("/services");
              } else if (link.label === "Home") {
                href = "/";
                isActive = pathname === "/";
              } else {
                href = isHome ? link.href : `/${link.href}`;
                isActive = false;
              }

              return (
                <Link
                  key={link.label}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-between ${
                    isActive
                      ? "text-primary-700 bg-primary-50/80"
                      : "text-slate-600 hover:text-primary-600 hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                  {link.label === "Services" && (
                    <ChevronDown className="w-3.5 h-3.5 opacity-70 stroke-[2.5]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Phone & Book Now buttons inside mobile menu (shown only under 640px mobile screens) */}
          <div className="sm:hidden pt-4 border-t border-slate-100 flex flex-col gap-3">
            <Button
              onClick={() => {
                window.dispatchEvent(new CustomEvent("open-call-modal"));
              }}
              variant="outline"
              color="blue"
              className="w-full py-3.5 text-xs font-extrabold flex items-center justify-center gap-2"
            >
              <Phone className="w-3.5 h-3.5 stroke-[2.5]" />
              {SITE_INFO.phone}
            </Button>

            <Button
              href="/checkout"
              onClick={() => setMenuOpen(false)}
              variant="solid"
              color="blue"
              className="w-full py-3.5 text-xs font-extrabold flex items-center justify-center gap-2 shadow-primary-600/20"
            >
              {SITE_INFO.ctaLabel}
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
