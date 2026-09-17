// prisma/seed/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding KejaPoa database...");

  // 1. Clear existing data (Order matters due to foreign keys)
  console.log("🧹 Clearing old data...");
  await prisma.searchEvent.deleteMany();
  await prisma.application.deleteMany();
  await prisma.enquiry.deleteMany();
  await prisma.propertyAmenity.deleteMany();
  await prisma.propertyImage.deleteMany();
  await prisma.propertyUnit.deleteMany();
  await prisma.payment.deleteMany(); // MUST delete payments BEFORE landlords
  await prisma.property.deleteMany();
  await prisma.campus.deleteMany();
  await prisma.institution.deleteMany();
  await prisma.landlord.deleteMany(); // MUST delete landlords AFTER payments/properties
  await prisma.amenity.deleteMany();
  await prisma.package.deleteMany();
  await prisma.admin.deleteMany();
  console.log("✅ Database cleared successfully.");

  // 2. Create Admin User
  const adminEmail = process.env.ADMIN_EMAIL || "admin@kejapoa.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "MyStrongLocalPassword!123";
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
  
  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: { password: hashedAdminPassword },
    create: {
      name: "KejaPoa Admin",
      email: adminEmail,
      password: hashedAdminPassword,
      role: "ADMIN",
    },
  });
  console.log(`✅ Admin user created: ${adminEmail}`);

  // 3. Create Amenities
  const amenities = await Promise.all([
    prisma.amenity.create({ data: { name: "WiFi" } }),
    prisma.amenity.create({ data: { name: "Water" } }),
    prisma.amenity.create({ data: { name: "Electricity" } }),
    prisma.amenity.create({ data: { name: "Security" } }),
    prisma.amenity.create({ data: { name: "Parking" } }),
    prisma.amenity.create({ data: { name: "Laundry" } }),
    prisma.amenity.create({ data: { name: "Furnished" } }),
    prisma.amenity.create({ data: { name: "24hr Access" } }),
    prisma.amenity.create({ data: { name: "Hot Shower" } }),
    prisma.amenity.create({ data: { name: "CCTV" } }),
  ]);

  // 4. Create Institutions & Campuses
  const dkut = await prisma.institution.create({
    data: {
      name: "Dedan Kimathi University",
      type: "University",
      county: "Nyeri",
      town: "Nyeri",
      campuses: { create: [{ name: "Main Campus", latitude: -0.4106, longitude: 36.9587 }] },
    },
    include: { campuses: true },
  });

  const uon = await prisma.institution.create({
    data: {
      name: "University of Nairobi",
      type: "University",
      county: "Nairobi",
      town: "Nairobi",
      campuses: { create: [{ name: "Main Campus", latitude: -1.2815, longitude: 36.8196 }] },
    },
    include: { campuses: true },
  });

  // 🆕 NEW: Kenya School of Agriculture - Nyeri Campus
  const ksa = await prisma.institution.create({
    data: {
      name: "Kenya School of Agriculture",
      type: "College",
      county: "Nyeri",
      town: "Nyeri",
      campuses: { create: [{ name: "Nyeri Campus", latitude: -0.4167, longitude: 36.9500 }] },
    },
    include: { campuses: true },
  });

  // 5. Create Landlords
  const landlord1 = await prisma.landlord.create({
    data: {
      fullName: "John Kamau",
      phone: "0712345678",
      email: "john@example.com",
      idNumber: "12345678",
      businessName: "Green View Hostels",
      password: await bcrypt.hash("password123", 10),
      mpesaNumber: "0712345678",
      verificationStatus: "VERIFIED",
    },
  });

  // 6. Create Properties
  await prisma.property.create({
    data: {
      landlordId: landlord1.id,
      institutionId: dkut.id,
      campusId: dkut.campuses[0].id,
      name: "Green View Hostels",
      description: "Modern, secure student accommodation near DKUT.",
      county: "Nyeri",
      town: "Nyeri",
      area: "Near Main Gate",
      latitude: -0.4130,
      longitude: 36.9600,
      baseRent: 4500,
      deposit: 4500,
      isVerified: true,
      status: "VERIFIED",
      lastAvailabilityCheck: new Date(),
      images: {
        create: [{ url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800", isPrimary: true }],
      },
      units: {
        create: [
          { unitNumber: "Room 001", type: "Single Room", status: "VACANT", rent: 4500 },
          { unitNumber: "Bedsitter A", type: "Bedsitter", status: "VACANT", rent: 6500 },
        ],
      },
      amenities: {
        create: [
          { amenityId: amenities[0].id },
          { amenityId: amenities[1].id },
        ],
      },
    },
  });

  // 7. Create Packages
  await prisma.package.createMany({
    data: [
      { name: "BASIC", price: 500, durationDays: 30, maxProperties: 1, maxUnits: 20, isFeatured: false },
      { name: "STANDARD", price: 1500, durationDays: 30, maxProperties: 5, maxUnits: 100, isFeatured: false },
      { name: "PREMIUM", price: 3500, durationDays: 30, maxProperties: 999, maxUnits: 9999, isFeatured: true },
    ],
  });

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });