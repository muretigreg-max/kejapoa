// src/app/search/SearchResultsClient.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MapPin, ShieldCheck, Wifi, Droplet, Zap, Shield as ShieldIcon, Clock, Users, HomeIcon } from "lucide-react";

interface Property {
  id: string;
  name: string;
  description: string;
  town: string;
  area: string;
  baseRent: number;
  deposit: number;
  isVerified: boolean;
  lastAvailabilityCheck: string;
  distanceKm: number | null;
  institutionName: string | null;
  campusName: string | null;
  landlordName: string;
  landlordVerified: boolean;
  availableUnits: number;
  unitTypes: string[];
  amenities: string[];
  primaryImage: string | null;
}

const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="h-3.5 w-3.5" />,
  Water: <Droplet className="h-3.5 w-3.5" />,
  Electricity: <Zap className="h-3.5 w-3.5" />,
  Security: <ShieldIcon className="h-3.5 w-3.5" />,
};

function daysAgo(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function formatDistance(km: number | null | undefined) {
  if (km === null || km === undefined) return "Distance not specified";
  if (km < 1) return `${Math.round(km * 1000)}m away`;
  return `${km.toFixed(1)} km away`;
}

export default function SearchResultsClient() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const institutionId = searchParams.get("institutionId") || "";
  const propertyType = searchParams.get("propertyType") || "";
  const maxBudget = searchParams.get("maxBudget") || "";

  useEffect(() => {
    async function fetchProperties() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (institutionId) params.set("institutionId", institutionId);
        if (propertyType) params.set("propertyType", propertyType);
        if (maxBudget) params.set("maxBudget", maxBudget);

        const res = await fetch(`/api/properties/search?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setProperties(data.properties || []);
      } catch (err) {
        setError("Could not load properties. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, [institutionId, propertyType, maxBudget]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
        <p className="mt-4 text-slate-600">Finding the best rooms for you...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Results Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          {properties.length} {properties.length === 1 ? "Accommodation" : "Accommodations"} Found
        </h1>
        <p className="text-slate-600 mt-1">
          {institutionId && "Near your institution"}
          {propertyType && ` • ${propertyType}`}
          {maxBudget && maxBudget !== "99999" && ` • Under KES ${parseInt(maxBudget).toLocaleString()}`}
        </p>
      </div>

      {/* Results Grid */}
      {properties.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <HomeIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">No accommodations found</h3>
          <p className="text-slate-600 mb-6">
            Try adjusting your filters or search for a different institution.
          </p>
          <Link
            href="/"
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors"
          >
            Start New Search
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}

function PropertyCard({ property }: { property: Property }) {
  const daysSinceCheck = daysAgo(property.lastAvailabilityCheck);
  const availabilityText =
    daysSinceCheck === 0
      ? "Confirmed today"
      : daysSinceCheck === 1
      ? "Confirmed yesterday"
      : `Confirmed ${daysSinceCheck} days ago`;

  return (
    <Link
      href={`/property/${property.id}`}
      className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-48 bg-slate-200 overflow-hidden">
        {property.primaryImage ? (
          <img
            src={property.primaryImage}
            alt={property.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100">
            <HomeIcon className="h-16 w-16 text-emerald-400" />
          </div>
        )}

        {/* Verification Badge */}
        {property.isVerified && (
          <div className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
            <ShieldCheck className="h-3.5 w-3.5" />
            VERIFIED
          </div>
        )}

        {/* Availability Badge */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
          <Clock className="h-3.5 w-3.5 text-emerald-600" />
          {availabilityText}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
            {property.name}
          </h3>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-sm text-slate-600 mb-3">
          <MapPin className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span className="line-clamp-1">
            {property.area}, {property.town}
            {property.distanceKm !== null && ` • ${formatDistance(property.distanceKm)}`}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-2xl font-extrabold text-emerald-700">
            KES {property.baseRent.toLocaleString()}
          </span>
          <span className="text-sm text-slate-500">/month</span>
        </div>

        {/* Unit Types */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {property.unitTypes.slice(0, 3).map((type) => (
            <span
              key={type}
              className="bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-md"
            >
              {type}
            </span>
          ))}
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mb-4">
          {property.amenities.slice(0, 4).map((amenity) => (
            <div
              key={amenity}
              className="flex items-center gap-1 text-xs text-slate-600 bg-emerald-50 px-2 py-1 rounded-md"
            >
              {amenityIcons[amenity] || <span className="h-3.5 w-3.5">•</span>}
              <span>{amenity}</span>
            </div>
          ))}
          {property.amenities.length > 4 && (
            <span className="text-xs text-slate-500 px-2 py-1">
              +{property.amenities.length - 4} more
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-sm text-slate-600">
            <Users className="h-4 w-4 text-emerald-600" />
            <span className="font-semibold">{property.availableUnits}</span>
            <span className="text-xs">available</span>
          </div>
          <span className="text-sm font-semibold text-emerald-700 group-hover:underline">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
}