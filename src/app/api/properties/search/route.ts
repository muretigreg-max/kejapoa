// src/app/api/properties/search/route.ts
// VERSION 2.0 - Updated for Vercel deployment - DO NOT CACHE
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
      const parsedBudget = Number(maxBudget);
      if (!isNaN(parsedBudget)) {
        where.baseRent = { lte: parsedBudget };
      }
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        institution: { select: { name: true } },
        campus: { select: { name: true } },
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

      // Safe distance calculation
      if (
        p.latitude !== null &&
        p.longitude !== null &&
        p.campus !== null &&
        p.campus.latitude !== null &&
        p.campus.longitude !== null
      ) {
        const lat1 = Number(p.latitude);
        const lon1 = Number(p.longitude);
        const lat2 = Number(p.campus.latitude);
        const lon2 = Number(p.campus.longitude);

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

      // ✅ NEW: Calculate unit types and available units from the units array
      const unitTypes = [...new Set(p.units.map((u: any) => u.type))];
      const availableUnits = p.units.length;

      return {
        id: p.id,
        name: p.name,
        description: p.description || "",
        town: p.town || "",
        area: p.area || "",
        baseRent: Number(p.baseRent),
        deposit: Number(p.deposit) || 0,
        isVerified: p.isVerified,
        lastAvailabilityCheck: p.lastAvailabilityCheck || new Date().toISOString(),
        institutionName: p.institution?.name || "Unknown",
        campusName: p.campus?.name || "Unknown",
        distanceKm: distanceKm,
        landlordName: "Verified Landlord", // Fallback
        landlordVerified: true,
        availableUnits: availableUnits, // ✅ Now sent to frontend
        unitTypes: unitTypes,           // ✅ Now sent to frontend
        amenities: p.amenities.map((pa: any) => pa.amenity.name),
        primaryImage: p.images.length > 0 ? p.images[0].url : null,
      };
    });

    return NextResponse.json({ properties: formatted });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Failed to search properties" }, { status: 500 });
  }
}