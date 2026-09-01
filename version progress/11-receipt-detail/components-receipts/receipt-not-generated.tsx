// components/receipts/receipt-not-generated.tsx — Pending state placeholder when receipt is not yet generated.
// Rendered when an order exists but is still in sourcing/in-transit before physical silo placement.
// Used in: app/receipts/[receiptId]/page.tsx

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";

export interface ReceiptNotGeneratedProps {
  /** Optional order ID if linked */
  orderId?: string;
}

export const ReceiptNotGenerated: React.FC<ReceiptNotGeneratedProps> = ({ orderId }) => {
  return (
    <Card className="w-full max-w-[640px] mx-auto p-8 sm:p-12 text-center bg-[#FFFFFF] border-2 border-[#E4DCC8] rounded-[16px] shadow-soil-sm space-y-5">
      {/* Hourglass / Document pending icon */}
      <div className="w-16 h-16 rounded-full bg-[#F5EFE0] mx-auto flex items-center justify-center text-3xl">
        ⏳
      </div>

      <div className="space-y-2">
        <h2 className="font-serif-display text-2xl sm:text-3xl text-[#4A3828]">
          Receipt Generation in Progress
        </h2>
        <p className="text-sm font-sans-inter text-[#4A3828]/70 max-w-md mx-auto leading-relaxed">
          Your official warehouse receipt will be minted and certified once your physical commodity order is verified and safely deposited in the Korra Silo.
        </p>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
        {orderId && (
          <Link
            href={`/orders/${orderId}`}
            className="inline-flex items-center justify-center h-11 px-5 rounded-[10px] bg-[#D8B56A] hover:bg-[#c9a456] text-[#4A3828] font-bold text-sm transition-colors shadow-soil-xs"
          >
            Track Order Status
          </Link>
        )}
        <Link
          href="/orders"
          className="inline-flex items-center justify-center h-11 px-5 rounded-[10px] border border-[#E4DCC8] bg-[#FFFFFF] hover:bg-[#F7F4EA] text-[#4A3828] font-semibold text-sm transition-colors"
        >
          View All Orders
        </Link>
      </div>
    </Card>
  );
};
