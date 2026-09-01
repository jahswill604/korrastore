// app/admin/pricing/page.tsx — Admin Pricing & Valuation Management Page (Server Component).
// Renders the commodity pricing control center for KorraStore administrators.
// Enables setting marketplace retail prices and platform buyback liquidation prices with
// atomic price_history ledger writes and dynamic portfolio valuation propagation.
// Security: Role-gated at layout + server query level.
// Used in: /admin/pricing route.

import * as React from 'react';
import {
  getAllCommodityPrices,
  getPricingMetrics,
} from '@/lib/supabase/queries/admin/pricing';
import { PricingMetrics } from '@/components/admin/pricing/pricing-metrics';
import { PricingTable } from '@/components/admin/pricing/pricing-table';

// ----------------------------------------------------------------------------
// Metadata
// ----------------------------------------------------------------------------
export const metadata = {
  title: 'Commodity Pricing & Valuation | KorraStore Admin',
  description:
    'Manage retail marketplace prices, buyback liquidation margins, and track price history across all KorraStore commodities.',
};

// ----------------------------------------------------------------------------
// AdminPricingPage Component
// ----------------------------------------------------------------------------
export default async function AdminPricingPage() {
  // Fetch pricing data & operational metrics parallelly
  const [commodities, metrics] = await Promise.all([
    getAllCommodityPrices(),
    getPricingMetrics(),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A3828]">
            Commodity Pricing & Valuation
          </h1>
          <p className="text-sm text-[#A88958] mt-1 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#21483A]" />
            Market Connected — Real-time ledger propagation active
          </p>
        </div>
      </div>

      {/* Operational Stat Cards */}
      <PricingMetrics metrics={metrics} />

      {/* Main Pricing Management Table & Drawer */}
      <PricingTable initialCommodities={commodities} />
    </div>
  );
}
