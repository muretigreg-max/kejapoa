// src/app/api/landlords/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.NEXTAUTH_SECRET || "kejapoa_super_secret_key_12345";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, password } = body;

    if (!phone || !password) {
      return NextResponse.json(
        { error: "Phone and password are required" },
        { status: 400 }
      );
    }

    // Find landlord by phone
    const landlord = await prisma.landlord.findUnique({
      where: { phone: phone.replace(/\s/g, "") },
      include: { package: true },
    });

    if (!landlord) {
      return NextResponse.json(
        { error: "Invalid phone number or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, landlord.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid phone number or password" },
        { status: 401 }
      );
    }

    // Check if suspended
    if (landlord.verificationStatus === "SUSPENDED") {
      return NextResponse.json(
        { error: "Your account has been suspended. Please contact support." },
        { status: 403 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        landlordId: landlord.id,
        email: landlord.email,
        role: "LANDLORD",
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      landlord: {
        id: landlord.id,
        fullName: landlord.fullName,
        email: landlord.email,
        phone: landlord.phone,
        businessName: landlord.businessName,
        verificationStatus: landlord.verificationStatus,
        packageName: landlord.package?.name,
      },
    });

    response.cookies.set("kejapoa_landlord_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("💥 Landlord Login API Error:", error);
    // GUARANTEE a JSON response even on crash
    return NextResponse.json(
      { error: error.message || "Failed to login" },
      { status: 500 }
    );
  }
}