// src/app/api/auth/landlord/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

// ✅ Lazy initialization - only creates Resend client when needed
let resendClient: any = null;

function getResendClient() {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not set. Please add it to your environment variables.");
    }
    // Dynamic import to avoid build-time errors
    const { Resend } = require("resend");
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

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
      return NextResponse.json({ 
        success: true, 
        message: "If an account exists with that email, you will receive reset instructions" 
      });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await prisma.landlord.update({
      where: { id: landlord.id },
      data: { resetToken, resetTokenExpiry },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get("origin") || "https://kejapoa.vercel.app";
    const resetUrl = `${baseUrl}/landlord/reset-password/${resetToken}`;

    // ✅ Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      console.warn("⚠️ RESEND_API_KEY not set. Reset link:", resetUrl);
      return NextResponse.json({ 
        success: true, 
        message: "Reset link generated (email service not configured)",
        resetLink: resetUrl // Show in UI for testing
      });
    }

    // ✅ Send email
    try {
      const resend = getResendClient();
      
      const { error } = await resend.emails.send({
        from: "KejaPoa <onboarding@resend.dev>",
        to: landlord.email,
        subject: "Reset Your KejaPoa Password",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f1f5f9;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <table width="100%" style="max-width: 560px; background-color: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                      <tr>
                        <td style="background: linear-gradient(135deg, #059669 0%, #0d9488 100%); padding: 32px; text-align: center;">
                          <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 800;">KejaPoa</h1>
                          <p style="margin: 8px 0 0 0; color: #d1fae5; font-size: 14px;">Password Reset Request</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 40px 32px;">
                          <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 22px; font-weight: 700;">
                            Hi ${landlord.fullName},
                          </h2>
                          <p style="margin: 0 0 16px 0; color: #475569; font-size: 16px; line-height: 1.6;">
                            We received a request to reset your password. Click the button below to create a new one.
                          </p>
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                            <tr>
                              <td align="center">
                                <a href="${resetUrl}" 
                                   style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #0d9488 100%); color: white; text-decoration: none; padding: 14px 40px; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);">
                                  Reset My Password
                                </a>
                              </td>
                            </tr>
                          </table>
                          <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px;">
                            Or copy this link:
                          </p>
                          <p style="margin: 0 0 24px 0; padding: 12px; background-color: #f1f5f9; border-radius: 8px; word-break: break-all;">
                            <a href="${resetUrl}" style="color: #059669; font-size: 13px;">${resetUrl}</a>
                          </p>
                          <div style="padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px;">
                            <p style="margin: 0; color: #78350f; font-size: 14px;">
                              ⏰ <strong>This link expires in 1 hour.</strong><br>
                              If you didn't request this, ignore this email.
                            </p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="background-color: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
                          <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                            © ${new Date().getFullYear()} KejaPoa. Verified Rentals Across Kenya.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
      });

      if (error) {
        console.error("❌ Resend error:", error);
        return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
      }

      console.log(`✅ Password reset email sent to ${landlord.email}`);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Fallback: return the link in the response for testing
      return NextResponse.json({ 
        success: true, 
        message: "Reset link generated (email service error)",
        resetLink: resetUrl
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Reset link sent successfully" 
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: error.message || "Failed to process request" }, { status: 500 });
  }
}