// src/app/api/admin/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.NEXTAUTH_SECRET || "kejapoa_super_secret_key_12345";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("kejapoa_admin_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded || decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const [landlordsCount, propertiesCount, enquiriesCount] = await Promise.all([
      prisma.landlord.count(),
      prisma.property.count(),
      prisma.enquiry.count(),
    ]);

    return NextResponse.json({
      landlords: { total: landlordsCount },
      properties: { total: propertiesCount },
      enquiries: { total: enquiriesCount },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}