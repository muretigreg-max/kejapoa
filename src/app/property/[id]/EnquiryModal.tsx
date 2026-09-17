// src/app/property/[id]/EnquiryModal.tsx
"use client";

import { useState } from "react";
import { X, CheckCircle, Loader2 } from "lucide-react";

interface EnquiryModalProps {
  propertyId: string;
  propertyName: string;
  institutionName: string;
}

export default function EnquiryModal({
  propertyId,
  propertyName,
  institutionName,
}: EnquiryModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    studentName: "",
    studentPhone: "",
    institution: institutionName,
    preferredRoomType: "",
    message: "",
    preferredViewingDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          ...formData,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit enquiry");
      }

      setReferenceNumber(data.referenceNumber);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-amber-500/20"
      >
        I'm Interested
      </button>

      {isOpen && (
        // z-[100] ensures it's above everything. !text-slate-900 FORCE overrides parent white text.
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm !text-slate-900">
          
          {/* Increased width to max-w-xl for maximum breathing room */}
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            
            {/* Header: Explicit bg-white and !text-slate-900 to guarantee visibility */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-start rounded-t-2xl z-10">
              <div className="pr-10">
                <h2 className="text-2xl font-bold !text-slate-900 leading-tight">
                  {success ? "Enquiry Submitted!" : "Express Interest"}
                </h2>
                <p className="text-base !text-slate-600 mt-1 break-words">
                  {propertyName}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  if (success) {
                    setSuccess(false);
                    setFormData({
                      studentName: "",
                      studentPhone: "",
                      institution: institutionName,
                      preferredRoomType: "",
                      message: "",
                      preferredViewingDate: "",
                    });
                  }
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="h-6 w-6 !text-slate-600" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {success ? (
                <div className="text-center py-6">
                  <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-10 w-10 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold !text-slate-900 mb-2">
                    Thank you!
                  </h3>
                  <p className="!text-slate-600 mb-4">
                    Your enquiry has been sent to the landlord. They will contact you soon.
                  </p>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
                    <div className="text-xs !text-slate-500 uppercase tracking-wide mb-1">
                      Your Reference Number
                    </div>
                    <div className="text-2xl font-extrabold text-emerald-700 font-mono break-all">
                      {referenceNumber}
                    </div>
                    <div className="text-xs !text-slate-600 mt-2">
                      Save this number. Use it when communicating with the landlord.
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setSuccess(false);
                      setFormData({
                        studentName: "",
                        studentPhone: "",
                        institution: institutionName,
                        preferredRoomType: "",
                        message: "",
                        preferredViewingDate: "",
                      });
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold !text-slate-700 mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="studentName"
                      required
                      value={formData.studentName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none !text-slate-900 placeholder:!text-slate-500"
                      placeholder="e.g., Jane Wanjiku"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold !text-slate-700 mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="studentPhone"
                      required
                      value={formData.studentPhone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none !text-slate-900 placeholder:!text-slate-500"
                      placeholder="e.g., 0712345678"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold !text-slate-700 mb-1.5">
                      Institution *
                    </label>
                    <input
                      type="text"
                      name="institution"
                      required
                      value={formData.institution}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none !text-slate-900 placeholder:!text-slate-500"
                      placeholder="e.g., Dedan Kimathi University"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold !text-slate-700 mb-1.5">
                      Preferred Room Type *
                    </label>
                    <select
                      name="preferredRoomType"
                      required
                      value={formData.preferredRoomType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none !text-slate-900"
                    >
                      <option value="" disabled className="!text-slate-500">
                        Select type
                      </option>
                      <option value="Single Room">Single Room</option>
                      <option value="Bedsitter">Bedsitter</option>
                      <option value="Self-Contained">Self-Contained</option>
                      <option value="Shared Room">Shared Room</option>
                      <option value="One Bedroom">One Bedroom</option>
                      <option value="Two Bedroom">Two Bedroom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold !text-slate-700 mb-1.5">
                      Preferred Viewing Date
                    </label>
                    <input
                      type="date"
                      name="preferredViewingDate"
                      value={formData.preferredViewingDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none !text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold !text-slate-700 mb-1.5">
                      Message (Optional)
                    </label>
                    <textarea
                      name="message"
                      rows={3}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none !text-slate-900 placeholder:!text-slate-500"
                      placeholder="Any specific questions or requirements?"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Enquiry"
                    )}
                  </button>

                  <p className="text-xs !text-slate-500 text-center">
                    No account needed. The landlord will contact you directly.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}