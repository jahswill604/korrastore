// components/my-storage/holding-actions.tsx — Action Button Row for individual holding cards.
// Client Component ("use client") — handles routing to downstream flows and "Coming soon" toast stubs.
// Actions: Resell → /resale/create?holdingId=, Request Buyback → /buyback/request?holdingId=, Request Delivery → /delivery/request?holdingId=
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
// Uses a simple ephemeral overlay since the full Toast component may need a provider
// ----------------------------------------------------------------------------

interface MiniToast {
  message: string;
  visible: boolean;
}

// ----------------------------------------------------------------------------
// HoldingActions Component
// ----------------------------------------------------------------------------

export function HoldingActions({ holdingId, availableQuantity, commodityName }: HoldingActionsProps) {
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

  // ----------------------------------------------------------------------------
  // Action Handlers
  // The resale and buyback flows are stubbed — routes will be built in
  // prompts/13-create-resale.md and prompts/14-buyback.md respectively.
  // Delivery route is stubbed for v1 per AGENTS.md Feature 10 rules.
  // ----------------------------------------------------------------------------

  function handleResell() {
    if (isDisabled) return;
    // TODO: Route to /resale/create once Feature 13 is built
    // router.push(`/resale/create?holdingId=${holdingId}`);
    showComingSoonToast('Resale marketplace');
  }

  function handleBuyback() {
    if (isDisabled) return;
    // TODO: Route to /buyback/request once Feature 14 is built
    // router.push(`/buyback/request?holdingId=${holdingId}`);
    showComingSoonToast('Request buyback');
  }

  function handleDelivery() {
    if (isDisabled) return;
    // TODO: Route to /delivery/request once delivery feature is built
    // router.push(`/delivery/request?holdingId=${holdingId}`);
    showComingSoonToast('Request delivery');
  }

  return (
    /* Action button row container — relative positioning enables the floating mini-toast */
    <div className="relative">

      {/* ======================== MINI TOAST OVERLAY ======================== */}
      {/* Ephemeral "Coming soon" notification — fades in then auto-dismisses after 3s */}
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
      {/* Desktop: 3 equal-width bordered buttons. Mobile: compact row at card bottom. */}
      <div className="flex gap-2 pt-3 border-t border-[#E4DCC8]">

        {/* --- Resell Button --- */}
        {/* Deep Grain Green outlined — primary action for sending to secondary market */}
        <button
          type="button"
          id={`resell-btn-${holdingId}`}
          onClick={handleResell}
          title={disabledTitle}
          aria-label={`Resell ${commodityName}`}
          aria-disabled={isDisabled}
          className={`flex-1 flex items-center justify-center gap-1.5
                      h-9 rounded-xl text-xs font-semibold font-sans-inter
                      border-2 border-[#21483A] text-[#21483A]
                      hover:bg-[#21483A] hover:text-white
                      active:scale-95 transition-all duration-150
                      ${disabledStyle}`}
        >
          {/* Arrow-up icon representing resale/listing */}
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Resell
        </button>

        {/* --- Request Buyback Button --- */}
        {/* Husk gold outlined — secondary action for buyback offer request */}
        <button
          type="button"
          id={`buyback-btn-${holdingId}`}
          onClick={handleBuyback}
          title={disabledTitle}
          aria-label={`Request buyback for ${commodityName}`}
          aria-disabled={isDisabled}
          className={`flex-1 flex items-center justify-center gap-1.5
                      h-9 rounded-xl text-xs font-semibold font-sans-inter
                      border-2 border-[#A88958] text-[#A88958]
                      hover:bg-[#A88958] hover:text-white
                      active:scale-95 transition-all duration-150
                      ${disabledStyle}`}
        >
          {/* Refresh/cycle icon representing buyback */}
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Buyback
        </button>

        {/* --- Request Delivery Button --- */}
        {/* Trust Indigo outlined — action for physical delivery from silo */}
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
          {/* Truck/delivery icon */}
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          Delivery
        </button>
      </div>
    </div>
  );
}
