// src/app/page.tsx
import Link from "next/link";
import { Search, ShieldCheck, MapPin, Home, Zap, Users, ArrowRight } from "lucide-react";
import { PrismaClient } from "@prisma/client";
import HeroImageSlider from "@/components/HeroImageSlider";
import SearchForm from "@/components/SearchForm";

const prisma = new PrismaClient();

export default async function HomePage() {
  // Fetch featured properties
  const featuredProperties = await prisma.property.findMany({
    where: { isVerified: true, status: "VERIFIED" },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      institution: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  // Fetch only institutions that have at least one property
  const institutionsWithProperties = await prisma.institution.findMany({
    where: {
      properties: {
        some: {},
      },
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: "asc" },
  });

  const hasInstitutions = institutionsWithProperties.length > 0;

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

            {/* Conditional: Search Form OR Empty State */}
            {hasInstitutions ? (
              <SearchForm institutions={institutionsWithProperties} />
            ) : (
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 max-w-2xl mx-auto text-center border border-white/30">
                <Home className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Coming Soon!</h3>
                <p className="text-slate-600 mb-6">
                  We're working with landlords to list properties near your campus. Check back soon!
                </p>
                <Link 
                  href="/landlord/register" 
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
                >
                  Are you a landlord? List your property
                </Link>
              </div>
            )}

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

           {/* 2. HOW IT WORKS */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-emerald-50/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-emerald-100 text-emerald-700 text-sm font-bold px-4 py-1.5 rounded-full mb-4">
              Simple Process
            </div>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">How KejaPoa Works</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Find your perfect student accommodation in 3 easy steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting Line (Desktop Only) */}
            <div className="hidden md:block absolute top-24 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-200" />
            
            {/* Step 1 */}
            <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-br from-emerald-500 to-teal-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                1
              </div>
              <div className="pt-6">
                <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Search className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 text-center">Search & Filter</h3>
                <p className="text-slate-600 text-center leading-relaxed">
                  Enter your institution, preferred room type, and budget. We'll show you verified options near your campus.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-br from-emerald-500 to-teal-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                2
              </div>
              <div className="pt-6">
                <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <ShieldCheck className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 text-center">Verify & Connect</h3>
                <p className="text-slate-600 text-center leading-relaxed">
                  Every property is verified by our team. Contact landlords directly—no middlemen or hidden fees.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-br from-emerald-500 to-teal-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                3
              </div>
              <div className="pt-6">
                <div className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Home className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 text-center">Move In</h3>
                <p className="text-slate-600 text-center leading-relaxed">
                  Secure your room with confidence. Pay securely via M-Pesa and get ready for campus life.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TRUST SIGNALS - Compact Version */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Why Students Trust KejaPoa</h2>
            <p className="text-slate-600">Built for students, by people who understand the struggle</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-5 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
              <ShieldCheck className="h-10 w-10 text-emerald-600 mx-auto mb-3" />
              <div className="text-2xl font-extrabold text-slate-900 mb-1">100%</div>
              <div className="text-sm text-slate-600 font-medium">Verified Properties</div>
            </div>
            
            <div className="text-center p-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
              <MapPin className="h-10 w-10 text-blue-600 mx-auto mb-3" />
              <div className="text-2xl font-extrabold text-slate-900 mb-1">&lt;1km</div>
              <div className="text-sm text-slate-600 font-medium">From Campus</div>
            </div>
            
            <div className="text-center p-5 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
              <Users className="h-10 w-10 text-purple-600 mx-auto mb-3" />
              <div className="text-2xl font-extrabold text-slate-900 mb-1">0%</div>
              <div className="text-sm text-slate-600 font-medium">Agency Fees</div>
            </div>
            
            <div className="text-center p-5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
              <Zap className="h-10 w-10 text-amber-600 mx-auto mb-3" />
              <div className="text-2xl font-extrabold text-slate-900 mb-1">24/7</div>
              <div className="text-sm text-slate-600 font-medium">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED PROPERTIES */}
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

      {/* 5. LANDLORD CTA */}
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