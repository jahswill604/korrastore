// components/resale/resale-empty-state.tsx — Empty State display for Resale Marketplace.
// Rendered when no peer-to-peer resale listings match the user's active filter criteria.
// Used in: app/resale/page.tsx

'use client';

import * as React from 'react';
import Link from 'next/link';

// ----------------------------------------------------------------------------
// ResaleEmptyState Component
// ----------------------------------------------------------------------------

export function ResaleEmptyState() {
  return (
    <div className="w-full bg-[#FAF7EE] border border-dashed border-[#E4DCC8] rounded-3xl p-8 sm:p-14 flex flex-col items-center justify-center text-center my-6">
      {/* Visual Icon */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#EDE8DA] flex items-center justify-center text-3xl sm:text-4xl mb-4 shadow-soil-sm">
        🌾
      </div>

      {/* Title & Subtext */}
      <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-[#4A3828] mb-2">
        No Resale Listings Found
      </h3>
      <p className="font-sans-inter text-sm text-[#4A3828]/70 max-w-md mb-6 leading-relaxed">
        There are currently no active resale listings matching your selected category filters.
        Try exploring other commodities or reset your search.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/resale"
          className="px-6 py-2.5 rounded-2xl bg-[#D8B56A] hover:bg-[#CBA457] text-[#4A3828] font-sans-inter text-sm font-bold shadow-soil-sm transition-all"
        >
          Reset All Filters
        </Link>
        <Link
          href="/marketplace"
          className="px-6 py-2.5 rounded-2xl bg-[#EDE8DA] hover:bg-[#E4DCC8] text-[#4A3828] font-sans-inter text-sm font-bold transition-all"
        >
          Browse Primary Store
        </Link>
      </div>
    </div>
  );
}
