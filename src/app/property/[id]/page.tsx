// src/app/property/[id]/page.tsx
import { notFound } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { MapPin, ShieldCheck, Wifi, Droplet, Zap, Shield as ShieldIcon, Clock, Users, HomeIcon, Phone, Calendar, CheckCircle } from "lucide-react";
import EnquiryModal from "./EnquiryModal";

const prisma = new PrismaClient();

const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="h-5 w-5" />,
  Water: <Droplet className="h-5 w-5" />,
  Electricity: <Zap className="h-5 w-5" />,
  Security: <ShieldIcon className="h-5 w-5" />,
};

function daysAgo(date: Date): number {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export default async function PropertyDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      institution: true,
      campus: true,
      landlord: {
        select: {
          id: true,
          fullName: true,
          businessName: true,
          phone: true,
          verificationStatus: true,
        },
      },
      units: {
        orderBy: { unitNumber: "asc" },
      },
      amenities: {
        include: { amenity: true },
      },
      images: {
        orderBy: { isPrimary: "desc" },
      },
    },
  });

  if (!property) {
    notFound();
  }

  const vacantUnits = property.units.filter((u) => u.status === "VACANT");
  const occupiedUnits = property.units.filter((u) => u.status === "OCCUPIED");
  const reservedUnits = property.units.filter((u) => u.status === "RESERVED");
  const daysSinceCheck = daysAgo(property.lastAvailabilityCheck);

  const availabilityText =
    daysSinceCheck === 0
      ? "Availability confirmed today"
      : daysSinceCheck === 1
      ? "Availability confirmed yesterday"
      : `Availability last confirmed ${daysSinceCheck} days ago`;

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      {/* Top Nav */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="flex items-center gap-2">
              <div className="bg-emerald-600 p-1.5 rounded-lg">
                <HomeIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-extrabold text-emerald-800 tracking-tight">
                KejaPoa
              </span>
            </a>
            <a
              href="/"
              className="text-slate-600 hover:text-emerald-700 font-medium"
            >
              ← Back to Search
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Property Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200">
              <div className="relative h-64 sm:h-96 bg-slate-200">
                {property.images.length > 0 ? (
                  <img
                    src={property.images[0].url}
                    alt={property.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100">
                    <HomeIcon className="h-24 w-24 text-emerald-400" />
                  </div>
                )}

                {property.isVerified && (
                  <div className="absolute top-4 left-4 bg-emerald-600 text-white text-sm font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                    <ShieldCheck className="h-4 w-4" />
                    VERIFIED PROPERTY
                  </div>
                )}
              </div>

              {/* Thumbnail strip */}
              {property.images.length > 1 && (
                <div className="p-3 flex gap-2 overflow-x-auto">
                  {property.images.map((img, idx) => (
                    <img
                      key={img.id}
                      src={img.url}
                      alt={`${property.name} ${idx + 1}`}
                      className="h-16 w-24 object-cover rounded-lg flex-shrink-0 border-2 border-transparent hover:border-emerald-500 cursor-pointer"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Property Header */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <div className="flex items-start justify-between mb-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {property.name}
                </h1>
                <div className="text-right">
                  <div className="text-3xl font-extrabold text-emerald-700">
                    KES {property.baseRent.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-500">per month</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-600 mb-4">
                <MapPin className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                <span>
                  {property.area}, {property.town}, {property.county}
                </span>
              </div>

              {property.institution && (
                <div className="flex items-center gap-2 text-slate-600 mb-4 bg-emerald-50 px-4 py-2 rounded-lg">
                  <HomeIcon className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                  <span>
                    Near <strong>{property.institution.name}</strong>
                    {property.campus && ` — ${property.campus.name}`}
                  </span>
                </div>
              )}

              {/* Availability Notice */}
              <div className="flex items-center gap-2 text-sm text-slate-600 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-lg mb-4">
                <Clock className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <span className="text-amber-900">{availabilityText}</span>
              </div>

              <p className="text-slate-700 leading-relaxed">
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map((pa) => (
                  <div
                    key={pa.id}
                    className="flex items-center gap-2 text-slate-700 bg-emerald-50 px-3 py-2.5 rounded-lg"
                  >
                    <div className="text-emerald-600">
                      {amenityIcons[pa.amenity.name] || <CheckCircle className="h-5 w-5" />}
                    </div>
                    <span className="font-medium text-sm">{pa.amenity.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Available Units */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Available Units</h2>
              <div className="flex gap-4 mb-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
                  <span className="text-slate-600">{vacantUnits.length} Vacant</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-slate-400"></div>
                  <span className="text-slate-600">{occupiedUnits.length} Occupied</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                  <span className="text-slate-600">{reservedUnits.length} Reserved</span>
                </div>
              </div>

              <div className="space-y-2">
                {property.units.map((unit) => (
                  <div
                    key={unit.id}
                    className="flex items-center justify-between p-3 border border-slate-200 rounded-lg"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{unit.unitNumber}</div>
                      <div className="text-sm text-slate-600">{unit.type}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-700">
                        KES {(unit.rent || property.baseRent).toLocaleString()}
                      </div>
                      <div
                        className={`text-xs font-semibold ${
                          unit.status === "VACANT"
                            ? "text-emerald-600"
                            : unit.status === "RESERVED"
                            ? "text-amber-600"
                            : "text-slate-500"
                        }`}
                      >
                        {unit.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Landlord Info & CTA */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Landlord Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Listed by
                </h3>
                <div className="flex items-start gap-3 mb-4">
                  <div className="bg-emerald-100 p-2.5 rounded-full">
                    <HomeIcon className="h-6 w-6 text-emerald-700" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-900">
                      {property.landlord.businessName || property.landlord.fullName}
                    </div>
                    {property.landlord.verificationStatus === "VERIFIED" && (
                      <div className="flex items-center gap-1 text-xs text-emerald-700 font-semibold mt-0.5">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Verified Landlord
                      </div>
                    )}
                  </div>
                </div>

                <a
                  href={`tel:${property.landlord.phone}`}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mb-3"
                >
                  <Phone className="h-4 w-4" />
                  {property.landlord.phone}
                </a>
              </div>

              {/* Enquiry CTA */}
              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white">
                <h3 className="text-xl font-bold mb-2">Interested in this property?</h3>
                <p className="text-emerald-100 text-sm mb-4">
                  Submit a quick enquiry. No account needed — the landlord will contact you directly.
                </p>
                <EnquiryModal
                  propertyId={property.id}
                  propertyName={property.name}
                  institutionName={property.institution?.name || ""}
                />
              </div>

              {/* Safety Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="h-5 w-5 text-amber-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-amber-900 text-sm mb-1">Safety Reminder</div>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Never send money before physically viewing the property and meeting the landlord.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}