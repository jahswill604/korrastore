// components/admin/pricing/update-price-modal.tsx — Slide-over Drawer & Modal for Updating Commodity Prices.
// Allows administrators to set new sale and buyback prices with real-time delta preview and historical charts.
// Executes atomic updates via POST /api/admin/pricing.
// Used in: components/admin/pricing/pricing-table.tsx

'use client';

import React, { useState, useEffect } from 'react';
import type {
  AdminPricingCommodity,
  PriceHistoryPoint,
} from '@/lib/types/admin-pricing';
import { PriceDeltaPreview } from '@/components/admin/pricing/price-delta-preview';
import { AdminPriceHistoryChart } from '@/components/admin/pricing/admin-price-history-chart';

interface UpdatePriceModalProps {
  commodity: AdminPricingCommodity | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// ----------------------------------------------------------------------------
// UpdatePriceModal Component
// ----------------------------------------------------------------------------
export function UpdatePriceModal({
  commodity,
  isOpen,
  onClose,
  onSuccess,
}: UpdatePriceModalProps) {
  const [selectedGradeId, setSelectedGradeId] = useState<string>('');
  const [newSalePrice, setNewSalePrice] = useState<number>(0);
  const [newBuybackPrice, setNewBuybackPrice] = useState<number>(0);
  const [changeReason, setChangeReason] = useState<string>('');
  const [history, setHistory] = useState<PriceHistoryPoint[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize form state when commodity changes or modal opens
  useEffect(() => {
    if (commodity && isOpen) {
      setNewSalePrice(commodity.current_price);
      setNewBuybackPrice(commodity.buyback_price);
      setChangeReason('');
      setErrorMessage(null);

      // Default to first grade or empty
      if (commodity.grades && commodity.grades.length > 0) {
        setSelectedGradeId(commodity.grades[0].id);
      } else {
        setSelectedGradeId('');
      }

      // Fetch price history points for chart
      fetchHistory(commodity.id);
    }
  }, [commodity, isOpen]);

  // Fetch price history from API
  const fetchHistory = async (commodityId: string) => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/admin/pricing/${commodityId}/history`);
      if (res.ok) {
        const json = await res.json();
        setHistory(json.history || []);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Auto-calculate suggested buyback price (90% spread) when sale price changes
  const handleSalePriceChange = (val: number) => {
    setNewSalePrice(val);
    // Keep buyback price proportionate if user hasn't explicitly set custom spread
    if (val > 0) {
      setNewBuybackPrice(Math.round(val * 0.9));
    }
  };

  // Submit atomic update to API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commodity) return;

    if (newSalePrice <= 0) {
      setErrorMessage('Sale price must be greater than zero.');
      return;
    }

    if (newBuybackPrice <= 0) {
      setErrorMessage('Buyback price must be greater than zero.');
      return;
    }

    if (newBuybackPrice >= newSalePrice) {
      setErrorMessage('Buyback liquidation price must be lower than marketplace sale price.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commodity_id: commodity.id,
          grade_id: selectedGradeId || null,
          new_sale_price: newSalePrice,
          new_buyback_price: newBuybackPrice,
          change_reason: changeReason || 'Admin price update',
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Failed to update pricing');
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred while updating price';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !commodity) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-end animate-fadeIn">
      {/* Slide-over Container */}
      <div className="relative w-full max-w-xl bg-[#F7F4EA] min-h-screen border-l border-[#E4DCC8] p-6 shadow-2xl overflow-y-auto flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E4DCC8]">
            <div>
              <h2 className="text-xl font-bold font-serif text-[#4A3828]">
                Update Commodity Price
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-semibold text-[#4A3828]">
                  {commodity.name}
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#E4DCC8]/60 text-[#4A3828]">
                  {commodity.code}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-[#A88958] hover:text-[#4A3828] hover:bg-[#E4DCC8]/40 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="my-4 p-3 rounded-lg bg-[#FDF0ED] border border-[#B3432E]/30 text-[#B3432E] text-xs">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form id="price-form" onSubmit={handleSubmit} className="space-y-5 my-4">
            {/* Grade Selector (if commodity has multiple grades) */}
            {commodity.grades && commodity.grades.length > 0 && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A3828] mb-2">
                  Select Grade
                </label>
                <div className="flex flex-wrap gap-2">
                  {commodity.grades.map((grade) => (
                    <button
                      key={grade.id}
                      type="button"
                      onClick={() => setSelectedGradeId(grade.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        selectedGradeId === grade.id
                          ? 'bg-[#21483A] text-white border-[#21483A]'
                          : 'bg-white text-[#4A3828] border-[#E4DCC8] hover:border-[#A88958]'
                      }`}
                    >
                      {grade.name} ({grade.code})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Current Benchmark Prices (Read-only) */}
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-white border border-[#E4DCC8] rounded-xl">
              <div>
                <div className="text-[11px] text-[#A88958] font-medium">
                  Current Sale Price
                </div>
                <div className="text-sm font-mono font-bold text-[#4A3828]">
                  ₦{commodity.current_price.toLocaleString()}/{commodity.unit}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[#A88958] font-medium">
                  Current Buyback Price
                </div>
                <div className="text-sm font-mono font-bold text-[#4A3828]">
                  ₦{commodity.buyback_price.toLocaleString()}/{commodity.unit}
                </div>
              </div>
            </div>

            {/* New Price Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* New Sale Price */}
              <div>
                <label className="block text-xs font-semibold text-[#4A3828] mb-1.5">
                  New Sale Price (₦ / {commodity.unit}) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  value={newSalePrice || ''}
                  onChange={(e) => handleSalePriceChange(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DCC8] bg-white font-mono text-[#4A3828] text-sm focus:outline-hidden focus:border-[#D8B56A] focus:ring-1 focus:ring-[#D8B56A]"
                  placeholder="e.g. 1350"
                />
              </div>

              {/* New Buyback Price */}
              <div>
                <label className="block text-xs font-semibold text-[#4A3828] mb-1.5">
                  New Buyback Price (₦ / {commodity.unit}) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  value={newBuybackPrice || ''}
                  onChange={(e) => setNewBuybackPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DCC8] bg-white font-mono text-[#4A3828] text-sm focus:outline-hidden focus:border-[#D8B56A] focus:ring-1 focus:ring-[#D8B56A]"
                  placeholder="e.g. 1200"
                />
              </div>
            </div>

            {/* Change Reason */}
            <div>
              <label className="block text-xs font-semibold text-[#4A3828] mb-1.5">
                Update Reason / Market Driver (Optional)
              </label>
              <input
                type="text"
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4DCC8] bg-white text-xs text-[#4A3828] focus:outline-hidden focus:border-[#D8B56A]"
                placeholder="e.g. Weekly northern grain terminal benchmark adjustment"
              />
            </div>

            {/* Live Delta Preview Widget */}
            <PriceDeltaPreview
              currentSalePrice={commodity.current_price}
              newSalePrice={newSalePrice}
              currentBuybackPrice={commodity.buyback_price}
              newBuybackPrice={newBuybackPrice}
              unit={commodity.unit}
            />

            {/* Interactive Price History Chart */}
            <AdminPriceHistoryChart
              history={history}
              commodityName={commodity.name}
              unit={commodity.unit}
            />

            {/* Safety & Propagation Invariant Notice */}
            <div className="p-3 bg-[#FAF8F2] border border-[#E4DCC8] rounded-xl flex items-start gap-2.5">
              <span className="text-base">🛡️</span>
              <div className="text-[11px] text-[#6B5A48] leading-relaxed">
                <span className="font-semibold text-[#4A3828]">Safe Dynamic Propagation:</span>{' '}
                Saving updates <code className="font-mono text-[10px] bg-[#E4DCC8]/40 px-1 py-0.5 rounded">price_history</code> and catalog prices. Customer portfolio valuations in My Storage are recalculated dynamically without modifying individual storage holding rows.
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#E4DCC8] flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl border border-[#E4DCC8] text-xs font-semibold text-[#4A3828] hover:bg-[#E4DCC8]/40 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="price-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-[#D8B56A] hover:bg-[#c9a456] text-[#4A3828] font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-[#4A3828] border-t-transparent rounded-full animate-spin" />
                Propagating Price...
              </>
            ) : (
              'Confirm & Propagate'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
