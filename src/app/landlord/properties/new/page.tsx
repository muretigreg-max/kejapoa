// src/app/landlord/properties/new/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, MapPin, Home, Upload, X, Plus, Minus, 
  Loader2, ShieldCheck, Building2, Zap, Sparkles, 
  Camera, Image as ImageIcon, Check, Info, TrendingUp,
  Users, Clock, Award
} from "lucide-react";

interface Amenity {
  id: string;
  name: string;
}

interface Unit {
  unitNumber: string;
  type: string;
  rent: string;
}

const UNIT_TYPES = [
  "Single Room", "Bedsitter", "1 Bedroom", "2 Bedroom", "3 Bedroom", "Family House"
];

export default function NewPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  
  const [units, setUnits] = useState<Unit[]>([
    { unitNumber: "1", type: "Bedsitter", rent: "" }
  ]);
  
  const [images, setImages] = useState<{ url: string; isPrimary: boolean }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    town: "",
    area: "",
    baseRent: "",
    deposit: "",
  });

  useEffect(() => {
    async function fetchAmenities() {
      try {
        const res = await fetch("/api/properties");
        const data = await res.json();
        setAmenities(data.amenities || []);
      } catch (err) {
        console.error("Failed to fetch amenities");
      }
    }
    fetchAmenities();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUnitChange = (index: number, field: keyof Unit, value: string) => {
    const newUnits = [...units];
    newUnits[index][field] = value;
    setUnits(newUnits);
  };

  const addUnit = () => {
    setUnits([...units, { unitNumber: String(units.length + 1), type: "Bedsitter", rent: "" }]);
  };

  const removeUnit = (index: number) => {
    if (units.length > 1) {
      setUnits(units.filter((_, i) => i !== index));
    }
  };

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenityId) 
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "kejapoa_properties");

    const res = await fetch("https://api.cloudinary.com/v1_1/dnxxkqzqj/image/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.secure_url || null;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processFiles(Array.from(files));
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    if (files.length === 0) return;
    await processFiles(files);
  };

  const processFiles = async (files: File[]) => {
    setUploading(true);
    try {
      for (const file of files) {
        const url = await uploadFile(file);
        if (url) {
          setImages(prev => [...prev, { 
            url, 
            isPrimary: prev.length === 0
          }]);
        }
      }
    } catch (err) {
      setError("Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    if (newImages.length > 0 && !newImages.some(img => img.isPrimary)) {
      newImages[0].isPrimary = true;
    }
    setImages(newImages);
  };

  const setPrimaryImage = (index: number) => {
    setImages(images.map((img, i) => ({ ...img, isPrimary: i === index })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!formData.name || !formData.town || !formData.baseRent) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    if (units.some(u => !u.rent)) {
      setError("Please enter rent for all units.");
      setLoading(false);
      return;
    }

    if (images.length === 0) {
      setError("Please upload at least one image.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          units,
          amenities: selectedAmenities,
          images,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create property");
      }

      setSuccess("Property submitted successfully! Our team will review it within 24 hours.");
      setTimeout(() => router.push("/landlord/dashboard"), 2500);
    } catch (err: any) {
      setError(err.message || "Failed to create property");
    } finally {
      setLoading(false);
    }
  };

  // Calculate completion progress
  const completionSteps = [
    !!formData.name,
    !!formData.town,
    units.every(u => !!u.rent),
    images.length > 0,
  ];
  const completionPercent = Math.round((completionSteps.filter(Boolean).length / completionSteps.length) * 100);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      
      {/* Premium Top Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/landlord/dashboard" className="flex items-center gap-2 text-slate-700 hover:text-emerald-600 font-medium transition-colors group">
              <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-emerald-100 transition-colors">
                <ArrowLeft className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold">Back to Dashboard</span>
            </Link>
            <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700 hidden sm:inline">Verified Landlord</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-400 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-emerald-300" />
            <span className="text-xs font-bold tracking-widest uppercase text-emerald-300">List Your Property</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 max-w-2xl">
            Reach thousands of verified tenants
          </h1>
          <p className="text-lg text-emerald-100 max-w-2xl mb-8">
            List your property for free and connect directly with quality tenants. No middlemen, no hidden fees.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-xl">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <TrendingUp className="h-5 w-5 text-emerald-300 mb-1" />
              <div className="text-2xl font-extrabold">10k+</div>
              <div className="text-xs text-emerald-200">Active tenants</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <Clock className="h-5 w-5 text-emerald-300 mb-1" />
              <div className="text-2xl font-extrabold">24h</div>
              <div className="text-xs text-emerald-200">Fast approval</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <Award className="h-5 w-5 text-emerald-300 mb-1" />
              <div className="text-2xl font-extrabold">0%</div>
              <div className="text-xs text-emerald-200">Commission fees</div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="sticky top-16 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              <span className="text-sm font-bold text-slate-700 whitespace-nowrap">{completionPercent}% complete</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Alert Messages */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-5 py-4 rounded-xl flex items-start gap-3 shadow-sm">
              <div className="bg-red-500 p-1 rounded-full flex-shrink-0 mt-0.5">
                <X className="h-3 w-3 text-white" />
              </div>
              <div>
                <div className="font-bold text-sm">Something went wrong</div>
                <div className="text-sm text-red-700 mt-0.5">{error}</div>
              </div>
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 px-5 py-4 rounded-xl flex items-start gap-3 shadow-sm">
              <div className="bg-emerald-500 p-1 rounded-full flex-shrink-0 mt-0.5">
                <Check className="h-3 w-3 text-white" />
              </div>
              <div>
                <div className="font-bold text-sm">Success!</div>
                <div className="text-sm text-emerald-700 mt-0.5">{success}</div>
              </div>
            </div>
          )}

          {/* Section 1: Basic Information */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
              <div className="bg-white p-2 rounded-xl shadow-sm">
                <Building2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Basic Information</h2>
                <p className="text-xs text-slate-600">Tell tenants about your property</p>
              </div>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
                  Property Name
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Matangi Heights Apartments"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white outline-none transition-all text-slate-900 font-medium placeholder:text-slate-400 placeholder:font-normal"
                  required
                />
                <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  A catchy name helps your property stand out
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe what makes your property special — security, nearby amenities, transport access, etc."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white outline-none transition-all text-slate-900 resize-none placeholder:text-slate-400"
                />
              </div>
            </div>
          </section>

          {/* Section 2: Location */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
              <div className="bg-white p-2 rounded-xl shadow-sm">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Location</h2>
                <p className="text-xs text-slate-600">Help tenants find you easily</p>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
                    Major Town
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="town"
                    value={formData.town}
                    onChange={handleChange}
                    placeholder="e.g., Ruiru, Kimbo-Ruiru, Juja"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white outline-none transition-all text-slate-900 font-medium placeholder:text-slate-400 placeholder:font-normal"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1.5">The main town near your property</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Area / Neighborhood</label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    placeholder="e.g., Matangi, Kilimani, Roysambu"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white outline-none transition-all text-slate-900 font-medium placeholder:text-slate-400 placeholder:font-normal"
                  />
                  <p className="text-xs text-slate-500 mt-1.5">Specific estate or neighborhood</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Units & Pricing */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
              <div className="bg-white p-2 rounded-xl shadow-sm">
                <Home className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Units & Pricing</h2>
                <p className="text-xs text-slate-600">Configure your available units</p>
              </div>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="space-y-3">
                {units.map((unit, index) => (
                  <div 
                    key={index} 
                    className="grid grid-cols-12 gap-2 sm:gap-3 items-end bg-slate-50 rounded-xl p-3 sm:p-4 border border-slate-200 hover:border-emerald-300 transition-colors"
                  >
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Unit #</label>
                      <input
                        type="text"
                        value={unit.unitNumber}
                        onChange={(e) => handleUnitChange(index, "unitNumber", e.target.value)}
                        className="w-full px-2 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-center focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div className="col-span-5 sm:col-span-5">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Type</label>
                      <select
                        value={unit.type}
                        onChange={(e) => handleUnitChange(index, "type", e.target.value)}
                        className="w-full px-2 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      >
                        {UNIT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="col-span-4 sm:col-span-4">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Rent (KES)</label>
                      <input
                        type="number"
                        value={unit.rent}
                        onChange={(e) => handleUnitChange(index, "rent", e.target.value)}
                        placeholder="5000"
                        className="w-full px-2 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        required
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      {units.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeUnit(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove unit"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addUnit}
                className="w-full py-3 border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 rounded-xl text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Another Unit
              </button>

              <div className="pt-5 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
                    Base Rent (Starting From)
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="baseRent"
                    value={formData.baseRent}
                    onChange={handleChange}
                    placeholder="5000"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 font-semibold"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1.5">Displayed as "Starting from" on listings</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Deposit (KES)</label>
                  <input
                    type="number"
                    name="deposit"
                    value={formData.deposit}
                    onChange={handleChange}
                    placeholder="Same as base rent"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 font-semibold"
                  />
                  <p className="text-xs text-slate-500 mt-1.5">Leave blank to match base rent</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Amenities */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
              <div className="bg-white p-2 rounded-xl shadow-sm">
                <Zap className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-900">Amenities</h2>
                <p className="text-xs text-slate-600">What does your property offer?</p>
              </div>
              {selectedAmenities.length > 0 && (
                <div className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">
                  {selectedAmenities.length} selected
                </div>
              )}
            </div>
            
            <div className="p-6">
              {amenities.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  Loading amenities...
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {amenities.map((amenity) => {
                    const isSelected = selectedAmenities.includes(amenity.id);
                    return (
                      <button
                        key={amenity.id}
                        type="button"
                        onClick={() => toggleAmenity(amenity.id)}
                        className={`relative px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                          isSelected
                            ? "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-500 text-emerald-700 shadow-sm"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 bg-emerald-500 rounded-full p-0.5">
                            <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                          </div>
                        )}
                        {amenity.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Section 5: Images */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
              <div className="bg-white p-2 rounded-xl shadow-sm">
                <Camera className="h-5 w-5 text-rose-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-900">Property Photos</h2>
                <p className="text-xs text-slate-600">High-quality photos attract more tenants</p>
              </div>
              {images.length > 0 && (
                <div className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-1 rounded-full">
                  {images.length} photo{images.length > 1 ? 's' : ''}
                </div>
              )}
            </div>
            
            <div className="p-6 space-y-4">
              {/* Drag & Drop Zone */}
              <label 
                htmlFor="image-upload" 
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`relative block border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragOver 
                    ? "border-emerald-500 bg-emerald-50 scale-[1.02]" 
                    : "border-slate-300 hover:border-emerald-400 hover:bg-emerald-50/50"
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={uploading}
                />
                
                {uploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
                    <div>
                      <p className="font-bold text-slate-900">Uploading your photos...</p>
                      <p className="text-xs text-slate-500 mt-1">This may take a moment</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-gradient-to-br from-emerald-100 to-teal-100 p-4 rounded-2xl">
                      <ImageIcon className="h-8 w-8 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">
                        <span className="text-emerald-600">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 10MB each • Multiple files allowed</p>
                    </div>
                  </div>
                )}
              </label>

              {/* Image Previews */}
              {images.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900">Uploaded Photos</h3>
                    <p className="text-xs text-slate-500">Click to set as primary</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {images.map((img, index) => (
                      <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-slate-200 hover:border-emerald-500 transition-all">
                        <img src={img.url} alt={`Property ${index + 1}`} className="w-full h-full object-cover" />
                        
                        {img.isPrimary && (
                          <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                            <Star className="h-2.5 w-2.5 fill-white" />
                            Primary
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
                          {!img.isPrimary && (
                            <button
                              type="button"
                              onClick={() => setPrimaryImage(index)}
                              className="bg-white text-slate-900 text-xs font-bold px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                            >
                              Set Primary
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="bg-red-600 text-white p-1.5 rounded-lg hover:bg-red-700 transition-colors ml-auto"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Desktop Submit Button */}
          <button
            type="submit"
            disabled={loading || uploading}
            className="hidden md:flex w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed items-center justify-center gap-2 text-lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Submitting your property...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Submit Property for Review
              </>
            )}
          </button>

          {/* Spacer for mobile sticky bar */}
          <div className="md:h-4" />
        </form>
      </div>

      {/* Mobile Sticky Submit Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-2xl z-40 px-4 py-3">
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={loading || uploading}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Submit Property
            </>
          )}
        </button>
      </div>
    </main>
  );
}