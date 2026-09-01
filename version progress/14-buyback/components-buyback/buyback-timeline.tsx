// components/buyback/buyback-timeline.tsx — Vertical Status Timeline for Buyback Requests.
// Server Component — renders a step-by-step progress timeline matching design tokens.
// States: Submitted → Under Review / Decision (Approved/Rejected) → Paid (Payout Settled).
// Displays admin notes if rejected and final payout amount when settled.
// Used in: app/buyback/[requestId]/page.tsx, components/buyback/buyback-detail-view.tsx

import React from 'react';
import { BuybackStatus } from '@/lib/supabase/queries/buyback';

// ----------------------------------------------------------------------------
// Props Interface
// ----------------------------------------------------------------------------

interface BuybackTimelineProps {
  status: BuybackStatus;
  requestedAt: string;
  processedAt?: string | null;
  adminNotes?: string | null;
  totalAmount: number;
}

// ----------------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------------

export function BuybackTimeline({
  status,
  requestedAt,
  processedAt,
  adminNotes,
  totalAmount,
}: BuybackTimelineProps) {
  // Format dates for display
  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-NG', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const isSubmitted = true;
  const isApproved = status === 'approved' || status === 'paid';
  const isRejected = status === 'rejected';
  const isPaid = status === 'paid';
  const isPending = status === 'pending';

  return (
    <div className="py-2">
      <h3 className="font-sans-inter text-xs font-semibold uppercase tracking-wider text-[#A88958] mb-4">
        Status Timeline
      </h3>

      <div className="relative pl-6 space-y-6">
        {/* Continuous Vertical Line */}
        <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-[#E4DCC8]" />

        {/* ----------------- STEP 1: SUBMITTED ----------------- */}
        <div className="relative">
          {/* Timeline Dot */}
          <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-[#21483A] border-2 border-[#F7F4EA] flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div>
            <p className="font-sans-inter text-sm font-semibold text-[#4A3828]">
              Request Submitted
            </p>
            <p className="font-sans-inter text-xs text-[#A88958] mt-0.5">
              {formatDate(requestedAt)}
            </p>
            <p className="font-sans-inter text-xs text-[#4A3828]/70 mt-1">
              Holding quantity locked and placed in KorraStore review queue.
            </p>
          </div>
        </div>

        {/* ----------------- STEP 2: REVIEW / APPROVAL / REJECTION ----------------- */}
        <div className="relative">
          {/* Timeline Dot */}
          {isPending && (
            <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-[#D8B56A] border-2 border-[#F7F4EA] flex items-center justify-center animate-pulse">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          )}
          {isApproved && (
            <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-[#21483A] border-2 border-[#F7F4EA] flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          {isRejected && (
            <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-[#B3432E] border-2 border-[#F7F4EA] flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}

          <div>
            <p className={`font-sans-inter text-sm font-semibold ${
              isRejected ? 'text-[#B3432E]' : isApproved ? 'text-[#21483A]' : 'text-[#D8B56A]'
            }`}>
              {isPending && 'Under Review by KorraStore'}
              {isApproved && 'Request Approved'}
              {isRejected && 'Request Declined'}
            </p>

            {processedAt && (
              <p className="font-sans-inter text-xs text-[#A88958] mt-0.5">
                {formatDate(processedAt)}
              </p>
            )}

            {isPending && (
              <p className="font-sans-inter text-xs text-[#4A3828]/70 mt-1">
                KorraStore administrators are verifying inventory and storage certificates.
              </p>
            )}

            {isApproved && !isPaid && (
              <p className="font-sans-inter text-xs text-[#4A3828]/70 mt-1">
                Approved for buyback settlement. Payout will be credited to your wallet shortly.
              </p>
            )}

            {/* Admin Note Callout if Rejected */}
            {isRejected && adminNotes && (
              <div className="mt-2 p-3 bg-[#B3432E]/10 border border-[#B3432E]/20 rounded-xl">
                <p className="font-sans-inter text-xs font-semibold text-[#B3432E] mb-0.5">
                  Reason / Admin Note:
                </p>
                <p className="font-sans-inter text-xs text-[#4A3828]">
                  {adminNotes}
                </p>
                <p className="font-sans-inter text-[11px] text-[#A88958] mt-1">
                  Reserved quantity has been unlocked and restored to your storage balance.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ----------------- STEP 3: PAID / SETTLED ----------------- */}
        <div className="relative">
          {/* Timeline Dot */}
          {isPaid ? (
            <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-[#21483A] border-2 border-[#F7F4EA] flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-[#E4DCC8] border-2 border-[#F7F4EA]" />
          )}

          <div>
            <p className={`font-sans-inter text-sm font-semibold ${
              isPaid ? 'text-[#21483A]' : 'text-[#4A3828]/40'
            }`}>
              Payout Settled
            </p>

            {isPaid ? (
              <div className="mt-1">
                <p className="font-sans-mono text-sm font-bold text-[#21483A]">
                  ₦{totalAmount.toLocaleString('en-NG')}
                </p>
                <p className="font-sans-inter text-xs text-[#A88958] mt-0.5">
                  Credited to KorraStore account balance.
                </p>
              </div>
            ) : (
              <p className="font-sans-inter text-xs text-[#4A3828]/40 mt-0.5">
                Estimated payout: ₦{totalAmount.toLocaleString('en-NG')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
