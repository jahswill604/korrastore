// components/resale/edit-price-modal.tsx — Resale Listing Price Editing Modal.
// Client Component ("use client") — allows sellers to adjust the asking price per unit for active listings.
// Live recalculates gross listing value without modifying holding reservation quantities.
// Used in: components/resale/my-listing-row.tsx

'use client';

import * as React from 'react';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

// ----------------------------------------------------------------------------
// Props Interface
// ----------------------------------------------------------------------------

export interface EditPriceListingInfo {
  id: string;
  commodityName: string;
  gradeCode: string;
  quantity: number;
  unitPrice: number;
  commodityUnit: string;
}

interface EditPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: EditPriceListingInfo | null;
  onSuccess?: () => void;
}

function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ----------------------------------------------------------------------------
// EditPriceModal Component
/**
 * Provides a dialog for updating the unit price of an active resale listing.
 *
 * @param listing - The resale listing whose unit price is being edited
 * @param onSuccess - Optional callback invoked after the price is updated successfully
 * @returns The price-editing dialog, or `null` when it is closed or no listing is provided
 */

export function EditPriceModal({
  isOpen,
  onClose,
  listing,
  onSuccess,
}: EditPriceModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [unitPrice, setUnitPrice] = useState<string>(
    listing ? listing.unitPrice.toString() : ''
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset the price field when a different listing is opened. Adjusting state
  // during render (rather than in a useEffect) is the pattern React itself
  // recommends for "reset state when a prop changes".
  const [prevListingId, setPrevListingId] = useState<string | undefined>(listing?.id);
  if (listing && listing.id !== prevListingId) {
    setPrevListingId(listing.id);
    setUnitPrice(listing.unitPrice.toString());
    setErrorMessage(null);
  }

  if (!isOpen || !listing) return null;

  const numPrice = parseFloat(unitPrice) || 0;
  const newGrossTotal = listing.quantity * numPrice;
  const platformFee = Math.round(newGrossTotal * 0.01);
  const netEstimatedPayout = Math.max(0, newGrossTotal - platformFee);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (numPrice <= 0) {
      setErrorMessage('Please enter a valid asking price greater than 0.');
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch(`/api/resale/${listing.id}/price`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ unitPrice: numPrice }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to update price.');
        }

        onClose();
        if (onSuccess) onSuccess();
        router.refresh();
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : 'An error occurred while updating price.');
      }
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-price-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#4A3828]/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-md bg-[#F7F4EA] border border-[#E4DCC8] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E4DCC8] bg-white/80">
          <div>
            <h2 id="edit-price-title" className="font-serif-display text-xl font-bold text-[#4A3828]">
              Edit Asking Price
            </h2>
            <p className="text-xs font-sans-inter text-[#4A3828]/60 mt-0.5">
              Update unit pricing for listing #{listing.id.slice(0, 8)}
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Commodity Details */}
          <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-[#E4DCC8]">
            <div>
              <p className="font-serif-display text-base font-bold text-[#4A3828]">
                {listing.commodityName}
              </p>
              <p className="text-xs font-mono-plex text-[#4A3828]/70">
                {listing.quantity.toLocaleString()} {listing.commodityUnit} listed
              </p>
            </div>
            <span className="px-2.5 py-0.5 bg-[#E6F0EC] text-[#21483A] border border-[#B8D4C5] rounded-full text-xs font-bold font-sans-inter">
              Grade {listing.gradeCode}
            </span>
          </div>

          {/* Asking Price Input */}
          <div className="space-y-2">
            <label htmlFor="edit-unit-price-input" className="text-xs font-bold font-sans-inter uppercase tracking-wider text-[#4A3828]">
              New Asking Price per {listing.commodityUnit} (₦)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono-plex text-sm font-bold text-[#4A3828]/60">
                ₦
              </span>
              <input
                id="edit-unit-price-input"
                type="number"
                step="1"
                min="1"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                disabled={isPending}
                className="w-full h-11 pl-8 pr-4 font-mono-plex text-base font-bold bg-white border border-[#E4DCC8] rounded-xl text-[#4A3828] focus:outline-none focus:border-[#D8B56A] focus:ring-1 focus:ring-[#D8B56A]"
              />
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="p-4 bg-white/90 rounded-2xl border border-[#E4DCC8] space-y-2 text-xs font-sans-inter">
            <div className="flex justify-between text-[#4A3828]/70">
              <span>New Gross Total:</span>
              <span className="font-mono-plex font-bold text-[#4A3828]">{formatNaira(newGrossTotal)}</span>
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

          {errorMessage && (
            <div className="p-3 bg-[#F9EAE8] border border-[#B3432E]/30 rounded-xl text-xs font-medium text-[#B3432E]">
              {errorMessage}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 h-11 rounded-xl bg-white border border-[#E4DCC8] text-xs font-bold text-[#4A3828] hover:bg-[#EFE9D9] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || numPrice <= 0}
              className="flex-1 h-11 rounded-xl bg-[#D8B56A] hover:bg-[#c4a259] active:scale-[0.98] text-[#4A3828] font-bold font-sans-inter text-xs shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isPending ? 'Updating...' : 'Update Price'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
