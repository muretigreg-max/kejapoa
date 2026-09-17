// src/app/api/properties/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.NEXTAUTH_SECRET || "kejapoa_super_secret_key_12345";

export async function POST(request: NextRequest) {
  try {
    // Verify landlord is logged in
    const token = request.cookies.get("kejapoa_landlord_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded || decoded.role !== "LANDLORD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      description,
      institutionId,
      campusId,
      county,
      town,
      area,
      latitude,
      longitude,
      baseRent,
      deposit,
      units,
      amenities,
    } = body;

    // Validate required fields
    if (!name || !institutionId || !campusId || !baseRent) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create the property
    const property = await prisma.property.create({
      data: {
        landlordId: decoded.landlordId,
        institutionId,
        campusId,
        name,
        description: description || "",
        county: county || "",
        town: town || "",
        area: area || "",
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        baseRent: parseFloat(baseRent),
        deposit: deposit ? parseFloat(deposit) : parseFloat(baseRent),
        isVerified: false, // New properties start as unverified
        status: "PENDING", // Admin must approve
        lastAvailabilityCheck: new Date(),
        units: {
          create: units || [],
        },
        amenities: {
          create: (amenities || []).map((amenityId: string) => ({
            amenityId,
          })),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Property submitted successfully! It will be reviewed by our team.",
      propertyId: property.id,
    });
  } catch (error: any) {
    console.error("Property creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create property" },
      { status: 500 }
    );
  }
}

// GET all institutions and amenities for the form
export async function GET() {
  try {
    const [institutions, amenities] = await Promise.all([
      prisma.institution.findMany({
        include: { campuses: true },
        orderBy: { name: "asc" },
      }),
      prisma.amenity.findMany({
        orderBy: { name: "asc" },
      }),
    ]);

    return NextResponse.json({ institutions, amenities });
  } catch (error) {
    console.error("Error fetching form data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}