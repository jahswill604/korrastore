// components/notifications/notification-filters.tsx — URL-Driven Notification Category Filters.
// Renders responsive horizontal filter chips for sorting notifications by type or read status.
// Used in: app/notifications/page.tsx

"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// ----------------------------------------------------------------------------
// Filter Options Definition
// ----------------------------------------------------------------------------
const FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "orders", label: "Orders" },
  { key: "resale", label: "Resale" },
  { key: "buyback", label: "Buyback" },
  { key: "pricing", label: "Pricing" },
];

export interface NotificationFiltersProps {
  unreadCount?: number;
  className?: string;
}

// ----------------------------------------------------------------------------
// Component Definition: NotificationFilters
// ----------------------------------------------------------------------------
export const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  unreadCount = 0,
  className,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get("filter") || "all";

  const handleSelectFilter = (filterKey: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (filterKey === "all") {
      params.delete("filter");
    } else {
      params.set("filter", filterKey);
    }
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0",
        className
      )}
    >
      {FILTERS.map((f) => {
        const isActive = currentFilter === f.key;
        return (
          <button
            key={f.key}
            type="button"
            onClick={() => handleSelectFilter(f.key)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all select-none flex items-center gap-1.5 shrink-0 shadow-2xs",
              isActive
                ? "bg-[#D8B56A] text-[#4A3828] font-bold shadow-xs"
                : "bg-white/80 border border-[#E4DCC8] text-[#4A3828]/70 hover:bg-white hover:text-[#4A3828]"
            )}
          >
            <span>{f.label}</span>
            {f.key === "unread" && unreadCount > 0 && (
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold",
                  isActive
                    ? "bg-[#4A3828] text-[#F7F4EA]"
                    : "bg-[#D8B56A] text-[#4A3828]"
                )}
              >
                {unreadCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
