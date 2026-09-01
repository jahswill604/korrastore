// components/admin/pricing/pricing-table.tsx — Admin Pricing Table and Mobile Cards with Search & Modals.
// Renders responsive pricing overview with live sparkline visualizations and price update triggers.
// Used in: app/admin/pricing/page.tsx

'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminPricingCommodity } from '@/lib/types/admin-pricing';
import { UpdatePriceModal } from '@/components/admin/pricing/update-price-modal';

interface PricingTableProps {
  initialCommodities: AdminPricingCommodity[];
}

// ----------------------------------------------------------------------------
// Mini Sparkline SVG Renderer
// ----------------------------------------------------------------------------
function MiniSparkline({ data, isPositive }: { data: number[]; isPositive: boolean }) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 80;
  const height = 24;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const strokeColor = isPositive ? '#21483A' : '#B3432E';

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

// ----------------------------------------------------------------------------
// PricingTable Component
// ----------------------------------------------------------------------------
export function PricingTable({ initialCommodities }: PricingTableProps) {
  const router = useRouter();
  const [commodities, setCommodities] = useState<AdminPricingCommodity[]>(initialCommodities);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCommodity, setSelectedCommodity] = useState<AdminPricingCommodity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Filtered commodities based on search query
  const filteredCommodities = useMemo(() => {
    if (!searchQuery.trim()) return commodities;
    const q = searchQuery.toLowerCase();
    return commodities.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [commodities, searchQuery]);

  const handleOpenModal = (commodity: AdminPricingCommodity) => {
    setSelectedCommodity(commodity);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCommodity(null);
  };

  const handleUpdateSuccess = () => {
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#F7F4EA] p-3 rounded-xl border border-[#E4DCC8]">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A88958] text-sm">
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search commodity name or code..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-[#E4DCC8] bg-white text-[#4A3828] placeholder-[#A88958] focus:outline-hidden focus:border-[#D8B56A]"
          />
        </div>
        <div className="text-xs text-[#A88958] font-medium self-center">
          Showing <span className="font-bold text-[#4A3828]">{filteredCommodities.length}</span> commodities
        </div>
      </div>

      {/* Desktop Table (≥1024px) */}
      <div className="hidden lg:block bg-[#F7F4EA] border border-[#E4DCC8] rounded-xl overflow-hidden shadow-2xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E4DCC8] bg-[#FAF8F2] text-[11px] font-semibold uppercase tracking-wider text-[#4A3828]">
              <th className="py-3 px-4">Commodity</th>
              <th className="py-3 px-4">Grades</th>
              <th className="py-3 px-4">Current Sale Price</th>
              <th className="py-3 px-4">Buyback Price</th>
              <th className="py-3 px-4">30d Trend</th>
              <th className="py-3 px-4">Last Updated</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4DCC8] text-xs">
            {filteredCommodities.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[#A88958]">
                  No commodities found matching &quot;{searchQuery}&quot;.
                </td>
              </tr>
            ) : (
              filteredCommodities.map((comm) => {
                const isPositive = comm.gain_loss_30d_pct >= 0;
                const formattedDate = comm.updated_at
                  ? new Date(comm.updated_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'N/A';

                return (
                  <tr key={comm.id} className="hover:bg-white/60 transition-colors">
                    {/* Commodity Title & Code */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#4A3828]">{comm.name}</div>
                      <div className="text-[11px] font-mono text-[#A88958] mt-0.5">
                        {comm.code}
                      </div>
                    </td>

                    {/* Grade Badges */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {comm.grades && comm.grades.length > 0 ? (
                          comm.grades.map((g) => (
                            <span
                              key={g.id}
                              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#21483A]/10 text-[#21483A] border border-[#21483A]/20"
                            >
                              {g.code || g.name}
                            </span>
                          ))
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#21483A]/10 text-[#21483A]">
                            Standard
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Current Sale Price */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-[#4A3828] text-sm">
                        ₦{comm.current_price.toLocaleString()}
                        <span className="text-[11px] font-normal text-[#A88958]">
                          /{comm.unit}
                        </span>
                      </div>
                    </td>

                    {/* Buyback Price */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-[#4A3828] text-sm">
                        ₦{comm.buyback_price.toLocaleString()}
                        <span className="text-[11px] font-normal text-[#A88958]">
                          /{comm.unit}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#A88958]">
                        Spread: {Math.round(((comm.current_price - comm.buyback_price) / comm.current_price) * 100)}%
                      </div>
                    </td>

                    {/* 30d Trend Sparkline */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <MiniSparkline data={comm.sparkline} isPositive={isPositive} />
                        <span
                          className={`text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                            isPositive
                              ? 'bg-[#EBF5EE] text-[#21483A]'
                              : 'bg-[#FDF0ED] text-[#B3432E]'
                          }`}
                        >
                          {isPositive ? '+' : ''}
                          {comm.gain_loss_30d_pct}%
                        </span>
                      </div>
                    </td>

                    {/* Last Updated */}
                    <td className="py-3.5 px-4 text-[#A88958] text-[11px]">
                      {formattedDate}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenModal(comm)}
                        className="px-3.5 py-1.5 rounded-lg bg-[#D8B56A] hover:bg-[#c9a456] text-[#4A3828] font-bold text-xs shadow-2xs transition-all cursor-pointer"
                      >
                        Update Price
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Cards (<1024px) */}
      <div className="lg:hidden space-y-3">
        {filteredCommodities.length === 0 ? (
          <div className="p-8 text-center bg-[#F7F4EA] border border-[#E4DCC8] rounded-xl text-[#A88958] text-xs">
            No commodities found matching &quot;{searchQuery}&quot;.
          </div>
        ) : (
          filteredCommodities.map((comm) => {
            const isPositive = comm.gain_loss_30d_pct >= 0;

            return (
              <div
                key={comm.id}
                className="bg-[#F7F4EA] border border-[#E4DCC8] rounded-xl p-4 shadow-2xs space-y-3"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-[#4A3828] text-sm">
                      {comm.name}
                    </h3>
                    <div className="text-[11px] font-mono text-[#A88958]">
                      {comm.code}
                    </div>
                  </div>
                  <span
                    className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                      isPositive
                        ? 'bg-[#EBF5EE] text-[#21483A]'
                        : 'bg-[#FDF0ED] text-[#B3432E]'
                    }`}
                  >
                    {isPositive ? '+' : ''}
                    {comm.gain_loss_30d_pct}%
                  </span>
                </div>

                {/* Pricing Grid */}
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-white border border-[#E4DCC8] rounded-lg">
                  <div>
                    <div className="text-[10px] text-[#A88958] uppercase font-semibold">
                      Sale Price
                    </div>
                    <div className="font-mono font-bold text-xs text-[#4A3828] mt-0.5">
                      ₦{comm.current_price.toLocaleString()}/{comm.unit}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#A88958] uppercase font-semibold">
                      Buyback Price
                    </div>
                    <div className="font-mono font-bold text-xs text-[#4A3828] mt-0.5">
                      ₦{comm.buyback_price.toLocaleString()}/{comm.unit}
                    </div>
                  </div>
                </div>

                {/* Action Trigger */}
                <button
                  type="button"
                  onClick={() => handleOpenModal(comm)}
                  className="w-full py-2 rounded-lg bg-[#D8B56A] hover:bg-[#c9a456] text-[#4A3828] font-bold text-xs shadow-2xs transition-all cursor-pointer text-center"
                >
                  Update Price
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Slide-over Update Modal */}
      <UpdatePriceModal
        commodity={selectedCommodity}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleUpdateSuccess}
      />
    </div>
  );
}
