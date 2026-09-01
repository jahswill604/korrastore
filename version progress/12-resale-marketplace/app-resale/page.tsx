// app/resale/page.tsx — Resale Marketplace browsing page for KorraStore.
// Server Component — queries active peer-to-peer resale listings from the sanitized public view (resale_listings_public).
// Enforces strict seller privacy, URL-driven filtering/sorting, and responsive grid layouts.
// Route: /resale

import React from 'react';
import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/app-shell';
import { getActiveResaleListings } from '@/lib/supabase/queries/resale';
import { ResaleHeader } from '@/components/resale/resale-header';
import { ResaleFilterBar } from '@/components/resale/resale-filter-bar';
import { ResaleGrid } from '@/components/resale/resale-grid';
import { ResaleEmptyState } from '@/components/resale/resale-empty-state';

// ----------------------------------------------------------------------------
// SEO Metadata
// ----------------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'Resale Marketplace | KorraStore',
  description:
    'Browse and purchase verified warehouse-stored agricultural commodities directly from other KorraStore buyers. Transparent pricing, grade certified, and instant title transfer.',
};

// ----------------------------------------------------------------------------
// Page Props Interface
// ----------------------------------------------------------------------------

interface ResalePageProps {
  searchParams: Promise<{
    type?: string;
    sort?: 'price_asc' | 'price_desc' | 'recent';
  }>;
}

// ----------------------------------------------------------------------------
// Resale Marketplace Server Page
// ----------------------------------------------------------------------------

export default async function ResalePage({ searchParams }: ResalePageProps) {
  // Await URL search parameters for Next.js App Router dynamic filtering
  const resolvedParams = await searchParams;
  const type = resolvedParams.type || 'all';
  const sort = resolvedParams.sort || 'price_asc';

  // Fetch active sanitized listings from Supabase view
  const listings = await getActiveResaleListings({ type, sort });

  return (
    <AppShell>
      <main className="min-h-screen bg-[#F7F4EA] px-4 sm:px-6 lg:px-8 py-6 sm:py-10 max-w-7xl mx-auto">
        {/* Top Header Banner */}
        <ResaleHeader />

        {/* Filter and Sort Navigation Bar */}
        <ResaleFilterBar />

        {/* Listings Grid or Empty State */}
        {listings.length > 0 ? (
          <ResaleGrid listings={listings} />
        ) : (
          <ResaleEmptyState />
        )}
      </main>
    </AppShell>
  );
}
