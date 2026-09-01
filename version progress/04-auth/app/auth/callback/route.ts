// app/auth/callback/route.ts — Supabase Auth Exchange Callback Handler for KorraStore.
// Exchanges the auth code from email confirmation or OTP redirect for a valid session cookie.
// Feature 05 update: checks profiles.role and profiles.onboarding_completed to route
// new buyers to /onboarding (first-time) or /home (returning buyers) and admins to /admin.
// Used in: Supabase Auth redirect confirmation flows (magic link, email OTP).

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Handles GET requests with auth code
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/home";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Re-fetch the authenticated user after successful session exchange.
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Fetch both role and onboarding_completed in one query to minimize round-trips.
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, onboarding_completed")
          .eq("id", user.id)
          .single();

        // Admin users go directly to /admin dashboard.
        if (profile?.role === "admin") {
          return NextResponse.redirect(`${origin}/admin`);
        }

        // New buyers who haven't completed onboarding yet go to /onboarding first.
        if (profile?.onboarding_completed === false) {
          return NextResponse.redirect(`${origin}/onboarding`);
        }
      }

      // Safe redirect for regular returning users; block admin paths via next param.
      const destination = next.startsWith("/admin") ? "/home" : next;
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  // If code exchange failed, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
