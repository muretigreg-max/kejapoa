// src/app/page.tsx
import Link from "next/link";
import { Search, MapPin, Home, ArrowRight, Building2 } from "lucide-react";
import { PrismaClient } from "@prisma/client";
import HeroImageSlider from "@/components/HeroImageSlider";
import SearchForm from "@/components/SearchForm";

const prisma = new PrismaClient();

export default async function HomePage() {
  // Just check if we have any properties to show the search form
  const propertyCount = await prisma.property.count({ where: { isVerified: true } });
  const hasProperties = propertyCount > 0;

  return (
    <main className="min-h-screen bg-slate-950">
      {/* SINGLE HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center text-white overflow-hidden">
        <HeroImageSlider />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 w-full">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 drop-shadow-2xl">
              Find Your Perfect <span className="text-emerald-400">Home</span>
            </h1>
            <p className="text-lg sm:text-xl text-emerald-50 mb-12 max-w-2xl mx-auto drop-shadow-lg">
              Verified, affordable, and conveniently located. Skip the stress and find your next rental with KejaPoa.
            </p>

            {hasProperties ? (
              <SearchForm />
            ) : (
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 max-w-2xl mx-auto text-center border border-white/30">
                <Home className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Coming Soon!</h3>
                <p className="text-slate-600 mb-6">We're working with landlords to list properties in your area.</p>
                <Link href="/landlord/register" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all">
                  List your property
                </Link>
              </div>
            )}

            {/* Navigation Links to other sections */}
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <Link href="/how-it-works" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold py-3 px-6 rounded-full border border-white/20 transition-all hover:scale-105">
                <Search className="h-4 w-4" /> How it Works
              </Link>
              <Link href="/locations" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold py-3 px-6 rounded-full border border-white/20 transition-all hover:scale-105">
                <MapPin className="h-4 w-4" /> Browse Locations
              </Link>
              <Link href="/landlord/register" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-full transition-all hover:scale-105 shadow-lg shadow-emerald-500/20">
                <Building2 className="h-4 w-4" /> List Property
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}