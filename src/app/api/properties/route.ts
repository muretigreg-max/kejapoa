// src/app/api/properties/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.NEXTAUTH_SECRET || "kejapoa_super_secret_key_12345";

export async function POST(request: NextRequest) {
  try {
    // 1. Verify Landlord Token
    const token = request.cookies.get("kejapoa_landlord_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized: Please log in" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== "LANDLORD") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const landlordId = decoded.landlordId;

    // 2. Parse Request Body
    const body = await request.json();
    const { name, description, town, area, baseRent, deposit, units, amenities, images } = body;

    // 3. Validate Required Fields
    if (!name || !town || !baseRent || !units || units.length === 0 || !images || images.length === 0) {
      console.log("Missing fields. Received:", { name, town, baseRent, units, images });
      return NextResponse.json({ error: "Missing required fields: name, town, baseRent, units, or images" }, { status: 400 });
    }

    // 4. Create Property in Database
    const property = await prisma.property.create({
      data: {
        name,
        description: description || "",
        town,
        area: area || "",
        baseRent: Number(baseRent),
        deposit: deposit ? Number(deposit) : Number(baseRent),
        landlordId,
        isVerified: false, // Requires admin approval
        status: "PENDING",
        
        // Create related records
        units: {
          create: units.map((u: any) => ({
            unitNumber: u.unitNumber,
            type: u.type,
            rent: Number(u.rent),
            status: "VACANT",
          })),
        },
        images: {
          create: images.map((img: any) => ({
            url: img.url,
            isPrimary: img.isPrimary || false,
          })),
        },
        amenities: {
          create: amenities.map((amenityId: string) => ({
            amenityId,
          })),
        },
      },
      include: {
        units: true,
        images: true,
        amenities: true,
      },
    });

    return NextResponse.json({ 
      success: true, 
      propertyId: property.id,
      message: "Property created successfully" 
    });

  } catch (error: any) {
    console.error("❌ Property creation error:", error);
    
    // Handle Prisma specific errors
    if (error.code === "P2002") {
      return NextResponse.json({ error: "A property with this name already exists" }, { status: 400 });
    }
    
    return NextResponse.json({ error: error.message || "Failed to create property" }, { status: 500 });
  }
}

// Optional: GET route to fetch amenities or properties
export async function GET(request: NextRequest) {
  try {
    const amenities = await prisma.amenity.findMany({
      select: { id: true, name: true },
    });
    return NextResponse.json({ amenities });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch amenities" }, { status: 500 });
  }
}