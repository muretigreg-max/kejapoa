// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KejaPoa | Find Verified Student Accommodation",
  description: "Find verified and affordable student accommodation near your institution. No account required to search.",
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23059669' rx='20'/%3E%3Cpath d='M50 20 L20 45 L30 45 L30 80 L70 80 L70 45 L80 45 Z' fill='white'/%3E%3Crect x='42' y='58' width='16' height='22' fill='%23059669'/%3E%3C/svg%3E",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Using standard system fonts for instant, offline-friendly loading */}
      <body className="antialiased bg-slate-50 font-sans">
        {children}
      </body>
    </html>
  );
}