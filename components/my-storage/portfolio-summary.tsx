// components/my-storage/portfolio-summary.tsx — Portfolio Summary Header Strip for My Storage page.
// Displays top-level portfolio stats: total market value (PriceDisplay), gain/loss delta badge, and holdings count.
// Server Component — no client-side state or interactivity.
// Desktop: wide 3-column banner card. Mobile: horizontally scrollable compact stat row.
// Used in: app/my-storage/page.tsx

import React from 'react';
import { PortfolioSummary } from '@/lib/supabase/queries/holdings';

// ----------------------------------------------------------------------------
// Props Interface
// ----------------------------------------------------------------------------

interface PortfolioSummaryProps {
  /** Aggregated portfolio statistics computed server-side from holdings_with_current_value view */
  summary: PortfolioSummary;
}

// ----------------------------------------------------------------------------
// Utility Helpers
// ----------------------------------------------------------------------------

/** Formats a number as Nigerian Naira with IBM Plex Mono numeric style.
 *  Example: 4850000 → "₦4,850,000.00"
 */
function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Determines if a gain/loss value is positive, negative, or neutral */
function getGainLossSign(amount: number): 'positive' | 'negative' | 'neutral' {
  if (amount > 0) return 'positive';
  if (amount < 0) return 'negative';
  return 'neutral';
}

// ----------------------------------------------------------------------------
// PortfolioSummary Component
// ----------------------------------------------------------------------------

export function PortfolioSummaryStrip({ summary }: PortfolioSummaryProps) {
  const gainLossSign = getGainLossSign(summary.overallGainLossAmount);

  // Color classes for gain/loss delta badge using KorraStore design tokens
  const gainLossColorClass =
    gainLossSign === 'positive'
      ? 'bg-[#E6F0EC] text-[#21483A]'  // Deep Grain Green — positive return
      : gainLossSign === 'negative'
        ? 'bg-[#F9EAE8] text-[#B3432E]'  // Danger — negative return
        : 'bg-[#F0EDE4] text-[#4A3828]'; // Neutral Soil — zero/flat

  // Arrow indicator for gain/loss
  const gainLossArrow =
    gainLossSign === 'positive' ? '↑' : gainLossSign === 'negative' ? '↓' : '→';

  return (
    /* Portfolio Summary Container — Paper background with Harvest Wheat left accent border */
    <div className="w-full">

      {/* ======================== DESKTOP SUMMARY BANNER ======================== */}
      {/* Wide 3-column banner card — visible only on md+ screens */}
      <div className="hidden md:block w-full bg-white border border-[#E4DCC8] rounded-2xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-3 divide-x divide-[#E4DCC8]">

          {/* --- Column 1: Total Portfolio Value --- */}
          <div className="p-6 flex flex-col justify-between">
            <span className="text-xs font-semibold font-sans-inter uppercase tracking-widest text-[#4A3828]/50">
              Total Portfolio Value
            </span>
            <div className="mt-3">
              {/* IBM Plex Mono for financial figures — matches design token */}
              <p className="font-mono-plex text-3xl font-bold text-[#4A3828] leading-none">
                {formatNaira(summary.totalPortfolioValue)}
              </p>
              <p className="mt-1.5 text-xs font-sans-inter text-[#4A3828]/50">
                Live market valuation
              </p>
            </div>
            {/* Harvest Wheat bottom accent bar */}
            <div className="mt-4 h-1 w-16 rounded-full bg-[#D8B56A]" />
          </div>

          {/* --- Column 2: Overall Return Delta --- */}
          <div className="p-6 flex flex-col justify-between">
            <span className="text-xs font-semibold font-sans-inter uppercase tracking-widest text-[#4A3828]/50">
              Unrealized Return
            </span>
            <div className="mt-3 space-y-2">
              {/* Gain/loss badge pill */}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold font-mono-plex ${gainLossColorClass}`}
              >
                <span>{gainLossArrow}</span>
                <span>{formatNaira(Math.abs(summary.overallGainLossAmount))}</span>
              </span>
              {/* Percentage return */}
              <p className={`text-lg font-bold font-mono-plex ${
                gainLossSign === 'positive' ? 'text-[#21483A]' :
                gainLossSign === 'negative' ? 'text-[#B3432E]' : 'text-[#4A3828]'
              }`}>
                {gainLossSign === 'positive' ? '+' : gainLossSign === 'negative' ? '' : ''}
                {summary.overallGainLossPercentage.toFixed(2)}%
              </p>
            </div>
            <p className="mt-1 text-xs font-sans-inter text-[#4A3828]/50">
              vs. total cost basis
            </p>
          </div>

          {/* --- Column 3: Holdings Count --- */}
          <div className="p-6 flex flex-col justify-between">
            <span className="text-xs font-semibold font-sans-inter uppercase tracking-widest text-[#4A3828]/50">
              Stored Commodities
            </span>
            <div className="mt-3">
              {/* Large count number in DM Serif Display */}
              <p className="font-serif-display text-5xl font-normal text-[#4A3828]">
                {summary.totalHoldingsCount}
              </p>
              <p className="mt-1.5 text-xs font-sans-inter text-[#4A3828]/50">
                {summary.totalHoldingsCount === 1 ? 'active holding' : 'active holdings'}
              </p>
            </div>
            {/* Warehouse silo icon */}
            <div className="mt-4">
              <svg className="w-5 h-5 text-[#A88958]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ======================== MOBILE SUMMARY STRIP ======================== */}
      {/* Horizontally scrollable compact stat row — visible only on < md screens */}
      <div className="md:hidden w-full overflow-x-auto pb-1">
        <div className="flex gap-3 px-1 min-w-max">

          {/* Mobile Stat Card: Total Value */}
          <div className="bg-white border border-[#E4DCC8] rounded-xl px-4 py-3 flex flex-col gap-0.5 min-w-[160px]">
            <span className="text-[10px] font-semibold font-sans-inter uppercase tracking-wider text-[#4A3828]/50">
              Total Value
            </span>
            <span className="font-mono-plex text-lg font-bold text-[#4A3828]">
              {formatNaira(summary.totalPortfolioValue)}
            </span>
          </div>

          {/* Mobile Stat Card: Return */}
          <div className="bg-white border border-[#E4DCC8] rounded-xl px-4 py-3 flex flex-col gap-0.5 min-w-[130px]">
            <span className="text-[10px] font-semibold font-sans-inter uppercase tracking-wider text-[#4A3828]/50">
              Return
            </span>
            <span className={`font-mono-plex text-lg font-bold ${
              gainLossSign === 'positive' ? 'text-[#21483A]' :
              gainLossSign === 'negative' ? 'text-[#B3432E]' : 'text-[#4A3828]'
            }`}>
              {gainLossSign === 'positive' ? '+' : ''}
              {summary.overallGainLossPercentage.toFixed(1)}%
            </span>
          </div>

          {/* Mobile Stat Card: Holdings Count */}
          <div className="bg-white border border-[#E4DCC8] rounded-xl px-4 py-3 flex flex-col gap-0.5 min-w-[110px]">
            <span className="text-[10px] font-semibold font-sans-inter uppercase tracking-wider text-[#4A3828]/50">
              Holdings
            </span>
            <span className="font-serif-display text-2xl text-[#4A3828]">
              {summary.totalHoldingsCount}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
