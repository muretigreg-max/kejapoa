// src/app/api/landlord/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.NEXTAUTH_SECRET || "kejapoa_super_secret_key_12345";

export async function GET(request: NextRequest) {
  try {
    // 1. Get the token from cookies
    const token = request.cookies.get("kejapoa_landlord_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // 2. Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (!decoded || decoded.role !== "LANDLORD") {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // 3. Fetch the landlord from the database
    const landlord = await prisma.landlord.findUnique({
      where: { id: decoded.landlordId },
      include: {
        package: true,
      },
    });

    if (!landlord) {
      return NextResponse.json({ error: "Landlord not found" }, { status: 404 });
    }

    // 4. Return safe data (exclude password)
    return NextResponse.json({
      id: landlord.id,
      fullName: landlord.fullName,
      phone: landlord.phone,
      email: landlord.email,
      businessName: landlord.businessName,
      verificationStatus: landlord.verificationStatus,
      packageName: landlord.package?.name || "Unknown",
      packagePrice: landlord.package?.price || 0,
      packageId: landlord.package?.id || "",
    });
  } catch (error) {
    console.error("Error fetching landlord:", error);
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
  }
}