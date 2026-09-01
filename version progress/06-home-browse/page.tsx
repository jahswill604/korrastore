// app/page.tsx — KorraStore Buyer Marketplace Dashboard & Commodity Browse View.
// Primary Server Component page for browsing active agricultural commodities (rice, garlic, beans, melon).
// Serves as the primary root application route ("/").
// Layout strictly follows desktop-ui.png and mobile-ui.png mockups.
// Used in: Primary root route ("/").

import * as React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMarketplaceCommodities } from "@/lib/supabase/queries/commodities";
import { AppShell } from "@/components/layout/app-shell";
import { MarketTicker } from "@/components/marketplace/market-ticker";
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
// RootPage — Primary Server Component for Buyer Marketplace.
// ----------------------------------------------------------------------------
export default async function RootPage({ searchParams }: PageProps) {
  // 1. Session Verification against Supabase Auth server via getUser()
  let user = null;
  let userName = "Amara";
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
    if (user) {
      // Fetch user profile full_name if available
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      if (profile?.full_name) {
        userName = profile.full_name.split(" ")[0];
      }
    }
  } catch (err) {
    console.warn("[RootPage] Supabase auth check failed (network/dev fallback):", err);
  }

  // In production, require user session; in dev without configured keys, allow preview
  if (!user && process.env.NODE_ENV === "production") {
    redirect("/login?redirect=/");
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
    <AppShell userName={userName}>
      <div className="space-y-5">
        {/* Top Header Greeting — Matching desktop-ui.png & mobile-ui.png */}
        <div className="flex flex-col gap-1 pt-1">
          <h1 className="font-serif-dm text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--soil)] tracking-tight">
            Welcome back, {userName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-[var(--soil-secondary)] font-normal">
            Real commodities. Real ownership.
          </p>
        </div>

        {/* Live Market Ticker Strip */}
        <MarketTicker commodities={commodities} />

        {/* URL-based Filter & Sort Bar */}
        <FilterBar />

        {/* Commodity Card Grid or Empty State Fallback */}
        {commodities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pt-1">
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
