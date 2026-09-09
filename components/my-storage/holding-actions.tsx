// components/my-storage/holding-actions.tsx — Action Button Row for individual holding cards.
// Client Component ("use client") — handles routing to downstream flows and
// "Coming soon" toast stubs for unbuilt actions.
// MVP scope: KorraStore is buy-only for now, so Resell and Buyback are hidden.
// Only Request Delivery → /delivery/request?holdingId= remains.
// Buttons are disabled if available_quantity === 0 (nothing left to act on).
// Used in: components/my-storage/holding-card.tsx

'use client';

import React, { useState } from 'react';

// ----------------------------------------------------------------------------
// Props Interface
// ----------------------------------------------------------------------------

interface HoldingActionsProps {
  /** The ID of the holding these actions apply to */
  holdingId: string;
  /** Available quantity — actions are disabled when this is 0 */
  availableQuantity: number;
  /** Commodity name — for descriptive toast messages */
  commodityName: string;
}

// ----------------------------------------------------------------------------
// Toast State — inline mini-toast for "Coming soon" stub messages
// ----------------------------------------------------------------------------

interface MiniToast {
  message: string;
  visible: boolean;
}

// ----------------------------------------------------------------------------
// HoldingActions Component
// ----------------------------------------------------------------------------

export function HoldingActions({
  holdingId,
  availableQuantity,
  commodityName,
}: HoldingActionsProps) {
  const [toast, setToast] = useState<MiniToast>({ message: '', visible: false });

  /** Shows a brief "Coming soon" toast for unbuilt downstream routes */
  function showComingSoonToast(feature: string) {
    setToast({ message: `${feature} — Coming soon!`, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 3000);
  }

  /** Determine if actions should be disabled — no available quantity */
  const isDisabled = availableQuantity <= 0;

  // Shared disabled styles applied when available_quantity === 0
  const disabledStyle = isDisabled
    ? 'opacity-40 cursor-not-allowed pointer-events-none'
    : 'cursor-pointer';

  // Tooltip text for disabled state
  const disabledTitle = isDisabled
    ? `No available quantity in ${commodityName}`
    : undefined;

  function handleDelivery() {
    if (isDisabled) return;
    // Route to /delivery/request in delivery feature
    showComingSoonToast('Request delivery');
  }

  return (
    /* Action button row container — relative positioning enables the floating mini-toast */
    <div className="relative">
      {/* ======================== MINI TOAST OVERLAY ======================== */}
      {toast.visible && (
        <div
          role="status"
          aria-live="polite"
          className="absolute bottom-full left-0 right-0 mb-2 z-50 flex justify-center"
        >
          <div className="bg-[#4A3828] text-[#F7F4EA] text-xs font-sans-inter font-medium
                          px-4 py-2 rounded-full shadow-lg whitespace-nowrap
                          animate-in fade-in slide-in-from-bottom-1 duration-200">
            {toast.message}
          </div>
        </div>
      )}

      {/* ======================== ACTION BUTTONS ROW ======================== */}
      {/* MVP scope: KorraStore is buy-only for now — Resell and Buyback are
          intentionally hidden here (not deleted; see git history / handleResell,
          handleBuyback) until the resale/buyback marketplace is enabled. */}
      <div className="flex gap-2 pt-3 border-t border-[#E4DCC8]">
        {/* --- Request Delivery Button --- */}
        <button
          type="button"
          id={`delivery-btn-${holdingId}`}
          onClick={handleDelivery}
          title={disabledTitle}
          aria-label={`Request delivery for ${commodityName}`}
          aria-disabled={isDisabled}
          className={`flex-1 flex items-center justify-center gap-1.5
                      h-9 rounded-xl text-xs font-semibold font-sans-inter
                      border-2 border-[#303B63] text-[#303B63]
                      hover:bg-[#303B63] hover:text-white
                      active:scale-95 transition-all duration-150
                      ${disabledStyle}`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          Delivery
        </button>
      </div>
    </div>
  );
}
