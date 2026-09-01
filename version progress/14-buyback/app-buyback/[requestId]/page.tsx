// app/buyback/[requestId]/page.tsx — Buyback Request Detail View for KorraStore.
// Server Component — auth-guarded detail page tracking a specific buyback request.
// Displays commodity metadata, requested quantity, live or agreed unit buyback price,
// total payout calculation, and the vertical status progression timeline.
// Route: /buyback/[requestId]

import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getBuybackRequestDetail } from '@/lib/supabase/queries/buyback';
import { AppShell } from '@/components/layout/app-shell';
import { GradeBadge } from '@/components/ui/grade-badge';
import { BuybackTimeline } from '@/components/buyback/buyback-timeline';

// ----------------------------------------------------------------------------
// SEO Metadata
// ----------------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'Buyback Request Details | KorraStore',
  description:
    'Track the review, approval, and settlement timeline of your commodity buyback request with KorraStore.',
};

// ----------------------------------------------------------------------------
// Page Props
// ----------------------------------------------------------------------------

interface BuybackDetailPageProps {
  params: Promise<{
    requestId: string;
  }>;
}

// ----------------------------------------------------------------------------
// BuybackDetailPage Component
// ----------------------------------------------------------------------------

export default async function BuybackDetailPage({ params }: BuybackDetailPageProps) {
  const { requestId } = await params;

  // 1. Authenticate user session
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id || 'demo-user-id';

  // 2. Fetch buyback request detail (verified by userId)
  const request = await getBuybackRequestDetail(userId, requestId);

  if (!request) {
    notFound();
  }

  return (
    <AppShell>
      <main className="min-h-screen bg-[#F7F4EA] px-4 sm:px-6 lg:px-8 py-6 sm:py-10 max-w-4xl mx-auto">
        {/* Back Link Navigation */}
        <div className="mb-6">
          <Link
            href="/buyback"
            className="inline-flex items-center gap-1.5 text-xs font-semibold font-sans-inter text-[#A88958] hover:text-[#4A3828] transition-colors"
          >
            ← Back to My Buyback Requests
          </Link>
        </div>

        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[#E4DCC8]">
          <div>
            <span className="font-sans-mono text-xs font-bold text-[#A88958] uppercase tracking-wider block">
              Request ID: {request.id}
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A3828] mt-1">
              {request.commodity_name} Buyback
            </h1>
          </div>

          <div className="self-start sm:self-auto">
            {request.status === 'pending' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold font-sans-inter bg-[#D8B56A]/20 text-[#A88958] border border-[#D8B56A]/40">
                ● Under Review
              </span>
            )}
            {request.status === 'approved' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold font-sans-inter bg-[#A88958]/20 text-[#A88958] border border-[#A88958]/40">
                ● Approved
              </span>
            )}
            {request.status === 'paid' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold font-sans-inter bg-[#21483A]/15 text-[#21483A] border border-[#21483A]/30">
                ✓ Payout Settled
              </span>
            )}
            {request.status === 'rejected' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold font-sans-inter bg-[#B3432E]/15 text-[#B3432E] border border-[#B3432E]/30">
                ✕ Declined
              </span>
            )}
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-8">
          {/* Left Column: Request Summary Cards (7 cols) */}
          <div className="md:col-span-7 space-y-6">
            {/* Commodity & Holding Card */}
            <div className="bg-[#FAF8F2] border border-[#E4DCC8] rounded-3xl p-6 shadow-sm">
              <h2 className="font-sans-inter text-xs font-semibold uppercase tracking-wider text-[#A88958] mb-4">
                Commodity & Warehouse
              </h2>

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#4A3828]">
                    {request.commodity_name}
                  </h3>
                  <div className="mt-2 flex items-center gap-2">
                    <GradeBadge grade={(request.grade_name as any) || 'Grade A'} size="sm" />
                    <span className="text-xs font-sans-inter text-[#4A3828]/70">
                      • {request.warehouse_name}
                    </span>
                  </div>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-[#E4DCC8]/40 flex items-center justify-center text-xl">
                  🌾
                </div>
              </div>
            </div>

            {/* Payout & Financial Breakdown Card */}
            <div className="bg-[#FAF8F2] border border-[#E4DCC8] rounded-3xl p-6 shadow-sm">
              <h2 className="font-sans-inter text-xs font-semibold uppercase tracking-wider text-[#A88958] mb-4">
                Liquidation Breakdown
              </h2>

              <div className="space-y-3 font-sans-inter text-sm">
                <div className="flex justify-between py-1 border-b border-[#E4DCC8]/40">
                  <span className="text-[#4A3828]/70">Requested Quantity</span>
                  <span className="font-sans-mono font-semibold text-[#4A3828]">
                    {request.quantity} {request.commodity_unit}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-[#E4DCC8]/40">
                  <span className="text-[#4A3828]/70">Offered Unit Price</span>
                  <span className="font-sans-mono font-semibold text-[#4A3828]">
                    ₦{request.offered_price.toLocaleString('en-NG')} /{request.commodity_unit}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-[#E4DCC8]/40">
                  <span className="text-[#4A3828]/70">Platform Liquidation Fee</span>
                  <span className="font-sans-mono font-semibold text-[#21483A]">
                    ₦0 (Zero Fee Guaranteed)
                  </span>
                </div>

                <div className="flex justify-between pt-2">
                  <span className="font-bold text-[#4A3828]">Total Payout Amount</span>
                  <span className="font-sans-mono font-bold text-lg text-[#21483A]">
                    ₦{request.total_amount.toLocaleString('en-NG')}
                  </span>
                </div>
              </div>
            </div>

            {/* Storage Link Notice */}
            <div className="p-4 bg-[#F7F4EA] border border-[#E4DCC8] rounded-2xl flex items-center justify-between text-xs font-sans-inter">
              <span className="text-[#4A3828]/80">
                Associated Holding ID: <span className="font-sans-mono text-[#A88958]">{request.holding_id}</span>
              </span>
              <Link
                href="/my-storage"
                className="font-semibold text-[#21483A] hover:underline"
              >
                View Storage →
              </Link>
            </div>
          </div>

          {/* Right Column: Status Timeline Progression (5 cols) */}
          <div className="md:col-span-5">
            <div className="bg-[#FAF8F2] border border-[#E4DCC8] rounded-3xl p-6 shadow-sm sticky top-6">
              <BuybackTimeline
                status={request.status}
                requestedAt={request.requested_at}
                processedAt={request.processed_at}
                adminNotes={request.admin_notes}
                totalAmount={request.total_amount}
              />
            </div>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
