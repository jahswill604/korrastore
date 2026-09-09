// components/resale/resale-card.tsx — Interactive Resale Listing Card for KorraStore.
// Displays commodity imagery, grade badge, quantity, unit & total asking prices, anonymized seller info,
// and handles the "Buy Listing" payment initialization flow directly into Paystack.
// Used in: components/resale/resale-grid.tsx

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PublicResaleListing } from '@/lib/supabase/queries/resale';
import { GradeBadge, CommodityGrade } from '@/components/ui/grade-badge';
import { PriceDisplay } from '@/components/ui/price-display';

// ----------------------------------------------------------------------------
// Props Interface
// ----------------------------------------------------------------------------

export interface ResaleCardProps {
  listing: PublicResaleListing;
}

// Shared clock store keeps snapshots stable and notifies cards once per minute.
let currentTimeSnapshot = 0;
let clockInterval: ReturnType<typeof setInterval> | null = null;
const clockListeners = new Set<() => void>();

function updateTimeSnapshot() {
  currentTimeSnapshot = Date.now();
  clockListeners.forEach((listener) => listener());
}

function subscribeToClock(listener: () => void) {
  clockListeners.add(listener);

  if (clockListeners.size === 1) {
    updateTimeSnapshot();
    clockInterval = setInterval(updateTimeSnapshot, 60_000);
  }

  return () => {
    clockListeners.delete(listener);
    if (clockListeners.size === 0 && clockInterval) {
      clearInterval(clockInterval);
      clockInterval = null;
    }
  };
}

function getTimeSnapshot() {
  return currentTimeSnapshot;
}

// ----------------------------------------------------------------------------
// Commodity Icon/Emoji Map for Visual Fallbacks
// ----------------------------------------------------------------------------

function getCommodityIcon(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('rice')) return '🌾';
  if (lower.includes('garlic')) return '🧄';
  if (lower.includes('bean')) return '🫘';
  if (lower.includes('melon') || lower.includes('egusi')) return '🍈';
  if (lower.includes('ginger')) return '🫚';
  return '📦';
}

// ----------------------------------------------------------------------------
// ResaleCard Component
/**
 * Displays a resale listing with pricing details and a purchase action.
 *
 * @param listing - The resale listing to display and purchase
 */

export function ResaleCard({ listing }: ResaleCardProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Normalize grade string for GradeBadge primitive
  const gradeTag = (
    listing.gradeCode === 'A' || listing.gradeName.includes('A') || listing.gradeName.includes('Premium')
      ? 'Grade A'
      : listing.gradeCode === 'B' || listing.gradeName.includes('B')
      ? 'Grade B'
      : 'Grade C'
  ) as CommodityGrade;

  // The cached snapshot changes only when the shared clock notifies subscribers.
  const now = React.useSyncExternalStore(
    subscribeToClock,
    getTimeSnapshot,
    () => 0
  );

  // Relative listing time helper
  const formattedDate = React.useMemo(() => {
    if (now === 0) return 'Recently listed';
    try {
      const created = new Date(listing.createdAt);
      const diffMs = now - created.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) return 'Listed today';
      if (diffDays === 1) return 'Listed 1d ago';
      return `Listed ${diffDays}d ago`;
    } catch {
      return 'Recently listed';
    }
  }, [listing.createdAt, now]);

  // Handle direct listing purchase
  const handleBuyListing = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/resale/${listing.id}/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to initiate purchase for this listing.');
      }

      if (data.authorizationUrl) {
        // Redirect to Paystack secure checkout
        window.location.href = data.authorizationUrl;
      } else if (data.orderId) {
        router.push(`/orders/${data.orderId}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during checkout.';
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FAF7EE] border border-[#E4DCC8] rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-soil-sm hover:shadow-soil-md transition-all duration-200 group">
      {/* Top Media & Grade Badge Area */}
      <div>
        <div className="relative w-full h-40 sm:h-48 rounded-xl sm:rounded-2xl bg-[#EDE6D4] border border-[#E4DCC8]/60 overflow-hidden flex items-center justify-center mb-4">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#FAF7EE]/40 via-transparent to-[#D8B56A]/10" />

          {/* Commodity Visual Representation */}
          <div className="text-5xl sm:text-6xl select-none transform group-hover:scale-110 transition-transform duration-300">
            {getCommodityIcon(listing.commodityName)}
          </div>

          {/* Grade Badge Overlay (Top Left) */}
          <div className="absolute top-3 left-3">
            <GradeBadge grade={gradeTag} size="sm" />
          </div>

          {/* Below Market Price Delta Badge (Top Right) */}
          {listing.priceDeltaPercentage < 0 && (
            <div className="absolute top-3 right-3 bg-[#21483A] text-[#FFFFFF] text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs">
              {listing.priceDeltaPercentage}% vs market
            </div>
          )}
        </div>

        {/* Commodity Title & Available Quantity */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-serif-display text-lg sm:text-xl font-bold text-[#4A3828] group-hover:text-[#21483A] transition-colors line-clamp-1">
              {listing.commodityName}
            </h3>
            <p className="font-sans-inter text-xs sm:text-sm text-[#4A3828]/70 font-medium">
              {listing.quantity.toLocaleString('en-NG')} {listing.commodityUnit} available
            </p>
          </div>
        </div>

        {/* Price Breakdown Matrix */}
        <div className="bg-[#FFFFFF]/70 rounded-xl p-3 border border-[#E4DCC8]/70 my-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-[#4A3828]/75">
            <span>Unit Price</span>
            <span className="font-mono-plex font-bold text-[#4A3828]">
              ₦{listing.unitPrice.toLocaleString('en-NG')} / {listing.commodityUnit}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-[#E4DCC8]/40">
            <span className="text-xs font-semibold text-[#4A3828]">Total Price</span>
            <PriceDisplay amount={listing.totalListingPrice} size="md" />
          </div>
        </div>

        {/* Anonymized Seller Identity & Location Strip */}
        <div className="flex items-center justify-between text-[11px] font-sans-inter text-[#4A3828]/70 py-1">
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-2 h-2 rounded-full bg-[#21483A] shrink-0" />
            <span className="font-medium truncate">{listing.sellerDisplayName}</span>
          </div>
          <span className="shrink-0 text-[#4A3828]/50">{formattedDate}</span>
        </div>
      </div>

      {/* Action CTA & Error Notice */}
      <div className="pt-3 border-t border-[#E4DCC8]/60 mt-3">
        {errorMessage && (
          <p className="text-xs font-medium text-[var(--danger)] bg-[var(--danger)]/10 px-2.5 py-1.5 rounded-lg mb-2">
            {errorMessage}
          </p>
        )}

        <button
          type="button"
          onClick={handleBuyListing}
          disabled={isSubmitting || listing.status !== 'active'}
          className="w-full h-11 rounded-xl sm:rounded-2xl bg-[#D8B56A] hover:bg-[#CBA457] active:scale-[0.98] text-[#4A3828] font-sans-inter text-sm font-bold shadow-soil-sm hover:shadow-soil-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4 text-[#4A3828]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Reserving Listing...</span>
            </>
          ) : (
            <span>Buy Listing</span>
          )}
        </button>
      </div>
    </div>
  );
}
