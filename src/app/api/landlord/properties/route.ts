// src/app/api/landlord/properties/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.NEXTAUTH_SECRET || "kejapoa_super_secret_key_12345";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("kejapoa_landlord_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded || decoded.role !== "LANDLORD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const properties = await prisma.property.findMany({
      where: { landlordId: decoded.landlordId },
      include: {
        institution: { select: { name: true } },
        campus: { select: { name: true } },
        units: { select: { id: true, status: true } },
        images: {
          where: { isPrimary: true },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format the response
    const formatted = properties.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      town: p.town,
      area: p.area,
      baseRent: p.baseRent,
      status: p.status,
      isVerified: p.isVerified,
      createdAt: p.createdAt,
      institutionName: p.institution?.name || "Unknown",
      campusName: p.campus?.name || "Unknown",
      totalUnits: p.units.length,
      vacantUnits: p.units.filter((u) => u.status === "VACANT").length,
      occupiedUnits: p.units.filter((u) => u.status === "OCCUPIED").length,
      primaryImage: p.images[0]?.url || null,
    }));

    return NextResponse.json({ properties: formatted });
  } catch (error) {
    console.error("Error fetching landlord properties:", error);
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
  }
}