// src/app/page.tsx
import Link from "next/link";
import { Search, HomeIcon, ShieldCheck, MapPin, Phone, Menu } from "lucide-react";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const metadata = {
  title: "KejaPoa | Find Verified Student Accommodation",
  description: "Find verified and affordable student accommodation near your institution.",
};

export default async function Home() {
  let institutions = [];
  try {
    // Safely fetch institutions. If DB is asleep, it catches the error and continues.
    institutions = await prisma.institution.findMany({
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.warn("Database is currently asleep. Showing fallback homepage.");
  }

  return (
    <main className="min-h-screen bg-slate-50 font-sans">
      {/* 0. TOP NAVIGATION BAR */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-600 p-1.5 rounded-lg">
                <HomeIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-extrabold text-emerald-800 tracking-tight">KejaPoa</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#search" className="text-slate-600 hover:text-emerald-700 font-medium transition-colors">Find a Room</a>
              <a href="#how-it-works" className="text-slate-600 hover:text-emerald-700 font-medium transition-colors">How it Works</a>
              <Link href="/landlord/register" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-5 rounded-lg transition-all shadow-sm hover:shadow-md">
                Landlord Login / Register
              </Link>
            </div>
            <button className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* 1. HERO SECTION */}
      <section id="search" className="bg-gradient-to-br from-emerald-700 via-teal-700 to-emerald-800 text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-4 drop-shadow-sm">
            Pata Nyumba Karibu na Chuo Chako.
          </h1>
          <p className="text-emerald-200/90 mb-10 max-w-2xl mx-auto text-lg">
            Find verified, safe, and affordable accommodation near your institution.
            <span className="font-semibold text-white"> No account required to search!</span>
          </p>

          {/* Search Bar */}
          <form action="/search" method="GET" className="bg-white p-2 sm:p-3 rounded-2xl shadow-2xl max-w-4xl mx-auto text-slate-800 ring-1 ring-white/20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-emerald-600" />
                <select name="institutionId" className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none appearance-none bg-slate-50 hover:bg-white transition-colors text-sm font-medium">
                  <option value="">Select Institution</option>
                  {institutions.length > 0 ? (
                    institutions.map((inst: any) => (
                      <option key={inst.id} value={inst.id}>{inst.name}</option>
                    ))
                  ) : (
                    <option value="" disabled>Database is waking up...</option>
                  )}
                </select>
              </div>

              <div className="relative">
                <HomeIcon className="absolute left-3 top-3.5 h-5 w-5 text-emerald-600" />
                <select name="propertyType" className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none appearance-none bg-slate-50 hover:bg-white transition-colors text-sm font-medium">
                  <option value="">Property Type</option>
                  <option value="Single Room">Single Room</option>
                  <option value="Bedsitter">Bedsitter</option>
                  <option value="Self-Contained">Self-Contained</option>
                  <option value="Shared Room">Shared Room</option>
                </select>
              </div>

              <div className="relative">
                <span className="absolute left-3 top-3.5 text-emerald-700 font-bold text-sm">KES</span>
                <select name="maxBudget" className="w-full pl-14 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none appearance-none bg-slate-50 hover:bg-white transition-colors text-sm font-medium">
                  <option value="">Max Budget</option>
                  <option value="3000">Under 3,000</option>
                  <option value="5000">3,000 - 5,000</option>
                  <option value="8000">5,000 - 8,000</option>
                  <option value="12000">8,000 - 12,000</option>
                  <option value="99999">12,000+</option>
                </select>
              </div>

              <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/30 flex items-center justify-center gap-2 text-sm uppercase tracking-wide">
                <Search className="h-5 w-5" />
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">How KejaPoa Works</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">Getting your ideal student accommodation is as easy as 1-2-3.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <Search className="h-8 w-8 text-emerald-600" />, title: "01 — Search", desc: "Choose your institution, budget, and preferred location. No account needed to browse." },
            { icon: <ShieldCheck className="h-8 w-8 text-emerald-600" />, title: "02 — Compare", desc: "Compare rent, distance, amenities, and real-time availability of verified hostels." },
            { icon: <Phone className="h-8 w-8 text-emerald-600" />, title: "03 — Contact", desc: "Submit a quick enquiry or call the landlord directly to schedule a viewing." }
          ].map((step, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-center mb-6 bg-emerald-50 w-16 h-16 rounded-full items-center mx-auto">{step.icon}</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
              <p className="text-slate-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. TRUST & SAFETY BANNER */}
      <section className="bg-emerald-50 border-y border-emerald-100 py-10 px-4">
        <div className="max-w-4xl mx-auto flex items-start gap-5">
          <div className="bg-emerald-100 p-3 rounded-full flex-shrink-0">
            <ShieldCheck className="h-8 w-8 text-emerald-700" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-emerald-900 mb-2">Your Safety is Our Priority</h3>
            <p className="text-emerald-800 leading-relaxed">
              <strong>Never send money before viewing and confirming the property.</strong>
              While KejaPoa verifies landlords and properties, we strongly advise all students to physically visit the accommodation and meet the landlord before making any deposits or payments.
            </p>
          </div>
        </div>
      </section>

      {/* 4. LANDLORD CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white text-center relative overflow-hidden">
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Are you a Landlord?</h2>
          <p className="text-slate-300 mb-10 text-lg max-w-2xl mx-auto">
            Have vacant rooms or bedsitters? Register on KejaPoa, pay a small activation fee via M-Pesa, and reach thousands of students actively looking for accommodation.
          </p>
          <Link href="/landlord/register" className="inline-block bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-4 px-10 rounded-xl transition-all shadow-lg hover:shadow-amber-500/20 text-lg">
            Register as a Landlord
          </Link>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="bg-slate-950 py-10 px-4 text-center text-slate-400 text-sm border-t border-slate-800">
        <p className="font-semibold text-slate-200 text-lg mb-2">KejaPoa</p>
        <p>© 2026 KejaPoa. All rights reserved.</p>
        <p className="mt-2 text-slate-500">Built for students, by students. 🇰🇪</p>
        <div className="mt-6 pt-6 border-t border-slate-800">
          <Link href="/admin/login" className="text-slate-600 hover:text-emerald-500 text-xs font-medium transition-colors">Admin Login</Link>
        </div>
      </footer>
    </main>
  );
}