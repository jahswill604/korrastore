// components/resale/resale-grid.tsx — Grid Container for Resale Marketplace Listings.
// Renders 3-column desktop and single-column mobile responsive grid with listing count indicator.
// Used in: app/resale/page.tsx

import * as React from 'react';
import { PublicResaleListing } from '@/lib/supabase/queries/resale';
import { ResaleCard } from './resale-card';

// ----------------------------------------------------------------------------
// Props Interface
// ----------------------------------------------------------------------------

export interface ResaleGridProps {
  listings: PublicResaleListing[];
}

// ----------------------------------------------------------------------------
// ResaleGrid Component
// ----------------------------------------------------------------------------

export function ResaleGrid({ listings }: ResaleGridProps) {
  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Header Count Strip */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs sm:text-sm font-semibold text-[#4A3828]/70">
          Showing <strong className="text-[#4A3828] font-bold">{listings.length}</strong> active listing{listings.length === 1 ? '' : 's'}
        </span>
        <span className="text-xs text-[#21483A] font-bold bg-[#21483A]/10 px-2.5 py-1 rounded-full border border-[#21483A]/20">
          ● Live Warehouse Stocks
        </span>
      </div>

      {/* Responsive Grid: 1 col mobile, 2 col tablet, 3 col desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {listings.map((listing) => (
          <ResaleCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
