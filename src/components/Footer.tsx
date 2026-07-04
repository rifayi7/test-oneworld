"use client";

import Image from "next/image";
import { SITE_INFO, FOOTER_CONTENT } from "@/content";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-16 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12"> {/* unslop-ignore — brand/links/contact footer columns, not a feature-card grid */}
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 select-none">
              <Image
                src="https://pub-c2c4d3bdfe384b9ea9857d8c2158d659.r2.dev/clean-world-solutions/brand/logo-mark.webp"
                alt="CleanWorld logo"
                width={215}
                height={170}
                className="h-9 w-auto"
              />
              <div className="flex flex-col leading-none">
                <span className="text-base font-black tracking-tight text-neutral-900">
                  {SITE_INFO.brandName}
                </span>
                <span className="text-[0.55rem] font-extrabold tracking-[0.25em] text-primary-500 uppercase mt-0.5">
                  {SITE_INFO.brandSuffix}
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              {SITE_INFO.tagline}
            </p>
          </div>

          {/* Links Col */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_CONTENT.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-500 hover:text-primary-600 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Col */}
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
                  className="hover:text-primary-600 transition-colors"
                >
                  {FOOTER_CONTENT.email}
                </a>
              </li>
              <li className="space-y-1 mt-2">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Lines:</span>
                {FOOTER_CONTENT.phones ? (
                  FOOTER_CONTENT.phones.map((ph: string) => (
                    <a
                      key={ph}
                      href={`tel:${ph.replace(/\s+/g, "")}`}
                      className="block hover:text-primary-600 transition-colors text-xs font-semibold"
                    >
                      {ph}
                    </a>
                  ))
                ) : (
                  <a
                    href={`tel:${FOOTER_CONTENT.phone}`}
                    className="hover:text-primary-600 transition-colors"
                  >
                    {FOOTER_CONTENT.phone}
                  </a>
                )}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>{FOOTER_CONTENT.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
