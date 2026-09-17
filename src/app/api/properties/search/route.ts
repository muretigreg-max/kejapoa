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
      return {
        id: p.id,
        name: p.name,
        description: p.description,
        town: p.town,
        area: p.area,
        baseRent: Number(p.baseRent),
        deposit: Number(p.deposit),
        isVerified: p.isVerified,
        lastAvailabilityCheck: p.lastAvailabilityCheck,
        institutionName: p.institution?.name || "Unknown",
        campusName: p.campus?.name || "Unknown",
        distanceKm: null, // Simplified for guaranteed MVP deployment
        units: p.units.map((u: any) => ({
          id: u.id,
          type: u.type,
          rent: Number(u.rent),
          status: u.status,
        })),
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