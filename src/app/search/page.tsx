// src/app/search/page.tsx
import Link from "next/link";
import { HomeIcon } from "lucide-react";
import { Suspense } from "react";
import SearchResultsClient from "./SearchResultsClient";

export const metadata = {
  title: "Search Accommodation | KejaPoa",
};

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Top Nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-emerald-600 p-1.5 rounded-lg group-hover:bg-emerald-700 transition-colors">
                <HomeIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                KejaPoa
              </span>
            </Link>
            <Link
              href="/"
              className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors flex items-center gap-1"
            >
              ← New Search
            </Link>
          </div>
        </div>
      </nav>

      {/* Search Results Area */}
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
      <p className="mt-4 text-slate-600 font-medium">Finding the best rooms for you...</p>
    </div>
  );
}