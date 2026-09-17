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

    // Build the where clause
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

    // Safe budget filtering
    if (maxBudget) {
      const parsedBudget = parseFloat(maxBudget);
      if (!isNaN(parsedBudget)) {
        where.baseRent = { lte: parsedBudget };
      }
    }

    // Fetch properties
    const properties = await prisma.property.findMany({
      where,
      include: {
        institution: {
          select: { name: true },
        },
        campus: {
          select: { name: true },
        },
        units: {
          where: { status: "VACANT" },
          select: {
            id: true,
            type: true,
            rent: true,
            status: true,
          },
        },
        amenities: {
          include: {
            amenity: {
              select: { name: true },
            },
          },
        },
        images: {
          where: { isPrimary: true },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format the response
    const formatted = properties.map((p) => {
      // Calculate distance if coordinates exist
      let distanceKm: number | null = null;
      
      if (p.latitude && p.longitude && p.campus) {
        // Simple distance calculation (you can enhance this later)
        distanceKm = 0.5; // Placeholder - implement real calculation if needed
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