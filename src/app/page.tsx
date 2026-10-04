// src/app/page.tsx
import Link from "next/link";
import { Search, ShieldCheck, MapPin, Home, Zap, Users, ArrowRight } from "lucide-react";
import { PrismaClient } from "@prisma/client";
import HeroImageSlider from "@/components/HeroImageSlider";

const prisma = new PrismaClient();

export default async function HomePage() {
  const featuredProperties = await prisma.property.findMany({
    where: { isVerified: true, status: "VERIFIED" },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      institution: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <main className="min-h-screen bg-slate-50">
      {/* 1. HERO SECTION WITH FULL-BLEED BACKGROUND SLIDER */}
      <section className="relative min-h-[700px] lg:min-h-[800px] text-white overflow-hidden">
        {/* Background Image Slider */}
        <HeroImageSlider />
        
        {/* Content Overlay */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 drop-shadow-2xl">
              Find Your Perfect Student <span className="text-emerald-300">Haven</span>
            </h1>
            <p className="text-lg sm:text-xl text-emerald-50 mb-10 max-w-2xl mx-auto drop-shadow-lg">
              Verified, affordable, and close to campus. Skip the stress and find your next room with KejaPoa.
            </p>

            {/* Search Form */}
                        {/* Search Form */}
                       {/* Search Form - Airbnb Inspired */}
            <form 
              action="/search" 
              method="GET" 
              className="max-w-4xl mx-auto"
            >
              {/* Desktop: Unified Pill */}
              <div className="hidden md:flex items-center bg-white rounded-full shadow-2xl border border-slate-200/60 p-1.5 hover:shadow-3xl transition-shadow duration-300">
                
                {/* Institution */}
                <div className="flex-1 px-6 py-3 rounded-full hover:bg-slate-50 transition-colors cursor-pointer border-r border-slate-200">
                  <div className="text-xs font-bold text-slate-900 mb-0.5">Where</div>
                  <select 
                    name="institutionId" 
                    className="w-full text-sm text-slate-600 bg-transparent outline-none cursor-pointer appearance-none"
                    required
                  >
                    <option value="">Select institution</option>
                    <option value="1">Dedan Kimathi University</option>
                    <option value="2">Karatina University</option>
                    <option value="3">Murang'a University</option>
                  </select>
                </div>

                {/* Room Type */}
                <div className="flex-1 px-6 py-3 rounded-full hover:bg-slate-50 transition-colors cursor-pointer border-r border-slate-200">
                  <div className="text-xs font-bold text-slate-900 mb-0.5">Room type</div>
                  <select 
                    name="propertyType" 
                    className="w-full text-sm text-slate-600 bg-transparent outline-none cursor-pointer appearance-none"
                  >
                    <option value="">Any room</option>
                    <option value="Single Room">Single room</option>
                    <option value="Bedsitter">Bedsitter</option>
                    <option value="Self-Contained">Self-contained</option>
                    <option value="One Bedroom">One bedroom</option>
                  </select>
                </div>

                {/* Budget */}
                <div className="flex-1 px-6 py-3 rounded-full hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="text-xs font-bold text-slate-900 mb-0.5">Budget</div>
                  <select 
                    name="maxBudget" 
                    className="w-full text-sm text-slate-600 bg-transparent outline-none cursor-pointer appearance-none"
                  >
                    <option value="99999">Any price</option>
                    <option value="3000">Under KES 3,000</option>
                    <option value="5000">Under KES 5,000</option>
                    <option value="8000">Under KES 8,000</option>
                    <option value="15000">Under KES 15,000</option>
                  </select>
                </div>

                {/* Search Button */}
                <button 
                  type="submit" 
                  className="ml-2 bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white p-4 rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile: Clean Stacked Card */}
              <div className="md:hidden bg-white rounded-3xl shadow-2xl border border-white/30 p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">Where</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600" />
                    <select 
                      name="institutionId" 
                      className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-emerald-500"
                      required
                    >
                      <option value="">Select institution</option>
                      <option value="1">Dedan Kimathi University</option>
                      <option value="2">Karatina University</option>
                      <option value="3">Murang'a University</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">Room type</label>
                    <select 
                      name="propertyType" 
                      className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-emerald-500"
                    >
                      <option value="">Any</option>
                      <option value="Single Room">Single</option>
                      <option value="Bedsitter">Bedsitter</option>
                      <option value="Self-Contained">Self-contained</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">Budget</label>
                    <select 
                      name="maxBudget" 
                      className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-emerald-500"
                    >
                      <option value="99999">Any</option>
                      <option value="3000">KES 3k</option>
                      <option value="5000">KES 5k</option>
                      <option value="8000">KES 8k</option>
                      <option value="15000">KES 15k</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Search className="h-5 w-5" />
                  Search
                </button>
              </div>
            </form>

            {/* Floating Badge */}
            <div className="mt-8 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-full text-sm font-semibold border border-white/20">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-50">500+ Verified Listings</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITIONS */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Students Trust KejaPoa</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">We take the guesswork out of finding off-campus housing.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">100% Verified</h3>
              <p className="text-slate-600">Every property is physically verified by our team to ensure it matches the listing.</p>
            </div>
            
            <div className="text-center p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Close to Campus</h3>
              <p className="text-slate-600">We prioritize listings within walking distance or a short commute to your institution.</p>
            </div>
            
            <div className="text-center p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Direct to Landlord</h3>
              <p className="text-slate-600">No middlemen or hidden agency fees. Connect directly with property owners.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED PROPERTIES */}
      {featuredProperties.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Featured Accommodations</h2>
                <p className="text-slate-600">Hand-picked, highly-rated places ready for you.</p>
              </div>
              <Link href="/search" className="hidden sm:flex items-center gap-2 text-emerald-700 font-semibold hover:underline">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.map((property) => (
                <Link 
                  key={property.id} 
                  href={`/property/${property.id}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative h-48 bg-slate-200">
                    {property.images[0]?.url ? (
                      <img 
                        src={property.images[0].url} 
                        alt={property.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100">
                        <Home className="h-12 w-12 text-emerald-400" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" /> VERIFIED
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-1">{property.name}</h3>
                    <p className="text-sm text-slate-500 mb-3">{property.institution?.name || "Near Campus"}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-extrabold text-emerald-700">KES {Number(property.baseRent).toLocaleString()}</span>
                      <span className="text-sm text-slate-500">/month</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. LANDLORD CTA */}
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
          <Link href="/admin/login" className="hover:text-white transition-colors">Admin</Link>
        </div>
      </footer>
    </main>
  );
}