import type { Metadata } from "next";
import { Elms_Sans, Plus_Jakarta_Sans } from "next/font/google";
import { SITE_INFO } from "@/content";
import Script from "next/script";
import "./globals.css";
import { headers } from "next/headers";

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

async function getMetadataBase(): Promise<URL> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto")
    ?? (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
  return new URL(`${proto}://${host}`);
}

export async function generateMetadata(): Promise<Metadata> {
  const metadataBase = await getMetadataBase();
  return {
    metadataBase,
    title: `${SITE_INFO.brandName} - ${SITE_INFO.tagline}`,
    description: SITE_INFO.description,
    openGraph: {
      title: `${SITE_INFO.brandName} - ${SITE_INFO.tagline}`,
      description: SITE_INFO.description,
      type: "website",
      images: [
        {
          url: "/og.png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${SITE_INFO.brandName} - ${SITE_INFO.tagline}`,
      description: SITE_INFO.description,
      images: ["/og.png"],
    },
  };
}

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
