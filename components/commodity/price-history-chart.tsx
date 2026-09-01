// components/commodity/price-history-chart.tsx — Price History Line & Area Chart for Commodity Details.
// Renders an interactive Recharts line chart showing price trends across selectable range tabs (7d, 30d, 90d, All).
// Styled with KorraStore design tokens (Harvest Wheat stroke #D8B56A, Paper background #F7F4EA, Soil text #4A3828).
// Used in: app/commodities/[commodityId]/page.tsx

"use client";

import * as React from "react";
import { PriceHistoryPoint } from "@/lib/types";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface PriceHistoryChartProps {
  priceHistory: PriceHistoryPoint[];
  commodityName: string;
}

type TimeRange = "7d" | "30d" | "90d" | "All";

export function PriceHistoryChart({
  priceHistory,
  commodityName,
}: PriceHistoryChartProps) {
  const [range, setRange] = React.useState<TimeRange>("30d");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Filter data based on selected time range
  const filteredData = React.useMemo(() => {
    if (!priceHistory || priceHistory.length === 0) return [];
    if (range === "7d") return priceHistory.slice(-7);
    if (range === "30d") return priceHistory.slice(-30);
    if (range === "90d") return priceHistory.slice(-90);
    return priceHistory;
  }, [priceHistory, range]);

  // Compute min/max for chart Y-axis domain
  const minPrice = React.useMemo(() => {
    if (filteredData.length === 0) return 0;
    return Math.floor(Math.min(...filteredData.map((d) => d.price)) * 0.95);
  }, [filteredData]);

  const maxPrice = React.useMemo(() => {
    if (filteredData.length === 0) return 100000;
    return Math.ceil(Math.max(...filteredData.map((d) => d.price)) * 1.05);
  }, [filteredData]);

  const currentPrice = filteredData.length > 0 ? filteredData[filteredData.length - 1].price : 0;
  const startPrice = filteredData.length > 0 ? filteredData[0].price : 0;
  const priceChange = currentPrice - startPrice;
  const percentChange = startPrice > 0 ? ((priceChange / startPrice) * 100).toFixed(1) : "0.0";
  const isUp = priceChange >= 0;

  return (
    <div className="p-6 rounded-[24px] bg-white border border-[#E4DCC8] shadow-2xs space-y-5">
      {/* Header section with title and range filter tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-serif-display text-lg font-bold text-[#4A3828]">
              Price History Trend
            </h3>
            <span
              className={`text-xs font-mono-plex font-bold px-2.5 py-0.5 rounded-full ${
                isUp
                  ? "bg-[#EBF5EE] text-[#21483A]"
                  : "bg-[#FDECEA] text-[#B3432E]"
              }`}
            >
              {isUp ? `+${percentChange}%` : `${percentChange}%`}
            </span>
          </div>
          <p className="font-sans-inter text-xs text-[#6B5A48] mt-0.5">
            Historical price per bag for {commodityName} across certified KorraStore hubs.
          </p>
        </div>

        {/* Range Selector Tabs (7d, 30d, 90d, All) */}
        <div className="flex items-center space-x-1 p-1 bg-[#F7F4EA] border border-[#E4DCC8] rounded-full self-start md:self-auto">
          {(["7d", "30d", "90d", "All"] as TimeRange[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setRange(tab)}
              className={`px-3 py-1 rounded-full font-sans-inter text-xs font-semibold transition-all cursor-pointer ${
                range === tab
                  ? "bg-[#D8B56A] text-[#4A3828] shadow-2xs font-bold"
                  : "text-[#6B5A48] hover:text-[#4A3828]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[280px] w-full pt-2">
        {mounted && filteredData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHarvestWheat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D8B56A" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#D8B56A" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4DCC8" vertical={false} />
              <XAxis
                dataKey="formattedDate"
                stroke="#6B5A48"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#E4DCC8" }}
              />
              <YAxis
                domain={[minPrice, maxPrice]}
                stroke="#6B5A48"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `₦${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as PriceHistoryPoint;
                    return (
                      <div className="p-3 bg-white border border-[#E4DCC8] rounded-xl shadow-soil-md font-sans-inter">
                        <span className="block text-[11px] text-[#6B5A48] font-medium">
                          {data.formattedDate || data.date}
                        </span>
                        <span className="font-mono-plex text-sm font-bold text-[#4A3828]">
                          ₦{data.price.toLocaleString()} / bag
                        </span>
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
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorHarvestWheat)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center bg-[#F7F4EA] rounded-2xl text-[#6B5A48] text-xs font-sans-inter">
            Loading interactive price history chart...
          </div>
        )}
      </div>
    </div>
  );
}
