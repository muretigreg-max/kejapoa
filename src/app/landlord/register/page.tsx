// src/app/landlord/register/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HomeIcon, User, Phone, Mail, IdCard, Building2, CreditCard, Lock, CheckCircle, Loader2, ArrowLeft } from "lucide-react";

interface Package {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  maxProperties: number;
  maxUnits: number;
  isFeatured: boolean;
}

export default function LandlordRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    idNumber: "",
    businessName: "",
    mpesaNumber: "",
    password: "",
    confirmPassword: "",
    packageId: "",
    agreeTerms: false,
  });

  useEffect(() => {
    async function fetchPackages() {
      try {
        const res = await fetch("/api/packages");
        const data = await res.json();
        setPackages(data.packages || []);
      } catch (err) {
        console.error("Failed to fetch packages");
      } finally {
        setLoading(false);
      }
    }
    fetchPackages();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const validateStep1 = () => {
    if (!formData.fullName || !formData.phone || !formData.email || !formData.idNumber) {
      setError("Please fill in all required fields");
      return false;
    }
    setError("");
    return true;
  };

  const validateStep2 = () => {
    if (!formData.mpesaNumber) {
      setError("Please enter your M-Pesa number");
      return false;
    }
    setError("");
    return true;
  };

  const validateStep3 = () => {
    if (!formData.packageId) {
      setError("Please select a package");
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (!formData.agreeTerms) {
      setError("You must agree to the terms and conditions");
      return false;
    }
    setError("");
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/landlords/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          idNumber: formData.idNumber,
          businessName: formData.businessName,
          mpesaNumber: formData.mpesaNumber,
          password: formData.password,
          packageId: formData.packageId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="bg-emerald-600 p-1.5 rounded-lg">
              <HomeIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-emerald-800 tracking-tight">
              KejaPoa
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {success ? "Registration Successful!" : "Become a Landlord"}
          </h1>
          <p className="text-slate-600">
            {success
              ? "Your account is pending verification"
              : "Join thousands of landlords reaching students across Kenya"}
          </p>
        </div>

        {/* Progress Steps */}
        {!success && (
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    step >= s
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-16 sm:w-24 h-1 ${
                      step > s ? "bg-emerald-600" : "bg-slate-200"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          {success ? (
            <div className="text-center py-8">
              <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-12 w-12 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                Welcome to KejaPoa!
              </h2>
              <p className="text-slate-600 mb-6">
                Your registration was successful. Your account is currently pending verification by our team. You will receive an email once your account is approved.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
                <div className="text-sm text-slate-600 mb-1">What's next?</div>
                <ul className="text-left text-sm text-slate-700 space-y-2">
                  <li>✓ Our team will verify your details within 24-48 hours</li>
                  <li>✓ You'll receive an email notification once approved</li>
                  <li>✓ After approval, complete your M-Pesa payment to activate your listing</li>
                  <li>✓ Start adding properties and reach students instantly</li>
                </ul>
              </div>
              <Link
                href="/landlord/login"
                className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-xl transition-colors"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              {/* Step 1: Personal Information */}
              {step === 1 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">
                    Personal Information
                  </h2>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        placeholder="e.g., John Kamau"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        placeholder="e.g., 0712345678"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        placeholder="e.g., john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      National ID / Passport Number *
                    </label>
                    <div className="relative">
                      <IdCard className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                      <input
                        type="text"
                        name="idNumber"
                        required
                        value={formData.idNumber}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        placeholder="e.g., 12345678"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Business Information */}
              {step === 2 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">
                    Business Information
                  </h2>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Business / Property Name
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        placeholder="e.g., Green View Hostels"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Optional. Leave blank if you don't have a business name yet.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      M-Pesa Number *
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                      <input
                        type="tel"
                        name="mpesaNumber"
                        required
                        value={formData.mpesaNumber}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        placeholder="e.g., 0712345678"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      This number will be used for subscription payments via M-Pesa.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Package & Password */}
              {step === 3 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">
                    Select Package & Create Password
                  </h2>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Choose Your Package *
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {packages.map((pkg) => (
                        <label
                          key={pkg.id}
                          className={`relative flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            formData.packageId === pkg.id
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="packageId"
                            value={pkg.id}
                            checked={formData.packageId === pkg.id}
                            onChange={handleChange}
                            className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div className="font-bold text-slate-900">
                                {pkg.name}
                              </div>
                              <div className="text-lg font-extrabold text-emerald-700">
                                KES {pkg.price.toLocaleString()}
                                <span className="text-xs font-normal text-slate-500">
                                  /{pkg.durationDays} days
                                </span>
                              </div>
                            </div>
                            <div className="text-sm text-slate-600">
                              Up to {pkg.maxProperties} properties • {pkg.maxUnits} units
                              {pkg.isFeatured && (
                                <span className="ml-2 bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                                  Featured
                                </span>
                              )}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Create Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                      <input
                        type="password"
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        placeholder="At least 6 characters"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                      <input
                        type="password"
                        name="confirmPassword"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        placeholder="Re-enter password"
                      />
                    </div>
                  </div>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 rounded"
                    />
                    <span className="text-sm text-slate-600">
                      I agree to the{" "}
                      <a href="#" className="text-emerald-700 font-semibold hover:underline">
                        Terms and Conditions
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-emerald-700 font-semibold hover:underline">
                        Privacy Policy
                      </a>
                    </span>
                  </label>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 mt-8">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    Back
                  </button>
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                )}
              </div>

              {/* Login Link */}
              <div className="text-center mt-6 text-sm text-slate-600">
                Already have an account?{" "}
                <Link href="/landlord/login" className="text-emerald-700 font-semibold hover:underline">
                  Login here
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}