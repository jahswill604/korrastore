// components/resale/cancel-listing-dialog.tsx — Resale Listing Cancellation Confirmation Dialog.
// Client Component ("use client") — provides explicit confirmation before cancelling an active listing.
// Informs seller that reserved commodity quantity is immediately restored to available balance in /my-storage.
// Used in: components/resale/my-listing-row.tsx

'use client';

import * as React from 'react';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

// ----------------------------------------------------------------------------
// Props Interface
// ----------------------------------------------------------------------------

export interface CancelListingInfo {
  id: string;
  commodityName: string;
  gradeCode: string;
  quantity: number;
  commodityUnit: string;
}

interface CancelListingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  listing: CancelListingInfo | null;
  onSuccess?: () => void;
}

// ----------------------------------------------------------------------------
// CancelListingDialog Component
// ----------------------------------------------------------------------------

export function CancelListingDialog({
  isOpen,
  onClose,
  listing,
  onSuccess,
}: CancelListingDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !listing) return null;

  const handleConfirmCancel = () => {
    setErrorMessage(null);
    startTransition(async () => {
      try {
        const response = await fetch(`/api/resale/${listing.id}/cancel`, {
          method: 'POST',
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to cancel listing.');
        }

        onClose();
        if (onSuccess) onSuccess();
        router.refresh();
      } catch (err: any) {
        setErrorMessage(err.message || 'An error occurred while cancelling the listing.');
      }
    });
  };

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="cancel-dialog-title"
      aria-describedby="cancel-dialog-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#4A3828]/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-md bg-[#F7F4EA] border border-[#E4DCC8] rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Warning Icon & Heading */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F9EAE8] border border-[#B3432E]/20 flex items-center justify-center text-2xl flex-shrink-0 text-[#B3432E]">
            ⚠️
          </div>
          <div>
            <h2 id="cancel-dialog-title" className="font-serif-display text-xl font-bold text-[#4A3828]">
              Cancel Resale Listing?
            </h2>
            <p id="cancel-dialog-desc" className="text-xs font-sans-inter text-[#4A3828]/70 mt-1 leading-relaxed">
              Are you sure you want to cancel this listing for{' '}
              <strong className="text-[#4A3828]">
                {listing.quantity.toLocaleString()} {listing.commodityUnit} of {listing.commodityName} (Grade {listing.gradeCode})
              </strong>?
            </p>
          </div>
        </div>

        {/* Informational Callout */}
        <div className="p-3.5 bg-white rounded-2xl border border-[#E4DCC8] text-xs font-sans-inter text-[#4A3828]/80 space-y-1">
          <p className="font-semibold text-[#21483A] flex items-center gap-1.5">
            <span>✓</span> Immediate Storage Restoration
          </p>
          <p className="text-[11px] text-[#4A3828]/60">
            The {listing.quantity.toLocaleString()} {listing.commodityUnit} will be released back into your active available storage immediately.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-[#F9EAE8] border border-[#B3432E]/30 rounded-xl text-xs font-medium text-[#B3432E]">
            {errorMessage}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 h-11 rounded-xl bg-white border border-[#E4DCC8] text-xs font-bold text-[#4A3828] hover:bg-[#EFE9D9] transition-colors"
          >
            Keep Listing
          </button>
          <button
            type="button"
            onClick={handleConfirmCancel}
            disabled={isPending}
            className="flex-1 h-11 rounded-xl bg-[#B3432E] hover:bg-[#993623] active:scale-[0.98] text-white font-bold font-sans-inter text-xs shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isPending ? 'Cancelling...' : 'Yes, Cancel Listing'}
          </button>
        </div>
      </div>
    </div>
  );
}
