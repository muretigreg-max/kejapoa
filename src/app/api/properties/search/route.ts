// src/app/api/properties/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Haversine formula to calculate distance between two coordinates (in km)
function calculateDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const institutionId = searchParams.get("institutionId");
    const propertyType = searchParams.get("propertyType");
    const maxBudget = searchParams.get("maxBudget")
      ? parseInt(searchParams.get("maxBudget")!)
      : null;
    const maxDistanceKm = searchParams.get("maxDistanceKm")
      ? parseFloat(searchParams.get("maxDistanceKm")!)
      : null;

    // Build the Prisma query
    const where: any = {
      status: "VERIFIED",
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

    // Fetch properties with related data
    let properties = await prisma.property.findMany({
      where,
      include: {
        institution: true,
        campus: true,
        landlord: {
          select: {
            id: true,
            fullName: true,
            businessName: true,
            verificationStatus: true,
          },
        },
        units: {
          where: { status: "VACANT" },
          select: { id: true, type: true, rent: true },
        },
        amenities: {
          include: { amenity: true },
        },
        images: {
          orderBy: { isPrimary: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Filter by distance if campus coordinates exist
    if (maxDistanceKm && institutionId) {
      const institution = await prisma.institution.findUnique({
        where: { id: institutionId },
        include: { campuses: true },
      });

      if (institution && institution.campuses.length > 0) {
        const campus = institution.campuses[0];
        if (campus.latitude && campus.longitude) {
          properties = properties
            .map((property) => {
              if (property.latitude && property.longitude) {
                const distance = calculateDistance(
                  campus.latitude,
                  campus.longitude,
                  property.latitude,
                  property.longitude
                );
                return { ...property, distanceKm: distance };
              }
              return { ...property, distanceKm: null };
            })
            .filter((property) => 
              property.distanceKm !== null && property.distanceKm <= maxDistanceKm
            )
            .sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
        }
      }
    }

    // Format the response
    const formattedProperties = properties.map((property) => ({
      id: property.id,
      name: property.name,
      description: property.description,
      town: property.town,
      area: property.area,
      baseRent: property.baseRent,
      deposit: property.deposit,
      isVerified: property.isVerified,
      lastAvailabilityCheck: property.lastAvailabilityCheck,
      distanceKm: (property as any).distanceKm,
      institutionName: property.institution?.name || null,
      campusName: property.campus?.name || null,
      landlordName: property.landlord.businessName || property.landlord.fullName,
      landlordVerified: property.landlord.verificationStatus === "VERIFIED",
      availableUnits: property.units.length,
      unitTypes: [...new Set(property.units.map((u) => u.type))],
      amenities: property.amenities.map((a) => a.amenity.name),
      primaryImage: property.images[0]?.url || null,
    }));

    return NextResponse.json({ properties: formattedProperties });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search properties" },
      { status: 500 }
    );
  }
}