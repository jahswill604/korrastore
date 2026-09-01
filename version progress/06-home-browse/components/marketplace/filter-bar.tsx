// components/marketplace/filter-bar.tsx — Filter & Sort Control Bar for KorraStore Marketplace.
// Interactive Client Component managing commodity type filter chips and price/stock sorting.
// State is stored strictly in URL search parameters (?type=...&sort=...) for shareability and server rendering.
// Used in: app/home/page.tsx (Marketplace Browse Page).

"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

// Filter category configuration structure.
interface CategoryChip {
  label: string;
  value: string;
  icon: string;
}

// Available commodity type filter options.
const CATEGORIES: CategoryChip[] = [
  { label: "All Commodities", value: "all", icon: "🌾" },
  { label: "Rice", value: "rice", icon: "🍚" },
  { label: "Garlic", value: "garlic", icon: "🧄" },
  { label: "Beans", value: "beans", icon: "🫘" },
  { label: "Melon (Egusi)", value: "melon", icon: "🍈" },
];

// Available sorting options.
const SORT_OPTIONS = [
  { label: "Default Sorting", value: "" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Stock: High to Low", value: "stock_desc" },
];

// ----------------------------------------------------------------------------
// FilterBar — renders horizontal scrollable category chips and sort selector.
// Updates URL query params without triggering full page refresh.
// ----------------------------------------------------------------------------
export function FilterBar({ className }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentType = searchParams.get("type") || "all";
  const currentSort = searchParams.get("sort") || "";

  // Helper function to update URL search parameters safely
  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/home?${params.toString()}`, { scroll: false });
  };

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--paper)] shadow-soil-sm",
        className
      )}
    >
      {/* Category Filter Chips — horizontally scrollable on mobile */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = currentType === cat.value;
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => updateParams("type", cat.value)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--harvest-wheat)]",
                isActive
                  ? "bg-[var(--harvest-wheat)] text-[var(--soil)] shadow-soil-sm font-bold scale-[1.02]"
                  : "bg-white text-[var(--soil-secondary)] hover:text-[var(--soil)] hover:bg-[#F3EFE0] border border-[var(--border)]"
              )}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sort Dropdown Selector */}
      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
        <label htmlFor="marketplace-sort" className="text-xs font-medium text-[var(--soil-secondary)]">
          Sort by:
        </label>
        <select
          id="marketplace-sort"
          value={currentSort}
          onChange={(e) => updateParams("sort", e.target.value)}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-[var(--border)] text-[var(--soil)] shadow-soil-sm focus:outline-none focus:ring-2 focus:ring-[var(--harvest-wheat)] cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
