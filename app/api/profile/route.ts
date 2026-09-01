// app/api/profile/route.ts — Profile Update API Route for KorraStore.
// Handles POST requests to update user personal profile metadata (such as full_name).
// Scoped strictly to the authenticated user's session via supabase.auth.getUser().
// Used in: components/profile/profile-form.tsx.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "@/lib/supabase/queries/profile";

// ----------------------------------------------------------------------------
// POST Handler — Updates the authenticated user's profile
// ----------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Authenticate session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized — please log in to update your profile" },
        { status: 401 }
      );
    }

    // 2. Parse request payload
    const body = await request.json();
    const { full_name } = body;

    if (typeof full_name !== "string" || full_name.trim().length === 0) {
      return NextResponse.json(
        { error: "Full name is required and cannot be empty" },
        { status: 400 }
      );
    }

    // 3. Update profile record
    const result = await updateProfile(user.id, {
      full_name: full_name.trim(),
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      profile: {
        id: user.id,
        full_name: full_name.trim(),
      },
    });
  } catch (error) {
    console.error("[Profile API] Exception updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while updating profile" },
      { status: 500 }
    );
  }
}
