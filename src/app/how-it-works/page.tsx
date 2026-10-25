// src/app/how-it-works/page.tsx
import Link from "next/link";
import { Search, ShieldCheck, Home, ArrowRight, ArrowLeft } from "lucide-react";

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Simple Nav */}
      <nav className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-emerald-700 font-bold text-xl">
            <ArrowLeft className="h-5 w-5" /> KejaPoa
          </Link>
        </div>
      </nav>

      {/* Premium How it Works Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 text-white overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto w-full">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20 mb-6">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs font-bold tracking-widest uppercase text-emerald-300">Simple Process</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
              How <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">KejaPoa</span> Works
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Three simple steps to your perfect new home
            </p>
          </div>

          <div className="space-y-20 lg:space-y-32">
            {/* Step 1 */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="absolute -top-8 -left-4 text-9xl font-black text-emerald-500/20 select-none">01</div>
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl shadow-2xl shadow-emerald-500/50 mb-6">
                    <Search className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-bold mb-4">Search & <span className="text-emerald-400">Discover</span></h3>
                  <p className="text-lg text-slate-300 leading-relaxed mb-6">
                    Tell us your preferred town, neighborhood, room type, and budget. Our smart system instantly surfaces verified homes in your ideal location.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-sm font-medium rounded-full border border-emerald-500/30">Smart Filters</span>
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-sm font-medium rounded-full border border-emerald-500/30">Town-based Search</span>
                  </div>
                </div>
              </div>
              <div className="relative hidden lg:block">
                <div className="aspect-square max-w-md mx-auto bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-3xl border border-white/10 backdrop-blur-sm p-8 flex items-center justify-center">
                  <Search className="h-32 w-32 text-emerald-400/60" strokeWidth={1} />
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative order-2 lg:order-1 hidden lg:block">
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
                  <h3 className="text-3xl sm:text-4xl font-bold mb-4">Verify & <span className="text-blue-400">Connect</span></h3>
                  <p className="text-lg text-slate-300 leading-relaxed mb-6">
                    Every property is physically verified by our team. Browse real photos, read details, and contact landlords directly—no middlemen, no hidden fees.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm font-medium rounded-full border border-blue-500/30">100% Verified</span>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm font-medium rounded-full border border-blue-500/30">Direct Contact</span>
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
                  <h3 className="text-3xl sm:text-4xl font-bold mb-4">Book & <span className="text-purple-400">Move In</span></h3>
                  <p className="text-lg text-slate-300 leading-relaxed mb-6">
                    Secure your new home with confidence. Pay securely via M-Pesa, get your lease agreement, and get ready to settle in.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm font-medium rounded-full border border-purple-500/30">M-Pesa Payments</span>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm font-medium rounded-full border border-purple-500/30">Secure Booking</span>
                  </div>
                </div>
              </div>
              <div className="relative hidden lg:block">
                <div className="aspect-square max-w-md mx-auto bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl border border-white/10 backdrop-blur-sm p-8 flex items-center justify-center">
                  <Home className="h-32 w-32 text-purple-400/60" strokeWidth={1} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-24 text-center">
            <Link href="/" className="inline-flex items-center gap-3 bg-white text-emerald-900 hover:bg-emerald-50 font-bold py-4 px-8 rounded-full transition-all shadow-2xl hover:scale-105 text-lg">
              <ArrowLeft className="h-5 w-5" /> Back to Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}