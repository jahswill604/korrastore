// components/resale/resale-header.tsx — Header banner for the KorraStore Resale Marketplace.
// Renders the page title in DM Serif Display, explanatory subtitle, trust badges, and link to My Listings.
// Used in: app/resale/page.tsx

import * as React from 'react';
import Link from 'next/link';

// ----------------------------------------------------------------------------
// ResaleHeader Component
// ----------------------------------------------------------------------------

export function ResaleHeader() {
  return (
    <div className="w-full space-y-4 mb-6 sm:mb-8">
      {/* Title, Subtitle & Action Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-2xl sm:text-4xl lg:text-5xl font-bold text-[#4A3828] tracking-tight">
            Resale Marketplace
          </h1>
          <p className="font-sans-inter text-sm sm:text-base text-[#4A3828]/75 mt-1.5 sm:mt-2 max-w-3xl leading-relaxed">
            Trade verified warehouse-stored commodities directly with other verified KorraStore buyers.
            Transparent, certified, and fully insured.
          </p>
        </div>

        {/* Action Link to Seller Dashboard */}
        <div className="flex items-center gap-2">
          <Link
            href="/resale/my-listings"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold font-sans-inter bg-white border border-[#E4DCC8] text-[#4A3828] hover:bg-[#EFE9D9] hover:border-[#D8B56A] shadow-sm active:scale-95 transition-all"
          >
            <span>📋 My Listings</span>
          </Link>
        </div>
      </div>

      {/* Trust & Guarantee Highlights */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EFE9D9] border border-[#E4DCC8] text-xs font-medium text-[#4A3828]">
          <span className="text-[#21483A]">🌾</span>
          <span>100% Silo Verified</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EFE9D9] border border-[#E4DCC8] text-xs font-medium text-[#4A3828]">
          <span className="text-[#303B63]">🔒</span>
          <span>Escrow Protected</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EFE9D9] border border-[#E4DCC8] text-xs font-medium text-[#4A3828]">
          <span className="text-[#D8B56A]">📜</span>
          <span>Instant Title Transfer</span>
        </div>
      </div>
    </div>
  );
}
