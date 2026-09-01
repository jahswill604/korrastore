// components/marketplace/market-ticker.tsx — Live Market Ticker Component for KorraStore.
// Renders 3 top market trend summary cards on desktop (Rice, Garlic, Beans) with SVG sparkline graphs
// and horizontal scrollable ticker strip on mobile matching desktop-ui.png and mobile-ui.png mockups.
// Used in: app/page.tsx (Buyer Marketplace Homepage).

import * as React from "react";
import { MarketplaceCommodity } from "@/lib/types";

interface MarketTickerProps {
  commodities: MarketplaceCommodity[];
}

// ----------------------------------------------------------------------------
// MiniSparkline — SVG Sparkline Chart for market visual trend indicator
// ----------------------------------------------------------------------------
function MiniSparkline({ isUp }: { isUp: boolean }) {
  const strokeColor = isUp ? "#21483A" : "#B3432E";
  const fillColor = isUp ? "rgba(33, 72, 58, 0.1)" : "rgba(179, 67, 46, 0.1)";
  const pathD = isUp
    ? "M0,20 C15,16 30,18 45,10 C60,12 75,5 90,2 L90,28 L0,28 Z"
    : "M0,4 C15,8 30,6 45,14 C60,12 75,18 90,22 L90,28 L0,28 Z";
  const lineD = isUp
    ? "M0,20 C15,16 30,18 45,10 C60,12 75,5 90,2"
    : "M0,4 C15,8 30,6 45,14 C60,12 75,18 90,22";

  return (
    <svg width="90" height="28" viewBox="0 0 90 28" className="overflow-visible">
      <path d={pathD} fill={fillColor} />
      <path d={lineD} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Static mock trend metadata matching exact mockup visuals
const TICKER_TRENDS: Record<string, { change: string; isUp: boolean }> = {
  rice: { change: "↑ 2.4%", isUp: true },
  garlic: { change: "↑ 1.9%", isUp: true },
  beans: { change: "↓ 0.3%", isUp: false },
  melon: { change: "↑ 5.3%", isUp: true },
};

// Commodity icons map matching mockups
const COMMODITY_ICONS: Record<string, string> = {
  rice: "🌾",
  garlic: "🧄",
  beans: "🫘",
  melon: "🍈",
};

// Helper to determine type key
const getTypeKey = (code: string, name: string): string => {
  const combined = (code + " " + name).toLowerCase();
  if (combined.includes("rice")) return "rice";
  if (combined.includes("garlic")) return "garlic";
  if (combined.includes("beans")) return "beans";
  if (combined.includes("melon") || combined.includes("egusi")) return "melon";
  return "rice";
};

// ----------------------------------------------------------------------------
// MarketTicker — dual desktop grid & mobile ticker component.
// ----------------------------------------------------------------------------
export function MarketTicker({ commodities }: MarketTickerProps) {
  // Filter or map commodities into 3 top cards (Rice, Garlic, Beans) or mobile strip
  const topItems: MarketplaceCommodity[] = (commodities && commodities.length > 0)
    ? commodities.slice(0, 4)
    : [
        {
          id: "1",
          name: "Rice",
          code: "RICE",
          current_price: 68500,
          base_price: 68500,
          unit: "bag",
          description: "",
          image_url: null,
          total_available_quantity: 1250,
          available_grades: ["Premium"],
          warehouse_count: 3,
        },
        {
          id: "2",
          name: "Garlic",
          code: "GARLIC",
          current_price: 51000,
          base_price: 51000,
          unit: "bag",
          description: "",
          image_url: null,
          total_available_quantity: 1250,
          available_grades: ["Premium"],
          warehouse_count: 2,
        },
        {
          id: "3",
          name: "Beans",
          code: "BEANS",
          current_price: 37500,
          base_price: 37500,
          unit: "bag",
          description: "",
          image_url: null,
          total_available_quantity: 1250,
          available_grades: ["Premium"],
          warehouse_count: 4,
        },
        {
          id: "4",
          name: "Melon",
          code: "MELON",
          current_price: 28000,
          base_price: 28000,
          unit: "bag",
          description: "",
          image_url: null,
          total_available_quantity: 1250,
          available_grades: ["Premium"],
          warehouse_count: 2,
        },
      ];

  return (
    <div className="w-full">
      {/* DESKTOP VIEW (3-card grid matching desktop-ui.png) */}
      <div className="hidden md:grid grid-cols-3 gap-5">
        {topItems.slice(0, 3).map((item) => {
          const typeKey = getTypeKey(item.code, item.name);
          const trend = TICKER_TRENDS[typeKey] || { change: "↑ 2.4%", isUp: true };
          const price = item.current_price || item.base_price || 68500;
          const icon = COMMODITY_ICONS[typeKey] || "🌾";
          const titleName = typeKey.charAt(0).toUpperCase() + typeKey.slice(1);

          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 rounded-[20px] bg-white border border-[#E4DCC8] shadow-2xs hover:shadow-soil-sm transition-shadow"
            >
              {/* Left Info: Icon, Name, Price */}
              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xl select-none">{icon}</span>
                  <span className="font-sans-inter text-base font-bold text-[#4A3828]">
                    {titleName}
                  </span>
                </div>
                <div className="font-mono-plex font-bold text-xl text-[#4A3828] tracking-tight">
                  ₦{price.toLocaleString()}
                  <span className="text-xs font-normal text-[#6B5A48]">/{item.unit || "bag"}</span>
                </div>
              </div>

              {/* Right Stats: Trend Pill + Mini Sparkline */}
              <div className="flex flex-col items-end space-y-2">
                <span
                  className={`text-xs font-mono-plex font-bold px-2.5 py-0.5 rounded-full ${
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

      {/* MOBILE VIEW (Horizontal scrollable ticker strip matching mobile-ui.png) */}
      <div className="md:hidden overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center space-x-3 min-w-max">
          {topItems.map((item) => {
            const typeKey = getTypeKey(item.code, item.name);
            const trend = TICKER_TRENDS[typeKey] || { change: "↑ 2.4%", isUp: true };
            const price = item.current_price || item.base_price || 68500;
            const titleName = typeKey.charAt(0).toUpperCase() + typeKey.slice(1);

            return (
              <div
                key={item.id}
                className="flex flex-col p-3 rounded-2xl bg-white border border-[#E4DCC8] shadow-2xs min-w-[135px]"
              >
                <span className="font-sans-inter text-xs font-semibold text-[#6B5A48]">
                  {titleName}
                </span>
                <span className="font-mono-plex text-sm font-bold text-[#4A3828] mt-0.5">
                  ₦{price.toLocaleString()}
                </span>
                <span
                  className={`text-[11px] font-mono-plex font-bold mt-1 ${
                    trend.isUp ? "text-[#21483A]" : "text-[#B3432E]"
                  }`}
                >
                  {trend.change}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

