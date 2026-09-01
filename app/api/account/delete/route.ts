// app/api/account/delete/route.ts — Guarded Account Deletion API Endpoint for KorraStore.
// Processes destructive user account deletion requests with strict financial invariant checks.
// Blocks deletion if the user has non-zero stored commodity holdings, open orders,
// active resale listings, or pending buyback requests.
// On success, appends an audit log entry, removes the auth.user record via service role,
// and invalidates the session cookies.
// Used in: components/profile/account-section.tsx (DeleteAccountModal).

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { checkAccountDeletionEligibility } from "@/lib/supabase/queries/profile";

// ----------------------------------------------------------------------------
// POST Handler — Guarded Account Deletion
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
        { error: "Unauthorized — session required to perform account deletion" },
        { status: 401 }
      );
    }

    // 2. Validate confirmation payload
    const body = await request.json().catch(() => ({}));
    const { confirmation } = body;

    if (confirmation !== "DELETE") {
      return NextResponse.json(
        { error: 'Invalid confirmation phrase. Please type "DELETE" to confirm.' },
        { status: 400 }
      );
    }

    // 3. Enforce Financial Ledger Invariants Server-Side
    const eligibility = await checkAccountDeletionEligibility(user.id);

    if (!eligibility.eligible) {
      return NextResponse.json(
        {
          error: "Account deletion is currently blocked due to active financial commitments.",
          reasons: eligibility.reasons,
        },
        { status: 400 }
      );
    }

    // 4. Log deletion audit event via Service Client
    const serviceClient = createServiceClient();

    await serviceClient.from("audit_logs").insert({
      user_id: user.id,
      action: "account_deleted",
      entity_type: "user",
      entity_id: user.id,
      old_data: { email: user.email, deleted_at: new Date().toISOString() },
    });

    // 5. Delete Supabase Auth User record (cascades to profiles table)
    const { error: deleteUserError } = await serviceClient.auth.admin.deleteUser(user.id);

    if (deleteUserError) {
      console.error("[Account Deletion] Error deleting user in Supabase Auth:", deleteUserError.message);
      return NextResponse.json(
        { error: "Failed to complete account deletion: " + deleteUserError.message },
        { status: 500 }
      );
    }

    // 6. Sign out current session cookies
    await supabase.auth.signOut();

    return NextResponse.json({
      success: true,
      message: "Your account has been permanently deleted.",
    });
  } catch (error) {
    console.error("[Account Deletion] Unexpected server exception:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during account deletion." },
      { status: 500 }
    );
  }
}
