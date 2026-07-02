"use client";

import { SITE_INFO, FOOTER_CONTENT } from "@/content";
import { Reveal } from "@/components/Reveal";
import { Home } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-16 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12"> {/* unslop-ignore */}
          {/* Brand Col */}
          <Reveal direction="up" delay={0.1}>
            <div className="space-y-4">
              <div className="flex items-center gap-2.5 select-none">
                <span className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-green-500 flex items-center justify-center text-white relative shadow-sm">
                  <Home className="w-5 h-5 stroke-[2.5]" />
                </span>
                <div className="flex flex-col leading-none">
                  <span className="text-base font-black tracking-tight text-slate-900">
                    {SITE_INFO.brandName}
                  </span>
                  <span className="text-[0.55rem] font-extrabold tracking-[0.25em] text-green-500 uppercase mt-0.5">
                    {SITE_INFO.brandSuffix}
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-500">
                {SITE_INFO.tagline}
              </p>
            </div>
          </Reveal>

          {/* Links Col */}
          <Reveal direction="up" delay={0.2}>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                Quick Links
              </h4>
              <ul className="space-y-2.5">
                {FOOTER_CONTENT.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-500 hover:text-blue-600 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Contact Col */}
          <Reveal direction="up" delay={0.3}>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                Contact
              </h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>{FOOTER_CONTENT.address}</li>
                <li>
                  Email:{" "}
                  <a
                    href={`mailto:${FOOTER_CONTENT.email}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {FOOTER_CONTENT.email}
                  </a>
                </li>
                <li>
                  Phone:{" "}
                  <a
                    href={`tel:${FOOTER_CONTENT.phone}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {FOOTER_CONTENT.phone}
                  </a>
                </li>
              </ul>
            </div>
          </Reveal>
        </div>

        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <Reveal direction="none" delay={0.4}>
            <p>{FOOTER_CONTENT.copyright}</p>
          </Reveal>
        </div>
      </div>
    </footer>
  );
}
