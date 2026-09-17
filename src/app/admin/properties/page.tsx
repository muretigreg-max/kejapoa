// src/app/admin/properties/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HomeIcon, Building2, CheckCircle, XCircle, Loader2, RefreshCw, Eye, MapPin } from "lucide-react";

interface Property {
  id: string;
  name: string;
  town: string;
  area: string;
  baseRent: number;
  status: string;
  isVerified: boolean;
  landlordName: string;
  landlordPhone: string;
  landlordVerified: boolean;
  institutionName: string;
  totalUnits: number;
  vacantUnits: number;
  primaryImage: string | null;
}

export default function AdminPropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "VERIFIED" | "REJECTED">("ALL");

  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/properties");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch properties");
      const data = await res.json();
      setProperties(data.properties || []);
    } catch (err: any) {
      setError(err.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/properties/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");

      setProperties((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus, isVerified: newStatus === "VERIFIED" } : p))
      );
    } catch (err) {
      alert("Failed to update property status.");
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"><CheckCircle className="h-3 w-3" /> Approved</span>;
      case "REJECTED":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="h-3 w-3" /> Rejected</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Pending Review</span>;
    }
  };

  const filteredProperties = filter === "ALL" ? properties : properties.filter((p) => p.status === filter);
  const counts = {
    ALL: properties.length,
    PENDING: properties.filter((p) => p.status === "PENDING").length,
    VERIFIED: properties.filter((p) => p.status === "VERIFIED").length,
    REJECTED: properties.filter((p) => p.status === "REJECTED").length,
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>;

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center max-w-md">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Connection Issue</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button onClick={fetchProperties} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-6 rounded-xl">
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <div className="bg-emerald-600 p-1.5 rounded-lg"><HomeIcon className="h-6 w-6 text-white" /></div>
              <span className="text-2xl font-extrabold text-emerald-800 tracking-tight">KejaPoa Admin</span>
            </Link>
            <Link href="/admin/dashboard" className="text-slate-600 hover:text-emerald-700 font-medium text-sm">← Back to Dashboard</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Property Management</h1>
            <p className="text-slate-600 text-sm mt-1">Review and approve property listings.</p>
          </div>
          <button onClick={fetchProperties} className="flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-700 font-medium">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2 mb-6 flex gap-2 flex-wrap">
          {(["ALL", "PENDING", "VERIFIED", "REJECTED"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${filter === f ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
              {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()} ({counts[f]})
            </button>
          ))}
        </div>

        {filteredProperties.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <Building2 className="h-16 w-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No properties found</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProperties.map((property) => (
              <div key={property.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="relative h-48 bg-slate-200">
                  {property.primaryImage ? (
                    <img src={property.primaryImage} alt={property.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100">
                      <Building2 className="h-16 w-16 text-emerald-400" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">{getStatusBadge(property.status)}</div>
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-slate-900">{property.name}</h3>
                    <div className="text-right">
                      <div className="text-lg font-extrabold text-emerald-700">KES {property.baseRent.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-slate-600 mb-3">
                    <MapPin className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span>{property.area}, {property.town} • Near {property.institutionName}</span>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-3 mb-4">
                    <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Listed by</div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">{property.landlordName}</div>
                        <div className="text-xs text-slate-600">{property.landlordPhone}</div>
                      </div>
                      {property.landlordVerified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"><CheckCircle className="h-3 w-3" /> Verified</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Landlord Pending</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {property.status === "PENDING" && (
                      <>
                        <button onClick={() => handleStatusChange(property.id, "VERIFIED")} disabled={updating === property.id} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50">
                          {updating === property.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />} Approve
                        </button>
                        <button onClick={() => handleStatusChange(property.id, "REJECTED")} disabled={updating === property.id} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50">
                          {updating === property.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />} Reject
                        </button>
                      </>
                    )}
                    {property.status === "VERIFIED" && (
                      <button onClick={() => handleStatusChange(property.id, "REJECTED")} disabled={updating === property.id} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50">
                        Remove Approval
                      </button>
                    )}
                    <Link href={`/property/${property.id}`} className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg">
                      <Eye className="h-4 w-4" /> Preview
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}