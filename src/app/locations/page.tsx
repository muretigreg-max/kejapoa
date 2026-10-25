// src/app/locations/page.tsx
import Link from "next/link";
import { MapPin, Home, ArrowLeft, ArrowRight } from "lucide-react";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function LocationsPage() {
  const properties = await prisma.property.findMany({
    where: { isVerified: true },
    select: { town: true, images: { where: { isPrimary: true }, take: 1 } },
  });

  const townMap = new Map<string, { count: number; coverImage: string | null }>();
  properties.forEach((p) => {
    if (!p.town) return;
    const existing = townMap.get(p.town);
    if (existing) {
      existing.count += 1;
    } else {
      townMap.set(p.town, { count: 1, coverImage: p.images[0]?.url || null });
    }
  });

  const townStats = Array.from(townMap.entries())
    .map(([town, data]) => ({ town, ...data }))
    .sort((a, b) => b.count - a.count);

  return (
    <main className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-emerald-700 font-bold text-xl">
            <ArrowLeft className="h-5 w-5" /> KejaPoa
          </Link>
        </div>
      </nav>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">Explore Locations</h2>
            <p className="text-slate-600">Discover verified rentals across Kenya's most popular towns</p>
          </div>

          {townStats.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
              <MapPin className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No locations yet</h3>
              <p className="text-slate-600">Check back soon as landlords list new properties!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {townStats.map((stat) => (
                <Link
                  key={stat.town}
                  href={`/search?town=${encodeURIComponent(stat.town)}`}
                  className="group relative h-64 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300"
                >
                  {stat.coverImage ? (
                    <img src={stat.coverImage} alt={stat.town} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 flex items-center justify-center">
                      <MapPin className="h-20 w-20 text-white/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <h3 className="text-2xl sm:text-3xl font-bold mb-1 drop-shadow-lg">{stat.town}</h3>
                        <p className="text-sm text-white/90 font-medium flex items-center gap-1.5">
                          <Home className="h-4 w-4" /> {stat.count} {stat.count === 1 ? "property" : "properties"}
                        </p>
                      </div>
                      <div className="bg-white/95 backdrop-blur-sm rounded-full p-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 shadow-lg">
                        <ArrowRight className="h-4 w-4 text-emerald-700" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}