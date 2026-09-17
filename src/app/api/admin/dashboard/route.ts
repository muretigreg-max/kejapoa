// src/app/api/admin/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.NEXTAUTH_SECRET || "kejapoa_super_secret_key_12345";

export async function GET(request: NextRequest) {
  try {
    // Verify admin token
    const token = request.cookies.get("kejapoa_admin_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded || decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch all statistics
    const [
      totalLandlords,
      verifiedLandlords,
      pendingLandlords,
      totalProperties,
      verifiedProperties,
      pendingProperties,
      totalUnits,
      vacantUnits,
      occupiedUnits,
      reservedUnits,
      totalEnquiries,
      totalApplications,
      approvedApplications,
      totalPayments,
      successfulPayments,
      totalRevenue,
    ] = await Promise.all([
      prisma.landlord.count(),
      prisma.landlord.count({ where: { verificationStatus: "VERIFIED" } }),
      prisma.landlord.count({ where: { verificationStatus: "PENDING" } }),
      prisma.property.count(),
      prisma.property.count({ where: { status: "VERIFIED" } }),
      prisma.property.count({ where: { status: "PENDING" } }),
      prisma.propertyUnit.count(),
      prisma.propertyUnit.count({ where: { status: "VACANT" } }),
      prisma.propertyUnit.count({ where: { status: "OCCUPIED" } }),
      prisma.propertyUnit.count({ where: { status: "RESERVED" } }),
      prisma.enquiry.count(),
      prisma.application.count(),
      prisma.application.count({ where: { status: "APPROVED" } }),
      prisma.payment.count(),
      prisma.payment.count({ where: { status: "SUCCESSFUL" } }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: "SUCCESSFUL" },
      }),
    ]);

    return NextResponse.json({
      landlords: {
        total: totalLandlords,
        verified: verifiedLandlords,
        pending: pendingLandlords,
      },
      properties: {
        total: totalProperties,
        verified: verifiedProperties,
        pending: pendingProperties,
      },
      units: {
        total: totalUnits,
        vacant: vacantUnits,
        occupied: occupiedUnits,
        reserved: reservedUnits,
      },
      enquiries: {
        total: totalEnquiries,
      },
      applications: {
        total: totalApplications,
        approved: approvedApplications,
      },
      payments: {
        total: totalPayments,
        successful: successfulPayments,
        revenue: totalRevenue._sum.amount || 0,
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}