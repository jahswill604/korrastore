// components/admin/pricing/price-delta-preview.tsx — Dynamic Price Delta Calculation Widget.
// Computes and renders real-time absolute (₦) and percentage (%) deltas for sale and buyback prices.
// Used in: components/admin/pricing/update-price-modal.tsx

'use client';

import React from 'react';

interface PriceDeltaPreviewProps {
  currentSalePrice: number;
  newSalePrice: number;
  currentBuybackPrice: number;
  newBuybackPrice: number;
  unit?: string;
}

// ----------------------------------------------------------------------------
// PriceDeltaPreview Component
// ----------------------------------------------------------------------------
export function PriceDeltaPreview({
  currentSalePrice,
  newSalePrice,
  currentBuybackPrice,
  newBuybackPrice,
  unit = 'kg',
}: PriceDeltaPreviewProps) {
  // 1. Calculate Sale Price Deltas
  const saleDiff = newSalePrice - currentSalePrice;
  const salePct =
    currentSalePrice > 0 ? (saleDiff / currentSalePrice) * 100 : 0;
  const isSalePositive = saleDiff >= 0;

  // 2. Calculate Buyback Price Deltas
  const buybackDiff = newBuybackPrice - currentBuybackPrice;
  const buybackPct =
    currentBuybackPrice > 0 ? (buybackDiff / currentBuybackPrice) * 100 : 0;
  const isBuybackPositive = buybackDiff >= 0;

  // 3. Compute Current & New Platform Liquidity Spread
  const newSpreadPct =
    newSalePrice > 0
      ? ((newSalePrice - newBuybackPrice) / newSalePrice) * 100
      : 0;

  return (
    <div className="bg-[#FAF8F2] border border-[#E4DCC8] rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold text-[#4A3828] uppercase tracking-wider">
        <span>Live Valuation Impact</span>
        <span className="text-[#A88958] font-normal normal-case font-mono">
          Spread: {newSpreadPct.toFixed(1)}%
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Sale Price Delta Badge */}
        <div
          className={`p-3 rounded-lg border ${
            isSalePositive
              ? 'bg-[#EBF5F0] border-[#21483A]/20 text-[#21483A]'
              : 'bg-[#FDF0ED] border-[#B3432E]/20 text-[#B3432E]'
          }`}
        >
          <div className="text-[11px] font-medium opacity-80 mb-0.5">
            Sale Price Delta
          </div>
          <div className="text-sm font-mono font-bold">
            {isSalePositive ? '+' : ''}₦{saleDiff.toLocaleString()}/{unit}
          </div>
          <div className="text-xs font-mono font-semibold mt-0.5">
            {isSalePositive ? '+' : ''}
            {salePct.toFixed(2)}%
          </div>
        </div>

        {/* Buyback Price Delta Badge */}
        <div
          className={`p-3 rounded-lg border ${
            isBuybackPositive
              ? 'bg-[#EBF5F0] border-[#21483A]/20 text-[#21483A]'
              : 'bg-[#FDF0ED] border-[#B3432E]/20 text-[#B3432E]'
          }`}
        >
          <div className="text-[11px] font-medium opacity-80 mb-0.5">
            Buyback Delta
          </div>
          <div className="text-sm font-mono font-bold">
            {isBuybackPositive ? '+' : ''}₦{buybackDiff.toLocaleString()}/{unit}
          </div>
          <div className="text-xs font-mono font-semibold mt-0.5">
            {isBuybackPositive ? '+' : ''}
            {buybackPct.toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  );
}
