// src/app/admin/landlords/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HomeIcon, Users, CheckCircle, XCircle, Loader2, RefreshCw, Eye } from "lucide-react";

interface Landlord {
  id: string;
  fullName: string;
  businessName: string | null;
  phone: string;
  email: string;
  verificationStatus: string;
  package: { name: string; price: number } | null;
  createdAt: string;
}

export default function AdminLandlordsPage() {
  const router = useRouter();
  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchLandlords = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/landlords");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch landlords");
      const data = await res.json();
      setLandlords(data.landlords || []);
    } catch (err: any) {
      setError(err.message || "Failed to load data. Database may be sleeping.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLandlords();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/landlords/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      
      // Update local state instantly for a smooth UI
      setLandlords((prev) =>
        prev.map((l) => (l.id === id ? { ...l, verificationStatus: newStatus } : l))
      );
    } catch (err) {
      alert("Failed to update landlord status. Please try again.");
    } finally {
      setUpdating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"><CheckCircle className="h-3 w-3" /> Verified</span>;
      case "SUSPENDED":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="h-3 w-3" /> Suspended</span>;
      case "REJECTED":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800"><XCircle className="h-3 w-3" /> Rejected</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Pending</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center max-w-md">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Connection Issue</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button onClick={fetchLandlords} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors">
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Top Nav */}
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <div className="bg-emerald-600 p-1.5 rounded-lg">
                <HomeIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-extrabold text-emerald-800 tracking-tight">KejaPoa Admin</span>
            </Link>
            <Link href="/admin/dashboard" className="text-slate-600 hover:text-emerald-700 font-medium text-sm">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Landlord Management</h1>
            <p className="text-slate-600 text-sm mt-1">Review, verify, or suspend landlord accounts.</p>
          </div>
          <button onClick={fetchLandlords} className="flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-700 font-medium">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Landlord</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Package</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {landlords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      <Users className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                      <p>No landlords registered yet.</p>
                    </td>
                  </tr>
                ) : (
                  landlords.map((landlord) => (
                    <tr key={landlord.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{landlord.fullName}</div>
                        <div className="text-xs text-slate-500">{landlord.businessName || "No business name"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">{landlord.phone}</div>
                        <div className="text-xs text-slate-500">{landlord.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">{landlord.package?.name || "None"}</div>
                        <div className="text-xs text-slate-500">KES {landlord.package?.price || 0}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(landlord.verificationStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {landlord.verificationStatus === "PENDING" && (
                            <button
                              onClick={() => handleStatusChange(landlord.id, "VERIFIED")}
                              disabled={updating === landlord.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                            >
                              {updating === landlord.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                              Verify
                            </button>
                          )}
                          {landlord.verificationStatus === "VERIFIED" && (
                            <button
                              onClick={() => handleStatusChange(landlord.id, "SUSPENDED")}
                              disabled={updating === landlord.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                            >
                              {updating === landlord.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                              Suspend
                            </button>
                          )}
                          {landlord.verificationStatus === "SUSPENDED" && (
                            <button
                              onClick={() => handleStatusChange(landlord.id, "VERIFIED")}
                              disabled={updating === landlord.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                            >
                              {updating === landlord.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                              Reactivate
                            </button>
                          )}
                          <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="View Details">
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}