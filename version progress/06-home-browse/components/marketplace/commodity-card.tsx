// components/marketplace/commodity-card.tsx — Commodity Catalog Item Card for KorraStore.
// Renders individual commodity photos, DM Serif Display titles, IBM Plex Mono price display,
// aggregated available stock, quality grade badges, and a detail page action CTA.
// Used in: app/home/page.tsx (Marketplace Commodity Grid).

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { MarketplaceCommodity } from "@/lib/types";
import { PriceDisplay } from "@/components/ui/price-display";
import { GradeBadge, CommodityGrade } from "@/components/ui/grade-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";


export interface CommodityCardProps {
  commodity: MarketplaceCommodity;
  className?: string;
}

// ----------------------------------------------------------------------------
// CommodityCard — individual product card for agricultural commodities.
// Uses Light Mode design system tokens exclusively.
// ----------------------------------------------------------------------------
export function CommodityCard({ commodity, className }: CommodityCardProps) {
  const formattedStock = commodity.total_available_quantity.toLocaleString("en-NG");

  return (
    <Card
      className={cn(
        "group flex flex-col justify-between overflow-hidden border border-[var(--border)] bg-[var(--paper)] transition-all duration-200 hover:shadow-soil-md hover:-translate-y-0.5",
        className
      )}
    >
      <div>
        {/* Commodity Photo / Visual Preview Container */}
        <div className="relative h-44 w-full overflow-hidden bg-[#EFE9D6] border-b border-[var(--border)]">
          {commodity.image_url ? (
            <Image
              src={commodity.image_url}
              alt={commodity.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl">
              🌾
            </div>
          )}

          {/* Stored Status Badge Pill */}
          <div className="absolute top-3 right-3 rounded-full bg-[var(--deep-grain-green)]/90 px-2.5 py-1 text-[11px] font-bold text-white shadow-soil-sm backdrop-blur-xs">
            ✓ Verified Warehouse Stock
          </div>
        </div>

        {/* Card Header — Name & Description */}
        <CardHeader className="p-4 pb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-serif-dm text-lg font-bold text-[var(--soil)] leading-tight group-hover:text-[var(--husk)] transition-colors">
              {commodity.name}
            </h3>
            <span className="shrink-0 rounded bg-[var(--husk)]/10 px-2 py-0.5 font-mono-plex text-[11px] font-semibold text-[var(--husk)]">
              {commodity.code}
            </span>
          </div>
          {commodity.description && (
            <p className="mt-1 line-clamp-2 text-xs text-[var(--soil-secondary)] leading-relaxed">
              {commodity.description}
            </p>
          )}
        </CardHeader>

        {/* Card Content — Pricing, Stock & Grades */}
        <CardContent className="p-4 pt-1 space-y-3">
          {/* Price Framing Block */}
          <div className="rounded-lg bg-white/70 p-2.5 border border-[var(--border)]">
            <span className="block text-[11px] font-semibold text-[var(--soil-secondary)] uppercase tracking-wider">
              Base Starting Price
            </span>
            <div className="mt-0.5 flex items-baseline gap-1">
              <span className="text-xs font-semibold text-[var(--soil-secondary)]">from</span>
              <PriceDisplay amount={commodity.current_price} size="lg" />
              <span className="text-xs font-medium text-[var(--soil-secondary)]">/ {commodity.unit}</span>
            </div>
          </div>

          {/* Availability & Grades */}
          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex items-center gap-1.5 text-[var(--soil)] font-medium">
              <span>📦</span>
              <span>
                <strong className="font-mono-plex">{formattedStock}</strong> {commodity.unit} in stock
              </span>
            </div>
            <span className="text-[11px] text-[var(--soil-secondary)] font-medium">
              {commodity.warehouse_count} {commodity.warehouse_count === 1 ? "warehouse" : "warehouses"}
            </span>
          </div>

          {/* Available Quality Grades */}
          {commodity.available_grades.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {commodity.available_grades.map((grade) => (
                <GradeBadge key={grade} grade={grade as CommodityGrade} size="sm" />
              ))}
            </div>
          )}
        </CardContent>
      </div>

      {/* Card Footer — CTA Navigation Button */}
      <CardFooter className="p-4 pt-0">
        <Link href={`/commodities/${commodity.id}`} className="w-full">
          <Button variant="primary" size="md" className="w-full justify-center">
            View Details & Purchase →
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
