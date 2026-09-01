// components/marketplace/filter-bar.tsx — Filter & Sort Control Bar for KorraStore Marketplace.
// Interactive Client Component managing commodity type filter chips and price/stock sorting.
// State is stored strictly in URL search parameters (?type=...&sort=...) for shareability and server rendering.
// Design strictly matches desktop-ui.png and mobile-ui.png.
// Used in: app/page.tsx (Marketplace Browse Page).

"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

// Filter category configuration structure.
interface CategoryChip {
  label: string;
  value: string;
}

// Available commodity type filter options matching mockups.
const CATEGORIES: CategoryChip[] = [
  { label: "All", value: "all" },
  { label: "Rice", value: "rice" },
  { label: "Garlic", value: "garlic" },
  { label: "Beans", value: "beans" },
  { label: "Melon", value: "melon" },
];

// Available sorting options.
const SORT_OPTIONS = [
  { label: "Sort: Price ∨", value: "" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Stock: High to Low", value: "stock_desc" },
];

// ----------------------------------------------------------------------------
// FilterBar — renders horizontal category chips and sort selector matching UI mockup.
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
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 w-full",
        className
      )}
    >
      {/* Category Filter Chips — horizontally scrollable */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = currentType === cat.value;
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => updateParams("type", cat.value)}
              className={cn(
                "inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 focus:outline-none",
                isActive
                  ? "bg-[var(--harvest-wheat)] text-white shadow-xs font-bold"
                  : "bg-white text-[var(--soil)] hover:bg-[#F7F4EA] border border-[#E4DCC8]"
              )}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Sort Dropdown Selector */}
      <div className="shrink-0 hidden sm:block">
        <select
          id="marketplace-sort"
          value={currentSort}
          onChange={(e) => updateParams("sort", e.target.value)}
          aria-label="Sort commodities by price or availability"
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-white border border-[#E4DCC8] text-[var(--soil)] shadow-2xs focus:outline-none focus:ring-2 focus:ring-[var(--harvest-wheat)] cursor-pointer"
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
