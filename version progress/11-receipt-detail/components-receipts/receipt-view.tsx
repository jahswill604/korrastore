// components/receipts/receipt-view.tsx — Full-size Ledger Warehouse Receipt component for KorraStore.
// Renders the signature physical ledger ticket with perforated edges, dashed section dividers,
// live market valuations, purchase price delta badges, and warehouse verification metadata.
// Used in: app/receipts/[receiptId]/page.tsx

import React from "react";
import { GradeBadge } from "@/components/ui/grade-badge";
import { PriceDisplay } from "@/components/ui/price-display";
import type { ReceiptDetail } from "@/lib/supabase/queries/receipts";

// Interface for ReceiptViewProps
export interface ReceiptViewProps {
  /** Receipt data structure containing commodity details and live valuation */
  receipt: ReceiptDetail;
}

// ----------------------------------------------------------------------------
// ReceiptView Component Definition
// ----------------------------------------------------------------------------
export const ReceiptView: React.FC<ReceiptViewProps> = ({ receipt }) => {
  return (
    <div className="relative w-full max-w-[640px] mx-auto bg-[#FFFFFF] border-2 border-[#D8B56A] rounded-[16px] shadow-soil-md overflow-hidden font-sans-inter">
      {/* -------------------------------------------------------------------- */}
      {/* 1. Perforated Edge Header Band */}
      {/* -------------------------------------------------------------------- */}
      <div className="bg-[#21483A] text-[#FFFFFF] px-6 py-4 flex items-center justify-between border-b-2 border-dashed border-[#D8B56A]/40">
        <div className="flex items-center space-x-2.5">
          <span className="text-lg" aria-hidden="true">
            📜
          </span>
          <span className="font-mono-plex text-xs sm:text-sm tracking-wider uppercase font-semibold text-[#D8B56A]">
            {receipt.receiptNumber}
          </span>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#FFFFFF]/15 text-[#FFFFFF] border border-[#FFFFFF]/30">
          {receipt.status}
        </span>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 2. Ticket Body */}
      {/* -------------------------------------------------------------------- */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Commodity Heading & Warehouse Silo */}
        <div>
          <span className="text-[11px] font-bold text-[#A88958] uppercase tracking-wider block">
            OFFICIAL WAREHOUSE TICKET
          </span>
          <h2 className="font-serif-display text-2xl sm:text-3xl text-[#4A3828] mt-1 font-normal">
            {receipt.commodityName}
          </h2>
          <p className="text-xs sm:text-sm text-[#4A3828]/70 mt-1.5 flex items-center gap-1.5">
            <span aria-hidden="true">📍</span>
            <span>{receipt.warehouseLocation}</span>
          </p>
        </div>

        {/* Quantity & Grade 2-Column Row */}
        <div className="grid grid-cols-2 gap-4 bg-[#F7F4EA] p-4 rounded-[12px] border border-[#E4DCC8]">
          <div>
            <span className="text-[11px] text-[#4A3828]/60 uppercase font-semibold block">
              Quantity Stored
            </span>
            <span className="font-mono-plex text-base sm:text-lg font-bold text-[#4A3828] mt-0.5 block">
              {receipt.quantityFormatted}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-[#4A3828]/60 uppercase font-semibold block mb-1">
              Quality Grade
            </span>
            <GradeBadge grade={receipt.gradeCode as "A" | "B" | "C"} size="md" />
          </div>
        </div>

        {/* Dashed Perforated Divider */}
        <div className="receipt-dashed-divider" />

        {/* Purchase Value Details */}
        <div className="space-y-2.5 text-xs sm:text-sm font-sans-inter">
          <div className="flex justify-between items-center text-[#4A3828]/80">
            <span>Purchase Date</span>
            <span className="font-medium text-[#4A3828]">{receipt.purchaseDate}</span>
          </div>

          <div className="flex justify-between items-center text-[#4A3828]/80">
            <span>Purchase Price (per unit)</span>
            <span className="font-mono-plex font-medium text-[#4A3828]">
              ₦{receipt.unitPurchasePrice.toLocaleString()} / {receipt.commodityUnit}
            </span>
          </div>

          <div className="flex justify-between items-center text-[#4A3828]">
            <span className="font-medium">Total Purchase Value</span>
            <span className="font-mono-plex font-bold text-sm sm:text-base">
              ₦{receipt.totalPurchasePrice.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Dashed Perforated Divider */}
        <div className="receipt-dashed-divider" />

        {/* Real-time Dynamic Live Valuation */}
        <div className="bg-[#F7F4EA]/60 p-4 rounded-[12px] border border-[#E4DCC8] space-y-3">
          <div className="flex justify-between items-center text-xs text-[#4A3828]/70">
            <span>Current Market Price</span>
            <span className="font-mono-plex font-semibold text-[#21483A]">
              ₦{receipt.currentUnitPrice.toLocaleString()} / {receipt.commodityUnit}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pt-1 border-t border-[#E4DCC8]">
            <div>
              <span className="text-[11px] font-bold text-[#A88958] uppercase tracking-wider block">
                Current Live Valuation
              </span>
              <div className="mt-0.5">
                <PriceDisplay
                  amount={receipt.currentTotalValue}
                  size="lg"
                  className="font-mono-plex font-bold text-[#21483A]"
                />
              </div>
            </div>

            {/* Profit/Loss Delta Pill Badge */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-mono-plex font-bold self-start sm:self-auto ${
                receipt.isPositiveChange
                  ? "bg-[#21483A] text-[#FFFFFF]"
                  : "bg-[#B3432E] text-[#FFFFFF]"
              }`}
            >
              <span>{receipt.isPositiveChange ? "▲" : "▼"}</span>
              <span>
                {receipt.isPositiveChange ? "+" : ""}₦
                {Math.abs(receipt.profitLoss).toLocaleString()} ({receipt.percentageChange})
              </span>
            </div>
          </div>
        </div>

        {/* Dashed Perforated Divider */}
        <div className="receipt-dashed-divider" />

        {/* Storage Location & Ownership Verification Metadata */}
        <div className="space-y-2 text-xs text-[#4A3828]/80 font-sans-inter">
          <div className="flex justify-between items-center">
            <span>Ownership Status</span>
            <span className="font-semibold text-[#21483A] flex items-center gap-1">
              <span>✓</span> Stored in Korra Silo
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span>Warehouse</span>
            <span className="font-medium text-[#4A3828]">{receipt.warehouseName}</span>
          </div>

          <div className="flex justify-between items-center">
            <span>Receipt ID</span>
            <span className="font-mono-plex font-medium text-[#4A3828]">{receipt.id}</span>
          </div>

          <div className="flex justify-between items-center">
            <span>Issue Date & Time</span>
            <span className="font-mono-plex text-[#4A3828]">
              {new Date(receipt.issuedAt).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 3. Footer Microprint Band */}
      {/* -------------------------------------------------------------------- */}
      <div className="bg-[#F7F4EA] border-t border-[#E4DCC8] px-6 py-3 flex flex-col sm:flex-row justify-between items-center gap-1 text-[10px] text-[#4A3828]/60 font-mono-plex">
        <span>KORRASTORE WAREHOUSE LEDGER</span>
        <span>VERIFIED ON-CHAIN & PHYSICAL SILO</span>
      </div>
    </div>
  );
};
