// app/resale/my-listings/page.tsx — Seller Resale Listings Management Dashboard.
// Server Component — authenticates buyer session, queries user's own resale listings,
// and renders status tabs (Active, Sold, Expired, Cancelled) and management cards.
// Route: /resale/my-listings

import * as React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/layout/app-shell';
import { getMyResaleListings } from '@/lib/supabase/queries/resale';
import { MyListingsHeader } from '@/components/resale/my-listings-header';
import { MyListingsTabs } from '@/components/resale/my-listings-tabs';
import { MyListingRow } from '@/components/resale/my-listing-row';

// ----------------------------------------------------------------------------
// SEO Metadata
// ----------------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'My Resale Listings | KorraStore',
  description:
    'Manage your commodity resale listings on KorraStore. Update asking prices, track active sales, or cancel listings to restore warehouse storage.',
};

// ----------------------------------------------------------------------------
// Page Props Interface
// ----------------------------------------------------------------------------

interface MyListingsPageProps {
  searchParams: Promise<{
    status?: string;
  }>;
}

// ----------------------------------------------------------------------------
// My Listings Server Component
// ----------------------------------------------------------------------------

export default async function MyListingsPage({ searchParams }: MyListingsPageProps) {
  // 1. Authenticate user
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/resale/my-listings');
  }

  // 2. Resolve URL parameters
  const resolvedParams = await searchParams;
  const statusFilter = resolvedParams.status || 'all';

  // 3. Fetch seller listings
  const listings = await getMyResaleListings(user.id, statusFilter);

  return (
    <AppShell>
      <main className="min-h-screen bg-[#F7F4EA] px-4 sm:px-6 lg:px-8 py-6 sm:py-10 max-w-5xl mx-auto">
        {/* Header Banner */}
        <MyListingsHeader />

        {/* Status Filter Tabs */}
        <div className="mb-6">
          <MyListingsTabs />
        </div>

        {/* Listings List or Empty State */}
        {listings.length > 0 ? (
          <div className="space-y-3.5">
            {listings.map((listing) => (
              <MyListingRow key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#E4DCC8] rounded-3xl p-8 sm:p-12 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[#F5EFE0] border border-[#E4DCC8] flex items-center justify-center text-3xl mx-auto mb-4">
              📦
            </div>
            <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-[#4A3828]">
              No {statusFilter !== 'all' ? statusFilter : ''} listings found
            </h3>
            <p className="text-xs sm:text-sm font-sans-inter text-[#4A3828]/70 max-w-md mx-auto mt-2 leading-relaxed">
              {statusFilter === 'all'
                ? "You haven't listed any stored commodities for resale yet. You can list commodities directly from your storage portfolio."
                : `You currently have no listings marked as "${statusFilter}".`}
            </p>
            <div className="pt-6 flex justify-center gap-3">
              <Link
                href="/my-storage"
                className="px-5 py-2.5 rounded-xl bg-[#D8B56A] text-[#4A3828] text-xs font-bold font-sans-inter hover:bg-[#c4a259] active:scale-95 shadow-sm transition-all"
              >
                Go to My Storage
              </Link>
              {statusFilter !== 'all' && (
                <Link
                  href="/resale/my-listings"
                  className="px-5 py-2.5 rounded-xl bg-white border border-[#E4DCC8] text-[#4A3828] text-xs font-bold font-sans-inter hover:bg-[#EFE9D9] active:scale-95 transition-all"
                >
                  View All Listings
                </Link>
              )}
            </div>
          </div>
        )}
      </main>
    </AppShell>
  );
}
