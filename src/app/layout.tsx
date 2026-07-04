import type { Metadata } from "next";
import { Elms_Sans, Plus_Jakarta_Sans } from "next/font/google";
import { SITE_INFO } from "@/content";
import Script from "next/script";
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

const getSiteUrl = () => {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "http://localhost:3000";
  if (url && !url.startsWith("http")) {
    url = `https://${url}`;
  }
  return url;
};

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: `${SITE_INFO.brandName} - ${SITE_INFO.tagline}`,
  description: SITE_INFO.description,
  openGraph: {
    title: `${SITE_INFO.brandName} - ${SITE_INFO.tagline}`,
    description: SITE_INFO.description,
    type: "website",
    images: [
      {
        url: "/icon.png",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: `${SITE_INFO.brandName} - ${SITE_INFO.tagline}`,
    description: SITE_INFO.description,
    images: ["/icon.png"],
  },
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
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
