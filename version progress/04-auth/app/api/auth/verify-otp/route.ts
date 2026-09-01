// app/api/auth/verify-otp/route.ts — Dual-Strategy Email OTP Verification Endpoint for KorraStore.
// Strategy 1: Validates 6-digit code against custom auth_otp_codes table (sent via Resend).
// Strategy 2: Fallback to Supabase Auth verifyOtp (if token was issued directly by Supabase Auth).
// On successful verification:
//  - Marks profiles.email_verified_at by matching user ID
//  - Confirms user in Supabase Auth if admin permissions available
//  - Returns appropriate redirect path (/onboarding, /home, /admin)
// Used in: components/auth/email-otp-form.tsx.

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server";

// POST /api/auth/verify-otp
// Body: { email: string, code: string }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = body as { email: string; code: string };

    // ── 1. Validate input (strictly 6-digit numeric OTP code) ───────────────
    if (!email || !code || !/^\d{6}$/.test(code.trim())) {
      return NextResponse.json(
        { success: false, error: "Valid email and 6-digit numeric code are required." },
        { status: 400 }
      );
    }

    const adminSupabase = createServiceClient();
    const serverSupabase = await createClient();
    const normalizedEmail = email.toLowerCase().trim();
    const submittedCode = code.trim();

    let isVerified = false;

    // ── 2. Strategy 1: Check active unused codes in auth_otp_codes ───────────
    const { data: activeCodes } = await adminSupabase
      .from("auth_otp_codes")
      .select("id, code, expires_at, used_at")
      .eq("email", normalizedEmail)
      .is("used_at", null)
      .order("created_at", { ascending: false });

    if (activeCodes && activeCodes.length > 0) {
      const now = new Date();
      const matchingCode = activeCodes.find(
        (row) => row.code === submittedCode && new Date(row.expires_at) >= now
      );

      if (matchingCode) {
        await adminSupabase
          .from("auth_otp_codes")
          .update({ used_at: now.toISOString() })
          .eq("id", matchingCode.id);

        isVerified = true;
      }
    }

    // ── 3. Strategy 2: Supabase Auth Fallback ───────────────────────────────
    if (!isVerified) {
      const OTP_TYPES = ["signup", "email", "magiclink"] as const;
      for (const otpType of OTP_TYPES) {
        const { data: authData } = await serverSupabase.auth.verifyOtp({
          email: normalizedEmail,
          token: submittedCode,
          type: otpType,
        });

        if (authData?.user) {
          isVerified = true;
          break;
        }
      }
    }

    // ── 4. Reject if neither strategy verified the code ─────────────────────
    if (!isVerified) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid or expired verification code. Please check your email and enter the latest 6-digit code received.",
        },
        { status: 400 }
      );
    }

    // ── 5. Resolve User ID safely ───────────────────────────────────────────
    let userId: string | null = null;
    try {
      const { data: { user: currentUser } } = await serverSupabase.auth.getUser();
      if (currentUser?.email?.toLowerCase() === normalizedEmail) {
        userId = currentUser.id;
      }
    } catch {}

    if (!userId) {
      try {
        const { data: usersData } = await adminSupabase.auth.admin.listUsers();
        const matchedUser = usersData?.users?.find(
          (u) => u.email?.toLowerCase() === normalizedEmail
        );
        if (matchedUser) {
          userId = matchedUser.id;
        }
      } catch {}
    }

    // ── 6. Post-Verification Profile & Auth Confirmation ───────────────────
    let role = "user";
    let onboardingCompleted = false;

    if (userId) {
      // Mark email_verified_at on profiles table by ID
      await adminSupabase
        .from("profiles")
        .update({ email_verified_at: new Date().toISOString() })
        .eq("id", userId);

      // Confirm user in Supabase Auth if admin permissions available
      try {
        await adminSupabase.auth.admin.updateUserById(userId, {
          email_confirm: true,
        });

        // Generate magiclink token and verify server-side to set session cookies
        const { data: linkData } = await adminSupabase.auth.admin.generateLink({
          type: "magiclink",
          email: normalizedEmail,
        });

        if (linkData?.properties?.hashed_token) {
          await serverSupabase.auth.verifyOtp({
            email: normalizedEmail,
            token_hash: linkData.properties.hashed_token,
            type: "magiclink",
          });
        }
      } catch (confirmErr) {
        console.warn("[verify-otp] Session establishment note:", confirmErr);
      }

      // Read profile role and onboarding status by ID
      const { data: profile } = await adminSupabase
        .from("profiles")
        .select("role, onboarding_completed")
        .eq("id", userId)
        .single();

      if (profile) {
        role = profile.role ?? "user";
        onboardingCompleted = profile.onboarding_completed ?? false;
      }
    }

    // ── 7. Determine Redirect Destination ───────────────────────────────────
    let redirect = "/onboarding";
    if (role === "admin") {
      redirect = "/admin";
    } else if (onboardingCompleted) {
      redirect = "/home";
    }

    return NextResponse.json({
      success: true,
      redirect,
      message: "Email verified successfully.",
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[verify-otp] Unexpected error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
