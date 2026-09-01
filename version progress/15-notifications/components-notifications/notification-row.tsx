// components/notifications/notification-row.tsx — Interactive Notification Card for KorraStore.
// Renders an individual notification row with category-specific icons, unread indicator accent,
// relative timestamp, and click-to-read + deep navigation handler.
// Used in: app/notifications/page.tsx

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { InAppNotification } from "@/lib/supabase/queries/notifications";
import { cn } from "@/lib/utils";

// ----------------------------------------------------------------------------
// Props Interface
// ----------------------------------------------------------------------------
export interface NotificationRowProps {
  notification: InAppNotification;
  className?: string;
}

// ----------------------------------------------------------------------------
// Relative Time Formatter Helper
// ----------------------------------------------------------------------------
function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 172800) return "Yesterday";
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dateString;
  }
}

// ----------------------------------------------------------------------------
// Category Icon Renderer
// ----------------------------------------------------------------------------
function getNotificationIcon(type: string) {
  switch (type) {
    case "order_status":
    case "order":
      return (
        <div className="w-10 h-10 rounded-xl bg-[#21483A] text-white flex items-center justify-center shrink-0 shadow-2xs">
          {/* Silo / Warehouse Box Icon */}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
      );
    case "resale_sold":
    case "resale":
    case "resale_listed":
      return (
        <div className="w-10 h-10 rounded-xl bg-[#D8B56A]/20 border border-[#D8B56A]/40 text-[#A88958] flex items-center justify-center shrink-0 shadow-2xs">
          {/* Tag / Currency Icon */}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </div>
      );
    case "buyback_status":
    case "buyback":
    case "buyback_approved":
      return (
        <div className="w-10 h-10 rounded-xl bg-[#303B63] text-white flex items-center justify-center shrink-0 shadow-2xs">
          {/* Indigo Checkmark / Approval Icon */}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    case "price_alert":
    case "pricing":
      return (
        <div className="w-10 h-10 rounded-xl bg-[#EAF3EE] text-[#21483A] border border-[#21483A]/20 flex items-center justify-center shrink-0 shadow-2xs">
          {/* Trend Up Icon */}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="w-10 h-10 rounded-xl bg-[#EDE8DA] text-[#4A3828] flex items-center justify-center shrink-0 shadow-2xs">
          {/* General Bell Icon */}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
      );
  }
}

// ----------------------------------------------------------------------------
// Component Definition: NotificationRow
// ----------------------------------------------------------------------------
export const NotificationRow: React.FC<NotificationRowProps> = ({
  notification,
  className,
}) => {
  const router = useRouter();
  const [isRead, setIsRead] = React.useState(notification.isRead);
  const [isProcessing, setIsProcessing] = React.useState(false);

  // Handle card click: mark read and route
  const handleClick = async () => {
    if (isProcessing) return;

    if (!isRead) {
      setIsRead(true);
      try {
        setIsProcessing(true);
        await fetch(`/api/notifications/${notification.id}/read`, {
          method: "POST",
        });
      } catch (err) {
        console.error("Failed to mark notification read:", err);
      } finally {
        setIsProcessing(false);
      }
    }

    if (notification.link) {
      router.push(notification.link);
    } else {
      router.refresh();
    }
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      className={cn(
        "group relative flex items-start gap-3.5 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-white border transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md hover:-translate-y-0.5 select-none",
        isRead
          ? "border-[#E4DCC8]/80 text-[#4A3828]/80 bg-white"
          : "border-[#D8B56A] border-l-[6px] border-l-[#D8B56A] bg-[#FAF8F2]",
        className
      )}
    >
      {/* Visual Unread Gold Dot Indicator */}
      {!isRead && (
        <span
          className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#D8B56A] ring-2 ring-white shadow-xs"
          title="Unread notification"
        />
      )}

      {/* Category Icon */}
      {getNotificationIcon(notification.type)}

      {/* Content Body */}
      <div className="flex-1 min-w-0 pr-2">
        {/* Header line: Title, Status Badge, Relative Timestamp */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <h3
              className={cn(
                "text-sm sm:text-base font-serif-display tracking-tight truncate",
                isRead ? "font-semibold text-[#4A3828]" : "font-bold text-[#4A3828]"
              )}
            >
              {notification.title}
            </h3>

            {/* Read/Unread Pill Badge */}
            <span
              className={cn(
                "text-[10px] sm:text-[11px] font-mono px-1.5 py-0.5 rounded-md uppercase font-medium tracking-wider",
                isRead
                  ? "bg-[#EDE8DA] text-[#6B5A48]"
                  : "bg-[#21483A] text-white"
              )}
            >
              {isRead ? "read" : "unread"}
            </span>
          </div>

          <span className="text-xs font-sans-inter text-[#6B5A48]/80 shrink-0 font-medium">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>

        {/* Message Description */}
        <p className="text-xs sm:text-sm text-[#6B5A48] font-sans-inter line-clamp-2 leading-relaxed">
          {notification.body}
        </p>
      </div>

      {/* Right Chevron Navigation Arrow */}
      <div className="self-center shrink-0 text-[#A88958] group-hover:text-[#4A3828] group-hover:translate-x-0.5 transition-all">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
};
