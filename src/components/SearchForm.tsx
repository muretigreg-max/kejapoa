// src/components/SearchForm.tsx
"use client";

import { useRouter } from "next/navigation";
import { Search, MapPin, Home, Zap } from "lucide-react";

const MAJOR_TOWNS = [
  "Nairobi", "Kiambu", "Machakos", "Kajiado", 
  "Nakuru", "Eldoret", "Mombasa", "Kisumu", "Thika"
];

const ROOM_TYPES = [
  "Single Room", "Bedsitter", "1 Bedroom", "2 Bedroom", "3 Bedroom", "Family House"
];

const BUDGETS = [
  { label: "Any Budget", value: "999999" },
  { label: "Under KES 5,000", value: "5000" },
  { label: "Under KES 10,000", value: "10000" },
  { label: "Under KES 15,000", value: "15000" },
  { label: "Under KES 25,000", value: "25000" },
  { label: "Under KES 40,000", value: "40000" },
];

export default function SearchForm() {
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // ✅ BULLETPROOF mobile-friendly form extraction
    const form = e.currentTarget;
    const town = (form.elements.namedItem("town") as HTMLSelectElement)?.value || "";
    const area = (form.elements.namedItem("area") as HTMLInputElement)?.value || "";
    const propertyType = (form.elements.namedItem("propertyType") as HTMLSelectElement)?.value || "";
    const maxBudget = (form.elements.namedItem("maxBudget") as HTMLSelectElement)?.value || "";

    if (!town) {
      alert("Please select a major town to search.");
      return;
    }

    const params = new URLSearchParams();
    params.set("town", town);
    if (area) params.set("area", area);
    if (propertyType) params.set("propertyType", propertyType);
    if (maxBudget && maxBudget !== "999999") params.set("maxBudget", maxBudget);

    router.push(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="max-w-5xl mx-auto">
      {/* Desktop: 4-Column Clean Card */}
      <div className="hidden md:flex items-end gap-4 bg-white rounded-2xl shadow-2xl border border-slate-200/60 p-4 hover:shadow-3xl transition-shadow duration-300">
        
        {/* 1. Major Town */}
        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-900 mb-1.5 ml-1">Major Town</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-600 pointer-events-none" />
            <select 
              name="town" 
              className="w-full pl-10 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none appearance-none text-slate-900 font-semibold cursor-pointer hover:border-slate-300 transition-colors"
            >
              <option value="">Select Town</option>
              {MAJOR_TOWNS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* 2. Subtown / Area */}
        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-900 mb-1.5 ml-1">Area / Neighborhood</label>
          <div className="relative">
            <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-600 pointer-events-none" />
            <input 
              name="area"
              type="text"
              placeholder="e.g., Kilimani, Roysambu, Juja"
              className="w-full pl-10 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 font-semibold placeholder:text-slate-400 placeholder:font-normal hover:border-slate-300 transition-colors"
            />
          </div>
        </div>

        {/* 3. Room Type */}
        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-900 mb-1.5 ml-1">Room Type</label>
          <div className="relative">
            <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-600 pointer-events-none" />
            <select 
              name="propertyType" 
              className="w-full pl-10 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none appearance-none text-slate-900 font-semibold cursor-pointer hover:border-slate-300 transition-colors"
            >
              <option value="">Any Type</option>
              {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* 4. Budget */}
        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-900 mb-1.5 ml-1">Max Budget</label>
          <div className="relative">
            <Zap className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-600 pointer-events-none" />
            <select 
              name="maxBudget" 
              className="w-full pl-10 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none appearance-none text-slate-900 font-semibold cursor-pointer hover:border-slate-300 transition-colors"
            >
              {BUDGETS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </div>
        </div>

        {/* Search Button */}
        <button 
          type="submit" 
          className="bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white p-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center mb-[1px]"
          aria-label="Search"
        >
          <Search className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile: Stacked Card */}
      <div className="md:hidden bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-900 mb-1.5">Major Town</label>
          <select 
            name="town" 
            className="w-full px-4 py-3.5 bg-white border-2 border-slate-300 rounded-xl text-sm text-slate-900 font-semibold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all appearance-none"
          >
            <option value="">Select Town</option>
            {MAJOR_TOWNS.map(t => <option key={t} value={t} className="text-slate-900 font-medium">{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-900 mb-1.5">Area / Neighborhood</label>
          <input 
            name="area" 
            type="text" 
            placeholder="e.g., Kilimani, Juja" 
            className="w-full px-4 py-3.5 bg-white border-2 border-slate-300 rounded-xl text-sm text-slate-900 font-semibold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all placeholder:text-slate-400 placeholder:font-normal"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1.5">Type</label>
            <select 
              name="propertyType" 
              className="w-full px-4 py-3.5 bg-white border-2 border-slate-300 rounded-xl text-sm text-slate-900 font-semibold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all appearance-none"
            >
              <option value="">Any</option>
              {ROOM_TYPES.map(t => <option key={t} value={t} className="text-slate-900 font-medium">{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1.5">Budget</label>
            <select 
              name="maxBudget" 
              className="w-full px-4 py-3.5 bg-white border-2 border-slate-300 rounded-xl text-sm text-slate-900 font-semibold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all appearance-none"
            >
              {BUDGETS.map(b => <option key={b.value} value={b.value} className="text-slate-900 font-medium">{b.label}</option>)}
            </select>
          </div>
        </div>
        <button 
          type="submit" 
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          <Search className="h-5 w-5" /> Search Homes
        </button>
      </div>
    </form>
  );
}