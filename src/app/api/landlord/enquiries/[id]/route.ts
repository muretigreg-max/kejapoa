// src/app/api/landlord/enquiries/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.NEXTAUTH_SECRET || "kejapoa_super_secret_key_12345";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.cookies.get("kejapoa_landlord_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded || decoded.role !== "LANDLORD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { action, unitId, moveInDate } = body;

    // Verify the enquiry belongs to this landlord
    const enquiry = await prisma.enquiry.findUnique({
      where: { id },
      include: {
        property: {
          select: { landlordId: true },
        },
      },
    });

    if (!enquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    if (enquiry.property.landlordId !== decoded.landlordId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Handle different actions
    if (action === "ENROLL") {
      if (!unitId) {
        return NextResponse.json(
          { error: "A unit must be selected" },
          { status: 400 }
        );
      }

      // 1. Update enquiry status to ENROLLED
      const updatedEnquiry = await prisma.enquiry.update({
        where: { id },
        data: {
          status: "ENROLLED",
        },
      });

      // 2. Update the selected unit status to OCCUPIED
      await prisma.propertyUnit.update({
        where: { id: unitId },
        data: { status: "OCCUPIED" },
      });

      return NextResponse.json({
        success: true,
        message: "Student enrolled successfully",
        enquiry: updatedEnquiry,
      });
    }

    if (action === "CONTACTED") {
      const updatedEnquiry = await prisma.enquiry.update({
        where: { id },
        data: { status: "CONTACTED" },
      });
      return NextResponse.json({ success: true, enquiry: updatedEnquiry });
    }

    if (action === "CLOSE") {
      const updatedEnquiry = await prisma.enquiry.update({
        where: { id },
        data: { status: "CLOSED" },
      });
      return NextResponse.json({ success: true, enquiry: updatedEnquiry });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Enquiry update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update enquiry" },
      { status: 500 }
    );
  }
}

// GET: Fetch units for a specific property (for enrollment form)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.cookies.get("kejapoa_landlord_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded || decoded.role !== "LANDLORD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch the enquiry to get the property ID
    const enquiry = await prisma.enquiry.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            id: true,
            landlordId: true,
            units: {
              where: { status: "VACANT" },
              select: {
                id: true,
                unitNumber: true,
                type: true,
                rent: true,
              },
            },
          },
        },
      },
    });

    if (!enquiry || enquiry.property.landlordId !== decoded.landlordId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({
      units: enquiry.property.units,
    });
  } catch (error) {
    console.error("Error fetching units:", error);
    return NextResponse.json({ error: "Failed to fetch units" }, { status: 500 });
  }
}