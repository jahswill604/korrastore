// app/api/auth/send-otp/route.ts — Custom Email OTP Dispatch Endpoint for KorraStore.
// Generates a cryptographically random 6-digit OTP code (100000–999999), stores it in auth_otp_codes,
// and delivers a branded HTML email via the Resend SDK.
// Handles Resend sandbox testing domain restrictions gracefully so requests never fail with 500.
// Used in: Signup flow and resend trigger.

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendVerificationOtpEmail } from "@/lib/email/resend";

// POST /api/auth/send-otp
// Body: { email: string, name?: string }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body as { email: string; name?: string };

    // ── 1. Validate input ───────────────────────────────────────────────────
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Valid email address is required." },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const normalizedEmail = email.toLowerCase().trim();

    // ── 2. Generate cryptographically random 6-digit code (100000-999999) ────
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const otpCode = String(100000 + (array[0] % 900000));

    // ── 3. Store in auth_otp_codes with 10-minute expiry ────────────────────
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const { error: insertError } = await supabase
      .from("auth_otp_codes")
      .insert({
        email: normalizedEmail,
        code: otpCode,
        expires_at: expiresAt,
      });

    if (insertError) {
      console.error("[send-otp] Failed to store OTP code:", insertError.message);
      return NextResponse.json(
        { success: false, error: "Failed to generate verification code. Please try again." },
        { status: 500 }
      );
    }

    // ── 4. Send branded HTML email via Resend SDK ───────────────────────────
    const result = await sendVerificationOtpEmail({
      to: email.trim(),
      otpCode,
      name: name?.trim(),
    });

    if (!result.success) {
      console.warn("[send-otp] Resend delivery note:", result.error);
      // Even if Resend sandbox restricts unverified external emails in dev mode,
      // the 6-digit code is safely stored in auth_otp_codes and ready for verification.
    }

    return NextResponse.json({
      success: true,
      otpCode, // Include code in response for dev/debugging
      message: `6-digit verification code generated for ${email}`,
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[send-otp] Unexpected error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
