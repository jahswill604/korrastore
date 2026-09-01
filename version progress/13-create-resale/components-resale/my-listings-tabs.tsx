// components/resale/my-listings-tabs.tsx — Status Filter Tabs for /resale/my-listings.
// Client Component ("use client") — drives URL query parameter state (?status=active|sold|expired|cancelled|all).
// Provides responsive horizontal scrolling on mobile and styled pill buttons on desktop.
// Used in: app/resale/my-listings/page.tsx

'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// ----------------------------------------------------------------------------
// Tab Definitions
// ----------------------------------------------------------------------------

interface TabItem {
  id: string;
  label: string;
}

const TABS: TabItem[] = [
  { id: 'all', label: 'All Listings' },
  { id: 'active', label: 'Active' },
  { id: 'sold', label: 'Sold' },
  { id: 'expired', label: 'Expired' },
  { id: 'cancelled', label: 'Cancelled' },
];

// ----------------------------------------------------------------------------
// MyListingsTabs Component
// ----------------------------------------------------------------------------

export function MyListingsTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get('status') || 'all';

  const handleSelectTab = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tabId === 'all') {
      params.delete('status');
    } else {
      params.set('status', tabId);
    }
    router.push(`/resale/my-listings?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {TABS.map((tab) => {
        const isSelected = currentStatus === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleSelectTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold font-sans-inter whitespace-nowrap transition-all duration-150 ${
              isSelected
                ? 'bg-[#D8B56A] text-[#4A3828] font-bold shadow-sm border border-[#A88958]'
                : 'bg-white text-[#4A3828]/70 hover:bg-[#EFE9D9] hover:text-[#4A3828] border border-[#E4DCC8]'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
