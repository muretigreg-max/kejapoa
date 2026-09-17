// src/app/api/landlord/enquiries/route.ts
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

    // Fetch all enquiries for properties owned by this landlord
    const enquiries = await prisma.enquiry.findMany({
      where: {
        property: {
          landlordId: decoded.landlordId,
        },
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            town: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ enquiries });
  } catch (error) {
    console.error("Error fetching landlord enquiries:", error);
    return NextResponse.json({ error: "Failed to fetch enquiries" }, { status: 500 });
  }
}