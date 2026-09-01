// components/admin/pricing/pricing-metrics.tsx — Admin Pricing Operational Stat Cards.
// Renders 4 high-level summary cards: Total Priced Commodities, Average Spread,
// Highest 30d Gainer, and Last Global Price Update.
// Used in: app/admin/pricing/page.tsx

import React from 'react';
import type { PricingMetricsData } from '@/lib/types/admin-pricing';

interface PricingMetricsProps {
  metrics: PricingMetricsData;
}

// ----------------------------------------------------------------------------
// PricingMetrics Component
// ----------------------------------------------------------------------------
export function PricingMetrics({ metrics }: PricingMetricsProps) {
  // Format formatted last update date
  const formattedUpdate = metrics.last_global_update
    ? new Date(metrics.last_global_update).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Just now';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Total Priced Commodities */}
      <div className="bg-[#F7F4EA] border border-[#E4DCC8] rounded-xl p-4 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#A88958] mb-1">
          Total Priced Commodities
        </div>
        <div className="text-2xl font-bold font-mono text-[#4A3828]">
          {metrics.total_priced_commodities}
        </div>
        <div className="text-xs text-[#A88958] mt-1 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#21483A]" />
          All active catalog SKUs
        </div>
      </div>

      {/* 2. Average Marketplace Spread */}
      <div className="bg-[#F7F4EA] border border-[#E4DCC8] rounded-xl p-4 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#A88958] mb-1">
          Average Buyback Spread
        </div>
        <div className="text-2xl font-bold font-mono text-[#4A3828]">
          {metrics.avg_spread_pct.toFixed(1)}%
        </div>
        <div className="text-xs text-[#A88958] mt-1">
          Platform liquidation margin
        </div>
      </div>

      {/* 3. Highest 30d Gainer */}
      <div className="bg-[#F7F4EA] border border-[#E4DCC8] rounded-xl p-4 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#A88958] mb-1">
          Highest 30d Gainer
        </div>
        <div className="text-xl font-bold text-[#4A3828] truncate">
          {metrics.highest_gainer?.commodity_name ?? 'Stable Markets'}
        </div>
        <div className="text-xs font-mono font-semibold text-[#21483A] mt-1">
          {metrics.highest_gainer
            ? `+${metrics.highest_gainer.gain_pct.toFixed(1)}% gain`
            : 'No major shifts'}
        </div>
      </div>

      {/* 4. Last Global Price Update */}
      <div className="bg-[#F7F4EA] border border-[#E4DCC8] rounded-xl p-4 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#A88958] mb-1">
          Last Price Update
        </div>
        <div className="text-lg font-bold text-[#4A3828] truncate">
          {formattedUpdate}
        </div>
        <div className="text-xs text-[#A88958] mt-1">
          Automated valuation sync active
        </div>
      </div>
    </div>
  );
}
