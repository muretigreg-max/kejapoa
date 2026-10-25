// src/app/landlord/properties/new/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, MapPin, Home, Upload, X, Plus, Minus, 
  Loader2, ShieldCheck, Building2, Zap
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

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    town: "",
    area: "",
    baseRent: "",
    deposit: "",
  });

  // Fetch amenities on mount
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "kejapoa_properties");

        const res = await fetch("https://api.cloudinary.com/v1_1/dnxxkqzqj/image/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        
        if (data.secure_url) {
          setImages(prev => [...prev, { 
            url: data.secure_url, 
            isPrimary: prev.length === 0 // First image is primary
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
    // If we removed the primary image, make the first one primary
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

    // Validation
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

      setSuccess("Property submitted successfully! It will be reviewed by our team.");
      setTimeout(() => router.push("/landlord/dashboard"), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to create property");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Top Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/landlord/dashboard" className="flex items-center gap-2 text-slate-700 hover:text-emerald-600 font-medium">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </Link>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span className="hidden sm:inline">Verified Landlord</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">List Your Property</h1>
          <p className="text-slate-600">Fill in the details below to list your property on KejaPoa</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl">
              {success}
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-600" />
              Basic Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Property Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Matangi Heights Apartments"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe your property, nearby amenities, security, etc."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Location */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-emerald-600" />
              Location
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Major Town <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="town"
                  value={formData.town}
                  onChange={handleChange}
                  placeholder="e.g., Ruiru, Kimbo-Ruiru, Juja"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">The main town or area near your property</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Area / Neighborhood
                </label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="e.g., Matangi, Kilimani, Roysambu"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
                <p className="text-xs text-slate-500 mt-1">Specific neighborhood or estate</p>
              </div>
            </div>
          </div>

          {/* Section 3: Units & Pricing */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Home className="h-5 w-5 text-emerald-600" />
              Units & Pricing
            </h2>
            
            <div className="space-y-4">
              {units.map((unit, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Unit #</label>
                    <input
                      type="text"
                      value={unit.unitNumber}
                      onChange={(e) => handleUnitChange(index, "unitNumber", e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                  <div className="col-span-5">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Type</label>
                    <select
                      value={unit.type}
                      onChange={(e) => handleUnitChange(index, "type", e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    >
                      <option value="Single Room">Single Room</option>
                      <option value="Bedsitter">Bedsitter</option>
                      <option value="1 Bedroom">1 Bedroom</option>
                      <option value="2 Bedroom">2 Bedroom</option>
                      <option value="3 Bedroom">3 Bedroom</option>
                      <option value="Family House">Family House</option>
                    </select>
                  </div>
                  <div className="col-span-4">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Rent (KES) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      value={unit.rent}
                      onChange={(e) => handleUnitChange(index, "rent", e.target.value)}
                      placeholder="5000"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                      required
                    />
                  </div>
                  <div className="col-span-1">
                    {units.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeUnit(index)}
                        className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addUnit}
                className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold text-sm"
              >
                <Plus className="h-4 w-4" />
                Add Another Unit
              </button>

              <div className="pt-4 border-t border-slate-200">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Base Rent (Lowest Price) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="baseRent"
                  value={formData.baseRent}
                  onChange={handleChange}
                  placeholder="5000"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">Enter the lowest rent amount (will be displayed as "Starting from")</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Deposit (KES)
                </label>
                <input
                  type="number"
                  name="deposit"
                  value={formData.deposit}
                  onChange={handleChange}
                  placeholder="5000"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
                <p className="text-xs text-slate-500 mt-1">Leave blank if same as base rent</p>
              </div>
            </div>
          </div>

          {/* Section 4: Amenities */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-emerald-600" />
              Amenities
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {amenities.map((amenity) => (
                <button
                  key={amenity.id}
                  type="button"
                  onClick={() => toggleAmenity(amenity.id)}
                  className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    selectedAmenities.includes(amenity.id)
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  {amenity.name}
                </button>
              ))}
            </div>
          </div>

          {/* Section 5: Images */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Upload className="h-5 w-5 text-emerald-600" />
              Property Images <span className="text-red-500">*</span>
            </h2>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-emerald-500 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={uploading}
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  {uploading ? (
                    <Loader2 className="h-12 w-12 text-emerald-600 mx-auto animate-spin" />
                  ) : (
                    <Upload className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                  )}
                  <p className="text-sm font-semibold text-slate-700">
                    {uploading ? "Uploading..." : "Click to upload images"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 10MB each</p>
                </label>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {images.map((img, index) => (
                    <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-slate-200">
                      <img src={img.url} alt={`Property ${index + 1}`} className="w-full h-full object-cover" />
                      {img.isPrimary && (
                        <div className="absolute top-2 left-2 bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                          Primary
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {!img.isPrimary && (
                          <button
                            type="button"
                            onClick={() => setPrimaryImage(index)}
                            className="bg-white text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-100"
                          >
                            Set Primary
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Property for Review"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}