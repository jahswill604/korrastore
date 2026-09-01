// components/orders/order-status-filter.tsx — Client Tab Filter for KorraStore Order History.
// Synchronizes active status filter with URL search parameters (?status=...).
// Used in: app/orders/page.tsx (Order History List view).

"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

// Filter definition interface
export interface FilterTab {
  id: string;
  label: string;
  paramValue: string;
}

// Available order status tabs matching spec and design mockup
export const ORDER_FILTER_TABS: FilterTab[] = [
  { id: "all", label: "All Orders", paramValue: "all" },
  { id: "in_progress", label: "In Progress", paramValue: "in_progress" },
  { id: "stored", label: "Stored in Silo", paramValue: "stored" },
  { id: "delivered", label: "Delivered", paramValue: "delivered" },
  { id: "cancelled", label: "Cancelled", paramValue: "cancelled" },
];

export interface OrderStatusFilterProps {
  className?: string;
  activeStatus?: string;
}

export const OrderStatusFilter: React.FC<OrderStatusFilterProps> = ({
  className,
  activeStatus: externalActiveStatus,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();

  // Determine current active filter from props or URL search params (defaults to 'all')
  const currentStatus = externalActiveStatus || searchParams.get("status") || "all";

  // Handles clicking a filter tab and pushing updated URL query params
  const handleSelectTab = (paramValue: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (paramValue === "all") {
        params.delete("status");
      } else {
        params.set("status", paramValue);
      }
      // Reset to page 1 on filter change
      params.delete("page");

      const queryString = params.toString();
      const targetUrl = queryString ? `/orders?${queryString}` : "/orders";
      router.push(targetUrl);
    });
  };

  return (
    <div
      className={cn(
        "w-full overflow-x-auto no-scrollbar py-2",
        isPending && "opacity-75 transition-opacity",
        className
      )}
    >
      <div className="flex items-center space-x-2 min-w-max pb-1">
        {ORDER_FILTER_TABS.map((tab) => {
          const isSelected =
            currentStatus === tab.paramValue ||
            (tab.paramValue === "all" && !currentStatus);

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleSelectTab(tab.paramValue)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer select-none",
                isSelected
                  ? "bg-[#D8B56A] text-[#4A3828] font-bold shadow-soil-xs"
                  : "bg-[#FFFFFF] border border-[#E4DCC8] text-[#4A3828]/70 hover:text-[#4A3828] hover:border-[#A88958]/50"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
