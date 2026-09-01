// version progress/16-profile-settings/app/profile/page.tsx
import * as React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/queries/profile";
import { AppShell } from "@/components/layout/app-shell";
import { ProfileView } from "@/components/profile/profile-view";

export const metadata = {
  title: "Profile & Account Settings | KorraStore",
  description: "Manage your personal information, contact credentials, and account settings on KorraStore.",
};

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login?redirect=/profile");
  }

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
