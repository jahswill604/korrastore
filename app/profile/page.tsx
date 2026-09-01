// app/profile/page.tsx — Profile & Settings Route (Server Component) for KorraStore.
// Authenticates user session, queries profile metadata from Supabase,
// and renders the buyer ProfileView inside the shared AppShell layout.
// Used in: Direct navigation to /profile, header avatar click, navigation rail Profile link.

import * as React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/queries/profile";
import { AppShell } from "@/components/layout/app-shell";
import { ProfileView } from "@/components/profile/profile-view";

// Metadata for SEO and browser tab title
export const metadata = {
  title: "Profile & Account Settings | KorraStore",
  description: "Manage your personal information, contact credentials, and account settings on KorraStore.",
};

// ----------------------------------------------------------------------------
// ProfilePage Component Definition (Server Component)
// ----------------------------------------------------------------------------
export default async function ProfilePage() {
  // 1. Initialize cookie-bound Supabase server client
  const supabase = await createClient();

  // 2. Authenticate session with Supabase Auth servers
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Redirect to login if session is unauthenticated
  if (authError || !user) {
    redirect("/login?redirect=/profile");
  }

  // 3. Fetch user profile from public.profiles table
  const profile = await getProfile(user.id);

  const userName = profile?.full_name || user.user_metadata?.full_name || "KorraStore User";
  const email = user.email || "";
  const phone = profile?.phone || user.phone || null;

  return (
    <AppShell userName={userName}>
      <ProfileView
        userId={user.id}
        email={email}
        phone={phone}
        profile={profile}
      />
    </AppShell>
  );
}
