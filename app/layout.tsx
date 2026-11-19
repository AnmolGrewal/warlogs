import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import NavLinks from "@/components/NavLinks";
import { SOURCE_URL } from "@/lib/patchNotes";
import "./globals.css";

const barlow = Barlow_Condensed({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-barlow" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-mono-face" });

export const metadata: Metadata = {
  title: "WARDOGS Season 3 — Patch Notes & Logistics Calculator",
  description: "Season 03 patch notes broken down by category with buffs and nerfs, plus a logistics XP/cash calculator with Season 3 estimates and a Season 2 baseline.",
};

export const viewport: Viewport = { themeColor: "#0e110f", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${barlow.variable} ${inter.variable} ${mono.variable}`}>
      <body>
        <header className="site-header">
          <div className="container">
            <Link href="/" className="brand">
              <span className="brand-mark">S3</span>
              <span className="brand-text">
                WARDOGS <span>SEASON 3 BRIEFING</span>
              </span>
            </Link>
            <NavLinks />
          </div>
        </header>
        <main className="container">{children}</main>
        <footer className="container foot">
          Fan-made, not affiliated with BULKHEAD or Team17. Source{" "}
          <a href={SOURCE_URL} target="_blank" rel="noreferrer">
            Season 03 Patch Notes
          </a>{" "}
          (11 Nov 2026).
        </footer>
      </body>
    </html>
  );
}
