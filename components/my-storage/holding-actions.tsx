// components/my-storage/holding-actions.tsx — Action Button Row for individual holding cards.
// Client Component ("use client") — handles routing to downstream flows, CreateListingModal launching,
// RequestBuybackModal launching, and "Coming soon" toast stubs for unbuilt actions.
// Actions: Resell → opens CreateListingModal, Request Buyback → opens RequestBuybackModal, Request Delivery → /delivery/request?holdingId=
// Buttons are disabled if available_quantity === 0 (nothing left to act on).
// Used in: components/my-storage/holding-card.tsx

'use client';

import React, { useState } from 'react';
import { CreateListingModal, CreateListingHoldingInfo } from '@/components/resale/create-listing-modal';
import { RequestBuybackModal, RequestBuybackHoldingInfo } from '@/components/buyback/request-modal';

// ----------------------------------------------------------------------------
// Props Interface
// ----------------------------------------------------------------------------

interface HoldingActionsProps {
  /** The ID of the holding these actions apply to */
  holdingId: string;
  /** Commodity ID */
  commodityId?: string;
  /** Grade ID */
  gradeId?: string;
  /** Available quantity — actions are disabled when this is 0 */
  availableQuantity: number;
  /** Commodity name — for descriptive toast messages and modal headers */
  commodityName: string;
  /** Grade information */
  gradeCode?: string;
  gradeName?: string;
  /** Commodity Unit (kg/bags) */
  commodityUnit?: string;
  /** Live market unit price */
  currentUnitPrice?: number;
  /** Warehouse name */
  warehouseName?: string;
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
  commodityId,
  gradeId,
  availableQuantity,
  commodityName,
  gradeCode = 'A',
  gradeName = 'Grade A',
  commodityUnit = 'kg',
  currentUnitPrice = 1850,
  warehouseName = 'KorraStore Warehouse',
}: HoldingActionsProps) {
  const [toast, setToast] = useState<MiniToast>({ message: '', visible: false });
  const [isResellModalOpen, setIsResellModalOpen] = useState(false);
  const [isBuybackModalOpen, setIsBuybackModalOpen] = useState(false);

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

  function handleResell() {
    if (isDisabled) return;
    setIsResellModalOpen(true);
  }

  function handleBuyback() {
    if (isDisabled) return;
    setIsBuybackModalOpen(true);
  }

  function handleDelivery() {
    if (isDisabled) return;
    // Route to /delivery/request in delivery feature
    showComingSoonToast('Request delivery');
  }

  const holdingInfo: CreateListingHoldingInfo = {
    id: holdingId,
    commodityName,
    gradeCode,
    gradeName,
    availableQuantity,
    commodityUnit,
    currentUnitPrice,
    warehouseName,
  };

  const buybackHoldingInfo: RequestBuybackHoldingInfo = {
    id: holdingId,
    commodityId,
    gradeId,
    commodityName,
    gradeCode,
    gradeName,
    availableQuantity,
    commodityUnit,
    currentUnitPrice,
    warehouseName,
  };

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
      <div className="flex gap-2 pt-3 border-t border-[#E4DCC8]">
        {/* --- Resell Button --- */}
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
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Resell
        </button>

        {/* --- Request Buyback Button --- */}
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
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Buyback
        </button>

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

      {/* Resale Listing Creation Modal */}
      <CreateListingModal
        isOpen={isResellModalOpen}
        onClose={() => setIsResellModalOpen(false)}
        holding={holdingInfo}
      />

      {/* Buyback Request Modal */}
      <RequestBuybackModal
        isOpen={isBuybackModalOpen}
        onClose={() => setIsBuybackModalOpen(false)}
        holding={buybackHoldingInfo}
      />
    </div>
  );
}
