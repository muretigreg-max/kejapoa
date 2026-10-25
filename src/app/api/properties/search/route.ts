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

    console.log("🔍 Search params:", { town, area, propertyType, maxBudget });

    const where: any = {};

    // ✅ FLEXIBLE LOCATION MATCHING: Check if search term appears in town, area, OR name
    if (town || area) {
      const searchTerm = (town || area || "").toLowerCase();
      
      where.OR = [
        { town: { contains: searchTerm, mode: "insensitive" } },
        { area: { contains: searchTerm, mode: "insensitive" } },
        { name: { contains: searchTerm, mode: "insensitive" } },
      ];
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

    console.log("🔍 Prisma where clause:", JSON.stringify(where, null, 2));

    const properties = await prisma.property.findMany({
      where,
      include: {
        units: { select: { id: true, type: true, rent: true, status: true } },
        amenities: { include: { amenity: { select: { name: true } } } },
        images: { where: { isPrimary: true }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });

    console.log(`🔍 Found ${properties.length} properties`);

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
    console.error("❌ Search error:", error);
    return NextResponse.json({ error: "Failed to search properties" }, { status: 500 });
  }
}