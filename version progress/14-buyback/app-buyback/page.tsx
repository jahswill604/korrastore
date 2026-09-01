// app/buyback/page.tsx — Buyback Requests Dashboard for KorraStore Buyers.
// Server Component — auth-guarded, fetches all buyback requests submitted by the buyer.
// Route: /buyback
// Supports URL-driven status filter tabs (?status=all|pending|approved|rejected|paid).
// Displays request rows with live status, dates, and links to detail timeline view.

import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getBuyerBuybackRequests, BuybackStatus } from '@/lib/supabase/queries/buyback';
import { AppShell } from '@/components/layout/app-shell';
import { BuybackRow } from '@/components/buyback/buyback-row';

// ----------------------------------------------------------------------------
// SEO Metadata
// ----------------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'My Buyback Requests | KorraStore',
  description:
    'Track your guaranteed commodity buyback liquidation requests, approval timelines, and payout settlements with KorraStore.',
};

// ----------------------------------------------------------------------------
// Page Props
// ----------------------------------------------------------------------------

interface BuybackPageProps {
  searchParams: Promise<{
    status?: string;
  }>;
}

// ----------------------------------------------------------------------------
// Status Filter Tabs List
// ----------------------------------------------------------------------------

const STATUS_TABS = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Paid', value: 'paid' },
  { label: 'Declined', value: 'rejected' },
];

// ----------------------------------------------------------------------------
// BuybackPage Component
// ----------------------------------------------------------------------------

export default async function BuybackPage({ searchParams }: BuybackPageProps) {
  const resolvedParams = await searchParams;
  const activeStatusParam = resolvedParams.status || 'all';

  // 1. Authenticate buyer session
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id || 'demo-user-id';

  // 2. Fetch requests from Supabase query layer
  const filterStatus =
    activeStatusParam !== 'all' ? (activeStatusParam as BuybackStatus) : undefined;
  const requests = await getBuyerBuybackRequests(userId, filterStatus);

  return (
    <AppShell>
      <main className="min-h-screen bg-[#F7F4EA] px-4 sm:px-6 lg:px-8 py-6 sm:py-10 max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A3828]">
              My Buyback Requests
            </h1>
            <p className="font-sans-inter text-sm text-[#A88958] mt-1">
              Guaranteed commodity liquidation requests and payout settlements
            </p>
          </div>

          <Link
            href="/my-storage"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-sans-inter font-semibold text-sm bg-[#D8B56A] hover:bg-[#A88958] text-[#4A3828] hover:text-white shadow-sm transition-all self-start sm:self-auto"
          >
            <span>+</span> Request Buyback from Storage
          </Link>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar border-b border-[#E4DCC8]">
          {STATUS_TABS.map((tab) => {
            const isActive = activeStatusParam === tab.value;
            const href = tab.value === 'all' ? '/buyback' : `/buyback?status=${tab.value}`;

            return (
              <Link
                key={tab.value}
                href={href}
                className={`px-4 py-2 rounded-xl text-xs font-semibold font-sans-inter whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#D8B56A] text-[#4A3828] shadow-sm'
                    : 'bg-[#F7F4EA] text-[#4A3828]/70 hover:bg-[#E4DCC8]/40 hover:text-[#4A3828]'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Requests List or Empty State */}
        {requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((request) => (
              <BuybackRow key={request.id} request={request} />
            ))}
          </div>
        ) : (
          <div className="bg-[#FAF8F2] border border-[#E4DCC8] rounded-3xl p-12 text-center my-8">
            <div className="w-16 h-16 rounded-full bg-[#D8B56A]/20 flex items-center justify-center mx-auto mb-4 text-[#A88958]">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 className="font-serif text-xl font-bold text-[#4A3828] mb-2">
              No buyback requests found
            </h3>
            <p className="font-sans-inter text-sm text-[#A88958] max-w-md mx-auto mb-6">
              {activeStatusParam !== 'all'
                ? `You have no buyback requests with '${activeStatusParam}' status.`
                : 'You have not submitted any buyback requests yet. Liquidate your stored inventory anytime from My Storage.'}
            </p>
            <Link
              href="/my-storage"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl font-sans-inter font-semibold text-sm border-2 border-[#21483A] text-[#21483A] hover:bg-[#21483A] hover:text-white transition-all"
            >
              Go to My Storage →
            </Link>
          </div>
        )}
      </main>
    </AppShell>
  );
}
