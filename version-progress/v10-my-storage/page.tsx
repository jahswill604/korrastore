// app/my-storage/page.tsx — My Storage Portfolio Page for KorraStore buyers.
// Server Component — auth-guarded, fetches holdings data server-side, never client-side.
// Route: /my-storage (protected buyer route; session required via supabase.auth.getUser()).
// Renders: AppShell with active Storage nav rail, PortfolioSummaryStrip, 3-col holding card grid (desktop),
//          single-column stack (mobile), and EmptyState when no holdings exist.
// Critical: current_value is computed by the DB view, never stored or re-derived here.
//           Each holding renders as its own card — no merging across purchases.

import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getBuyerHoldings, getPortfolioSummary } from '@/lib/supabase/queries/holdings';
import { AppShell } from '@/components/layout/app-shell';
import { PortfolioSummaryStrip } from '@/components/my-storage/portfolio-summary';
import { HoldingCard } from '@/components/my-storage/holding-card';

// ----------------------------------------------------------------------------
// SEO Metadata
// ----------------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'My Storage | KorraStore',
  description:
    'View your stored commodity holdings, live portfolio valuations, unrealized gains, and manage resale, buyback, or delivery requests.',
};

// ----------------------------------------------------------------------------
// EmptyState — inline sub-component for zero holdings case
// Guides the buyer back to /home with a clear CTA
// ----------------------------------------------------------------------------

function StorageEmptyState() {
  return (
    /* Full-page centred empty state — Paper background, DM Serif Display heading */
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      {/* Warehouse / silo icon in a warm circular container */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: '#F5EFE0' }}
      >
        <svg
          className="w-10 h-10 text-[#A88958]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      </div>

      {/* Heading in DM Serif Display per design system */}
      <h2 className="font-serif-display text-2xl text-[#4A3828] mb-3">
        Nothing in storage yet
      </h2>

      {/* Descriptive message */}
      <p className="font-sans-inter text-sm text-[#4A3828]/60 max-w-xs mb-8">
        Make your first commodity purchase to start building your agricultural portfolio.
        Your holdings will appear here.
      </p>

      {/* CTA back to marketplace */}
      <a
        href="/home"
        id="browse-marketplace-btn"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full
                   bg-[#D8B56A] text-[#4A3828] font-semibold font-sans-inter text-sm
                   hover:bg-[#C9A85D] active:scale-95 transition-all duration-150 shadow-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        </svg>
        Browse Marketplace
      </a>
    </div>
  );
}

// ----------------------------------------------------------------------------
// MyStoragePage — Server Component
// ----------------------------------------------------------------------------

export default async function MyStoragePage() {
  // --------------------------------------------------------------------------
  // Auth Guard — verify session server-side using getUser() (never getSession())
  // Redirects unauthenticated visitors to /login with the intended path as redirect param
  // --------------------------------------------------------------------------
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login?redirect=/my-storage');
  }

  // --------------------------------------------------------------------------
  // Data Fetching — parallel server-side queries for performance
  // Both use holdings_with_current_value view for consistent live valuation
  // --------------------------------------------------------------------------
  const [summary, holdings] = await Promise.all([
    getPortfolioSummary(user.id),
    getBuyerHoldings(user.id),
  ]);

  const hasHoldings = holdings.length > 0;

  // --------------------------------------------------------------------------
  // Page Render
  // --------------------------------------------------------------------------
  return (
    <AppShell>
      {/* Page background — Paper (#F7F4EA) */}
      <div className="min-h-screen bg-[#F7F4EA]">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-6 md:py-8">

          {/* ======================== PAGE HEADER ======================== */}
          {/* Desktop: Inline heading row. Mobile: Compact page title. */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-start justify-between">
              <div>
                {/* Page title in DM Serif Display */}
                <h1 className="font-serif-display text-3xl md:text-4xl text-[#4A3828]">
                  My Storage
                </h1>
                <p className="mt-1 font-sans-inter text-sm text-[#4A3828]/60">
                  Your stored commodity portfolio with live market valuations
                </p>
              </div>

              {/* Refresh hint — subtle on desktop only */}
              <div className="hidden md:flex items-center gap-1.5 mt-2 text-xs font-sans-inter text-[#4A3828]/40">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Prices update on each page load
              </div>
            </div>
          </div>

          {/* ======================== PORTFOLIO SUMMARY STRIP ======================== */}
          {/* Rendered regardless of whether holdings exist — shows 0 state gracefully */}
          {hasHoldings && (
            <div className="mb-6 md:mb-8">
              <PortfolioSummaryStrip summary={summary} />
            </div>
          )}

          {/* ======================== HOLDINGS GRID / EMPTY STATE ======================== */}
          {hasHoldings ? (
            <>
              {/* Holdings section header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-sans-inter text-sm font-semibold text-[#4A3828]/60 uppercase tracking-wider">
                  Your Holdings ({holdings.length})
                </h2>
              </div>

              {/* Holdings Grid:
                  - Desktop (≥1024px): 3-column grid
                  - Tablet (≥768px): 2-column grid
                  - Mobile (<768px): single column stack */}
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5"
                aria-label="Commodity holdings portfolio"
              >
                {holdings.map((holding) => (
                  /* Each holding is its own card — holdings from different purchases
                   * NEVER merged, even if same commodity/grade (per AGENTS.md Feature 10) */
                  <HoldingCard key={holding.id} holding={holding} />
                ))}
              </div>
            </>
          ) : (
            /* Empty State — no holdings yet, prompt buyer to browse marketplace */
            <StorageEmptyState />
          )}

        </div>
      </div>
    </AppShell>
  );
}
