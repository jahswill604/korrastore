// components/my-storage/holding-card.tsx — Individual ledger-style holding card for My Storage page.
// Server Component — renders a single buyer commodity holding with live valuation, quantity split, and actions.
// Critical: Each holding is rendered as its own card — NEVER merged with other holdings even if same commodity/grade.
// current_value is always from the DB view (quantity × current_price), never stored or computed here.
// Desktop: participates in a 3-column grid. Mobile: full-width single column.
// Used in: app/my-storage/page.tsx

import React from 'react';
import Image from 'next/image';
import { HoldingWithCurrentValue } from '@/lib/supabase/queries/holdings';
import { HoldingActions } from './holding-actions';

// ----------------------------------------------------------------------------
// Props Interface
// ----------------------------------------------------------------------------

interface HoldingCardProps {
  /** Full holding row with live valuation data from holdings_with_current_value view */
  holding: HoldingWithCurrentValue;
}

// ----------------------------------------------------------------------------
// Utility Helpers
// ----------------------------------------------------------------------------

/** Formats a number as Nigerian Naira currency with compact display */
function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Maps grade code (A, B, C) to its color scheme for the grade badge chip */
function getGradeStyle(gradeCode: string): { bg: string; text: string; border: string } {
  switch (gradeCode?.toUpperCase()) {
    case 'A':
      // Deep Grain Green — highest quality
      return { bg: '#E6F0EC', text: '#21483A', border: '#B8D4C5' };
    case 'B':
      // Harvest Wheat — standard quality
      return { bg: '#FBF5E8', text: '#7A5C1E', border: '#E8D4A0' };
    case 'C':
      // Husk — economy quality
      return { bg: '#F5F0E8', text: '#6B5A48', border: '#D8CDB8' };
    default:
      return { bg: '#F5F0E8', text: '#6B5A48', border: '#D8CDB8' };
  }
}

/** Returns a commodity emoji fallback based on the commodity name */
function getCommodityEmoji(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('rice')) return '🌾';
  if (lower.includes('garlic')) return '🧄';
  if (lower.includes('bean') || lower.includes('soy')) return '🫘';
  if (lower.includes('melon') || lower.includes('egusi')) return '🍈';
  if (lower.includes('maize') || lower.includes('corn')) return '🌽';
  return '📦';
}

/** Formats a date string to human-readable format: "Aug 12, 2026" */
function formatDate(dateString: string): string {
  try {
    return new Intl.DateTimeFormat('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

// ----------------------------------------------------------------------------
// HoldingCard Component
/**
 * Displays a commodity holding with quantity, valuation, storage details, and available actions.
 *
 * @param holding - Holding data used to populate the card
 */

export function HoldingCard({ holding }: HoldingCardProps) {
  const gradeStyle = getGradeStyle(holding.gradeCode);
  const isPositiveReturn = holding.profitLoss >= 0;

  // Determine gain/loss display values
  const gainLossPrefix = isPositiveReturn ? '+' : '';
  const gainLossAmount = Math.abs(holding.profitLoss);
  const gainLossPercentage = Math.abs(holding.profitLossPercentage);
  const gainLossColor = isPositiveReturn ? '#21483A' : '#B3432E';
  const gainLossBg = isPositiveReturn ? '#E6F0EC' : '#F9EAE8';
  const gainLossArrow = isPositiveReturn ? '↑' : '↓';

  return (
    /* Ledger-style holding card — Paper fill, warm border, subtle shadow */
    <div
      className="bg-white border border-[#E4DCC8] rounded-2xl overflow-hidden shadow-sm
                 hover:shadow-md hover:border-[#D8B56A] transition-all duration-200 flex flex-col"
    >

      {/* ======================== CARD HEADER ======================== */}
      {/* Commodity thumbnail + name + grade badge */}
      <div className="flex items-start gap-3 p-4 pb-3">

        {/* Commodity Thumbnail — warm beige background with image or emoji fallback */}
        <div
          className="w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden
                     flex items-center justify-center text-2xl"
          style={{ backgroundColor: '#F5EFE0' }}
        >
          {holding.commodityImageUrl ? (
            <Image
              src={holding.commodityImageUrl}
              alt={holding.commodityName}
              width={64}
              height={64}
              className="object-cover w-full h-full"
            />
          ) : (
            <span role="img" aria-label={holding.commodityName}>
              {getCommodityEmoji(holding.commodityName)}
            </span>
          )}
        </div>

        {/* Commodity Name + Grade Badge */}
        <div className="flex-1 min-w-0">
          {/* Commodity name in DM Serif Display */}
          <h3
            className="font-serif-display text-[#4A3828] text-lg leading-tight truncate"
            title={holding.commodityName}
          >
            {holding.commodityName}
          </h3>

          {/* Grade badge chip */}
          <span
            className="inline-flex items-center px-2.5 py-0.5 mt-1 rounded-full text-xs font-semibold font-sans-inter border"
            style={{
              backgroundColor: gradeStyle.bg,
              color: gradeStyle.text,
              borderColor: gradeStyle.border,
            }}
          >
            Grade {holding.gradeCode}
          </span>

          {/* Purchase date */}
          <p className="text-[11px] font-sans-inter text-[#4A3828]/40 mt-1">
            Purchased {formatDate(holding.purchasedAt)}
          </p>
        </div>
      </div>

      {/* ======================== CARD BODY ======================== */}
      <div className="px-4 pb-4 flex flex-col gap-3 flex-1">

        {/* --- Quantity Row --- */}
        {/* Shows available vs reserved quantity split per AGENTS.md Feature 10 rules */}
        <div className="bg-[#F7F4EA] rounded-xl p-3">
          <p className="text-[10px] font-semibold font-sans-inter uppercase tracking-wider text-[#4A3828]/50 mb-1">
            Quantity in Storage
          </p>
          <div className="flex items-center justify-between">
            {/* Available quantity — actionable amount */}
            <span className="font-mono-plex text-sm font-bold text-[#4A3828]">
              {holding.availableQuantity.toLocaleString()} {holding.commodityUnit}
              <span className="font-sans-inter font-normal text-[#4A3828]/60 ml-1 text-xs">
                available
              </span>
            </span>

            {/* Reserved quantity — only shown when > 0 */}
            {holding.reservedQuantity > 0 && (
              <span className="font-mono-plex text-xs text-[#A88958] font-medium">
                {holding.reservedQuantity.toLocaleString()} {holding.commodityUnit} reserved
              </span>
            )}
          </div>

          {/* Visual quantity bar showing available vs reserved proportion */}
          {holding.reservedQuantity > 0 && (
            <div className="mt-2 h-1.5 bg-[#E4DCC8] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D8B56A] rounded-full"
                style={{
                  width: `${(holding.availableQuantity / holding.quantity) * 100}%`,
                }}
              />
            </div>
          )}
        </div>

        {/* --- Valuation Row --- */}
        {/* Purchase price vs current market value with gain/loss delta badge */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold font-sans-inter uppercase tracking-wider text-[#4A3828]/50">
            Valuation
          </p>

          {/* Price comparison: purchase vs current, per unit */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-sans-inter text-[#4A3828]/50">Purchase price</p>
              <p className="font-mono-plex text-sm font-medium text-[#4A3828]">
                {formatNaira(holding.unitPurchasePrice)}/{holding.commodityUnit}
              </p>
            </div>
            <svg className="w-4 h-4 text-[#E4DCC8]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
            <div className="text-right">
              <p className="text-[11px] font-sans-inter text-[#4A3828]/50">Current price</p>
              <p className="font-mono-plex text-sm font-bold text-[#4A3828]">
                {formatNaira(holding.currentUnitPrice)}/{holding.commodityUnit}
              </p>
            </div>
          </div>

          {/* Total current value with gain/loss badge */}
          <div className="flex items-center justify-between pt-1 border-t border-[#E4DCC8]">
            <div>
              <p className="text-[11px] font-sans-inter text-[#4A3828]/50">Total market value</p>
              <p className="font-mono-plex text-base font-bold text-[#4A3828]">
                {formatNaira(holding.currentTotalValue)}
              </p>
            </div>
            {/* Gain/loss delta badge pill */}
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold font-mono-plex"
              style={{ backgroundColor: gainLossBg, color: gainLossColor }}
            >
              <span>{gainLossArrow}</span>
              <span>{gainLossPrefix}{formatNaira(gainLossAmount)}</span>
              <span className="text-[10px]">({gainLossPercentage.toFixed(1)}%)</span>
            </span>
          </div>
        </div>

        {/* --- Storage Location Badge --- */}
        <div className="flex items-center gap-2">
          {/* Pin icon */}
          <svg className="w-4 h-4 text-[#A88958] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-xs font-sans-inter font-medium text-[#4A3828]/70">
            {holding.warehouseName}
          </span>
          <span className="text-xs font-sans-inter text-[#4A3828]/40">
            · {holding.warehouseLocation}
          </span>
        </div>

        {/* ======================== HOLDING ACTIONS ======================== */}
        {/* Client Component handling Delivery button routing (buy-only MVP scope) */}
        <HoldingActions
          holdingId={holding.id}
          availableQuantity={holding.availableQuantity}
          commodityName={holding.commodityName}
        />
      </div>
    </div>
  );
}
