// app/home/page.tsx — KorraStore Buyer Marketplace Dashboard & Commodity Browse View.
// Primary Server Component page for browsing active agricultural commodities (rice, garlic, beans, melon).
// Verifies active auth session via getUser(), fetches live market data via getMarketplaceCommodities(),
// and supports URL-driven filter chips and price/stock sorting.
// Used in: Protected buyer route /home.

import * as React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMarketplaceCommodities } from "@/lib/supabase/queries/commodities";
import { AppShell } from "@/components/layout/app-shell";
import { FilterBar } from "@/components/marketplace/filter-bar";
import { CommodityCard } from "@/components/marketplace/commodity-card";
import { EmptyState } from "@/components/ui/empty-state";

interface PageProps {
  searchParams: Promise<{
    type?: string;
    sort?: string;
  }>;
}

// ----------------------------------------------------------------------------
// HomePage — Server Component for Marketplace Browse.
// ----------------------------------------------------------------------------
export default async function HomePage({ searchParams }: PageProps) {
  // 1. Session Verification against Supabase Auth server via getUser()
  let user = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch (err) {
    console.warn("[HomePage] Supabase auth check failed (network/dev fallback):", err);
  }

  // In production, require user session; in dev without configured keys, allow preview
  if (!user && process.env.NODE_ENV === "production") {
    redirect("/login?redirect=/home");
  }


  // 2. Resolve URL Search Parameters for type filtering & sorting
  const params = await searchParams;
  const activeType = params.type || "all";
  const activeSort = params.sort || "";

  // 3. Fetch Commodities Catalog matching active filters
  const commodities = await getMarketplaceCommodities({
    type: activeType,
    sort: activeSort,
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header & Subtitle */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌾</span>
            <h1 className="font-serif-dm text-2xl sm:text-3xl font-bold text-[var(--soil)] tracking-tight">
              Commodity Marketplace
            </h1>
          </div>
          <p className="text-sm text-[var(--soil-secondary)] leading-relaxed max-w-2xl">
            Browse verified agricultural commodities stored in high-security partner warehouses across Nigeria.
            Real-time transparent market prices, quality grade sorting, and instant order sourcing.
          </p>
        </div>

        {/* URL-based Filter & Sort Bar */}
        <FilterBar />

        {/* Commodity Card Grid or Empty State Fallback */}
        {commodities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {commodities.map((commodity) => (
              <CommodityCard key={commodity.id} commodity={commodity} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="🌾"
            title="No commodities found"
            description="No active agricultural commodities match your selected filter criteria. Try clearing filters or checking back soon."
            actionLabel="Reset Filters"
          />

        )}
      </div>
    </AppShell>
  );
}
