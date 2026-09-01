// components/resale/my-listings-header.tsx — Header banner for /resale/my-listings page.
// Server Component — renders title in DM Serif Display, explanatory description,
// and navigation buttons back to the public resale market and /my-storage portfolio.
// Used in: app/resale/my-listings/page.tsx

import * as React from 'react';
import Link from 'next/link';

// ----------------------------------------------------------------------------
// MyListingsHeader Component
// ----------------------------------------------------------------------------

export function MyListingsHeader() {
  return (
    <div className="w-full space-y-4 mb-6 sm:mb-8">
      {/* Breadcrumb / Back Link */}
      <div className="flex items-center gap-2 text-xs font-sans-inter text-[#4A3828]/60">
        <Link href="/resale" className="hover:text-[#4A3828] hover:underline flex items-center gap-1">
          <span>←</span> Resale Marketplace
        </Link>
        <span>/</span>
        <span className="text-[#4A3828] font-medium">My Listings</span>
      </div>

      {/* Main Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-2xl sm:text-4xl font-bold text-[#4A3828] tracking-tight">
            My Resale Listings
          </h1>
          <p className="font-sans-inter text-xs sm:text-sm text-[#4A3828]/75 mt-1 max-w-2xl leading-relaxed">
            Manage your active and completed commodity resale offers. Edit asking prices or cancel listings to restore reserved storage anytime.
          </p>
        </div>

        {/* Action button linking to My Storage to create more listings */}
        <div className="flex items-center gap-2">
          <Link
            href="/my-storage"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold font-sans-inter bg-[#D8B56A] text-[#4A3828] hover:bg-[#c4a259] shadow-sm active:scale-95 transition-all"
          >
            <span>+ List from Storage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
