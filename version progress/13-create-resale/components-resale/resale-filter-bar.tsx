// components/resale/resale-filter-bar.tsx — Interactive Filter and Sort bar for Resale Marketplace.
// Manages commodity category selection and sort options via URL search parameters for SSR compatibility.
// Used in: app/resale/page.tsx

'use client';

import * as React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

// ----------------------------------------------------------------------------
// Filter & Sort Definitions
// ----------------------------------------------------------------------------

const CATEGORIES = [
  { label: 'All Commodities', value: 'all' },
  { label: 'Rice', value: 'rice' },
  { label: 'Garlic', value: 'garlic' },
  { label: 'Beans', value: 'beans' },
  { label: 'Melon', value: 'melon' },
];

const SORT_OPTIONS = [
  { label: 'Sort: Lowest Price', value: 'price_asc' },
  { label: 'Sort: Highest Price', value: 'price_desc' },
  { label: 'Sort: Newest Listed', value: 'recent' },
];

// ----------------------------------------------------------------------------
// ResaleFilterBar Component
// ----------------------------------------------------------------------------

export function ResaleFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Active filters from URL search params
  const activeType = searchParams.get('type') || 'all';
  const activeSort = searchParams.get('sort') || 'price_asc';

  // Update URL search parameters
  const updateQuery = (key: string, val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val === 'all' && key === 'type') {
      params.delete('type');
    } else {
      params.set(key, val);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
      {/* Category Pills — Horizontally Scrollable on Mobile */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none select-none">
        {CATEGORIES.map((cat) => {
          const isSelected = activeType === cat.value || (cat.value === 'all' && !searchParams.get('type'));
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => updateQuery('type', cat.value)}
              className={cn(
                'px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D8B56A]/50 shrink-0',
                isSelected
                  ? 'bg-[#D8B56A] text-[#4A3828] shadow-xs'
                  : 'bg-[#EDE8DA] text-[#4A3828]/70 hover:bg-[#E4DCC8] hover:text-[#4A3828]'
              )}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Sort Select Dropdown */}
      <div className="flex items-center justify-end shrink-0">
        <div className="relative inline-block w-full sm:w-auto">
          <select
            value={activeSort}
            onChange={(e) => updateQuery('sort', e.target.value)}
            className="w-full sm:w-auto appearance-none bg-[#EDE8DA] text-[#4A3828] font-sans-inter text-xs sm:text-sm font-semibold rounded-2xl px-4 py-2 pr-8 border border-[#E4DCC8] hover:border-[#D8B56A] focus:outline-none focus:ring-2 focus:ring-[#D8B56A] cursor-pointer transition-all"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[#4A3828]/60">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
