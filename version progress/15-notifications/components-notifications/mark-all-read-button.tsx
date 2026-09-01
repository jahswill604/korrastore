// components/notifications/mark-all-read-button.tsx — Mark All As Read Interactive Action.
// Provides both full desktop text button and compact mobile button to clear all unread notifications.
// Used in: app/notifications/page.tsx

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// ----------------------------------------------------------------------------
// Props Interface
// ----------------------------------------------------------------------------
export interface MarkAllReadButtonProps {
  unreadCount: number;
  className?: string;
  variant?: "full" | "icon-only" | "responsive";
}

// ----------------------------------------------------------------------------
// Component Definition
// ----------------------------------------------------------------------------
export const MarkAllReadButton: React.FC<MarkAllReadButtonProps> = ({
  unreadCount,
  className,
  variant = "responsive",
}) => {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);

  const handleMarkAll = async () => {
    if (unreadCount === 0 || isPending) return;

    try {
      setIsPending(true);
      const res = await fetch("/api/notifications/read-all", {
        method: "POST",
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    } finally {
      setIsPending(false);
    }
  };

  const isDisabled = unreadCount === 0 || isPending;

  return (
    <button
      type="button"
      onClick={handleMarkAll}
      disabled={isDisabled}
      aria-label="Mark all notifications as read"
      className={cn(
        "inline-flex items-center gap-1.5 font-sans-inter text-xs sm:text-sm font-semibold transition-all rounded-xl",
        variant === "icon-only"
          ? "p-2 border border-[#E4DCC8] bg-white text-[#4A3828] hover:bg-[#EDE8DA] disabled:opacity-40"
          : variant === "responsive"
          ? "px-3 py-1.5 sm:px-3.5 sm:py-2 border border-[#E4DCC8]/80 bg-white/80 hover:bg-white text-[#A88958] hover:text-[#4A3828] shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
          : "text-[#A88958] hover:text-[#4A3828] hover:underline disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed",
        className
      )}
    >
      {/* Checkmark Double Tick Icon */}
      <svg className="w-4 h-4 shrink-0 text-[#D8B56A]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l2 2 4-4" />
      </svg>

      <span className={cn(variant === "icon-only" && "sr-only")}>
        {isPending ? "Marking..." : "Mark all as read"}
      </span>
    </button>
  );
};
