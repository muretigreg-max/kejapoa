// src/app/page.tsx
import Link from "next/link";
import { Search, MapPin, Home, Building2 } from "lucide-react";
import { PrismaClient } from "@prisma/client";
import HeroImageSlider from "@/components/HeroImageSlider";
import SearchForm from "@/components/SearchForm";

const prisma = new PrismaClient();

export default async function HomePage() {
  // Check if we have any properties to show the search form
  const propertyCount = await prisma.property.count({ where: { isVerified: true } });
  const hasProperties = propertyCount > 0;

  return (
    <main className="min-h-screen bg-slate-50">
      
      {/* ✅ STICKY TOP NAVIGATION BAR */}
      <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Brand */}
                        {/* Logo & Brand with Tagline (Visible on ALL screens) */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
              <div className="bg-emerald-600 p-1.5 rounded-lg group-hover:bg-emerald-700 transition-colors flex-shrink-0">
                <Home className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight">KejaPoa</span>
                <span className="text-[10px] sm:text-xs text-slate-500 font-medium leading-tight">Verified Rentals Across Kenya</span>
              </div>
            </Link>

            {/* Desktop Tabs */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/how-it-works" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">
                How it Works
              </Link>
              <Link href="/locations" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">
                Browse Locations
              </Link>
              <Link 
                href="/landlord/register" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2 px-5 rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                List Property
              </Link>
            </div>

            {/* Mobile Tabs (Compact & Touch-Friendly) */}
            <div className="md:hidden flex items-center gap-3">
              <Link href="/how-it-works" className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors" title="How it Works">
                <Search className="h-5 w-5" />
              </Link>
              <Link href="/locations" className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors" title="Locations">
                <MapPin className="h-5 w-5" />
              </Link>
              <Link href="/landlord/register" className="bg-emerald-600 text-white text-xs font-bold py-2 px-3 rounded-lg shadow-sm">
                List
              </Link>
            </div>

          </div>
        </div>
      </nav>

      {/* SINGLE HERO SECTION */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center text-white overflow-hidden">
        <HeroImageSlider />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 w-full">
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
          </div>
        </div>
      </section>

    </main>
  );
}