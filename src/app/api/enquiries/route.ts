// src/app/api/enquiries/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      propertyId,
      studentName,
      studentPhone,
      institution,
      preferredRoomType,
      message,
      preferredViewingDate,
    } = body;

    // Validate required fields
    if (!propertyId || !studentName || !studentPhone || !institution || !preferredRoomType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate a unique reference number
    const referenceNumber = `KP-${Date.now().toString().slice(-6)}`;

    // Create the enquiry in the database
    const enquiry = await prisma.enquiry.create({
      data: {
        propertyId,
        studentName,
        studentPhone,
        institution,
        preferredRoomType,
        message: message || "",
        preferredViewingDate: preferredViewingDate ? new Date(preferredViewingDate) : null,
        referenceNumber,
        status: "NEW",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Enquiry submitted successfully",
      referenceNumber,
      enquiryId: enquiry.id,
    });
  } catch (error: any) {
    console.error("Enquiry submission error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit enquiry" },
      { status: 500 }
    );
  }
}