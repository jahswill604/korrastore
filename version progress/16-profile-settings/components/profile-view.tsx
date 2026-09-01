// version progress/16-profile-settings/components/profile-view.tsx
"use client";

import * as React from "react";
import { SectionNav, ProfileSection } from "@/components/profile/section-nav";
import { ProfileForm } from "@/components/profile/profile-form";
import { ContactForm } from "@/components/profile/contact-form";
import { AccountSection } from "@/components/profile/account-section";
import type { Profile } from "@/lib/supabase/queries/profile";

export interface ProfileViewProps {
  userId: string;
  email: string;
  phone: string | null;
  profile: Profile | null;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userId,
  email,
  phone,
  profile,
}) => {
  const [activeSection, setActiveSection] = React.useState<ProfileSection>("profile");

  const fullName = profile?.full_name || "";
  const role = profile?.role || "user";
  const createdAt = profile?.created_at || new Date().toISOString();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold font-serif-display text-[#4A3828] tracking-tight">
          Profile & Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#A88958] font-sans-inter">
          Manage your personal details, contact preferences, and account security.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        <div className="md:col-span-4 lg:col-span-3">
          <SectionNav
            activeSection={activeSection}
            onSelectSection={setActiveSection}
          />
        </div>

        <div className="md:col-span-8 lg:col-span-9">
          {activeSection === "profile" && (
            <ProfileForm
              userId={userId}
              initialFullName={fullName}
              email={email}
              role={role}
              createdAt={createdAt}
            />
          )}

          {activeSection === "contact" && (
            <ContactForm
              initialEmail={email}
              initialPhone={phone || profile?.phone || null}
            />
          )}

          {(activeSection === "security" || activeSection === "account") && (
            <AccountSection
              userId={userId}
              email={email}
            />
          )}
        </div>
      </div>
    </div>
  );
};
