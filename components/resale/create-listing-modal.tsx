// components/resale/create-listing-modal.tsx — Resale Listing Creation Modal / Sheet.
// Client Component ("use client") — launched from a holding card in /my-storage.
// Pre-fills commodity and grade, clamps quantity to available non-reserved balance,
// allows unit price configuration, duration selection (7/14/30 days), and displays payout breakdown.
// Used in: components/my-storage/holding-actions.tsx

'use client';

import * as React from 'react';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

// ----------------------------------------------------------------------------
// Props Interface
// ----------------------------------------------------------------------------

export interface CreateListingHoldingInfo {
  id: string;
  commodityName: string;
  commodityCode?: string;
  gradeCode: string;
  gradeName?: string;
  availableQuantity: number;
  commodityUnit: string;
  currentUnitPrice: number;
  warehouseName?: string;
}

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  holding: CreateListingHoldingInfo | null;
  onSuccess?: (listingId: string) => void;
}

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ----------------------------------------------------------------------------
// CreateListingModal Component
/**
 * Renders a modal for configuring and submitting a resale listing for a selected holding.
 *
 * @param isOpen - Whether the modal is visible
 * @param onClose - Callback invoked when the modal closes
 * @param holding - Holding to list for resale
 * @param onSuccess - Optional callback invoked with the created listing ID after submission
 */

export function CreateListingModal({
  isOpen,
  onClose,
  holding,
  onSuccess,
}: CreateListingModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form states
  const [quantity, setQuantity] = useState<number>(holding ? Math.min(100, holding.availableQuantity) : 1);
  const [unitPrice, setUnitPrice] = useState<string>(
    holding ? holding.currentUnitPrice.toString() : ''
  );
  const [durationDays, setDurationDays] = useState<number>(30);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset form fields when a different holding is opened. Adjusting state
  // during render (rather than in a useEffect) is the pattern React itself
  // recommends for "reset state when a prop changes" — see
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [prevHoldingId, setPrevHoldingId] = useState<string | undefined>(holding?.id);
  if (holding && holding.id !== prevHoldingId) {
    setPrevHoldingId(holding.id);
    setQuantity(Math.min(100, Math.max(1, holding.availableQuantity)));
    setUnitPrice(holding.currentUnitPrice ? holding.currentUnitPrice.toString() : '1850');
    setErrorMessage(null);
  }

  if (!isOpen || !holding) return null;

  const maxQty = holding.availableQuantity;
  const numUnitPrice = parseFloat(unitPrice) || 0;
  const grossTotal = quantity * numUnitPrice;
  // KorraStore standard 1% seller platform fee
  const platformFee = Math.round(grossTotal * 0.01);
  const netEstimatedPayout = Math.max(0, grossTotal - platformFee);

  // Stepper handlers
  const handleDecrement = () => setQuantity((prev) => Math.max(1, prev - 10));
  const handleIncrement = () => setQuantity((prev) => Math.min(maxQty, prev + 10));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (quantity <= 0 || quantity > maxQty) {
      setErrorMessage(`Please enter a valid quantity between 1 and ${maxQty} ${holding.commodityUnit}.`);
      return;
    }

    if (numUnitPrice <= 0) {
      setErrorMessage('Please enter a valid asking unit price greater than 0.');
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/resale', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            holdingId: holding.id,
            quantity,
            unitPrice: numUnitPrice,
            durationDays,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create resale listing.');
        }

        onClose();
        if (onSuccess) {
          onSuccess(data.listingId);
        }
        router.refresh();
        router.push('/resale/my-listings');
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : 'An error occurred while creating the listing.');
      }
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-listing-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#4A3828]/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-lg bg-[#F7F4EA] border border-[#E4DCC8] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E4DCC8] bg-white/80">
          <div>
            <h2 id="create-listing-title" className="font-serif-display text-2xl font-bold text-[#4A3828]">
              List for Resale
            </h2>
            <p className="text-xs font-sans-inter text-[#4A3828]/60 mt-0.5">
              Offer your stored commodity on the KorraStore peer-to-peer market.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#4A3828]/60 hover:text-[#4A3828] hover:bg-[#EFE9D9] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Commodity & Grade summary pill */}
          <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-[#E4DCC8]">
            <div>
              <p className="font-serif-display text-base font-bold text-[#4A3828]">
                {holding.commodityName}
              </p>
              <p className="text-xs font-sans-inter text-[#4A3828]/60">
                {holding.warehouseName || 'Verified Silo Storage'}
              </p>
            </div>
            <span className="px-3 py-1 bg-[#E6F0EC] text-[#21483A] border border-[#B8D4C5] rounded-full text-xs font-bold font-sans-inter">
              Grade {holding.gradeCode}
            </span>
          </div>

          {/* Quantity selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="resale-quantity-input" className="text-xs font-bold font-sans-inter uppercase tracking-wider text-[#4A3828]">
                Listing Quantity ({holding.commodityUnit})
              </label>
              <span className="text-xs font-mono-plex text-[#A88958] font-medium">
                {maxQty.toLocaleString()} {holding.commodityUnit} available
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={quantity <= 1 || isPending}
                className="w-11 h-11 rounded-xl bg-white border border-[#E4DCC8] text-lg font-bold text-[#4A3828] hover:bg-[#EFE9D9] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center active:scale-95 transition-all"
              >
                −
              </button>

              <input
                id="resale-quantity-input"
                type="number"
                min={1}
                max={maxQty}
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (isNaN(val)) setQuantity(1);
                  else setQuantity(Math.min(maxQty, Math.max(1, val)));
                }}
                disabled={isPending}
                className="flex-1 h-11 text-center font-mono-plex text-base font-bold bg-white border border-[#E4DCC8] rounded-xl text-[#4A3828] focus:outline-none focus:border-[#D8B56A] focus:ring-1 focus:ring-[#D8B56A]"
              />

              <button
                type="button"
                onClick={handleIncrement}
                disabled={quantity >= maxQty || isPending}
                className="w-11 h-11 rounded-xl bg-white border border-[#E4DCC8] text-lg font-bold text-[#4A3828] hover:bg-[#EFE9D9] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center active:scale-95 transition-all"
              >
                +
              </button>
            </div>
            <p className="text-[11px] font-sans-inter text-[#4A3828]/50">
              Quantity listed will be reserved from your active storage until purchased or cancelled.
            </p>
          </div>

          {/* Asking Price Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="unit-price-input" className="text-xs font-bold font-sans-inter uppercase tracking-wider text-[#4A3828]">
                Asking Price per {holding.commodityUnit} (₦)
              </label>
              <span className="text-xs font-sans-inter text-[#4A3828]/60">
                Benchmark: <strong className="font-mono-plex">{formatNaira(holding.currentUnitPrice)}</strong>
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono-plex text-sm font-bold text-[#4A3828]/60">
                ₦
              </span>
              <input
                id="unit-price-input"
                type="number"
                step="1"
                min="1"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                disabled={isPending}
                placeholder="e.g. 1850"
                className="w-full h-11 pl-8 pr-4 font-mono-plex text-base font-bold bg-white border border-[#E4DCC8] rounded-xl text-[#4A3828] focus:outline-none focus:border-[#D8B56A] focus:ring-1 focus:ring-[#D8B56A]"
              />
            </div>
          </div>

          {/* Listing Duration */}
          <div className="space-y-2">
            <label className="text-xs font-bold font-sans-inter uppercase tracking-wider text-[#4A3828]">
              Listing Duration
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[7, 14, 30].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setDurationDays(days)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold font-sans-inter transition-all ${
                    durationDays === days
                      ? 'bg-[#D8B56A] text-[#4A3828] shadow-sm font-bold border-2 border-[#A88958]'
                      : 'bg-white border border-[#E4DCC8] text-[#4A3828]/80 hover:bg-[#EFE9D9]'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>

          {/* Financial Breakdown Summary Card */}
          <div className="p-4 bg-white/90 rounded-2xl border border-[#E4DCC8] space-y-2 text-xs font-sans-inter">
            <div className="flex justify-between text-[#4A3828]/70">
              <span>Gross Listing Value:</span>
              <span className="font-mono-plex font-bold text-[#4A3828]">{formatNaira(grossTotal)}</span>
            </div>
            <div className="flex justify-between text-[#4A3828]/70">
              <span>Platform Fee (1%):</span>
              <span className="font-mono-plex text-[#A88958] font-medium">− {formatNaira(platformFee)}</span>
            </div>
            <div className="pt-2 border-t border-[#E4DCC8] flex justify-between items-center text-sm font-bold text-[#4A3828]">
              <span>Estimated Net Payout:</span>
              <span className="font-mono-plex text-base font-bold text-[#21483A]">
                {formatNaira(netEstimatedPayout)}
              </span>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-[#F9EAE8] border border-[#B3432E]/30 rounded-xl text-xs font-medium text-[#B3432E]">
              {errorMessage}
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isPending || quantity <= 0 || numUnitPrice <= 0}
            className="w-full h-12 rounded-xl bg-[#D8B56A] hover:bg-[#c4a259] active:scale-[0.98] text-[#4A3828] font-bold font-sans-inter text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <svg className="animate-spin w-4 h-4 text-[#4A3828]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Reserving & Listing...</span>
              </>
            ) : (
              <span>List for Resale</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
