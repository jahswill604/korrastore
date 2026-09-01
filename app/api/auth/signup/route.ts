// app/api/auth/signup/route.ts — Custom Unified Signup & Single OTP Dispatch Endpoint for KorraStore.
// Uses cookie-bound Supabase client (anon key) so it never fails with "User not allowed".
// Creates the user account, generates a 6-digit OTP code in auth_otp_codes, and sends
// the branded HTML verification email via Resend SDK.
// Used in: components/auth/signup-form.tsx.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendVerificationOtpEmail } from "@/lib/email/resend";

// POST /api/auth/signup
// Body: { email: string, password: string, fullName: string, phone: string }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName, phone } = body as {
      email: string;
      password: string;
      fullName: string;
      phone: string;
    };

    // ── 1. Validate inputs ──────────────────────────────────────────────────
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Valid email address is required." },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const supabase = await createClient();
    const adminSupabase = createServiceClient();

    // ── 2. Pre-check if user with email already exists ──────────────────────
    // Query existing profiles / auth users to prevent sending unexpected OTPs to registered emails.
    try {
      const { data: usersData } = await adminSupabase.auth.admin.listUsers();
      const existingUser = usersData?.users?.find(
        (u) => u.email?.toLowerCase() === normalizedEmail
      );

      if (existingUser) {
        return NextResponse.json(
          {
            success: false,
            error: "An account with this email address already exists. Please log in instead or use a different email.",
          },
          { status: 400 }
        );
      }
    } catch (checkErr) {
      console.warn("[signup] Existing user pre-check note:", checkErr);
    }

    // ── 3. Create user account via Supabase Auth Client ─────────────────────
    // Uses standard anon key client (never requires admin service role key).
    const { data: signUpData, error: authError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
        },
      },
    });

    if (authError) {
      const isAlreadyRegistered =
        authError.message.toLowerCase().includes("already registered") ||
        authError.message.toLowerCase().includes("already exists") ||
        authError.message.toLowerCase().includes("user_already_exists");
      const isRateLimit = authError.message.toLowerCase().includes("rate limit");

      return NextResponse.json(
        {
          success: false,
          error: isAlreadyRegistered
            ? "An account with this email address already exists. Please log in instead or use a different email."
            : isRateLimit
            ? "Too many requests. Please wait 2–5 minutes before trying again."
            : authError.message,
        },
        { status: 400 }
      );
    }

    // Check if Supabase returned an empty identities array (user already exists)
    if (signUpData?.user && signUpData.user.identities && signUpData.user.identities.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "An account with this email address already exists. Please log in instead or use a different email.",
        },
        { status: 400 }
      );
    }

    // ── 3. Ensure profile row exists in profiles table ──────────────────────
    try {
      const { data: usersData } = await adminSupabase.auth.admin.listUsers();
      const matchedUser = usersData?.users?.find(
        (u) => u.email?.toLowerCase() === normalizedEmail
      );

      if (matchedUser) {
        await adminSupabase.from("profiles").upsert(
          {
            id: matchedUser.id,
            full_name: fullName.trim(),
            phone: phone.trim(),
            role: "user",
          },
          { onConflict: "id" }
        );
      }
    } catch (profileErr) {
      console.warn("[signup] Profile upsert note:", profileErr);
    }

    // ── 4. Generate 6-Digit OTP Code ────────────────────────────────────────
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const otpCode = String(100000 + (array[0] % 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Store in auth_otp_codes table
    const { error: insertError } = await adminSupabase
      .from("auth_otp_codes")
      .insert({
        email: normalizedEmail,
        code: otpCode,
        expires_at: expiresAt,
      });

    if (insertError) {
      console.error("[signup] Failed to store OTP code:", insertError.message);
      return NextResponse.json(
        { success: false, error: "Failed to generate verification code. Please try again." },
        { status: 500 }
      );
    }

    // ── 5. Send OTP Email via Resend SDK ────────────────────────────────────
    const result = await sendVerificationOtpEmail({
      to: normalizedEmail,
      otpCode,
      name: fullName.trim(),
    });

    if (!result.success) {
      console.error("[signup] Resend delivery error:", result.error);
      return NextResponse.json(
        { success: false, error: "Failed to send verification email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Account created. 6-digit verification code sent to ${email}`,
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[signup] Unexpected error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
