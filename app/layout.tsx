import type { Metadata } from "next";
import { Cinzel, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Crown of the Realm | School of Arts and Design (SOAD) • British Challenge 2026",
  description:
    "School of Arts and Design (SOAD) presents Crown of the Realm — an open British artistic competition inviting creators across the globe to reimagine Britain's historic interiors and architectural treasures.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cinzel.variable} ${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#FAF8F5] text-[#1A1A1A] selection:bg-[#C5A059]/30 selection:text-[#0D1F3C]">
        {children}
      </body>
    </html>
  );
}
