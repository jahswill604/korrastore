// lib/supabase/queries/profile.ts — Profile Query Helpers for KorraStore.
// Provides server-side utility functions for reading and updating user profiles,
// checking onboarding status, user roles, and enforcing deletion eligibility invariants.
// All user-facing queries run under the authenticated client scoped via RLS (auth.uid() = id).
// Used in: app/profile/page.tsx, app/api/profile/route.ts, app/api/account/delete/route.ts, middleware.ts.

import { createClient } from "@/lib/supabase/server";

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

// Profile entity representation matching database schema
export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: "user" | "admin";
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

// Account deletion eligibility check response
export interface AccountDeletionCheckResult {
  eligible: boolean;
  reasons: string[];
}

// ----------------------------------------------------------------------------
// getProfile — reads full profile row for the authenticated user.
// Returns the profile object or null if not found.
// Used in: app/profile/page.tsx, app/api/profile/route.ts.
// ----------------------------------------------------------------------------
export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, phone, role, onboarding_completed, created_at, updated_at")
    .eq("id", userId)
    .single();

  if (error || !data) {
    console.error("[getProfile] Error fetching profile for user:", userId, error?.message);
    return null;
  }

  return data as Profile;
}

// ----------------------------------------------------------------------------
// updateProfile — updates profile display fields (e.g. full_name).
// Scoped to the user's ID via RLS withCheck constraint.
// Used in: app/api/profile/route.ts.
// ----------------------------------------------------------------------------
export async function updateProfile(
  userId: string,
  updates: { full_name?: string }
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: updates.full_name,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    console.error("[updateProfile] Error updating profile for user:", userId, error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ----------------------------------------------------------------------------
// checkAccountDeletionEligibility — server-side guard verifying financial invariants.
// Ensures user has zero active holdings, in-flight orders, active listings,
// or pending buybacks before account termination is permitted.
// Used in: app/api/account/delete/route.ts.
// ----------------------------------------------------------------------------
export async function checkAccountDeletionEligibility(
  userId: string
): Promise<AccountDeletionCheckResult> {
  const supabase = await createClient();
  const reasons: string[] = [];

  // 1. Check for non-zero storage holdings
  const { data: holdings, error: holdingsErr } = await supabase
    .from("holdings")
    .select("id, quantity")
    .eq("user_id", userId)
    .gt("quantity", 0);

  if (holdingsErr) {
    console.error("[checkAccountDeletionEligibility] Holdings check failed:", holdingsErr.message);
  } else if (holdings && holdings.length > 0) {
    const totalQty = holdings.reduce((sum, h) => sum + Number(h.quantity || 0), 0);
    reasons.push(`You currently have ${totalQty.toLocaleString()} kg of active commodity stock stored in Korra silos.`);
  }

  // 2. Check for in-progress orders
  const { data: activeOrders, error: ordersErr } = await supabase
    .from("orders")
    .select("id, status")
    .eq("user_id", userId)
    .in("status", ["pending_payment", "sourcing", "in_transit"]);

  if (ordersErr) {
    console.error("[checkAccountDeletionEligibility] Orders check failed:", ordersErr.message);
  } else if (activeOrders && activeOrders.length > 0) {
    reasons.push(`You have ${activeOrders.length} order(s) currently being processed or in transit.`);
  }

  // 3. Check for active resale listings
  const { data: activeListings, error: listingsErr } = await supabase
    .from("resale_listings")
    .select("id, status")
    .eq("seller_id", userId)
    .eq("status", "active");

  if (listingsErr) {
    console.error("[checkAccountDeletionEligibility] Resale check failed:", listingsErr.message);
  } else if (activeListings && activeListings.length > 0) {
    reasons.push(`You have ${activeListings.length} active resale listing(s) on the P2P marketplace.`);
  }

  // 4. Check for pending or approved buyback requests
  const { data: activeBuybacks, error: buybacksErr } = await supabase
    .from("buyback_requests")
    .select("id, status")
    .eq("user_id", userId)
    .in("status", ["pending", "approved"]);

  if (buybacksErr) {
    console.error("[checkAccountDeletionEligibility] Buyback check failed:", buybacksErr.message);
  } else if (activeBuybacks && activeBuybacks.length > 0) {
    reasons.push(`You have ${activeBuybacks.length} pending or approved buyback request(s) awaiting payout.`);
  }

  return {
    eligible: reasons.length === 0,
    reasons,
  };
}

// ----------------------------------------------------------------------------
// markOnboardingComplete — sets onboarding_completed = true for the given user.
// Called from the server action when the user finishes or skips onboarding.
// ----------------------------------------------------------------------------
export async function markOnboardingComplete(userId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ onboarding_completed: true })
    .eq("id", userId);

  if (error) {
    console.error("[markOnboardingComplete] Failed to update profile:", error.message);
  }
}

// ----------------------------------------------------------------------------
// getOnboardingStatus — reads the onboarding_completed flag for the given user.
// ----------------------------------------------------------------------------
export async function getOnboardingStatus(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", userId)
    .single();

  if (error || !data) {
    console.warn("[getOnboardingStatus] Could not read onboarding flag:", error?.message);
    return true;
  }

  return data.onboarding_completed ?? false;
}

// ----------------------------------------------------------------------------
// getUserRole — reads the role field for the given user.
// ----------------------------------------------------------------------------
export async function getUserRole(userId: string): Promise<string> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return "user";
  }

  return data.role ?? "user";
}
