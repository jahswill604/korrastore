// components/buyback/buyback-row.tsx — Buyback Request Row / Card Component.
// Renders an individual buyback request in table/card form for the list view (/buyback).
// Displays commodity, grade badge, quantity, offered unit price, total estimated payout,
// status badge (with semantic token coloring), date, and a "View" link to the detail page.
// Used in: app/buyback/page.tsx

import React from 'react';
import Link from 'next/link';
import { BuybackRequestRow, BuybackStatus } from '@/lib/supabase/queries/buyback';
import { GradeBadge, CommodityGrade } from '@/components/ui/grade-badge';

// ----------------------------------------------------------------------------
// Props Interface
// ----------------------------------------------------------------------------

interface BuybackRowProps {
  request: BuybackRequestRow;
}

// ----------------------------------------------------------------------------
// Status Badge Helper
// ----------------------------------------------------------------------------

function renderStatusBadge(status: BuybackStatus) {
  switch (status) {
    case 'pending':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-sans-inter bg-[#D8B56A]/20 text-[#A88958] border border-[#D8B56A]/40">
          Pending
        </span>
      );
    case 'approved':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-sans-inter bg-[#A88958]/20 text-[#A88958] border border-[#A88958]/40">
          Approved
        </span>
      );
    case 'paid':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-sans-inter bg-[#21483A]/15 text-[#21483A] border border-[#21483A]/30">
          Paid
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-sans-inter bg-[#B3432E]/15 text-[#B3432E] border border-[#B3432E]/30">
          Declined
        </span>
      );
    default:
      return null;
  }
}

// ----------------------------------------------------------------------------
// BuybackRow Component
/**
 * Renders a responsive buyback request row with its details, status, payout, and actions.
 *
 * @param request - The buyback request to display.
 * @returns The rendered buyback request row.
 */

export function BuybackRow({ request }: BuybackRowProps) {
  const formattedDate = (() => {
    try {
      return new Date(request.requested_at).toLocaleDateString('en-NG', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return request.requested_at;
    }
  })();

  return (
    <div className="bg-[#F7F4EA] border border-[#E4DCC8] hover:border-[#D8B56A] rounded-2xl p-4 sm:p-5 transition-all duration-200 shadow-sm hover:shadow-md">
      {/* Desktop / Tablet Grid View (≥640px) */}
      <div className="hidden sm:grid sm:grid-cols-12 items-center gap-4">
        {/* Commodity & Grade */}
        <div className="col-span-3">
          <p className="font-serif font-bold text-sm text-[#4A3828] truncate">
            {request.commodity_name}
          </p>
          <div className="mt-1">
            <GradeBadge grade={(request.grade_name as CommodityGrade) || 'Grade A'} size="sm" />
          </div>
        </div>

        {/* Quantity */}
        <div className="col-span-2">
          <p className="text-[11px] font-sans-inter text-[#A88958] uppercase">Quantity</p>
          <p className="font-sans-mono text-sm font-semibold text-[#4A3828]">
            {request.quantity} {request.commodity_unit}
          </p>
        </div>

        {/* Offered Price */}
        <div className="col-span-2">
          <p className="text-[11px] font-sans-inter text-[#A88958] uppercase">Offered Price</p>
          <p className="font-sans-mono text-xs text-[#4A3828]">
            ₦{request.offered_price.toLocaleString('en-NG')} /{request.commodity_unit}
          </p>
        </div>

        {/* Total Payout */}
        <div className="col-span-2">
          <p className="text-[11px] font-sans-inter text-[#A88958] uppercase">Payout Total</p>
          <p className="font-sans-mono text-sm font-bold text-[#21483A]">
            ₦{request.total_amount.toLocaleString('en-NG')}
          </p>
        </div>

        {/* Status */}
        <div className="col-span-2 flex flex-col items-start">
          {renderStatusBadge(request.status)}
          <span className="text-[11px] font-sans-inter text-[#A88958] mt-1">
            {formattedDate}
          </span>
        </div>

        {/* Action */}
        <div className="col-span-1 text-right">
          <Link
            href={`/buyback/${request.id}`}
            className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold font-sans-inter text-[#21483A] bg-[#21483A]/10 hover:bg-[#21483A] hover:text-white transition-all"
          >
            View
          </Link>
        </div>
      </div>

      {/* Mobile Stacked Card View (<640px) */}
      <div className="sm:hidden space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-serif font-bold text-sm text-[#4A3828]">
              {request.commodity_name}
            </h4>
            <div className="mt-1">
              <GradeBadge grade={(request.grade_name as CommodityGrade) || 'Grade A'} size="sm" />
            </div>
          </div>
          <div>{renderStatusBadge(request.status)}</div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E4DCC8]/60 text-xs">
          <div>
            <span className="text-[#A88958]">Quantity: </span>
            <span className="font-sans-mono font-semibold text-[#4A3828]">
              {request.quantity} {request.commodity_unit}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[#A88958]">Total Payout: </span>
            <span className="font-sans-mono font-bold text-[#21483A]">
              ₦{request.total_amount.toLocaleString('en-NG')}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] font-sans-inter text-[#A88958]">
            {formattedDate}
          </span>
          <Link
            href={`/buyback/${request.id}`}
            className="inline-flex items-center justify-center px-4 py-1.5 rounded-lg text-xs font-semibold font-sans-inter text-[#21483A] bg-[#21483A]/10 hover:bg-[#21483A] hover:text-white transition-all"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
}
