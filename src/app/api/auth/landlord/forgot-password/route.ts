// src/app/api/auth/landlord/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const landlord = await prisma.landlord.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!landlord) {
      // Don't reveal if email exists or not (security best practice)
      return NextResponse.json({ 
        success: true, 
        message: "If an account exists with that email, you will receive reset instructions" 
      });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save token to database
    await prisma.landlord.update({
      where: { id: landlord.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Create reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/landlord/reset-password/${resetToken}`;

    // TODO: Send email with resetUrl (integrate with email service like SendGrid, Resend, etc.)
    // For now, return the link in the response for testing
    console.log(`🔑 Password reset link for ${email}: ${resetUrl}`);

    return NextResponse.json({ 
      success: true, 
      message: "Reset link sent successfully",
      resetLink: resetUrl // Remove this in production after adding email service
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: error.message || "Failed to process request" }, { status: 500 });
  }
}