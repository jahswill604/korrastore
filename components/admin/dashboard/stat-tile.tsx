// components/admin/dashboard/stat-tile.tsx — Administrative Metric Stat Card for KorraStore.
// Renders key operational metrics with IBM Plex Mono typography, status badge, and navigation links.
// Used in: app/admin/page.tsx

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ----------------------------------------------------------------------------
// Type Definitions
// ----------------------------------------------------------------------------

export interface StatTileProps {
  title: string;
  value: string | number;
  subtext: string;
  badge?: {
    text: string;
    variant: "success" | "warning" | "danger" | "neutral";
  };
  icon: React.ReactNode;
  href?: string;
  className?: string;
}

// ----------------------------------------------------------------------------
// StatTile Component
// ----------------------------------------------------------------------------

export const StatTile: React.FC<StatTileProps> = ({
  title,
  value,
  subtext,
  badge,
  icon,
  href,
  className,
}) => {
  const content = (
    <div
      className={cn(
        "relative p-5 rounded-2xl bg-white border border-[#E4DCC8] shadow-sm transition-all duration-200",
        href && "hover:shadow-md hover:border-[#D8B56A] group cursor-pointer",
        className
      )}
    >
      {/* Top Row: Icon + Badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-[#F7F4EA] border border-[#E4DCC8] text-[#4A3828] flex items-center justify-center transition-colors group-hover:bg-[#D8B56A]/20">
          {icon}
        </div>

        {badge && (
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wide",
              badge.variant === "success" && "bg-[#21483A]/10 text-[#21483A] border border-[#21483A]/20",
              badge.variant === "warning" && "bg-[#C7862B]/10 text-[#C7862B] border border-[#C7862B]/20",
              badge.variant === "danger" && "bg-[#B3432E]/10 text-[#B3432E] border border-[#B3432E]/20",
              badge.variant === "neutral" && "bg-[#E4DCC8]/60 text-[#6B5A48]"
            )}
          >
            {badge.text}
          </span>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="space-y-1">
        <div className="text-2xl sm:text-3xl font-mono font-bold text-[#4A3828] tracking-tight">
          {value}
        </div>
        <div className="text-xs font-semibold text-[#6B5A48] uppercase tracking-wider">
          {title}
        </div>
      </div>

      {/* Subtext & Deep Link Arrow */}
      <div className="mt-3 pt-3 border-t border-[#E4DCC8]/60 flex items-center justify-between text-xs text-[#A88958]">
        <span className="truncate">{subtext}</span>
        {href && (
          <span className="font-semibold text-[#303B63] group-hover:translate-x-0.5 transition-transform">
            →
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }

  return content;
};
