// src/app/landlord/properties/new/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HomeIcon, MapPin, Building2, CheckCircle, Loader2, Plus, X, Upload } from "lucide-react";

interface Institution {
  id: string;
  name: string;
  campuses: { id: string; name: string }[];
}

interface Amenity {
  id: string;
  name: string;
}

interface Unit {
  unitNumber: string;
  type: string;
  rent: number;
}

export default function NewPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState("");
  const [availableCampuses, setAvailableCampuses] = useState<{ id: string; name: string }[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    institutionId: "",
    campusId: "",
    county: "",
    town: "",
    area: "",
    latitude: "",
    longitude: "",
    baseRent: "",
    deposit: "",
  });

  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  
  // 🆕 Photo Upload State
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/properties");
        const data = await res.json();
        setInstitutions(data.institutions || []);
        setAmenities(data.amenities || []);
      } catch (err) {
        setError("Failed to load form data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleInstitutionChange = (instId: string) => {
    setSelectedInstitutionId(instId);
    setFormData({ ...formData, institutionId: instId, campusId: "" });
    
    const inst = institutions.find((i) => i.id === instId);
    setAvailableCampuses(inst?.campuses || []);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addUnit = () => {
    setUnits([...units, { unitNumber: "", type: "Single Room", rent: 0 }]);
  };

  const removeUnit = (index: number) => {
    setUnits(units.filter((_, i) => i !== index));
  };

  const updateUnit = (index: number, field: keyof Unit, value: string | number) => {
    const updated = [...units];
    updated[index] = { ...updated[index], [field]: value };
    setUnits(updated);
  };

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId) ? prev.filter((id) => id !== amenityId) : [...prev, amenityId]
    );
  };

  // 🆕 Photo Handlers
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages((prev) => [...prev, ...newFiles]);
      
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (images.length === 0) {
      setError("Please upload at least one photo of the property.");
      return;
    }

    setSubmitting(true);
    setUploadingImages(true);
    setError("");

    try {
      // 1. Upload all images to Cloudinary via our API
      const uploadedUrls: string[] = [];
      for (const file of images) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);
        
        const res = await fetch("/api/landlord/upload", {
          method: "POST",
          body: uploadFormData,
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to upload image");
        uploadedUrls.push(data.url);
      }

      setUploadingImages(false);

      // 2. Create property with the uploaded image URLs
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          units,
          amenities: selectedAmenities,
          images: uploadedUrls.map((url, index) => ({
            url,
            isPrimary: index === 0, // First image is the main cover photo
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create property");
      }

      setSuccess(true);
    } catch (err: any) {
      setUploadingImages(false);
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center max-w-md">
          <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Property Submitted!</h2>
          <p className="text-slate-600 mb-6">
            Your property has been submitted for review. Our admin team will verify it within 24-48 hours.
          </p>
          <Link
            href="/landlord/dashboard"
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-xl transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/landlord/dashboard" className="inline-flex items-center gap-2 mb-4">
            <div className="bg-emerald-600 p-1.5 rounded-lg">
              <HomeIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-emerald-800 tracking-tight">KejaPoa</span>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Add New Property</h1>
          <p className="text-slate-600">List your accommodation and reach thousands of students.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Property Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900"
                  placeholder="e.g., Green View Hostels"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none text-slate-900"
                  placeholder="Describe your property..."
                />
              </div>
            </div>
          </div>

          {/* Location & Institution */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Location & Institution</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nearest Institution *</label>
                <select
                  name="institutionId"
                  required
                  value={formData.institutionId}
                  onChange={(e) => handleInstitutionChange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white text-slate-900"
                >
                  <option value="">Select Institution</option>
                  {institutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Campus *</label>
                <select
                  name="campusId"
                  required
                  value={formData.campusId}
                  onChange={handleChange}
                  disabled={!formData.institutionId}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white disabled:bg-slate-100 text-slate-900"
                >
                  <option value="">Select Campus</option>
                  {availableCampuses.map((campus) => (
                    <option key={campus.id} value={campus.id}>
                      {campus.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">County</label>
                  <input
                    type="text"
                    name="county"
                    value={formData.county}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900"
                    placeholder="e.g., Nyeri"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Town</label>
                  <input
                    type="text"
                    name="town"
                    value={formData.town}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900"
                    placeholder="e.g., Nyeri"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Area</label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900"
                    placeholder="e.g., Near Main Gate"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Pricing</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Base Rent (KES) *</label>
                <input
                  type="number"
                  name="baseRent"
                  required
                  value={formData.baseRent}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900"
                  placeholder="e.g., 4500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Deposit (KES)</label>
                <input
                  type="number"
                  name="deposit"
                  value={formData.deposit}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900"
                  placeholder="Same as rent if blank"
                />
              </div>
            </div>
          </div>

          {/* Units */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">Units</h2>
              <button
                type="button"
                onClick={addUnit}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Unit
              </button>
            </div>

            {units.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No units added yet. Click "Add Unit" to start.</p>
            ) : (
              <div className="space-y-3">
                {units.map((unit, index) => (
                  <div key={index} className="flex gap-3 items-end bg-slate-50 p-3 rounded-lg">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Number</label>
                      <input
                        type="text"
                        value={unit.unitNumber}
                        onChange={(e) => updateUnit(index, "unitNumber", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900"
                        placeholder="e.g., Room 001"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Type</label>
                      <select
                        value={unit.type}
                        onChange={(e) => updateUnit(index, "type", e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900"
                      >
                        <option>Single Room</option>
                        <option>Bedsitter</option>
                        <option>Self-Contained</option>
                        <option>Shared Room</option>
                        <option>One Bedroom</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Rent (KES)</label>
                      <input
                        type="number"
                        value={unit.rent}
                        onChange={(e) => updateUnit(index, "rent", parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeUnit(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Amenities */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {amenities.map((amenity) => (
                <label
                  key={amenity.id}
                  className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedAmenities.includes(amenity.id)
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(amenity.id)}
                    onChange={() => toggleAmenity(amenity.id)}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 rounded"
                  />
                  <span className="text-sm font-medium text-slate-700">{amenity.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 🆕 Photos Section */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Property Photos</h2>
            <p className="text-sm text-slate-600 mb-3">
              Upload clear photos of the property. The first photo will be the main cover image. 
              <span className="text-emerald-600 font-semibold block sm:inline sm:ml-1"> (Mobile users can tap to use their camera!)</span>
            </p>
            
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-slate-400" />
                <p className="text-sm text-slate-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
              </div>
              {/* capture="environment" opens the rear camera on mobile devices! */}
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                multiple 
                capture="environment"
                onChange={handleImageChange} 
              />
            </label>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={preview} 
                      alt={`Preview ${index + 1}`} 
                      className="w-full h-32 object-cover rounded-lg border border-slate-200" 
                    />
                    {index === 0 && (
                      <span className="absolute top-2 left-2 bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || uploadingImages}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {(submitting || uploadingImages) ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {uploadingImages ? "Uploading Photos..." : "Submitting..."}
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