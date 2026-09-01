// app/receipts/page.tsx — KorraStore Buyer Warehouse Receipts List Page.
// Server Component — Auth-guarded, fetches all certified receipts for the buyer,
// and renders an overview grid with live market valuations and direct links to receipt tickets.
// Route: /receipts (protected buyer route).

import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserReceipts } from "@/lib/supabase/queries/receipts";
import { AppShell } from "@/components/layout/app-shell";
import { GradeBadge } from "@/components/ui/grade-badge";
import { PriceDisplay } from "@/components/ui/price-display";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

// ----------------------------------------------------------------------------
// SEO Metadata
// ----------------------------------------------------------------------------
export const metadata: Metadata = {
  title: "Warehouse Receipts | KorraStore",
  description:
    "View all your certified KorraStore warehouse receipts, live holding valuations, and verifiable physical ownership ledger tickets.",
};

// ----------------------------------------------------------------------------
// Receipts List Server Component
// ----------------------------------------------------------------------------
export default async function ReceiptsListPage() {
  const supabase = await createClient();

  // 1. Authenticate user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && process.env.NODE_ENV === "production") {
    redirect("/login?redirect=/receipts");
  }

  const userId = user?.id || "demo-user";

  // 2. Fetch all buyer receipts
  const receipts = await getUserReceipts(userId);

  return (
    <AppShell>
      <main className="min-h-screen bg-[#F7F4EA] py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4DCC8] pb-5">
            <div>
              <h1 className="font-serif-display text-2xl sm:text-3xl text-[#4A3828]">
                Warehouse Receipts
              </h1>
              <p className="text-xs sm:text-sm font-sans-inter text-[#4A3828]/70 mt-1">
                Verifiable digital receipts for all physical commodities stored in Korra silos.
              </p>
            </div>

            <Link
              href="/my-storage"
              className="inline-flex items-center justify-center h-10 px-4 rounded-[10px] border border-[#D8B56A] bg-[#FFFFFF] hover:bg-[#F7F4EA] text-[#4A3828] font-semibold text-xs transition-colors self-start sm:self-auto"
            >
              🌾 View Portfolio in My Storage
            </Link>
          </div>

          {/* Receipts Grid / Empty State */}
          {receipts.length === 0 ? (
            <div className="text-center py-12">
              <EmptyState
                title="No warehouse receipts found"
                description="Your receipts will appear here once your commodity purchases are verified and stored in a Korra silo."
                className="my-4"
              />
              <Link
                href="/marketplace"
                className="inline-flex items-center justify-center h-10 px-5 rounded-[10px] bg-[#D8B56A] hover:bg-[#c9a456] text-[#4A3828] font-bold text-sm transition-colors shadow-soil-xs mt-2"
              >
                Explore Marketplace
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {receipts.map((receipt) => (
                <Card
                  key={receipt.id}
                  className="bg-[#FFFFFF] border-2 border-[#E4DCC8] hover:border-[#D8B56A] rounded-[14px] p-5 shadow-soil-xs transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header Row */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono-plex text-xs font-semibold text-[#D8B56A] uppercase">
                        {receipt.receiptNumber}
                      </span>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#21483A]/10 text-[#21483A] border border-[#21483A]/20">
                        {receipt.status}
                      </span>
                    </div>

                    {/* Commodity Title & Grade */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="font-serif-display text-xl text-[#4A3828]">
                          {receipt.commodityName}
                        </h2>
                        <p className="text-xs text-[#4A3828]/60 mt-0.5">
                          📍 {receipt.warehouseLocation}
                        </p>
                      </div>
                      <GradeBadge grade={receipt.gradeCode as "A" | "B" | "C"} size="sm" />
                    </div>

                    {/* Quantity & Valuation Summary */}
                    <div className="bg-[#F7F4EA] p-3 rounded-[10px] border border-[#E4DCC8] grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[#4A3828]/60 uppercase text-[10px] font-semibold block">
                          Stored Quantity
                        </span>
                        <span className="font-mono-plex font-bold text-[#4A3828] text-sm">
                          {receipt.quantityFormatted}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#4A3828]/60 uppercase text-[10px] font-semibold block">
                          Current Valuation
                        </span>
                        <PriceDisplay
                          amount={receipt.currentTotalValue}
                          size="sm"
                          className="font-mono-plex font-bold text-[#21483A]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="pt-4 mt-4 border-t border-[#E4DCC8] flex items-center justify-between">
                    <span className="text-[11px] text-[#4A3828]/60">
                      Issued: {receipt.purchaseDate}
                    </span>
                    <Link
                      href={`/receipts/${receipt.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#21483A] hover:text-[#18352b] transition-colors"
                    >
                      <span>View Receipt Ticket</span>
                      <span>→</span>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </AppShell>
  );
}
