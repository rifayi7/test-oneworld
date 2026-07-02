import type { Metadata } from "next";
import { Elms_Sans } from "next/font/google";
import { LeadProvider } from "@/lead";
import { SITE_INFO } from "@/content";
import "./globals.css";

const elmsSans = Elms_Sans({ // unslop-ignore
  subsets: ["latin"],
  variable: "--font-elms",
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
    <html lang="en" className={`${elmsSans.variable}`}>
      <body className={`antialiased ${elmsSans.className}`}>
        <LeadProvider>{children}</LeadProvider>
      </body>
    </html>
  );
}
