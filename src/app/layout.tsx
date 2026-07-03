import type { Metadata } from "next";
import { Elms_Sans, Plus_Jakarta_Sans } from "next/font/google";
import { SITE_INFO } from "@/content";
import "./globals.css";

const elmsSans = Elms_Sans({
  subsets: ["latin"],
  variable: "--font-elms",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${SITE_INFO.brandName} - ${SITE_INFO.tagline}`,
  description: SITE_INFO.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${elmsSans.variable} ${plusJakartaSans.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
