// components/profile/profile-form.tsx — Personal Profile Management Form for KorraStore.
// Renders the user identity section with avatar initials, role badge, member since info,
// and editable full name field with optimistic feedback and toast dispatch.
// Used in: app/profile/page.tsx.

"use client";

import * as React from "react";
import { Button } from "@/lib/../components/ui/button";
import { Badge } from "@/lib/../components/ui/badge";
import { cn } from "@/lib/utils";

// ----------------------------------------------------------------------------
// Props Interface
// ----------------------------------------------------------------------------

export interface ProfileFormProps {
  userId: string;
  initialFullName: string;
  email: string;
  role: string;
  createdAt: string;
}

// ----------------------------------------------------------------------------
// ProfileForm Component Definition
// ----------------------------------------------------------------------------
export const ProfileForm: React.FC<ProfileFormProps> = ({
  initialFullName,
  role,
  createdAt,
}) => {
  const [fullName, setFullName] = React.useState(initialFullName);
  const [isSaving, setIsSaving] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState<{ text: string; type: "success" | "error" } | null>(null);

  // Compute initials from name or fallback
  const initials = React.useMemo(() => {
    if (!fullName || fullName.trim().length === 0) return "KS";
    const parts = fullName.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  }, [fullName]);

  // Format member since date
  const memberSince = React.useMemo(() => {
    try {
      const date = new Date(createdAt);
      return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    } catch {
      return "August 2026";
    }
  }, [createdAt]);

  // Auto-dismiss toast notification after 4 seconds
  React.useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // --------------------------------------------------------------------------
  // Form Submission Handler — updates profile via /api/profile
  // --------------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setToastMessage({ text: "Full name cannot be empty.", type: "error" });
      return;
    }

    setIsSaving(true);
    setToastMessage(null);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setToastMessage({ text: "Profile details updated successfully!", type: "success" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred";
      setToastMessage({ text: msg, type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E4DCC8] p-6 sm:p-8 space-y-6 shadow-2xs">
      {/* Toast Alert Feedback */}
      {toastMessage && (
        <div
          className={cn(
            "p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all duration-200 animate-in fade-in-50",
            toastMessage.type === "success"
              ? "bg-[#21483A]/10 text-[#21483A] border border-[#21483A]/20"
              : "bg-[#B3432E]/10 text-[#B3432E] border border-[#B3432E]/20"
          )}
        >
          <span>{toastMessage.text}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-xs font-bold px-1 hover:opacity-75 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Block: Section Title & Description */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold font-serif-display text-[#4A3828]">
          Personal Profile
        </h2>
        <p className="text-xs sm:text-sm text-[#A88958] mt-0.5">
          Manage your public identity, display name, and membership status.
        </p>
      </div>

      <div className="h-px bg-[#E4DCC8]" />

      {/* User Identity Header Card with Avatar & Verification Badges */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#F7F4EA] p-4 sm:p-5 rounded-xl border border-[#E4DCC8]">
        {/* Large Initials Avatar */}
        <div className="w-16 h-16 rounded-full bg-[#21483A] text-white flex items-center justify-center text-xl font-bold font-mono-plex shadow-xs shrink-0 ring-2 ring-[#D8B56A]">
          {initials}
        </div>

        {/* User Identity Meta */}
        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-base text-[#4A3828]">
              {fullName.trim() || "KorraStore Member"}
            </span>
            <Badge variant="stored" className="text-[11px] py-0 px-2">
              Verified Buyer
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#A88958] font-medium">
            <span>
              Role: <strong className="text-[#4A3828] capitalize">{role}</strong>
            </span>
            <span>•</span>
            <span>
              Member Since: <strong className="text-[#4A3828]">{memberSince}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="fullName" className="block text-xs font-bold text-[#4A3828] uppercase tracking-wide">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            required
            className="w-full max-w-md px-4 py-2.5 text-sm rounded-xl bg-[#F7F4EA] border border-[#E4DCC8] text-[#4A3828] placeholder:text-[#A88958] focus:outline-none focus:ring-2 focus:ring-[#D8B56A] focus:bg-white transition-all shadow-2xs font-medium"
          />
          <p className="text-[11px] text-[#A88958]">
            This name will be displayed on your digital warehouse receipts and internal transaction logs.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSaving}
            className="px-6 shadow-xs font-semibold"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
