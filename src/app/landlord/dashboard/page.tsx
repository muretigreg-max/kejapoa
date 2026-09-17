// src/app/landlord/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  HomeIcon, Building2, Users, FileText, CreditCard, Loader2, 
  CheckCircle, RefreshCw, Plus, MapPin, Eye, Phone, Calendar, 
  MessageSquare, X 
} from "lucide-react";

interface LandlordData {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  businessName: string | null;
  verificationStatus: string;
  packageName: string;
  packagePrice: number;
  packageId: string;
}

interface Property {
  id: string;
  name: string;
  town: string;
  area: string;
  baseRent: number;
  status: string;
  isVerified: boolean;
  institutionName: string;
  totalUnits: number;
  vacantUnits: number;
  occupiedUnits: number;
  primaryImage: string | null;
}

interface Enquiry {
  id: string;
  studentName: string;
  studentPhone: string;
  institution: string;
  preferredRoomType: string;
  message: string;
  preferredViewingDate: string | null;
  referenceNumber: string;
  status: string;
  createdAt: string;
  property: {
    id: string;
    name: string;
    town: string;
  };
}

export default function LandlordDashboardPage() {
  const router = useRouter();
  const [landlord, setLandlord] = useState<LandlordData | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"properties" | "enquiries">("properties");

  const [paying, setPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const fetchLandlord = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/landlord/me");
      if (res.status === 401) {
        router.push("/landlord/login");
        return;
      }
      if (!res.ok) throw new Error("Database is waking up or unavailable.");
      const data = await res.json();
      setLandlord(data);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data.");
    }
  };

  const fetchProperties = async () => {
    try {
      const res = await fetch("/api/landlord/properties");
      if (res.ok) {
        const data = await res.json();
        setProperties(data.properties || []);
      }
    } catch (err) {
      console.error("Failed to fetch properties");
    }
  };

  const fetchEnquiries = async () => {
    try {
      const res = await fetch("/api/landlord/enquiries");
      if (res.ok) {
        const data = await res.json();
        setEnquiries(data.enquiries || []);
      }
    } catch (err) {
      console.error("Failed to fetch enquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLandlord();
    fetchProperties();
    fetchEnquiries();
  }, []);

  const handlePay = async () => {
    if (!landlord) return;
    setPaying(true);
    setPaymentStatus("idle");
    setMessage("Sending STK Push to your phone...");

    try {
      const res = await fetch("/api/payments/mpesa/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          landlordId: landlord.id,
          amount: landlord.packagePrice,
          phoneNumber: landlord.phone,
          packageId: landlord.packageId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPaymentStatus("success");
        setMessage("STK Push sent! Please enter your M-Pesa PIN.");
      } else {
        setPaymentStatus("error");
        setMessage(data.error || "Failed to initiate payment.");
      }
    } catch (err) {
      setPaymentStatus("error");
      setMessage("Network error. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"><CheckCircle className="h-3 w-3" /> Approved</span>;
      case "REJECTED":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Pending Review</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-4" />
        <p className="text-slate-600">Loading your dashboard...</p>
      </div>
    );
  }

  if (error || !landlord) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center max-w-md">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Connection Issue</h2>
          <p className="text-slate-600 mb-6">{error || "Failed to load data."}</p>
          <button onClick={() => { fetchLandlord(); fetchProperties(); fetchEnquiries(); }} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-6 rounded-xl">
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  const totalProperties = properties.length;
  const totalUnits = properties.reduce((sum, p) => sum + p.totalUnits, 0);
  const totalVacant = properties.reduce((sum, p) => sum + p.vacantUnits, 0);
  const newEnquiries = enquiries.filter((e) => e.status === "NEW").length;

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
              <span className="text-2xl font-extrabold text-emerald-800 tracking-tight">KejaPoa</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/landlord/properties/new" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
                <Plus className="h-4 w-4" /> Add Property
              </Link>
              <Link href="/" className="text-slate-600 hover:text-emerald-700 font-medium text-sm">Logout</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome, {landlord.fullName}!</h1>
          <p className="text-slate-600">{landlord.businessName || "Manage your properties and track student enquiries."}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="bg-emerald-100 p-2.5 rounded-lg w-fit mb-3">
              <Building2 className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mb-1">{totalProperties}</div>
            <div className="text-sm text-slate-600">Total Properties</div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="bg-blue-100 p-2.5 rounded-lg w-fit mb-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mb-1">{totalUnits}</div>
            <div className="text-sm text-slate-600">Total Units</div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="bg-amber-100 p-2.5 rounded-lg w-fit mb-3">
              <HomeIcon className="h-6 w-6 text-amber-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mb-1">{totalVacant}</div>
            <div className="text-sm text-slate-600">Vacant Units</div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="bg-purple-100 p-2.5 rounded-lg w-fit mb-3">
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mb-1">{enquiries.length}</div>
            <div className="text-sm text-slate-600">Enquiries</div>
            {newEnquiries > 0 && (
              <div className="text-xs text-purple-600 font-semibold mt-1">{newEnquiries} new</div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2 mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab("properties")}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
              activeTab === "properties" ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Building2 className="h-4 w-4" />
            My Properties ({totalProperties})
          </button>
          <button
            onClick={() => setActiveTab("enquiries")}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 relative ${
              activeTab === "enquiries" ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Student Enquiries ({enquiries.length})
            {newEnquiries > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {newEnquiries}
              </span>
            )}
          </button>
        </div>

        {/* Properties Tab */}
        {activeTab === "properties" && (
          <>
            {properties.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
                <Building2 className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No properties yet</h3>
                <p className="text-slate-600 mb-6">Start by adding your first property listing.</p>
                <Link href="/landlord/properties/new" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors">
                  <Plus className="h-5 w-5" /> Add Your First Property
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {properties.map((property) => (
                  <div key={property.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-40 bg-slate-200">
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
                        <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{property.name}</h3>
                        <div className="text-right flex-shrink-0 ml-2">
                          <div className="text-lg font-extrabold text-emerald-700">KES {property.baseRent.toLocaleString()}</div>
                          <div className="text-xs text-slate-500">/month</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-slate-600 mb-3">
                        <MapPin className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                        <span className="line-clamp-1">{property.area}, {property.town} • Near {property.institutionName}</span>
                      </div>
                      <div className="flex gap-3 mb-4 text-sm">
                        <div className="bg-slate-50 px-3 py-1.5 rounded-lg">
                          <span className="font-bold text-slate-900">{property.totalUnits}</span>
                          <span className="text-slate-600 ml-1">total</span>
                        </div>
                        <div className="bg-emerald-50 px-3 py-1.5 rounded-lg">
                          <span className="font-bold text-emerald-700">{property.vacantUnits}</span>
                          <span className="text-emerald-700 ml-1">vacant</span>
                        </div>
                      </div>
                      <Link href={`/property/${property.id}`} className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors">
                        <Eye className="h-4 w-4" /> Preview
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Enquiries Tab */}
        {activeTab === "enquiries" && (
          <>
            {enquiries.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
                <MessageSquare className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No enquiries yet</h3>
                <p className="text-slate-600">When students express interest in your properties, their enquiries will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {enquiries.map((enquiry) => (
                  <EnquiryCard
                    key={enquiry.id}
                    enquiry={enquiry}
                    onRefresh={fetchEnquiries}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

// ==========================================
// Enquiry Card Component (Defined OUTSIDE main component)
// ==========================================
function EnquiryCard({ enquiry, onRefresh }: { enquiry: Enquiry; onRefresh: () => void }) {
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [units, setUnits] = useState<any[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [moveInDate, setMoveInDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUnits = async () => {
    try {
      const res = await fetch(`/api/landlord/enquiries/${enquiry.id}`);
      if (res.ok) {
        const data = await res.json();
        setUnits(data.units || []);
      }
    } catch (err) {
      console.error("Failed to fetch units");
    }
  };

  const handleEnroll = async () => {
    if (!selectedUnitId || !moveInDate) {
      alert("Please select a unit and move-in date");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/landlord/enquiries/${enquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ENROLL",
          unitId: selectedUnitId,
          moveInDate,
        }),
      });

      if (res.ok) {
        alert("Student enrolled successfully!");
        setShowEnrollModal(false);
        onRefresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to enroll student");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string) => {
    setActionLoading(action);
    try {
      const res = await fetch(`/api/landlord/enquiries/${enquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      alert("Failed to update enquiry");
    } finally {
      setActionLoading(null);
    }
  };

  const getEnquiryStatusBadge = (status: string) => {
    switch (status) {
      case "ENROLLED":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="h-3 w-3" /> Enrolled</span>;
      case "CONTACTED":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Contacted</span>;
      case "VIEWED":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Viewed</span>;
      case "CLOSED":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">Closed</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">New</span>;
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{enquiry.studentName}</h3>
            <p className="text-sm text-slate-600">Interested in: <strong>{enquiry.property.name}</strong></p>
          </div>
          <div className="flex items-center gap-2">
            {getEnquiryStatusBadge(enquiry.status)}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <Phone className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <a href={`tel:${enquiry.studentPhone}`} className="font-semibold text-emerald-700 hover:underline">
              {enquiry.studentPhone}
            </a>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <Building2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <span>{enquiry.institution}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <HomeIcon className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <span>Wants: <strong>{enquiry.preferredRoomType}</strong></span>
          </div>
          {enquiry.preferredViewingDate && (
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Calendar className="h-4 w-4 text-purple-600 flex-shrink-0" />
              <span>Viewing: <strong>{new Date(enquiry.preferredViewingDate).toLocaleDateString()}</strong></span>
            </div>
          )}
        </div>

        {enquiry.message && (
          <div className="bg-slate-50 rounded-lg p-3 mb-3">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Message</div>
            <p className="text-sm text-slate-700">{enquiry.message}</p>
          </div>
        )}

        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            Ref: <span className="font-mono font-bold text-slate-700">{enquiry.referenceNumber}</span>
            <span className="ml-3">• {new Date(enquiry.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex gap-2">
            {enquiry.status === "NEW" && (
              <>
                <button
                  onClick={() => handleAction("CONTACTED")}
                  disabled={actionLoading === "CONTACTED"}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {actionLoading === "CONTACTED" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />}
                  Mark Contacted
                </button>
                <button
                  onClick={() => {
                    setShowEnrollModal(true);
                    fetchUnits();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  <CheckCircle className="h-4 w-4" />
                  Enroll Student
                </button>
              </>
            )}
            {enquiry.status === "CONTACTED" && (
              <button
                onClick={() => {
                  setShowEnrollModal(true);
                  fetchUnits();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
                Enroll Student
              </button>
            )}
            {enquiry.status !== "CLOSED" && enquiry.status !== "ENROLLED" && (
              <button
                onClick={() => handleAction("CLOSE")}
                disabled={actionLoading === "CLOSE"}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {actionLoading === "CLOSE" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Close"}
              </button>
            )}
            <a
              href={`tel:${enquiry.studentPhone}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <Phone className="h-4 w-4" />
              Call
            </a>
          </div>
        </div>
      </div>

      {/* Enrollment Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm !text-slate-900">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-5 flex justify-between items-center rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold !text-slate-900">Enroll Student</h2>
                <p className="text-sm !text-slate-600 mt-0.5">{enquiry.studentName}</p>
              </div>
              <button
                onClick={() => setShowEnrollModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 !text-slate-600" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm font-semibold !text-blue-900 mb-1">Student Details</div>
                <div className="text-sm !text-blue-800">
                  <div>Phone: <strong>{enquiry.studentPhone}</strong></div>
                  <div>Institution: <strong>{enquiry.institution}</strong></div>
                  <div>Preferred: <strong>{enquiry.preferredRoomType}</strong></div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold !text-slate-700 mb-1.5">
                  Assign to Unit *
                </label>
                <select
                  value={selectedUnitId}
                  onChange={(e) => setSelectedUnitId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none !text-slate-900"
                >
                  <option value="">Select a vacant unit</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.unitNumber} - {unit.type} (KES {unit.rent.toLocaleString()})
                    </option>
                  ))}
                </select>
                {units.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">No vacant units available for this property.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold !text-slate-700 mb-1.5">
                  Move-in Date *
                </label>
                <input
                  type="date"
                  value={moveInDate}
                  onChange={(e) => setMoveInDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none !text-slate-900"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs !text-amber-800">
                  <strong>Note:</strong> Enrolling this student will mark the selected unit as <strong>OCCUPIED</strong> and update the enquiry status to <strong>ENROLLED</strong>.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowEnrollModal(false)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2.5 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEnroll}
                  disabled={loading || units.length === 0}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enrolling...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Confirm Enrollment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}