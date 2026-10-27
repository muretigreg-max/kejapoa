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
  
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: "https://kejapoa.vercel.app",
    siteName: "KejaPoa",
    title: "KejaPoa - Verified Rentals Across Kenya",
    description: "Find verified, affordable accommodation near your campus. Skip the stress and find your next rental with KejaPoa.",
    images: [
      {
        url: "https://kejapoa.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "KejaPoa - Verified Rentals Across Kenya",
      },
    ],
  },
  
  twitter: {
    card: "summary_large_image",
    title: "KejaPoa - Verified Rentals Across Kenya",
    description: "Find verified, affordable accommodation near your campus.",
    images: ["https://kejapoa.vercel.app/og-image.png"],
  },
  
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
    google: "SqmSd5ZOrcn_Tvq5twHhAZEZ35UgsxmtxEu1MPo2V6c", 
  },

  // ✅ Add favicon to Next.js metadata
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Google Search Console Verification */}
        <meta name="google-site-verification" content="SqmSd5ZOrcn_Tvq5twHhAZEZ35UgsxmtxEu1MPo2V6c" />
        
        {/* ✅ Favicon Link */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}