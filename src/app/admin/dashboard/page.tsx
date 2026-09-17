// src/app/admin/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HomeIcon, Users, Building2, Home as HomeIcon2, FileText, CreditCard, Loader2 } from "lucide-react";

interface DashboardData {
  landlords: { total: number; verified: number; pending: number };
  properties: { total: number; verified: number; pending: number };
  units: { total: number; vacant: number; occupied: number; reserved: number };
  enquiries: { total: number };
  applications: { total: number; approved: number };
  payments: { total: number; successful: number; revenue: number };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/dashboard");
        if (res.status === 401) {
          router.push("/admin/login");
          return;
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600">Failed to load dashboard data.</p>
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
                <HomeIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-extrabold text-emerald-800 tracking-tight">
                KejaPoa Admin
              </span>
            </div>
            <Link href="/" className="text-slate-600 hover:text-emerald-700 font-medium text-sm">
              Back to Site
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Platform Overview</h1>
          <p className="text-slate-600">Monitor and manage the entire KejaPoa ecosystem.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Landlords */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-blue-100 p-2.5 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mb-1">{data.landlords.total}</div>
            <div className="text-sm text-slate-600">Total Landlords</div>
            <div className="text-xs text-slate-500 mt-2">
              {data.landlords.verified} verified • {data.landlords.pending} pending
            </div>
          </div>

          {/* Properties */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-emerald-100 p-2.5 rounded-lg">
                <Building2 className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mb-1">{data.properties.total}</div>
            <div className="text-sm text-slate-600">Total Properties</div>
            <div className="text-xs text-slate-500 mt-2">
              {data.properties.verified} verified • {data.properties.pending} pending
            </div>
          </div>

          {/* Units */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-amber-100 p-2.5 rounded-lg">
                <HomeIcon2 className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mb-1">{data.units.total}</div>
            <div className="text-sm text-slate-600">Total Units</div>
            <div className="text-xs text-slate-500 mt-2">
              {data.units.vacant} vacant • {data.units.occupied} occupied
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-green-100 p-2.5 rounded-lg">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mb-1">
              KES {data.payments.revenue.toLocaleString()}
            </div>
            <div className="text-sm text-slate-600">Total Revenue</div>
            <div className="text-xs text-slate-500 mt-2">
              {data.payments.successful} successful payments
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {/* Enquiries */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <FileText className="h-5 w-5 text-slate-600" />
              <h3 className="font-semibold text-slate-900">Student Enquiries</h3>
            </div>
            <div className="text-2xl font-bold text-slate-900">{data.enquiries.total}</div>
          </div>

          {/* Applications */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <FileText className="h-5 w-5 text-slate-600" />
              <h3 className="font-semibold text-slate-900">Applications</h3>
            </div>
            <div className="text-2xl font-bold text-slate-900">{data.applications.total}</div>
            <div className="text-sm text-slate-500 mt-1">
              {data.applications.approved} approved
            </div>
          </div>

          {/* Payments */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <CreditCard className="h-5 w-5 text-slate-600" />
              <h3 className="font-semibold text-slate-900">Payment Records</h3>
            </div>
            <div className="text-2xl font-bold text-slate-900">{data.payments.total}</div>
            <div className="text-sm text-slate-500 mt-1">
              {data.payments.successful} successful
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/admin/landlords"
              className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl p-4 transition-colors"
            >
              <div className="font-semibold text-emerald-900 mb-1">Manage Landlords</div>
              <div className="text-sm text-emerald-700">Verify, suspend, or view landlord accounts</div>
            </Link>
            <Link
              href="/admin/properties"
              className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl p-4 transition-colors"
            >
              <div className="font-semibold text-blue-900 mb-1">Manage Properties</div>
              <div className="text-sm text-blue-700">Approve or reject property listings</div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}