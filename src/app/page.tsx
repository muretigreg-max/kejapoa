// src/app/page.tsx
import Link from "next/link";
import { 
  Search, ShieldCheck, MapPin, Home, Zap, Users, ArrowRight, 
  Heart, Star, GraduationCap, Building2, Wifi, Droplet, 
  Shield as ShieldIcon, Car, UtensilsCrossed
} from "lucide-react";
import { PrismaClient } from "@prisma/client";
import HeroImageSlider from "@/components/HeroImageSlider";
import SearchForm from "@/components/SearchForm";

const prisma = new PrismaClient();

// Category definitions (Airbnb-style)
const categories = [
  { id: "all", name: "All", icon: Home },
  { id: "Bedsitter", name: "Bedsitters", icon: Home },
  { id: "Single Room", name: "Single Rooms", icon: Building2 },
  { id: "Self-Contained", name: "Self-Contained", icon: Building2 },
  { id: "One Bedroom", name: "1 Bedroom", icon: Building2 },
  { id: "Budget", name: "Under KES 5k", icon: Zap },
  { id: "Premium", name: "Premium", icon: Star },
  { id: "Verified", name: "Verified", icon: ShieldCheck },
];

export default async function HomePage() {
  // Fetch featured properties (Airbnb-style cards)
  const featuredProperties = await prisma.property.findMany({
    where: { isVerified: true, status: "VERIFIED" },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      institution: { select: { name: true } },
      campus: { select: { name: true } },
      units: { select: { type: true, rent: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  // Fetch institutions with properties (for "Browse by Institution")
  const institutionsWithProperties = await prisma.institution.findMany({
    where: { properties: { some: {} } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
    take: 6,
  });

  // Fetch properties per institution for the destination cards
  const institutionStats = await Promise.all(
    institutionsWithProperties.map(async (inst) => {
      const count = await prisma.property.count({
        where: { institutionId: inst.id, isVerified: true },
      });
      const sampleProperty = await prisma.property.findFirst({
        where: { institutionId: inst.id, isVerified: true },
        include: { images: { where: { isPrimary: true }, take: 1 } },
      });
      return {
        ...inst,
        propertyCount: count,
        coverImage: sampleProperty?.images[0]?.url || null,
      };
    })
  );

  const hasInstitutions = institutionsWithProperties.length > 0;

  return (
    <main className="min-h-screen bg-white">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[700px] lg:min-h-[800px] text-white overflow-hidden">
        <HeroImageSlider />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 drop-shadow-2xl">
              Find Your Perfect Student <span className="text-emerald-300">Haven</span>
            </h1>
            <p className="text-lg sm:text-xl text-emerald-50 mb-10 max-w-2xl mx-auto drop-shadow-lg">
              Verified, affordable, and close to campus. Skip the stress and find your next room with KejaPoa.
            </p>

            {hasInstitutions ? (
              <SearchForm institutions={institutionsWithProperties} />
            ) : (
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 max-w-2xl mx-auto text-center border border-white/30">
                <Home className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Coming Soon!</h3>
                <p className="text-slate-600 mb-6">
                  We're working with landlords to list properties near your campus.
                </p>
                <Link 
                  href="/landlord/register" 
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
                >
                  Are you a landlord? List your property
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. CATEGORY PILLS (Airbnb-style horizontal scroll) */}
      <section className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8 py-4 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.id}
                  href={cat.id === "all" ? "/search" : `/search?category=${cat.id}`}
                  className="flex flex-col items-center gap-2 min-w-fit pb-2 border-b-2 border-transparent hover:border-slate-900 hover:text-slate-900 text-slate-600 transition-all group"
                >
                  <Icon className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold whitespace-nowrap">{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. FEATURED PROPERTIES (Airbnb-style grid) */}
      {featuredProperties.length > 0 && (
        <section className="py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Popular stays for students</h2>
                <p className="text-slate-600">Verified rooms near your campus</p>
              </div>
              <Link href="/search" className="hidden sm:flex items-center gap-2 text-slate-900 font-semibold hover:underline underline-offset-4">
                Show all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProperties.map((property) => {
                const lowestRent = property.units.length > 0 
                  ? Math.min(...property.units.map(u => Number(u.rent)))
                  : Number(property.baseRent);

                return (
                  <Link 
                    key={property.id} 
                    href={`/property/${property.id}`}
                    className="group"
                  >
                    {/* Image */}
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 mb-3">
                      {property.images[0]?.url ? (
                        <img 
                          src={property.images[0].url} 
                          alt={property.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100">
                          <Home className="h-16 w-16 text-emerald-400" />
                        </div>
                      )}
                      
                      {/* Heart/Favorite Button */}
                      <button 
                        className="absolute top-3 right-3 text-white hover:scale-110 transition-transform"
                        onClick={(e) => e.preventDefault()}
                        aria-label="Save to favorites"
                      >
                        <Heart className="h-6 w-6 drop-shadow-md" fill="rgba(0,0,0,0.3)" />
                      </button>

                      {/* Verified Badge */}
                      {property.isVerified && (
                        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                          <ShieldCheck className="h-3 w-3" />
                          Verified
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-semibold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                          {property.name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm flex-shrink-0">
                          <Star className="h-3.5 w-3.5 fill-slate-900 text-slate-900" />
                          <span className="font-medium">New</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-slate-600 truncate">
                        {property.campus?.name || property.institution?.name || "Near campus"}
                      </p>
                      
                      <p className="text-sm text-slate-500">
                        {property.units.length > 0 ? property.units.map(u => u.type).slice(0, 2).join(" · ") : "Multiple room types"}
                      </p>
                      
                      <p className="pt-1">
                        <span className="font-semibold text-slate-900">
                          KES {lowestRent.toLocaleString()}
                        </span>
                        <span className="text-slate-600 text-sm"> /month</span>
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link href="/search" className="inline-flex items-center gap-2 text-slate-900 font-semibold hover:underline">
                Show all properties <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 4. HOW IT WORKS - PREMIUM VERSION */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20 mb-6">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs font-bold tracking-widest uppercase text-emerald-300">Simple Process</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
              How <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">KejaPoa</span> Works
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Three simple steps to your perfect student accommodation
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-20 lg:space-y-32">
            
            {/* Step 1 */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="absolute -top-8 -left-4 text-9xl font-black text-emerald-500/20 select-none">01</div>
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl shadow-2xl shadow-emerald-500/50 mb-6">
                    <Search className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-bold mb-4">
                    Search & <span className="text-emerald-400">Discover</span>
                  </h3>
                  <p className="text-lg text-slate-300 leading-relaxed mb-6">
                    Tell us your institution, preferred room type, and budget. Our smart system instantly surfaces verified options near your campus.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-sm font-medium rounded-full border border-emerald-500/30">Smart Filters</span>
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-sm font-medium rounded-full border border-emerald-500/30">Instant Results</span>
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-sm font-medium rounded-full border border-emerald-500/30">Campus Proximity</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square max-w-md mx-auto bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-3xl border border-white/10 backdrop-blur-sm p-8 flex items-center justify-center">
                  <Search className="h-32 w-32 text-emerald-400/60" strokeWidth={1} />
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative order-2 lg:order-1">
                <div className="aspect-square max-w-md mx-auto bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-3xl border border-white/10 backdrop-blur-sm p-8 flex items-center justify-center">
                  <ShieldCheck className="h-32 w-32 text-blue-400/60" strokeWidth={1} />
                </div>
              </div>
              <div className="relative order-1 lg:order-2">
                <div className="absolute -top-8 -left-4 text-9xl font-black text-blue-500/20 select-none">02</div>
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl shadow-2xl shadow-blue-500/50 mb-6">
                    <ShieldCheck className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-bold mb-4">
                    Verify & <span className="text-blue-400">Connect</span>
                  </h3>
                  <p className="text-lg text-slate-300 leading-relaxed mb-6">
                    Every property is physically verified by our team. Browse real photos, read details, and contact landlords directly—no middlemen, no hidden fees.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm font-medium rounded-full border border-blue-500/30">100% Verified</span>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm font-medium rounded-full border border-blue-500/30">Direct Contact</span>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm font-medium rounded-full border border-blue-500/30">Real Photos</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="absolute -top-8 -left-4 text-9xl font-black text-purple-500/20 select-none">03</div>
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl shadow-2xl shadow-purple-500/50 mb-6">
                    <Home className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-bold mb-4">
                    Book & <span className="text-purple-400">Move In</span>
                  </h3>
                  <p className="text-lg text-slate-300 leading-relaxed mb-6">
                    Secure your room with confidence. Pay securely via M-Pesa, get your lease agreement, and get ready for an amazing campus life.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm font-medium rounded-full border border-purple-500/30">M-Pesa Payments</span>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm font-medium rounded-full border border-purple-500/30">Digital Lease</span>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm font-medium rounded-full border border-purple-500/30">Secure Booking</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square max-w-md mx-auto bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl border border-white/10 backdrop-blur-sm p-8 flex items-center justify-center">
                  <Home className="h-32 w-32 text-purple-400/60" strokeWidth={1} />
                </div>
              </div>
            </div>

          </div>

          {/* CTA at bottom */}
          <div className="mt-24 text-center">
            <Link 
              href="/search" 
              className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-4 px-8 rounded-full transition-all shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 text-lg"
            >
              Start Your Search
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. BROWSE BY INSTITUTION (Airbnb "destinations" style) */}
      {institutionStats.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Browse by institution</h2>
              <p className="text-slate-600">Find verified housing near your campus</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {institutionStats.map((inst) => (
                <Link
                  key={inst.id}
                  href={`/search?institutionId=${inst.id}`}
                  className="group relative h-64 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all"
                >
                  {inst.coverImage ? (
                    <img 
                      src={inst.coverImage} 
                      alt={inst.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center">
                      <GraduationCap className="h-20 w-20 text-white/30" />
                    </div>
                  )}
                  
                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-1 drop-shadow-lg">{inst.name}</h3>
                    <p className="text-sm text-white/90 font-medium">
                      {inst.propertyCount} {inst.propertyCount === 1 ? "property" : "properties"} available
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="h-4 w-4 text-slate-900" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. LANDLORD CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-emerald-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Are you a Landlord?</h2>
          <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
            List your property for free and reach thousands of verified students looking for accommodation near their campus.
          </p>
          <Link 
            href="/landlord/register" 
            className="inline-flex items-center gap-2 bg-white text-emerald-900 hover:bg-emerald-50 font-bold py-4 px-8 rounded-xl transition-all shadow-lg text-lg"
          >
            List Your Property Today <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-4 text-center text-sm">
        <p>© {new Date().getFullYear()} KejaPoa. All rights reserved.</p>
        <div className="mt-2 flex justify-center gap-4">
          <Link href="/login" className="hover:text-white transition-colors">Sign in</Link>
          <Link href="/landlord/register" className="hover:text-white transition-colors">List property</Link>
        </div>
      </footer>
    </main>
  );
}