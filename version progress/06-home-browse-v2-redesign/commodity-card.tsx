// version progress/06-home-browse-v2-redesign/commodity-card.tsx — Commodity Card Component.

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { MarketplaceCommodity } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface CommodityCardProps {
  commodity: MarketplaceCommodity;
  className?: string;
}

function CommodityGraphic({ typeKey }: { typeKey: string }) {
  if (typeKey === "rice") {
    return (
      <svg className="w-24 h-24 text-[#D8B56A]" viewBox="0 0 64 64" fill="none">
        <path d="M32 10C24 18 18 30 18 42C18 48 24 54 32 54C40 54 46 48 46 42C46 30 40 18 32 10Z" fill="#D8B56A" opacity="0.3" />
        <path d="M32 14C26 22 21 32 21 42C21 47 26 51 32 51C38 51 43 47 43 42C43 32 38 22 32 14Z" fill="#A88958" opacity="0.5" />
        <path d="M32 6V58" stroke="#21483A" strokeWidth="3" strokeLinecap="round" />
        <circle cx="24" cy="22" r="3" fill="#D8B56A" />
        <circle cx="40" cy="22" r="3" fill="#D8B56A" />
      </svg>
    );
  }

  if (typeKey === "garlic") {
    return (
      <svg className="w-20 h-20 text-[#A88958]" viewBox="0 0 64 64" fill="none">
        <path d="M32 12C28 18 20 26 20 38C20 48 25 54 32 54C39 54 44 48 44 38C44 26 36 18 32 12Z" fill="#E8DEC9" />
        <path d="M32 8V14" stroke="#4A3828" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (typeKey === "beans") {
    return (
      <svg className="w-20 h-20 text-[#4A3828]" viewBox="0 0 64 64" fill="none">
        <path d="M22 22C16 28 16 38 22 44C28 50 38 48 44 40C50 32 46 20 38 18C30 16 26 18 22 22Z" fill="#7C3A21" />
      </svg>
    );
  }

  return (
    <svg className="w-20 h-20 text-[#D8B56A]" viewBox="0 0 64 64" fill="none">
      <path d="M12 32C12 43.0457 20.9543 52 32 52C43.0457 52 52 43.0457 52 32H12Z" fill="#F9A825" />
    </svg>
  );
}

const COMMODITY_TRENDS: Record<string, { change: string; isUp: boolean }> = {
  rice: { change: "+2.4%", isUp: true },
  garlic: { change: "+1.9%", isUp: true },
  beans: { change: "-0.3%", isUp: false },
  melon: { change: "+5.3%", isUp: true },
};

const getTypeKey = (code: string, name: string): string => {
  const combined = (code + " " + name).toLowerCase();
  if (combined.includes("rice")) return "rice";
  if (combined.includes("garlic")) return "garlic";
  if (combined.includes("beans")) return "beans";
  if (combined.includes("melon") || combined.includes("egusi")) return "melon";
  return "rice";
};

export function CommodityCard({ commodity, className }: CommodityCardProps) {
  const formattedStock = commodity.total_available_quantity.toLocaleString("en-NG");
  const typeKey = getTypeKey(commodity.code, commodity.name);
  const trend = COMMODITY_TRENDS[typeKey] || { change: "+2.4%", isUp: true };
  const price = commodity.current_price || commodity.base_price || 68500;
  const gradeLabel = commodity.available_grades?.[0] || "Premium";

  return (
    <div className={cn("group transition-all duration-200 hover:-translate-y-0.5", className)}>
      <div className="hidden md:flex flex-col justify-between rounded-2xl border border-[#E4DCC8] bg-white p-4 shadow-2xs hover:shadow-soil-md h-full">
        <div>
          <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-xl bg-[#F5EFE0] border border-[#E8DEC9]">
            {commodity.image_url && commodity.image_url.startsWith("http") ? (
              <Image src={commodity.image_url} alt={commodity.name} fill className="object-cover" />
            ) : (
              <CommodityGraphic typeKey={typeKey} />
            )}
            <div className="absolute top-3 right-3 z-10">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#21483A] text-white">
                {gradeLabel}
              </span>
            </div>
          </div>

          <div className="mt-3.5">
            <h3 className="font-serif-dm text-lg font-bold text-[#4A3828] leading-tight truncate">
              {commodity.name}
            </h3>
            <p className="text-[11px] font-sans-inter text-[#4A3828]/60 mt-0.5">dark Soil</p>
          </div>

          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-mono-plex font-bold text-xl text-[#4A3828]">
              ₦{price.toLocaleString()}
            </span>
            <span className="font-mono-plex text-xs text-[#4A3828]/70">/ {commodity.unit || "bag"}</span>
          </div>

          <p className="mt-1 text-xs font-semibold text-[#21483A]">{trend.change} this month</p>
          <p className="mt-0.5 text-xs text-[#4A3828]/70 font-sans-inter">{formattedStock} bags available</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 pt-2 border-t border-[#E4DCC8]/40">
          <Link href={`/commodities/${commodity.id}`} className="w-full">
            <button type="button" className="w-full py-2.5 px-3 rounded-full border border-[#D4C9A8] bg-white text-xs font-bold text-[#4A3828]">
              View Details
            </button>
          </Link>
          <Link href={`/commodities/${commodity.id}`} className="w-full">
            <button type="button" className="w-full py-2.5 px-3 rounded-full bg-[#D8B56A] text-xs font-bold text-[#4A3828]">
              Buy Now
            </button>
          </Link>
        </div>
      </div>

      <div className="flex md:hidden flex-col gap-3 rounded-2xl border border-[#E4DCC8] bg-white p-3.5 shadow-2xs">
        <div className="flex items-start gap-3.5">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-[#F5EFE0] border border-[#E8DEC9] overflow-hidden">
            {commodity.image_url && commodity.image_url.startsWith("http") ? (
              <Image src={commodity.image_url} alt={commodity.name} fill className="object-cover" />
            ) : (
              <CommodityGraphic typeKey={typeKey} />
            )}
            <span className="absolute bottom-1 right-1 rounded bg-[#4A3828]/85 px-1.5 py-0.5 font-mono-plex text-[9px] font-bold text-white">
              G#
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h3 className="font-serif-dm text-base font-bold text-[#4A3828] truncate">{commodity.name}</h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#EBF5EE] text-[#21483A]">
                Premium
              </span>
            </div>

            <div className="mt-1 flex items-center justify-between gap-1">
              <div className="font-mono-plex font-bold text-sm text-[#4A3828]">
                ₦{price.toLocaleString()} <span className="text-[10px] font-normal text-[#4A3828]/70">/{commodity.unit || "bag"}</span>
              </div>
              <span className={`text-[10px] font-mono-plex font-bold px-1.5 py-0.5 rounded-md ${trend.isUp ? "bg-[#EBF5EE] text-[#21483A]" : "bg-[#FDECEA] text-[#B3432E]"}`}>
                {trend.change}
              </span>
            </div>

            <div className="mt-1 flex items-center justify-between text-[11px] font-sans-inter text-[#4A3828]/70">
              <span className="font-mono-plex text-[10px]">IBM Plex Mono</span>
              <span>{formattedStock} bags</span>
            </div>
          </div>
        </div>

        <Link href={`/commodities/${commodity.id}`} className="w-full">
          <button type="button" className="w-full py-2.5 rounded-xl bg-[#D8B56A] text-sm font-bold text-[#4A3828]">
            Buy Now
          </button>
        </Link>
      </div>
    </div>
  );
}
