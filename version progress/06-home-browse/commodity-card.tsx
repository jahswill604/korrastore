// components/marketplace/commodity-card.tsx — Commodity Catalog Item Card for KorraStore.
// Renders individual commodity cards matching desktop-ui.png and mobile-ui.png mockups.
// Desktop: 4-column card grid with warm beige image container, DM Serif Display title, IBM Plex Mono price,
// +2.4% monthly trend, stock availability count, and View Details / Buy Now buttons.
// Mobile: horizontal split row card with square thumbnail, right stats, and full-width Buy Now button.
// Used in: app/page.tsx (Marketplace Commodity Grid).

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { MarketplaceCommodity } from "@/lib/types";
import { GradeBadge, CommodityGrade } from "@/components/ui/grade-badge";
import { cn } from "@/lib/utils";

export interface CommodityCardProps {
  commodity: MarketplaceCommodity;
  className?: string;
}

// Map commodity types to representative emojis
const COMMODITY_EMOJIS: Record<string, string> = {
  rice: "🍚",
  garlic: "🧄",
  beans: "🫘",
  melon: "🍈",
};

// Static trend map matching mockups
const COMMODITY_TRENDS: Record<string, { change: string; isUp: boolean }> = {
  rice: { change: "+2.4%", isUp: true },
  garlic: { change: "+1.9%", isUp: true },
  beans: { change: "-0.3%", isUp: false },
  melon: { change: "+5.3%", isUp: true },
};

// Helper function to extract type key from commodity code/name
const getTypeKey = (code: string, name: string): string => {
  const combined = (code + " " + name).toLowerCase();
  if (combined.includes("rice")) return "rice";
  if (combined.includes("garlic")) return "garlic";
  if (combined.includes("beans")) return "beans";
  if (combined.includes("melon") || combined.includes("egusi")) return "melon";
  return "rice";
};

// ----------------------------------------------------------------------------
// CommodityCard — dual desktop & mobile layout component.
// ----------------------------------------------------------------------------
export function CommodityCard({ commodity, className }: CommodityCardProps) {
  const formattedStock = commodity.total_available_quantity.toLocaleString("en-NG");
  const typeKey = getTypeKey(commodity.code, commodity.name);
  const emoji = COMMODITY_EMOJIS[typeKey] || "🌾";
  const trend = COMMODITY_TRENDS[typeKey] || { change: "+2.4%", isUp: true };
  const primaryGrade = (commodity.available_grades?.[0] || "Premium") as CommodityGrade;
  const price = commodity.current_price || commodity.base_price || 0;

  return (
    <div className={cn("group transition-all duration-200 hover:-translate-y-0.5", className)}>
      {/* =====================================================================
          DESKTOP LAYOUT (hidden md:flex flex-col)
          White card, 16px radius, warm beige thumbnail top, details + 2 CTAs below.
          ===================================================================== */}
      <div className="hidden md:flex flex-col justify-between rounded-2xl border border-[#E4DCC8] bg-white p-4 shadow-xs hover:shadow-soil-md h-full">
        <div>
          {/* Warm Beige Illustration Container */}
          <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-xl bg-[#F5EDD6] border border-[#E8DEC9]">
            {commodity.image_url ? (
              <Image
                src={commodity.image_url}
                alt={commodity.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 1024px) 50vw, 25vw"
              />
            ) : (
              <span className="text-6xl select-none transition-transform duration-300 group-hover:scale-110 drop-shadow-xs">
                {emoji}
              </span>
            )}

            {/* Top-Right Premium Grade Badge */}
            <div className="absolute top-3 right-3 z-10">
              <GradeBadge grade={primaryGrade} size="sm" />
            </div>
          </div>

          {/* Commodity Title */}
          <div className="mt-3.5">
            <h3 className="font-serif-dm text-lg font-bold text-[var(--soil)] leading-tight">
              {commodity.name}
            </h3>
          </div>

          {/* Price Display in IBM Plex Mono */}
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-mono-plex font-bold text-xl text-[var(--soil)] tracking-tight">
              ₦{price.toLocaleString()}
            </span>
            <span className="font-mono-plex text-xs font-normal text-[var(--soil-secondary)]">
              / {commodity.unit}
            </span>
          </div>

          {/* Trend Subtext */}
          <p className="mt-1 text-xs font-semibold text-[var(--deep-grain-green)]">
            {trend.change} this month
          </p>

          {/* Stock Availability Subtext */}
          <p className="mt-0.5 text-xs text-[var(--soil-secondary)]">
            {formattedStock} {commodity.unit}s available
          </p>
        </div>

        {/* Dual CTA Buttons (View Details + Buy Now) */}
        <div className="mt-4 grid grid-cols-2 gap-2 pt-2">
          <Link href={`/commodities/${commodity.id}`} className="w-full">
            <button
              type="button"
              className="w-full py-2.5 px-3 rounded-full border border-[#D4C9A8] bg-transparent text-xs font-bold text-[var(--soil)] hover:bg-[#F7F4EA] transition-colors"
            >
              View Details
            </button>
          </Link>
          <Link href={`/commodities/${commodity.id}`} className="w-full">
            <button
              type="button"
              className="w-full py-2.5 px-3 rounded-full bg-[var(--harvest-wheat)] text-xs font-bold text-[var(--soil)] shadow-xs hover:opacity-95 transition-all"
            >
              Buy Now
            </button>
          </Link>
        </div>
      </div>

      {/* =====================================================================
          MOBILE LAYOUT (flex md:hidden flex-col)
          White card, horizontal split row (square thumbnail left, stats right),
          full-width Buy Now button below.
          ===================================================================== */}
      <div className="flex md:hidden flex-col gap-3.5 rounded-2xl border border-[#E4DCC8] bg-white p-4 shadow-xs">
        {/* Top Horizontal Section */}
        <div className="flex items-start gap-3.5">
          {/* Square Beige Thumbnail */}
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-[#F5EDD6] border border-[#E8DEC9] overflow-hidden">
            {commodity.image_url ? (
              <Image src={commodity.image_url} alt={commodity.name} fill className="object-cover" />
            ) : (
              <span className="text-3xl select-none">{emoji}</span>
            )}
            <span className="absolute bottom-1 right-1 rounded bg-[var(--soil)]/80 px-1 py-0.2 font-mono-plex text-[8px] font-bold text-white uppercase">
              {commodity.code.slice(0, 4)}
            </span>
          </div>

          {/* Right Details Column */}
          <div className="flex-1 min-w-0">
            {/* Title + Grade Row */}
            <div className="flex items-start justify-between gap-1">
              <h3 className="font-serif-dm text-base font-bold text-[var(--soil)] truncate">
                {commodity.name}
              </h3>
              <GradeBadge grade={primaryGrade} size="sm" />
            </div>

            {/* Price + Trend Row */}
            <div className="mt-1 flex items-center justify-between gap-1">
              <div className="font-mono-plex font-bold text-sm text-[var(--soil)]">
                ₦{price.toLocaleString()}{" "}
                <span className="text-[10px] font-normal text-[var(--soil-secondary)]">/{commodity.unit}</span>
              </div>
              <span
                className={`text-[10px] font-mono-plex font-bold px-1.5 py-0.5 rounded-md ${
                  trend.isUp ? "bg-[#EBF5EE] text-[#21483A]" : "bg-[#FDECEA] text-[#B3432E]"
                }`}
              >
                {trend.change}
              </span>
            </div>

            {/* Stock Count */}
            <p className="mt-1 text-[11px] text-[var(--soil-secondary)]">
              {formattedStock} {commodity.unit}s available
            </p>
          </div>
        </div>

        {/* Full-width Buy Now Button */}
        <Link href={`/commodities/${commodity.id}`} className="w-full">
          <button
            type="button"
            className="w-full py-3 rounded-xl bg-[var(--harvest-wheat)] text-sm font-bold text-[var(--soil)] shadow-xs active:scale-[0.99] transition-transform"
          >
            Buy Now
          </button>
        </Link>
      </div>
    </div>
  );
}
