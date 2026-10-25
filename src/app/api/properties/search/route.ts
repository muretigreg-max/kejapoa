// src/app/api/properties/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const town = searchParams.get("town");
    const area = searchParams.get("area");
    const propertyType = searchParams.get("propertyType");
    const maxBudget = searchParams.get("maxBudget");

    const where: any = {};

    // Filter by Major Town (case-insensitive partial match)
    if (town) {
      where.town = { contains: town, mode: "insensitive" };
    }

    // Filter by Subtown/Area (case-insensitive partial match)
    if (area) {
      where.area = { contains: area, mode: "insensitive" };
    }

    // Filter by Room Type
    if (propertyType) {
      where.units = {
        some: {
          type: propertyType,
        },
      };
    }

    // Filter by Budget
    if (maxBudget && maxBudget !== "999999") {
      const parsedBudget = Number(maxBudget);
      if (!isNaN(parsedBudget)) {
        where.baseRent = { lte: parsedBudget };
      }
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        institution: { select: { name: true } }, // Keep for backward compatibility
        campus: { select: { name: true } },
        units: { select: { id: true, type: true, rent: true, status: true } },
        amenities: { include: { amenity: { select: { name: true } } } },
        images: { where: { isPrimary: true }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = properties.map((p: any) => {
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
        institutionName: p.institution?.name || "",
        campusName: p.campus?.name || "",
        distanceKm: null,
        landlordName: "Verified Landlord",
        landlordVerified: true,
        availableUnits: availableUnits,
        unitTypes: unitTypes,
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