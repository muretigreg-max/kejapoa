// src/app/api/payments/mpesa/stkpush/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper to generate Daraja password
function generatePassword(shortcode: string, passkey: string, timestamp: string) {
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
}

// Helper to get Daraja OAuth Token
async function getDarajaToken() {
  // Aggressively clean credentials: remove spaces, newlines, and quotes
  const consumerKey = process.env.MPESA_CONSUMER_KEY?.trim().replace(/['"\n\r]+/g, '');
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET?.trim().replace(/['"\n\r]+/g, '');

  if (!consumerKey || !consumerSecret) {
    throw new Error("M-Pesa credentials missing. Please check your .env file.");
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  const response = await fetch(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    }
  );

  // Read as raw text first to catch HTML errors or empty responses
  const rawText = await response.text();
  console.log("🔍 Daraja OAuth Status:", response.status);
  console.log("🔍 Daraja OAuth Raw Response:", rawText);

  let data;
  try {
    data = JSON.parse(rawText);
  } catch (e) {
    throw new Error(`Safaricom returned non-JSON response (Status: ${response.status}). Response: ${rawText}`);
  }

  if (!response.ok || !data.access_token) {
    throw new Error(`Failed to get access token. Daraja response: ${JSON.stringify(data)}`);
  }

  if (data.access_token.length < 50) {
    throw new Error(
      `Invalid Access Token generated (Length: ${data.access_token.length}). ` +
      `This means your Consumer Key or Secret is incorrect or the app lacks M-Pesa product access.`
    );
  }

  console.log("✅ Successfully got Access Token:", data.access_token.substring(0, 15) + "...");
  return data.access_token;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { landlordId, amount, phoneNumber, packageId } = body;

    // 1. Validate inputs
    if (!landlordId || !amount || !phoneNumber || !packageId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2. Format phone number to 2547XXXXXXXX (Safaricom requirement)
    let formattedPhone = phoneNumber.replace(/\s/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "254" + formattedPhone.substring(1);
    } else if (formattedPhone.startsWith("+254")) {
      formattedPhone = formattedPhone.substring(1);
    }

    if (!/^2547\d{8}$/.test(formattedPhone)) {
      return NextResponse.json(
        { error: "Invalid phone number format. Use 07XXXXXXXX or 2547XXXXXXXX" },
        { status: 400 }
      );
    }

    // ==========================================
    // 🎭 MOCK MODE: Bypass Safaricom if enabled
    // ==========================================
    if (process.env.MPESA_MOCK_MODE === "true") {
      console.log("🎭 MOCK MODE: Simulating successful M-Pesa STK Push...");
      
      const payment = await prisma.payment.create({
        data: {
          landlordId,
          packageId,
          amount,
          phoneNumber: formattedPhone,
          status: "SUCCESSFUL", // Auto-succeed in mock mode
          mpesaReceipt: `MOCK${Date.now()}`,
        },
      });

      // Simulate a 3-second delay to feel like a real network request
      await new Promise((resolve) => setTimeout(resolve, 3000));

      return NextResponse.json({
        success: true,
        message: "STK Push sent successfully! (Mock Mode - Check your dashboard)",
        checkoutRequestID: `MOCK_${payment.id}`,
        paymentId: payment.id,
      });
    }
    // ==========================================

    // 3. Create a pending payment record in the database (Real Mode)
    const payment = await prisma.payment.create({
      data: {
        landlordId,
        packageId,
        amount,
        phoneNumber: formattedPhone,
        status: "PENDING",
      },
    });

    // 4. Get Daraja Access Token
    let accessToken: string;
    try {
      accessToken = await getDarajaToken();
    } catch (error: any) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });
      console.error("❌ Token Generation Failed:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 5. Generate Timestamp and Password
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, -3);
    const shortcode = process.env.MPESA_SHORTCODE?.trim().replace(/['"\n\r]+/g, '') || "174379";
    const passkey = process.env.MPESA_PASSKEY?.trim().replace(/['"\n\r]+/g, '') || "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
    const password = generatePassword(shortcode, passkey, timestamp);
    const callbackUrl = process.env.MPESA_CALLBACK_URL?.trim().replace(/['"\n\r]+/g, '') || "https://example.com/callback";

    // 6. Initiate STK Push
    const stkResponse = await fetch(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          BusinessShortCode: shortcode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: amount,
          PartyA: formattedPhone,
          PartyB: shortcode,
          PhoneNumber: formattedPhone,
          CallBackURL: callbackUrl,
          AccountReference: `KejaPoa-${payment.id.slice(0, 8)}`,
          TransactionDesc: `KejaPoa Subscription Payment`,
        }),
      }
    );

    const stkData = await stkResponse.json();
    console.log("📞 STK Push Response:", stkData);

    if (stkData.ResponseCode === "0") {
      return NextResponse.json({
        success: true,
        message: "STK Push sent successfully. Please check your phone.",
        checkoutRequestID: stkData.CheckoutRequestID,
        paymentId: payment.id,
      });
    } else {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });
      return NextResponse.json(
        { error: stkData.errorMessage || "Failed to initiate STK Push" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("💥 M-Pesa STK Push Fatal Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error during payment processing" },
      { status: 500 }
    );
  }
}