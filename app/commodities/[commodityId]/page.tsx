// app/commodities/[commodityId]/page.tsx — Single Commodity Details Server Component Page for KorraStore.
// Server Component fetching commodity attributes, per-grade prices/stock, and price history series via getCommodityDetails.
// Renders 2-column layout on desktop (~60% hero photo + specs + storage info; ~40% sticky purchase panel) and stacked column on mobile.
// Used in: App Router route /commodities/[commodityId] matching desktop-ui.png and mobile-ui.png.

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getCommodityDetails } from "@/lib/supabase/queries/commodities";
import { PurchasePanel } from "@/components/commodity/purchase-panel";
import { PriceHistoryChart } from "@/components/commodity/price-history-chart";
import { StorageInfo } from "@/components/commodity/storage-info";

interface CommodityPageProps {
  params: Promise<{
    commodityId: string;
  }>;
}

export default async function CommodityDetailsPage({ params }: CommodityPageProps) {
  const resolvedParams = await params;
  const commodityId = resolvedParams.commodityId;

  // 1. Fetch commodity details, per-grade pricing/stock, and price history points
  const commodity = await getCommodityDetails(commodityId);

  // 2. Handle missing/invalid commodity ID
  if (!commodity) {
    notFound();
  }

  // Stock availability summary
  const primaryGrade = commodity.grades[0] || {
    unitPrice: commodity.currentPrice || 68500,
    availableQuantity: 1250,
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-8 pb-16">
        {/* Breadcrumb Navigation Header */}
        <div className="flex items-center space-x-2 text-xs font-sans-inter text-[#6B5A48]">
          <Link href="/home" className="hover:text-[#4A3828] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/home" className="hover:text-[#4A3828] transition-colors">
            Commodities
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#4A3828]">{commodity.name}</span>
        </div>

        {/* TOP MAIN SECTION: 2-Column Layout on Desktop, Stacked on Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN (~60% width on Desktop: Hero Photo, Title, Description, Storage Info) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Commodity Photo Box */}
            <div className="relative w-full h-[320px] sm:h-[400px] rounded-[24px] bg-[#F5EFE0] border border-[#E4DCC8] overflow-hidden shadow-2xs flex items-center justify-center p-6">
              {commodity.imageUrl && (commodity.imageUrl.startsWith("http://") || commodity.imageUrl.startsWith("https://") || commodity.imageUrl.startsWith("/images/")) ? (
                <Image
                  src={commodity.imageUrl}
                  alt={commodity.name}
                  fill
                  unoptimized
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex flex-col items-center space-y-4 text-center">
                  <div className="w-24 h-24 rounded-full bg-white border border-[#E4DCC8] flex items-center justify-center text-5xl shadow-2xs">
                    {commodity.type?.toLowerCase().includes("rice")
                      ? "🌾"
                      : commodity.type?.toLowerCase().includes("garlic")
                      ? "🧄"
                      : commodity.type?.toLowerCase().includes("beans")
                      ? "🫘"
                      : "🍈"}
                  </div>
                  <span className="font-mono-plex text-xs font-bold text-[#6B5A48] bg-white px-3 py-1 rounded-full border border-[#E4DCC8]">
                    {commodity.code}
                  </span>
                </div>
              )}
            </div>

            {/* Title & Badge */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="bg-[#21483A] text-[#F7F4EA] font-sans-inter text-xs font-bold px-3 py-1 rounded-full tracking-wide">
                  [ Premium Grade ]
                </span>
                <span className="font-mono-plex text-xs text-[#6B5A48]">
                  Category: {commodity.category}
                </span>
              </div>

              <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#4A3828] leading-tight">
                {commodity.name}
              </h1>

              <p className="font-sans-inter text-sm sm:text-base text-[#6B5A48] leading-relaxed">
                {commodity.description}
              </p>
            </div>

            {/* Storage & Warehouse Compliance Card */}
            <StorageInfo storageInfo={commodity.storageInfo} />
          </div>

          {/* RIGHT COLUMN (~40% width on Desktop: Sticky Purchase Panel) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <PurchasePanel
              commodityId={commodity.id}
              commodityName={commodity.name}
              unit={commodity.unit}
              grades={commodity.grades}
            />
          </div>
        </div>

        {/* BOTTOM SECTION: Full-Width Price History Chart */}
        <div className="pt-4">
          <PriceHistoryChart
            priceHistory={commodity.priceHistory}
            commodityName={commodity.name}
          />
        </div>
      </div>
    </AppShell>
  );
}
