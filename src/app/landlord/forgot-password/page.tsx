// src/app/landlord/forgot-password/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resetLink, setResetLink] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/landlord/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send reset link");
      }

      setSuccess(true);
      setResetLink(data.resetLink || ""); // For MVP, we show the link
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/landlord/login" className="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-700 font-medium mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>

        {!success ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Forgot Password?</h1>
              <p className="text-slate-600">No worries, we'll send you reset instructions</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                      required
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Enter the email associated with your account and we'll send a password reset link
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Check Your Email</h1>
              <p className="text-slate-600">
                We've sent password reset instructions to <strong>{email}</strong>
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-emerald-800 font-medium mb-2">
                  For testing purposes, here's your reset link:
                </p>
                <a 
                  href={resetLink} 
                  className="text-sm text-emerald-700 font-semibold hover:underline break-all"
                >
                  {resetLink}
                </a>
              </div>
              <p className="text-sm text-slate-600">
                Didn't receive the email? Check your spam folder or{" "}
                <button 
                  onClick={() => setSuccess(false)}
                  className="text-emerald-700 font-semibold hover:underline"
                >
                  try again
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}