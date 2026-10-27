// src/app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/landlord/dashboard",
        "/landlord/properties/new",
        "/api/",
      ],
    },
    sitemap: "https://kejapoa.vercel.app/sitemap.xml",
  };
}