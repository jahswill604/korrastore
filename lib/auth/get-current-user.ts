// lib/auth/get-current-user.ts — Server-Side Auth Session & Role Evaluator for KorraStore.
// Safely verifies user session using getUser() and queries profiles table for role determination.
// Used in: Server Components, Route Handlers, Server Actions.
// Security Rule: Never relies on raw unverified getSession(); always verifies against Supabase Auth servers.

import { createClient } from "@/lib/supabase/server";
import { UserRole } from "@/lib/types";

// Interface for CurrentUser response
export interface CurrentUser {
  // Supabase Auth User ID
  id: string;
  // User email address
  email: string | null;
  // User phone number
  phone: string | null;
  // User role in KorraStore ('user' | 'admin')
  role: UserRole;
  // User full name
  fullName: string | null;
  // Boolean indicating whether user is an administrator
  isAdmin: boolean;
}

// Server helper returning the verified logged-in user or null if unauthenticated.
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const supabase = await createClient();

    // Re-verify session against Supabase Auth servers (prevents forged JWT attacks)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    // Query profiles table for role and profile metadata
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role, full_name, phone")
      .eq("id", user.id)
      .single();

    const role: UserRole = (profile?.role as UserRole) || "user";

    return {
      id: user.id,
      email: user.email ?? null,
      phone: profile?.phone ?? user.phone ?? null,
      role,
      fullName: profile?.full_name ?? user.user_metadata?.full_name ?? null,
      isAdmin: role === "admin",
    };
  } catch (error) {
    console.error("[getCurrentUser] Error verifying session:", error);
    return null;
  }
}
