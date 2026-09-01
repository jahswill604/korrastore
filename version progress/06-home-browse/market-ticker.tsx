// components/marketplace/market-ticker.tsx — Live Market Ticker Component for KorraStore.
// Renders horizontal market ticker cards with live prices, percentage trend badges,
// and SVG sparkline charts matching the approved desktop and mobile UI mockups.
// Used in: app/page.tsx (Buyer Marketplace Homepage).

import * as React from "react";
import { MarketplaceCommodity } from "@/lib/types";

interface MarketTickerProps {
  commodities: MarketplaceCommodity[];
}

// Helper to extract category key from commodity code/name
const getTypeKey = (code: string, name: string): string => {
  const combined = (code + " " + name).toLowerCase();
  if (combined.includes("rice")) return "rice";
  if (combined.includes("garlic")) return "garlic";
  if (combined.includes("beans")) return "beans";
  if (combined.includes("melon") || combined.includes("egusi")) return "melon";
  return "rice";
};

// SVG Sparkline Chart for market visual indicator
function MiniSparkline({ isUp }: { isUp: boolean }) {
  const strokeColor = isUp ? "#21483A" : "#B3432E";
  const fillColor = isUp ? "rgba(33, 72, 58, 0.12)" : "rgba(179, 67, 46, 0.12)";
  const pathD = isUp
    ? "M0,22 C12,18 24,20 36,12 C48,15 60,8 72,4 L72,28 L0,28 Z"
    : "M0,6 C12,10 24,8 36,16 C48,14 60,20 72,24 L72,28 L0,28 Z";
  const lineD = isUp
    ? "M0,22 C12,18 24,20 36,12 C48,15 60,8 72,4"
    : "M0,6 C12,10 24,8 36,16 C48,14 60,20 72,24";

  return (
    <svg width="60" height="24" viewBox="0 0 72 28" className="overflow-visible">
      <path d={pathD} fill={fillColor} />
      <path d={lineD} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ----------------------------------------------------------------------------
// MarketTicker — Renders horizontal live commodity price ticker cards.
// Matching UI mockup: white rounded cards, emoji icon, bold price, trend badge & sparkline.
// ----------------------------------------------------------------------------
export function MarketTicker({ commodities }: MarketTickerProps) {
  // Static mock trend metadata for ticker display matching mockups
  const tickerTrends: Record<string, { change: string; isUp: boolean }> = {
    rice: { change: "↑ 2.4%", isUp: true },
    garlic: { change: "↑ 1.9%", isUp: true },
    beans: { change: "↓ 0.3%", isUp: false },
    melon: { change: "↑ 5.3%", isUp: true },
  };

  if (!commodities || commodities.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-none">
      <div className="flex items-center gap-3.5 min-w-max">
        {commodities.map((item) => {
          const typeKey = getTypeKey(item.code, item.name);
          const trend = tickerTrends[typeKey] || { change: "↑ 1.2%", isUp: true };
          const price = item.current_price || item.base_price || 0;
          const emoji = typeKey === "rice" ? "🍚" : typeKey === "garlic" ? "🧄" : typeKey === "beans" ? "🫘" : "🍈";
          const displayName = item.name.split(" ")[0]; // e.g. Rice, Garlic, Beans

          return (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 bg-white border border-[#E4DCC8] px-4 py-3 rounded-2xl shadow-xs hover:shadow-soil-sm transition-all duration-200 min-w-[200px]"
            >
              {/* Left Column: Emoji + Name + Price */}
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-base select-none">{emoji}</span>
                  <span className="font-sans-inter text-xs font-bold text-[var(--soil)]">
                    {displayName}
                  </span>
                </div>
                <div className="font-mono-plex font-bold text-sm text-[var(--soil)] tracking-tight">
                  ₦{price.toLocaleString()}
                  <span className="text-[10px] font-normal text-[var(--soil-secondary)]">/{item.unit}</span>
                </div>
              </div>

              {/* Right Column: Trend Badge + Sparkline Graph */}
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`text-[10px] font-mono-plex font-bold px-2 py-0.5 rounded-full ${
                    trend.isUp
                      ? "bg-[#EBF5EE] text-[#21483A]"
                      : "bg-[#FDECEA] text-[#B3432E]"
                  }`}
                >
                  {trend.change}
                </span>
                <MiniSparkline isUp={trend.isUp} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
