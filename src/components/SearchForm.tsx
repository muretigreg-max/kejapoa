// src/components/SearchForm.tsx
"use client";

import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";

interface Institution {
  id: string;
  name: string;
}

interface SearchFormProps {
  institutions: Institution[];
}

export default function SearchForm({ institutions }: SearchFormProps) {
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const institutionId = formData.get("institutionId") as string;
    const propertyType = formData.get("propertyType") as string;
    const maxBudget = formData.get("maxBudget") as string;

    // Build query string
    const params = new URLSearchParams();
    if (institutionId) params.set("institutionId", institutionId);
    if (propertyType) params.set("propertyType", propertyType);
    if (maxBudget && maxBudget !== "99999") params.set("maxBudget", maxBudget);

    // Navigate to search results
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
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
            {institutions.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.name}
              </option>
            ))}
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
              {institutions.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name}
                </option>
              ))}
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
  );
}