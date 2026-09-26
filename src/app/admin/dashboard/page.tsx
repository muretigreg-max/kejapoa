// src/app/admin/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Users, Building2, MessageSquare, RefreshCw, LogOut } from "lucide-react";

interface DashboardData {
  landlords: { total: number };
  properties: { total: number };
  enquiries: { total: number };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/dashboard");
      
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      
      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }
      
      const jsonData = await res.json();
      
      // Safely set data with fallbacks
      setData({
        landlords: jsonData.landlords || { total: 0 },
        properties: jsonData.properties || { total: 0 },
        enquiries: jsonData.enquiries || { total: 0 },
      });
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleLogout = () => {
    document.cookie = "kejapoa_admin_token=; path=/; max-age=0";
    router.push("/admin/login");
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center max-w-md">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Connection Issue</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button 
            onClick={fetchDashboard} 
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-6 rounded-xl"
          >
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  // Safe check - data should exist here
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center max-w-md">
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Data</h2>
          <p className="text-slate-600 mb-6">Could not load dashboard data.</p>
          <button 
            onClick={fetchDashboard} 
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-6 rounded-xl"
          >
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
            <div className="flex items-center gap-2">
              <div className="bg-emerald-600 p-1.5 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-extrabold text-emerald-800 tracking-tight">KejaPoa Admin</span>
            </div>
            <button 
              onClick={handleLogout}
              className="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-700 font-medium text-sm"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
          <p className="text-slate-600">Welcome back. Here's an overview of your platform.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="bg-blue-100 p-2.5 rounded-lg w-fit mb-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mb-1">
              {data.landlords?.total ?? 0}
            </div>
            <div className="text-sm text-slate-600">Total Landlords</div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="bg-emerald-100 p-2.5 rounded-lg w-fit mb-3">
              <Building2 className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mb-1">
              {data.properties?.total ?? 0}
            </div>
            <div className="text-sm text-slate-600">Total Properties</div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="bg-purple-100 p-2.5 rounded-lg w-fit mb-3">
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mb-1">
              {data.enquiries?.total ?? 0}
            </div>
            <div className="text-sm text-slate-600">Total Enquiries</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link 
              href="/admin/properties" 
              className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Building2 className="h-5 w-5 text-emerald-600" />
              <div>
                <div className="font-semibold text-slate-900">Review Properties</div>
                <div className="text-sm text-slate-600">Approve or reject new listings</div>
              </div>
            </Link>
            <Link 
              href="/admin/landlords" 
              className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-semibold text-slate-900">Manage Landlords</div>
                <div className="text-sm text-slate-600">View and verify landlord accounts</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}