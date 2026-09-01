// app/receipts/[receiptId]/page.tsx — KorraStore Warehouse Receipt Detail Page.
// Server Component — Auth-guarded, fetches structured receipt data server-side,
// computes dynamic live market valuation, and renders the signature LedgerReceipt ticket.
// Route: /receipts/[receiptId] (protected buyer route; session required).
// Used in: Direct receipt access, order fulfillment completion link, My Storage portfolio link.

import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getReceiptDetail } from "@/lib/supabase/queries/receipts";
import { AppShell } from "@/components/layout/app-shell";
import { ReceiptView } from "@/components/receipts/receipt-view";
import { ReceiptActions } from "@/components/receipts/receipt-actions";
import { ReceiptNotGenerated } from "@/components/receipts/receipt-not-generated";

// ----------------------------------------------------------------------------
// SEO Metadata
// ----------------------------------------------------------------------------
export const metadata: Metadata = {
  title: "Warehouse Receipt | KorraStore",
  description:
    "Official KorraStore digital warehouse receipt and physical ledger ticket with certified ownership and live market valuation.",
};

// ----------------------------------------------------------------------------
// Page Props Interface
// ----------------------------------------------------------------------------
interface ReceiptPageProps {
  params: Promise<{ receiptId: string }>;
}

// ----------------------------------------------------------------------------
// Receipt Detail Server Component
// ----------------------------------------------------------------------------
export default async function ReceiptDetailPage({ params }: ReceiptPageProps) {
  const { receiptId } = await params;
  const supabase = await createClient();

  // 1. Authenticate user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // In production, redirect unauthenticated users to login
  if (!user && process.env.NODE_ENV === "production") {
    redirect(`/login?redirect=/receipts/${receiptId}`);
  }

  const userId = user?.id || "demo-user";

  // 2. Fetch receipt details with live dynamic valuation
  const receipt = await getReceiptDetail(userId, receiptId);

  // If receipt is not found at all
  if (!receipt) {
    notFound();
  }

  return (
    <AppShell>
      <main className="min-h-screen bg-[#F7F4EA] py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[680px] mx-auto space-y-6">
          {/* ---------------------------------------------------------------- */}
          {/* 1. Breadcrumb Trail & Back Navigation */}
          {/* ---------------------------------------------------------------- */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center space-x-2 text-xs font-sans-inter text-[#4A3828]/60"
          >
            <Link
              href="/orders"
              className="hover:text-[#4A3828] transition-colors"
            >
              Orders
            </Link>
            <span>/</span>
            {receipt.orderId ? (
              <Link
                href={`/orders/${receipt.orderId}`}
                className="hover:text-[#4A3828] transition-colors"
              >
                #{receipt.orderId.slice(0, 10)}
              </Link>
            ) : (
              <span>My Storage</span>
            )}
            <span>/</span>
            <span className="font-semibold text-[#4A3828]">Receipt</span>
          </nav>

          {/* ---------------------------------------------------------------- */}
          {/* 2. Page Title Header */}
          {/* ---------------------------------------------------------------- */}
          <div className="flex items-center justify-between">
            <h1 className="font-serif-display text-2xl sm:text-3xl text-[#4A3828]">
              Warehouse Receipt
            </h1>
            <Link
              href="/orders"
              className="text-xs text-[#A88958] hover:text-[#4A3828] font-semibold underline underline-offset-4"
            >
              ← Back to Orders
            </Link>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* 3. Main Receipt View or Not-Yet-Generated State */}
          {/* ---------------------------------------------------------------- */}
          {receipt.isGenerated ? (
            <>
              {/* Full-scale Physical Ledger Ticket */}
              <ReceiptView receipt={receipt} />

              {/* Action Buttons: View in Storage & Download */}
              <ReceiptActions
                receiptId={receipt.id}
                receiptNumber={receipt.receiptNumber}
                holdingId={receipt.holdingId}
              />
            </>
          ) : (
            <ReceiptNotGenerated orderId={receipt.orderId} />
          )}
        </div>
      </main>
    </AppShell>
  );
}
