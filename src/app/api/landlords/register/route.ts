// src/app/api/landlords/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fullName,
      phone,
      email,
      idNumber,
      businessName,
      mpesaNumber,
      password,
      packageId,
    } = body;

    // Validate required fields
    if (!fullName || !phone || !email || !idNumber || !mpesaNumber || !password || !packageId) {
      return NextResponse.json(
        { error: "All required fields must be filled" },
        { status: 400 }
      );
    }

    // Validate phone number (Kenyan format)
    const phoneRegex = /^(0|254|\+254)?(1|7)\d{8}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
      return NextResponse.json(
        { error: "Invalid Kenyan phone number" },
        { status: 400 }
      );
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if phone or email already exists
    const existingLandlord = await prisma.landlord.findFirst({
      where: {
        OR: [{ phone: phone.replace(/\s/g, "") }, { email }],
      },
    });

    if (existingLandlord) {
      return NextResponse.json(
        { error: "A landlord with this phone or email already exists" },
        { status: 409 }
      );
    }

    // Check if package exists
    const packageExists = await prisma.package.findUnique({
      where: { id: packageId },
    });

    if (!packageExists) {
      return NextResponse.json(
        { error: "Selected package not found" },
        { status: 404 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create landlord
    const landlord = await prisma.landlord.create({
      data: {
        fullName,
        phone: phone.replace(/\s/g, ""),
        email,
        idNumber,
        businessName: businessName || null,
        mpesaNumber: mpesaNumber.replace(/\s/g, ""),
        password: hashedPassword,
        packageId,
        verificationStatus: "PENDING",
      },
      include: {
        package: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Registration successful! Your account is pending verification.",
      landlord: {
        id: landlord.id,
        fullName: landlord.fullName,
        email: landlord.email,
        phone: landlord.phone,
        verificationStatus: landlord.verificationStatus,
        packageName: landlord.package?.name,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register landlord" },
      { status: 500 }
    );
  }
}