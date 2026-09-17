// src/app/api/admin/landlords/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, VerificationStatus } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.NEXTAUTH_SECRET || "kejapoa_super_secret_key_12345";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.cookies.get("kejapoa_admin_token")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded || decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body;

    if (!["PENDING", "VERIFIED", "SUSPENDED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updatedLandlord = await prisma.landlord.update({
      where: { id },
      data: { verificationStatus: status as VerificationStatus },
    });

    return NextResponse.json({ success: true, landlord: updatedLandlord });
  } catch (error) {
    console.error("Error updating landlord:", error);
    return NextResponse.json({ error: "Failed to update landlord" }, { status: 500 });
  }
}