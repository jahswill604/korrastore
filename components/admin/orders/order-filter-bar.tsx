// components/admin/orders/order-filter-bar.tsx — Admin Order Search and Status Filter Tabs.
// Provides responsive filter buttons and a search input driven by URL search params.
// Used in: app/admin/orders/page.tsx

"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { AdminOrderMetrics } from "@/lib/supabase/queries/admin/orders";
import { cn } from "@/lib/utils";

interface OrderFilterBarProps {
  metrics: AdminOrderMetrics;
  currentStatus: string;
  currentSearch: string;
}

export function OrderFilterBar({
  metrics,
  currentStatus,
  currentSearch,
}: OrderFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = React.useState(currentSearch || "");

  // Debounce search update to URL search params
  React.useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchTerm.trim()) {
        params.set("search", searchTerm.trim());
      } else {
        params.delete("search");
      }
      params.set("page", "1"); // Reset to page 1 on new search
      router.push(`${pathname}?${params.toString()}`);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm, pathname, router, searchParams]);

  // Handle status tab click
  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status === "all") {
      params.delete("status");
    } else {
      params.set("status", status);
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const tabs = [
    { key: "all", label: "All", count: metrics.totalOrders },
    { key: "pending_payment", label: "Pending", count: metrics.pendingCount },
    { key: "sourcing", label: "Sourcing", count: metrics.sourcingCount },
    { key: "in_transit", label: "In Transit", count: metrics.inTransitCount },
    { key: "stored", label: "Stored", count: metrics.storedCount },
    { key: "delivered", label: "Delivered", count: metrics.deliveredCount },
    {
      key: "exception",
      label: "Exceptions",
      count: metrics.exceptionCount,
      isException: true,
    },
    { key: "cancelled", label: "Cancelled", count: metrics.cancelledCount },
  ];

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Top Filter Row: Search Input & Export Action */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input with Icon */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A88958]">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Order ID (e.g. #KOR-250518-0012)..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#FCFAF5] border border-[#E4DCC8] rounded-xl text-sm text-[#4A3828] placeholder-[#A88958]/70 focus:outline-none focus:ring-2 focus:ring-[#D8B56A] focus:border-transparent transition-all shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-[#A88958] hover:text-[#4A3828]"
            >
              ✕
            </button>
          )}
        </div>

        {/* Export / Quick Info */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.print();
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#FCFAF5] hover:bg-[#F5EFE0] text-[#4A3828] border border-[#E4DCC8] rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <svg
              className="w-4 h-4 text-[#A88958]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span>Export Orders</span>
          </button>
        </div>
      </div>

      {/* Horizontal Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-[#E4DCC8]/60">
        {tabs.map((tab) => {
          const isActive =
            (tab.key === "all" && (!currentStatus || currentStatus === "all")) ||
            currentStatus === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => handleStatusChange(tab.key)}
              className={cn(
                "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150",
                isActive
                  ? tab.isException
                    ? "bg-[#B3432E] text-white shadow-sm"
                    : "bg-[#D8B56A] text-[#4A3828] font-semibold shadow-sm"
                  : "bg-[#FCFAF5] text-[#4A3828]/80 hover:bg-[#F5EFE0] hover:text-[#4A3828] border border-[#E4DCC8]/70"
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded-full text-[10px] font-mono leading-none",
                  isActive
                    ? tab.isException
                      ? "bg-white/20 text-white"
                      : "bg-[#4A3828]/15 text-[#4A3828]"
                    : tab.isException && tab.count > 0
                    ? "bg-[#B3432E]/10 text-[#B3432E] font-bold"
                    : "bg-[#E4DCC8]/60 text-[#4A3828]"
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
