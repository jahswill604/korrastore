// components/admin/pricing/admin-price-history-chart.tsx — Admin Interactive Price History Trend Chart.
// Renders an interactive Recharts line & area chart showing price trajectory for a commodity.
// Styled with KorraStore design tokens (Harvest Wheat #D8B56A stroke, Paper #F7F4EA bg, Soil #4A3828 text).
// Used in: components/admin/pricing/update-price-modal.tsx

'use client';

import React, { useState, useMemo } from 'react';
import type { PriceHistoryPoint } from '@/lib/types/admin-pricing';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface AdminPriceHistoryChartProps {
  history: PriceHistoryPoint[];
  commodityName: string;
  unit?: string;
}

type TimeRange = '7d' | '30d' | '90d' | 'All';

// ----------------------------------------------------------------------------
// AdminPriceHistoryChart Component
/**
 * Renders an interactive area chart showing historical prices for a commodity.
 *
 * @param history - Historical price points to display
 * @param commodityName - Commodity name shown in the chart title
 * @param unit - Price unit shown in the tooltip
 */
export function AdminPriceHistoryChart({
  history,
  commodityName,
  unit = 'kg',
}: AdminPriceHistoryChartProps) {
  const [range, setRange] = useState<TimeRange>('30d');
  // Client-mount guard for Recharts' ResponsiveContainer (avoids SSR/CSR
  // hydration mismatch on first paint).
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Filter history points based on selected range
  const filteredData = useMemo(() => {
    if (!history || history.length === 0) return [];
    if (range === '7d') return history.slice(-7);
    if (range === '30d') return history.slice(-14);
    if (range === '90d') return history.slice(-30);
    return history;
  }, [history, range]);

  // Compute min and max values for comfortable chart scaling
  const minPrice = useMemo(() => {
    if (filteredData.length === 0) return 0;
    const min = Math.min(...filteredData.map((d) => d.price));
    return Math.floor(min * 0.95);
  }, [filteredData]);

  const maxPrice = useMemo(() => {
    if (filteredData.length === 0) return 10000;
    const max = Math.max(...filteredData.map((d) => d.price));
    return Math.ceil(max * 1.05);
  }, [filteredData]);

  return (
    <div className="bg-[#FAF8F2] border border-[#E4DCC8] rounded-xl p-4 space-y-3">
      {/* Chart Header with Range Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[#4A3828]">
            Price History — {commodityName}
          </div>
          <div className="text-[11px] text-[#A88958] mt-0.5">
            Recorded price points from platform ledger
          </div>
        </div>

        {/* Range Selector */}
        <div className="flex items-center space-x-1 p-0.5 bg-[#F7F4EA] border border-[#E4DCC8] rounded-lg">
          {(['7d', '30d', 'All'] as TimeRange[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setRange(tab)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                range === tab
                  ? 'bg-[#D8B56A] text-[#4A3828] font-bold shadow-2xs'
                  : 'text-[#A88958] hover:text-[#4A3828]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Recharts Canvas */}
      <div className="h-[180px] w-full pt-1">
        {mounted && filteredData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filteredData}
              margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="adminPriceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D8B56A" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#D8B56A" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4DCC8" vertical={false} />
              <XAxis
                dataKey="formatted_date"
                stroke="#A88958"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#E4DCC8' }}
              />
              <YAxis
                domain={[minPrice, maxPrice]}
                stroke="#A88958"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `₦${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as PriceHistoryPoint;
                    return (
                      <div className="p-2.5 bg-white border border-[#E4DCC8] rounded-lg shadow-md">
                        <span className="block text-[10px] text-[#A88958] font-medium">
                          {data.formatted_date || data.recorded_at}
                        </span>
                        <span className="font-mono text-xs font-bold text-[#4A3828] block">
                          ₦{data.price.toLocaleString()} / {unit}
                        </span>
                        {data.change_reason && (
                          <span className="block text-[9px] text-[#21483A] mt-0.5">
                            {data.change_reason}
                          </span>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#D8B56A"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#adminPriceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center bg-[#F7F4EA] rounded-lg text-xs text-[#A88958]">
            Loading historical price chart...
          </div>
        )}
      </div>
    </div>
  );
}
