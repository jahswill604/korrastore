// components/buyback/request-modal.tsx — Buyback Request Modal / Sheet for KorraStore.
// Client Component ("use client") — launched from "Request Buyback" button on holding cards.
// Displays live buyback price, quantity stepper clamped to available stock, computed total payout,
// review timeframe disclaimer, and submits to POST /api/buybacks.
// Used in: components/my-storage/holding-actions.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GradeBadge } from '@/components/ui/grade-badge';

// ----------------------------------------------------------------------------
// Props & Type Interfaces
// ----------------------------------------------------------------------------

export interface RequestBuybackHoldingInfo {
  id: string;
  commodityId?: string;
  gradeId?: string;
  commodityName: string;
  gradeCode?: string;
  gradeName?: string;
  availableQuantity: number;
  commodityUnit?: string;
  currentUnitPrice?: number;
  warehouseName?: string;
}

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  holding: RequestBuybackHoldingInfo | null;
}

// ----------------------------------------------------------------------------
// RequestBuybackModal Component
// ----------------------------------------------------------------------------

export function RequestBuybackModal({ isOpen, onClose, holding }: RequestModalProps) {
  const router = useRouter();

  // Form State
  const [quantity, setQuantity] = useState<number>(1);
  const [buybackPrice, setBuybackPrice] = useState<number>(0);
  const [isLoadingPrice, setIsLoadingPrice] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Initialize or reset state when modal opens or holding changes
  useEffect(() => {
    if (isOpen && holding) {
      setQuantity(1);
      setErrorMsg(null);
      setSuccessMsg(null);

      // Estimate baseline buyback price (e.g. 95% of current market price)
      const fallbackPrice = holding.currentUnitPrice
        ? Math.round(holding.currentUnitPrice * 0.95)
        : 64500;
      setBuybackPrice(fallbackPrice);

      // Fetch live admin-configured buyback price if commodityId is available
      if (holding.commodityId) {
        setIsLoadingPrice(true);
        fetch(`/api/buybacks/price?commodityId=${holding.commodityId}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.buybackPrice) {
              setBuybackPrice(data.buybackPrice);
            }
          })
          .catch((err) => {
            console.warn('[RequestBuybackModal] Could not fetch live price, using fallback:', err);
          })
          .finally(() => {
            setIsLoadingPrice(false);
          });
      }
    }
  }, [isOpen, holding]);

  if (!isOpen || !holding) return null;

  const maxQty = Math.max(1, holding.availableQuantity);
  const unit = holding.commodityUnit || 'bags';
  const totalPayout = quantity * buybackPrice;

  // Stepper handlers clamped between 1 and availableQuantity
  const handleDecrement = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrement = () => {
    setQuantity((prev) => Math.min(maxQty, prev + 1));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) {
      setQuantity(1);
    } else {
      setQuantity(Math.min(maxQty, Math.max(1, val)));
    }
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/buybacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holdingId: holding.id,
          quantity,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit buyback request.');
      }

      setSuccessMsg('Buyback request submitted successfully! Redirecting...');
      setTimeout(() => {
        onClose();
        router.push('/buyback');
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#4A3828]/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal Dialog Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="buyback-modal-title"
        className="w-full sm:max-w-lg bg-[#F7F4EA] border border-[#E4DCC8] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-300"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4DCC8]">
          <div>
            <h2 id="buyback-modal-title" className="font-serif text-xl font-bold text-[#4A3828]">
              Request Buyback
            </h2>
            <p className="font-sans-inter text-xs text-[#A88958] mt-0.5">
              Liquidate stored commodity directly to KorraStore
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#4A3828]/70 hover:text-[#4A3828] hover:bg-[#E4DCC8]/50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Commodity Details Card */}
          <div className="bg-[#FAF8F2] border border-[#E4DCC8] rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="font-serif font-bold text-base text-[#4A3828]">
                {holding.commodityName}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <GradeBadge grade={(holding.gradeName as any) || 'Grade A'} size="sm" />
                <span className="text-xs font-sans-inter text-[#A88958]">
                  {holding.warehouseName || 'KorraStore Warehouse'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-sans-inter text-[#A88958] block">Available</span>
              <span className="font-sans-mono font-bold text-sm text-[#21483A]">
                {holding.availableQuantity} {unit}
              </span>
            </div>
          </div>

          {/* Current Buyback Price Strip */}
          <div className="bg-[#FFFFFF] border border-[#E4DCC8] rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-sans-inter font-semibold uppercase tracking-wider text-[#A88958]">
                Current Buyback Price
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium font-sans-inter bg-[#A88958]/15 text-[#A88958]">
                ▼ 1.2% (7d)
              </span>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-sans-mono text-2xl font-bold text-[#4A3828]">
                {isLoadingPrice ? (
                  <span className="animate-pulse text-sm text-[#A88958]">Updating price...</span>
                ) : (
                  `₦${buybackPrice.toLocaleString('en-NG')}`
                )}
              </span>
              <span className="text-xs font-sans-inter text-[#A88958]">/ {unit}</span>
            </div>
          </div>

          {/* Quantity Stepper Input */}
          <div>
            <label className="block text-xs font-sans-inter font-semibold text-[#4A3828] mb-2">
              Quantity to sell back
            </label>

            <div className="flex items-center gap-3">
              <div className="flex items-center border-2 border-[#E4DCC8] bg-white rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={quantity <= 1 || isSubmitting}
                  className="w-11 h-11 flex items-center justify-center text-[#4A3828] hover:bg-[#F7F4EA] disabled:opacity-30 disabled:cursor-not-allowed font-bold text-lg transition-colors"
                >
                  −
                </button>

                <input
                  type="number"
                  min="1"
                  max={maxQty}
                  value={quantity}
                  onChange={handleQuantityChange}
                  disabled={isSubmitting}
                  className="w-16 h-11 text-center font-sans-mono font-bold text-base text-[#4A3828] bg-transparent focus:outline-none"
                />

                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={quantity >= maxQty || isSubmitting}
                  className="w-11 h-11 flex items-center justify-center text-[#4A3828] hover:bg-[#F7F4EA] disabled:opacity-30 disabled:cursor-not-allowed font-bold text-lg transition-colors"
                >
                  +
                </button>
              </div>

              <span className="font-sans-inter text-sm font-medium text-[#4A3828]">
                {unit}
              </span>

              <span className="ml-auto text-xs font-sans-inter text-[#A88958]">
                (Max: {maxQty} {unit})
              </span>
            </div>
          </div>

          {/* Payout Estimate Box */}
          <div className="bg-[#FAF8F2] border border-[#D8B56A]/60 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-sans-inter font-semibold text-[#4A3828]">
                You will receive (est.):
              </span>
              <span className="font-sans-mono text-xl font-bold text-[#21483A]">
                ₦{totalPayout.toLocaleString('en-NG')}
              </span>
            </div>
            <p className="text-[11px] font-sans-inter text-[#A88958] mt-1">
              Actual payout processed and credited to your account upon admin approval.
            </p>
          </div>

          {/* Review Notice Alert Box */}
          <div className="flex items-start gap-2.5 p-3.5 bg-[#D8B56A]/15 border border-[#D8B56A]/30 rounded-xl">
            <svg className="w-4 h-4 text-[#A88958] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-sans-inter text-xs text-[#4A3828]">
              Buyback requests are reviewed by KorraStore and typically processed within <span className="font-semibold text-[#21483A]">3–5 business days</span>.
            </p>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3 bg-[#B3432E]/10 border border-[#B3432E]/30 rounded-xl text-xs font-sans-inter text-[#B3432E]">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-[#21483A]/10 border border-[#21483A]/30 rounded-xl text-xs font-sans-inter text-[#21483A] font-semibold">
              {successMsg}
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isSubmitting || quantity > maxQty}
            className="w-full h-12 rounded-xl font-sans-inter font-bold text-sm bg-[#D8B56A] hover:bg-[#A88958] text-[#4A3828] hover:text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-4 h-4 text-current" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing Request...
              </>
            ) : (
              'Submit Buyback Request'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
