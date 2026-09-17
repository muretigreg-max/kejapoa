// src/app/api/properties/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get("institutionId");
    const propertyType = searchParams.get("propertyType");
    const maxBudget = searchParams.get("maxBudget");

    const where: any = {
      status: "VERIFIED",
      isVerified: true,
    };

    if (institutionId) {
      where.institutionId = institutionId;
    }

    if (propertyType) {
      where.units = {
        some: {
          type: propertyType,
          status: "VACANT",
        },
      };
    }

    if (maxBudget) {
      const parsedBudget = parseFloat(maxBudget);
      if (!isNaN(parsedBudget)) {
        where.baseRent = { lte: parsedBudget };
      }
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        institution: { select: { name: true } },
        campus: true,
        units: {
          where: { status: "VACANT" },
          select: { id: true, type: true, rent: true, status: true },
        },
        amenities: { include: { amenity: { select: { name: true } } } },
        images: { where: { isPrimary: true }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = properties.map((p) => {
      let distanceKm: number | null = null;

      // Strict null-checking to satisfy Vercel's strict TypeScript checks
      if (
        p.latitude !== null &&
        p.longitude !== null &&
        p.campus !== null &&
        p.campus.latitude !== null &&
        p.campus.longitude !== null
      ) {
        const lat1 = p.latitude as number;
        const lon1 = p.longitude as number;
        const lat2 = p.campus.latitude as number;
        const lon2 = p.campus.longitude as number;

        // Haversine formula for distance calculation
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        distanceKm = R * c;
      }

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        town: p.town,
        area: p.area,
        baseRent: p.baseRent,
        deposit: p.deposit,
        isVerified: p.isVerified,
        lastAvailabilityCheck: p.lastAvailabilityCheck,
        institutionName: p.institution?.name || "Unknown",
        campusName: p.campus?.name || "Unknown",
        distanceKm: distanceKm,
        units: p.units.map((u) => ({
          id: u.id,
          type: u.type,
          rent: u.rent,
          status: u.status,
        })),
        amenities: p.amenities.map((pa) => pa.amenity.name),
        primaryImage: p.images[0]?.url || null,
      };
    });

    return NextResponse.json({ properties: formatted });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Failed to search properties" }, { status: 500 });
  }
}