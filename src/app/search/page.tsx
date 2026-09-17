// src/app/search/page.tsx
import Link from "next/link";
import { Search, MapPin, HomeIcon, ShieldCheck, Wifi, Droplet, Zap, Shield as ShieldIcon, Clock } from "lucide-react";
import { Suspense } from "react";

// Make this a client component because we need URL search params and interactivity
import SearchResultsClient from "./SearchResultsClient";

export const metadata = {
  title: "Search Accommodation | KejaPoa",
};

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Top Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-emerald-600 p-1.5 rounded-lg">
                <HomeIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-extrabold text-emerald-800 tracking-tight">
                KejaPoa
              </span>
            </Link>
            <Link
              href="/"
              className="text-slate-600 hover:text-emerald-700 font-medium"
            >
              ← New Search
            </Link>
          </div>
        </div>
      </nav>

      {/* Search Results */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<LoadingState />}>
          <SearchResultsClient />
        </Suspense>
      </div>
    </main>
  );
}

function LoadingState() {
  return (
    <div className="text-center py-20">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
      <p className="mt-4 text-slate-600">Finding the best rooms for you...</p>
    </div>
  );
}