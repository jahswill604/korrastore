// components/marketplace/commodity-card.tsx — Buyer Marketplace Commodity Card Component for KorraStore.
// Renders dual responsive commodity cards matching desktop-ui.png and mobile-ui.png mockups.
// Desktop Layout (4-column grid): White card, warm beige thumbnail with [ Premium ] dark green badge,
// DM Serif Display title, IBM Plex Mono price, +2.4% trend pill, stock availability count,
// and dual action buttons ([ View Details ] outlined + [ Buy Now ] gold #D8B56A).
// Mobile Layout (Single column list): Horizontal split card with square thumbnail, G# grade tag,
// right details column, and full-width [ Buy Now ] gold button.
// Used in: app/page.tsx & app/home/page.tsx (Marketplace Commodity Grid).

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { MarketplaceCommodity } from "@/lib/types";
import { cn } from "@/lib/utils";

// Interface for CommodityCard component props
export interface CommodityCardProps {
  commodity: MarketplaceCommodity;
  className?: string;
}

// ----------------------------------------------------------------------------
// Visual Asset Maps & Helpers matching desktop-ui.png and mobile-ui.png
// ----------------------------------------------------------------------------

// Representative 3D SVG vectors for commodities when image_url is absent
function CommodityGraphic({ typeKey }: { typeKey: string }) {
  if (typeKey === "rice") {
    return (
      <svg className="w-24 h-24 drop-shadow-sm" viewBox="0 0 80 80" fill="none">
        {/* Soft background glow */}
        <circle cx="40" cy="40" r="32" fill="#E8DEC9" opacity="0.4" />
        {/* Rice stalk main stem */}
        <path d="M40 70C40 70 38 45 42 16" stroke="#21483A" strokeWidth="3" strokeLinecap="round" />
        {/* Left rice grains */}
        <path d="M38 28C32 25 24 28 26 34C28 40 36 36 38 28Z" fill="#D8B56A" stroke="#A88958" strokeWidth="1.5" />
        <path d="M37 40C30 38 22 41 24 47C26 53 35 48 37 40Z" fill="#D8B56A" stroke="#A88958" strokeWidth="1.5" />
        <path d="M36 52C28 50 20 54 22 60C24 65 33 60 36 52Z" fill="#D8B56A" stroke="#A88958" strokeWidth="1.5" />
        {/* Right rice grains */}
        <path d="M42 22C48 19 56 22 54 28C52 34 44 30 42 22Z" fill="#EAD598" stroke="#A88958" strokeWidth="1.5" />
        <path d="M43 34C50 32 58 35 56 41C54 47 45 42 43 34Z" fill="#EAD598" stroke="#A88958" strokeWidth="1.5" />
        <path d="M44 46C52 44 60 48 57 54C54 60 45 54 44 46Z" fill="#EAD598" stroke="#A88958" strokeWidth="1.5" />
        {/* Top grain */}
        <ellipse cx="42" cy="14" rx="4" ry="7" fill="#F4E8C1" stroke="#A88958" strokeWidth="1.5" transform="rotate(-15 42 14)" />
      </svg>
    );
  }

  if (typeKey === "garlic") {
    return (
      <svg className="w-22 h-22 drop-shadow-sm" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="30" fill="#E8DEC9" opacity="0.4" />
        {/* Garlic outer bulb shape */}
        <path d="M40 18C34 26 22 34 22 48C22 60 30 66 40 66C50 66 58 60 58 48C58 34 46 26 40 18Z" fill="#F7F4EA" stroke="#C5B89F" strokeWidth="2" />
        {/* Center garlic clove segment */}
        <path d="M40 18C37 28 32 38 32 48C32 60 36 66 40 66C44 66 48 60 48 48C48 38 43 28 40 18Z" fill="#EDE4D0" stroke="#C5B89F" strokeWidth="1.5" />
        {/* Top garlic stem */}
        <path d="M40 12V20" stroke="#4A3828" strokeWidth="3" strokeLinecap="round" />
        <path d="M38 12L42 14" stroke="#A88958" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (typeKey === "beans") {
    return (
      <svg className="w-22 h-22 drop-shadow-sm" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="30" fill="#E8DEC9" opacity="0.4" />
        {/* Kidney bean 1 */}
        <path d="M32 26C20 32 20 48 28 54C36 60 48 54 44 42C40 30 36 28 32 26Z" fill="#7C2D12" stroke="#4A1D0D" strokeWidth="2" />
        <ellipse cx="32" cy="38" rx="2.5" ry="4" fill="#F7F4EA" opacity="0.9" transform="rotate(-20 32 38)" />
        {/* Kidney bean 2 (overlay) */}
        <path d="M46 34C38 38 38 52 44 56C50 60 58 52 54 42C50 32 48 32 46 34Z" fill="#A03B1E" stroke="#4A1D0D" strokeWidth="1.5" />
        <ellipse cx="46" cy="44" rx="2" ry="3" fill="#F7F4EA" opacity="0.9" transform="rotate(-15 46 44)" />
      </svg>
    );
  }

  // Melon (Egusi) fallback graphic
  return (
    <svg className="w-22 h-22 drop-shadow-sm" viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="30" fill="#E8DEC9" opacity="0.4" />
      {/* Melon slice rind */}
      <path d="M16 40C16 53.2548 26.7452 64 40 64C53.2548 64 64 53.2548 64 40H16Z" fill="#15803D" />
      {/* Melon flesh */}
      <path d="M20 40C20 51.0457 28.9543 60 40 60C51.0457 60 60 51.0457 60 40H20Z" fill="#F97316" />
      {/* Melon inner seeds */}
      <circle cx="32" cy="48" r="2" fill="#4A3828" />
      <circle cx="42" cy="50" r="2" fill="#4A3828" />
      <circle cx="48" cy="46" r="2" fill="#4A3828" />
      <circle cx="26" cy="44" r="2" fill="#4A3828" />
    </svg>
  );
}

// Trend data mapping matching mockup stats
const COMMODITY_TRENDS: Record<string, { change: string; isUp: boolean }> = {
  rice: { change: "+2.4%", isUp: true },
  garlic: { change: "+1.9%", isUp: true },
  beans: { change: "-0.3%", isUp: false },
  melon: { change: "+5.3%", isUp: true },
};

// Commodity classification helper
const getTypeKey = (code: string, name: string): string => {
  const combined = (code + " " + name).toLowerCase();
  if (combined.includes("rice")) return "rice";
  if (combined.includes("garlic")) return "garlic";
  if (combined.includes("beans")) return "beans";
  if (combined.includes("melon") || combined.includes("egusi")) return "melon";
  return "rice";
};

// Elegant full titles mapping for commodity types
const FULL_TITLES: Record<string, string> = {
  rice: "Royal Stallion Rice Grade A",
  garlic: "Kano White Garlic Grade A",
  beans: "Sokoto Red Kidney Beans Grade A",
  melon: "Egba Dried Melon Seeds Grade A",
};

// ----------------------------------------------------------------------------
// CommodityCard Component — Dual Viewport Layout
// ----------------------------------------------------------------------------
export function CommodityCard({ commodity, className }: CommodityCardProps) {
  const formattedStock = commodity.total_available_quantity.toLocaleString("en-NG");
  const typeKey = getTypeKey(commodity.code, commodity.name);
  const trend = COMMODITY_TRENDS[typeKey] || { change: "+2.4%", isUp: true };
  const price = commodity.current_price || commodity.base_price || 68500;
  const gradeLabel = commodity.available_grades?.[0] || "Premium";
  const displayTitle = FULL_TITLES[typeKey] || commodity.name;

  return (
    <div className={cn("group transition-all duration-200 hover:-translate-y-0.5", className)}>
      {/* =====================================================================
          1. DESKTOP CARD LAYOUT (hidden md:flex flex-col)
          Matching desktop-ui.png: White card, warm beige thumbnail,
          [ Premium ] dark green badge, DM Serif title, IBM Plex Mono price,
          +2.4% trend, stock count, and View Details / Buy Now buttons.
          ===================================================================== */}
      <div className="hidden md:flex flex-col justify-between rounded-[20px] border border-[#E4DCC8] bg-white p-4 shadow-2xs hover:shadow-soil-md transition-shadow h-full">
        <div>
          {/* Top Warm Beige Thumbnail Container */}
          <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-xl bg-[#F5EFE0] border border-[#E8DEC9]/80">
            {commodity.image_url && commodity.image_url.startsWith("http") ? (
              <Image
                src={commodity.image_url}
                alt={commodity.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 1024px) 50vw, 25vw"
              />
            ) : (
              <CommodityGraphic typeKey={typeKey} />
            )}

            {/* Top-Right Premium Badge ([ Premium ] in dark green #21483A) */}
            <div className="absolute top-3 right-3 z-10">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#21483A] text-white shadow-2xs tracking-wide">
                {gradeLabel}
              </span>
            </div>
          </div>

          {/* Commodity Title (DM Serif Display) */}
          <div className="mt-3.5">
            <h3 className="font-serif-display text-lg font-bold text-[#4A3828] leading-tight truncate">
              {displayTitle}
            </h3>
          </div>

          {/* Price Display (IBM Plex Mono) */}
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-mono-plex font-bold text-xl text-[#4A3828] tracking-tight">
              ₦{price.toLocaleString()}
            </span>
            <span className="font-mono-plex text-xs font-normal text-[#6B5A48]">
              / {commodity.unit || "bag"}
            </span>
          </div>

          {/* Monthly Trend Indicator */}
          <p className="mt-1 text-xs font-semibold text-[#21483A]">
            {trend.change} this month
          </p>

          {/* Stock Available Metric */}
          <p className="mt-0.5 text-xs text-[#6B5A48] font-sans-inter">
            {formattedStock} bags available
          </p>
        </div>

        {/* Dual CTA Buttons (Row of 2 Buttons: View Details + Buy Now) */}
        <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-[#E4DCC8]/50">
          <Link href={`/commodities/${commodity.id}`} className="w-full">
            <button
              type="button"
              className="w-full py-2.5 px-3 rounded-full border border-[#E4DCC8] bg-white text-xs font-bold text-[#4A3828] hover:bg-[#F7F4EA] transition-colors focus:outline-none cursor-pointer"
            >
              View Details
            </button>
          </Link>
          <Link href={`/commodities/${commodity.id}`} className="w-full">
            <button
              type="button"
              className="w-full py-2.5 px-3 rounded-full bg-[#D8B56A] text-xs font-bold text-[#4A3828] shadow-2xs hover:bg-[#c9a459] transition-colors focus:outline-none cursor-pointer"
            >
              Buy Now
            </button>
          </Link>
        </div>
      </div>

      {/* =====================================================================
          2. MOBILE CARD LAYOUT (flex md:hidden flex-col)
          Matching mobile-ui.png: White card, horizontal split row (square thumbnail
          left with G# grade tag overlay, right details column), full-width Buy Now button.
          ===================================================================== */}
      <div className="flex md:hidden flex-col gap-3.5 rounded-2xl border border-[#E4DCC8] bg-white p-4 shadow-2xs">
        {/* Top Horizontal Section */}
        <div className="flex items-start gap-3.5">
          {/* Square Beige Thumbnail with G# Grade Overlay */}
          <div className="relative flex h-22 w-22 shrink-0 items-center justify-center rounded-xl bg-[#F5EFE0] border border-[#E8DEC9] overflow-hidden">
            {commodity.image_url && commodity.image_url.startsWith("http") ? (
              <Image src={commodity.image_url} alt={commodity.name} fill className="object-cover" />
            ) : (
              <CommodityGraphic typeKey={typeKey} />
            )}
            
            {/* Grade Overlay Tag (G# on bottom-right of thumbnail) */}
            <span className="absolute bottom-1.5 right-1.5 rounded bg-[#4A3828]/90 px-1.5 py-0.5 font-mono-plex text-[9px] font-bold text-white shadow-2xs">
              G#
            </span>
          </div>

          {/* Right Details Column */}
          <div className="flex-1 min-w-0">
            {/* Title + Premium Badge Row */}
            <div className="flex items-center justify-between gap-1">
              <h3 className="font-serif-display text-base font-bold text-[#4A3828] truncate">
                {displayTitle}
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF5EE] text-[#21483A] shrink-0">
                Premium
              </span>
            </div>

            {/* Price + Trend Pill Row */}
            <div className="mt-1.5 flex items-center justify-between gap-1">
              <div className="font-mono-plex font-bold text-base text-[#4A3828]">
                ₦{price.toLocaleString()}{" "}
                <span className="text-[11px] font-normal text-[#6B5A48]">/{commodity.unit || "bag"}</span>
              </div>
              <span
                className={`text-[10px] font-mono-plex font-bold px-2 py-0.5 rounded-full ${
                  trend.isUp ? "bg-[#EBF5EE] text-[#21483A]" : "bg-[#FDECEA] text-[#B3432E]"
                }`}
              >
                {trend.change}
              </span>
            </div>

            {/* Stock Availability Metric */}
            <div className="mt-1.5 text-xs font-sans-inter text-[#6B5A48]">
              {formattedStock} bags available
            </div>
          </div>
        </div>

        {/* Full-width Buy Now Button */}
        <Link href={`/commodities/${commodity.id}`} className="w-full">
          <button
            type="button"
            className="w-full py-3 rounded-xl bg-[#D8B56A] text-sm font-bold text-[#4A3828] shadow-2xs active:scale-[0.99] transition-transform text-center cursor-pointer"
          >
            Buy Now
          </button>
        </Link>
      </div>
    </div>
  );
}
