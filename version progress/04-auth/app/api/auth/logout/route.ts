// app/api/auth/logout/route.ts — Server-Side Logout Endpoint for KorraStore.
// Invalidates the current user session server-side and clears session cookies.
// Used in: Navigation rail logout triggers, session expiry redirects.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Handles POST requests to log out the user
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Call Supabase signOut to revoke refresh tokens and session
    await supabase.auth.signOut();

    // Redirect to login page
    const requestUrl = new URL(request.url);
    const loginUrl = new URL("/login", requestUrl.origin);

    return NextResponse.redirect(loginUrl, {
      status: 303, // See Other for POST-to-GET redirect
    });
  } catch (error) {
    console.error("[Logout API] Exception during sign out:", error);
    return NextResponse.json(
      { error: "Failed to sign out" },
      { status: 500 }
    );
  }
}
