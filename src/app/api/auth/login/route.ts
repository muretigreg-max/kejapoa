// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.NEXTAUTH_SECRET || "kejapoa_super_secret_key_12345";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ✅ 1. Check Admin table
    const admin = await prisma.admin.findUnique({
      where: { email: normalizedEmail },
    });

    if (admin) {
      const isValid = await bcrypt.compare(password, admin.password);
      if (isValid) {
        const token = jwt.sign(
          { adminId: admin.id, email: admin.email, role: "ADMIN" },
          JWT_SECRET,
          { expiresIn: "7d" }
        );

        const response = NextResponse.json({
          success: true,
          role: "ADMIN",
          redirect: "/admin/dashboard",
        });

        response.cookies.set("kejapoa_admin_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
        });

        return response;
      }
    }

    // ✅ 2. Check Landlord table
    const landlord = await prisma.landlord.findUnique({
      where: { email: normalizedEmail },
    });

    if (landlord) {
      const isValid = await bcrypt.compare(password, landlord.password);
      if (isValid) {
        const token = jwt.sign(
          { landlordId: landlord.id, email: landlord.email, role: "LANDLORD" },
          JWT_SECRET,
          { expiresIn: "7d" }
        );

        const response = NextResponse.json({
          success: true,
          role: "LANDLORD",
          redirect: "/landlord/dashboard",
        });

        response.cookies.set("kejapoa_landlord_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
        });

        return response;
      }
    }

    // ✅ 3. Check Student table (if it exists)
    try {
      const student = await prisma.student.findUnique({
        where: { email: normalizedEmail },
      });

      if (student) {
        const isValid = await bcrypt.compare(password, student.password);
        if (isValid) {
          const token = jwt.sign(
            { studentId: student.id, email: student.email, role: "STUDENT" },
            JWT_SECRET,
            { expiresIn: "7d" }
          );

          const response = NextResponse.json({
            success: true,
            role: "STUDENT",
            redirect: "/",
          });

          response.cookies.set("kejapoa_student_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
          });

          return response;
        }
      }
    } catch (e) {
      // Student table might not exist yet - that's okay
      console.log("Student table not found, skipping");
    }

    // ❌ No matching user found
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "Login failed" },
      { status: 500 }
    );
  }
}