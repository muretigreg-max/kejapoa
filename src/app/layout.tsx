// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "KejaPoa - Verified Rentals Across Kenya",
    template: "%s | KejaPoa",
  },
  description: "Find verified, affordable student and family accommodation near your campus or workplace. Browse thousands of bedsitters, 1-bedroom, and family homes across Kenya.",
  keywords: ["student accommodation Kenya", "bedsitter Nairobi", "rental houses Kenya", "campus housing", "affordable rentals", "verified properties Kenya"],
  authors: [{ name: "KejaPoa" }],
  creator: "KejaPoa",
  publisher: "KejaPoa",
  
  // ✅ Add this section with YOUR exact code from Google
  verification: {
    google: "google7399e5c3a0d25e45.html", // <-- Paste YOUR verification code here (just the content part, not the full meta tag)
  },
};
  
  // Open Graph (Facebook, LinkedIn, WhatsApp)
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: "https://kejapoa.vercel.app",
    siteName: "KejaPoa",
    title: "KejaPoa - Verified Rentals Across Kenya",
    description: "Find verified, affordable accommodation near you. Skip the stress and find your next rental with KejaPoa.",
    images: [
      {
        url: "https://kejapoa.vercel.app/og-image.png", // We'll create this
        width: 1200,
        height: 630,
        alt: "KejaPoa - Verified Rentals Across Kenya",
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "KejaPoa - Verified Rentals Across Kenya",
    description: "Find verified, affordable accommodation near your campus.",
    images: ["https://kejapoa.vercel.app/og-image.png"],
  },
  
  // Additional SEO
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  verification: {
    google: "your-google-verification-code", // We'll add this later
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}