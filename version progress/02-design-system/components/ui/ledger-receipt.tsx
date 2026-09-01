// components/ui/ledger-receipt.tsx — Signature Ledger Receipt ticket component for KorraStore.
// Renders a physical commodity warehouse ledger receipt ticket with perforated edges, dashed section dividers,
// grade chip badge, and current valuation gain/loss indicators.
// Used in: user portfolio, order confirmations, receipt detail modal, design system showcase.

import * as React from "react";
import { cn } from "@/lib/utils";

// Interface for LedgerReceipt properties.
export interface LedgerReceiptProps extends React.HTMLAttributes<HTMLDivElement> {
  // Receipt unique identifier / serial code
  receiptNumber?: string;
  // Name of stored commodity
  commodityName?: string;
  // Warehouse silo storage location
  warehouseLocation?: string;
  // Commodity quantity stored (e.g., "50 Metric Tons")
  quantity?: string;
  // Quality grade (e.g., "Grade A", "Grade B")
  grade?: string;
  // Initial purchase value formatted in NGN
  purchaseValue?: string;
  // Current real-time market value formatted in NGN
  currentValue?: string;
  // Value change percentage formatted (e.g. "+12.4%")
  percentageChange?: string;
  // Boolean indicating whether percentage change is positive
  isPositiveChange?: boolean;
  // Current storage / ownership status
  status?: "Stored" | "In Transit" | "Processing" | "Sold";
}

// Signature Ledger Receipt primitive definition.
export const LedgerReceipt = React.forwardRef<HTMLDivElement, LedgerReceiptProps>(
  (
    {
      className,
      receiptNumber = "RECEIPT #KORRA-0000",
      commodityName = "Agricultural Commodity",
      warehouseLocation = "Central Silo, Nigeria",
      quantity = "0 Metric Tons",
      grade = "Grade A",
      purchaseValue = "₦0",
      currentValue = "₦0",
      percentageChange = "+0.0%",
      isPositiveChange = true,
      status = "Stored",
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative bg-[#FFFFFF] border-2 border-[var(--harvest-wheat)] rounded-[14px] shadow-soil-md overflow-hidden text-[var(--soil)] max-w-lg w-full font-sans-inter",
          className
        )}
        {...props}
      >
        {/* Perforated Edge Header Band */}
        <div className="bg-[var(--deep-grain-green)] text-[#FFFFFF] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-base">📜</span>
            <span className="font-mono-plex text-xs tracking-wider uppercase font-semibold text-[var(--harvest-wheat)]">
              {receiptNumber}
            </span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FFFFFF]/15 text-[#FFFFFF] border border-[#FFFFFF]/20">
            {status}
          </span>
        </div>

        {/* Ticket Content Body */}
        <div className="p-6 space-y-4">
          {/* Commodity Header */}
          <div>
            <span className="text-[11px] font-semibold text-[var(--soil-tertiary)] uppercase tracking-wider block">
              OFFICIAL WAREHOUSE TICKET
            </span>
            <h3 className="font-serif-display text-2xl text-[var(--soil)] mt-0.5">
              {commodityName}
            </h3>
            <p className="text-xs text-[var(--soil-secondary)] mt-1 flex items-center gap-1">
              📍 {warehouseLocation}
            </p>
          </div>

          {/* Quantity & Grade Row */}
          <div className="grid grid-cols-2 gap-4 bg-[var(--paper)] p-3.5 rounded-[10px] border border-[var(--border-color)]">
            <div>
              <span className="text-[11px] text-[var(--soil-tertiary)] uppercase font-semibold block">
                Quantity Stored
              </span>
              <span className="font-mono-plex text-sm font-semibold text-[var(--soil)]">
                {quantity}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-[var(--soil-tertiary)] uppercase font-semibold block">
                Quality Grade
              </span>
              <span className="inline-block mt-0.5 px-2 py-0.5 text-xs font-semibold rounded-[6px] bg-[var(--deep-grain-green)] text-[#FFFFFF]">
                {grade}
              </span>
            </div>
          </div>

          {/* Dashed Perforated Section Divider */}
          <div className="receipt-dashed-divider my-4" />

          {/* Financial Valuation Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--soil-secondary)]">Purchase Value:</span>
              <span className="font-mono-plex font-medium text-[var(--soil)]">{purchaseValue}</span>
            </div>

            <div className="flex justify-between items-end pt-1">
              <div>
                <span className="text-[11px] font-bold text-[var(--soil-tertiary)] uppercase tracking-wider block">
                  Current Valuation
                </span>
                <span className="font-mono-plex text-xl font-bold text-[var(--deep-grain-green)]">
                  {currentValue}
                </span>
              </div>
              {percentageChange && (
                <div
                  className={cn(
                    "px-3 py-1 rounded-[8px] text-xs font-mono-plex font-bold flex items-center gap-1",
                    isPositiveChange
                      ? "bg-[var(--deep-grain-green)] text-[#FFFFFF]"
                      : "bg-[var(--danger)] text-[#FFFFFF]"
                  )}
                >
                  {isPositiveChange ? "▲" : "▼"} {percentageChange}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Receipt Microprint */}
        <div className="bg-[var(--paper)] border-t border-[var(--border-color)] px-5 py-2.5 flex justify-between items-center text-[10px] text-[var(--soil-tertiary)] font-mono-plex">
          <span>KORRASTORE WAREHOUSE LEDGER</span>
          <span>VERIFIED ON-CHAIN & PHYSICAL SILO</span>
        </div>
      </div>
    );
  }
);
LedgerReceipt.displayName = "LedgerReceipt";
