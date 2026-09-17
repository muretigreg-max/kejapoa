// src/app/api/admin/landlords/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.NEXTAUTH_SECRET || "kejapoa_super_secret_key_12345";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("kejapoa_admin_token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded || decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const landlords = await prisma.landlord.findMany({
      include: { package: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ landlords });
  } catch (error) {
    console.error("Error fetching landlords:", error);
    return NextResponse.json({ error: "Failed to fetch landlords" }, { status: 500 });
  }
}