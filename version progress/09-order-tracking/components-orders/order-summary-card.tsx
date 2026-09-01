// components/orders/order-summary-card.tsx — Order Detail Summary & Financial Breakdown Card.
// Renders the commodity breakdown, pricing summary, payment status badge, warehouse location, and storage/receipt actions.
// Used in: app/orders/[orderId]/page.tsx (Order Detail & Tracking view).

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { GradeBadge } from "@/components/ui/grade-badge";
import { PriceDisplay } from "@/components/ui/price-display";
import { Badge } from "@/components/ui/badge";
import { BuyerOrderDetail } from "@/lib/supabase/queries/orders";
import { cn } from "@/lib/utils";

export interface OrderSummaryCardProps {
  order: BuyerOrderDetail;
  className?: string;
}

export const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({ order, className }) => {
  const isStored = order.status === "stored";
  const isCancelledOrFailed = order.status === "cancelled" || order.status === "failed";

  return (
    <div className={cn("space-y-6", className)}>
      {/* ---------------------------------------------------------------------- */}
      {/* 1. Commodity Item Breakdown Card */}
      {/* ---------------------------------------------------------------------- */}
      <Card className="p-5 sm:p-6 bg-[#FFFFFF] border-[#E4DCC8] shadow-soil-xs">
        <h2 className="font-serif-display text-lg font-bold text-[#4A3828] mb-4 pb-3 border-b border-[#E4DCC8]">
          Purchased Commodity
        </h2>

        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#F7F4EA] border border-[#E4DCC8] flex items-center justify-center shrink-0 overflow-hidden relative">
            {order.item.imageUrl ? (
              <Image
                src={order.item.imageUrl}
                alt={order.item.commodityName}
                fill
                className="object-cover"
                sizes="80px"
              />
            ) : (
              <span className="text-3xl select-none">🌾</span>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h3 className="font-serif-display text-base sm:text-lg font-bold text-[#4A3828]">
                {order.item.commodityName}
              </h3>
              <GradeBadge grade={order.item.gradeCode} size="sm" />
            </div>

            <div className="text-xs text-[#4A3828]/70 font-sans-inter">
              Unit: <span className="font-semibold text-[#4A3828]">50kg {order.item.unit}</span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-[#4A3828]/70 font-sans-inter">
                Quantity: <strong className="text-[#4A3828]">{order.item.quantity} {order.item.unit === "ton" ? "Tons" : "Bags"}</strong>
              </span>
              <span className="text-xs font-mono-plex text-[#A88958]">
                @ ₦{order.item.unitPrice.toLocaleString()}/{order.item.unit}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* ---------------------------------------------------------------------- */}
      {/* 2. Financial Summary Card */}
      {/* ---------------------------------------------------------------------- */}
      <Card className="p-5 sm:p-6 bg-[#FFFFFF] border-[#E4DCC8] shadow-soil-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E4DCC8]">
          <h2 className="font-serif-display text-lg font-bold text-[#4A3828]">
            Payment Summary
          </h2>

          {/* Standalone Payment Status Badge */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-[#4A3828]/60 font-sans-inter hidden sm:inline">Payment:</span>
            {order.paymentStatus === "paid" ? (
              <Badge variant="stored">
                PAID
              </Badge>
            ) : order.paymentStatus === "failed" ? (
              <Badge variant="cancelled">
                FAILED
              </Badge>
            ) : (
              <Badge variant="pending">
                PENDING
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Rows */}
        <div className="space-y-2.5 text-sm font-sans-inter">
          <div className="flex items-center justify-between text-[#4A3828]/80">
            <span>Subtotal</span>
            <span className="font-mono-plex font-medium">₦{order.subtotal.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between text-[#4A3828]/80">
            <span className="flex items-center space-x-1">
              <span>Platform & Handling Fee (1%)</span>
            </span>
            <span className="font-mono-plex font-medium">₦{order.platformFee.toLocaleString()}</span>
          </div>

          <div className="pt-3 border-t border-[#E4DCC8] flex items-center justify-between text-base font-bold text-[#4A3828]">
            <span>Total Paid</span>
            <PriceDisplay amount={order.totalPrice} size="md" className="text-[#4A3828] font-bold" />
          </div>
        </div>

        {/* Reference */}
        <div className="pt-2 text-[11px] font-mono-plex text-[#4A3828]/50 flex justify-between">
          <span>Reference</span>
          <span>{order.paystackReference || `#KS-${order.id.slice(0, 8).toUpperCase()}`}</span>
        </div>
      </Card>

      {/* ---------------------------------------------------------------------- */}
      {/* 3. Warehouse & Silo Fulfillment Details */}
      {/* ---------------------------------------------------------------------- */}
      <Card className="p-5 sm:p-6 bg-[#F7F4EA] border-[#E4DCC8] shadow-soil-xs space-y-3">
        <div className="flex items-center space-x-2 text-[#4A3828]">
          <span className="text-xl">🏬</span>
          <h2 className="font-serif-display text-base sm:text-lg font-bold">
            Assigned Warehouse Silo
          </h2>
        </div>

        <p className="text-xs sm:text-sm font-sans-inter text-[#4A3828]/80 leading-relaxed">
          <strong>{order.warehouseName}</strong>
          <br />
          {order.warehouseLocation}
        </p>

        <div className="text-[11px] text-[#A88958] font-sans-inter pt-1">
          🔒 Standardized climate-controlled hermetic storage with regular SGS inspection.
        </div>
      </Card>

      {/* ---------------------------------------------------------------------- */}
      {/* 4. Action Buttons for Stored / Delivered Orders */}
      {/* ---------------------------------------------------------------------- */}
      {isStored && (
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link
            href="/my-storage"
            className="flex-1 inline-flex items-center justify-center h-10 px-4 rounded-[10px] border border-[#D8B56A] text-[#4A3828] bg-[#FFFFFF] hover:bg-[#D8B56A]/20 font-bold font-sans-inter text-sm transition-colors shadow-soil-xs"
          >
            🌾 View in My Storage
          </Link>

          <Link
            href={`/receipts/${order.receiptId || order.id}`}
            className="flex-1 inline-flex items-center justify-center h-10 px-4 rounded-[10px] bg-[#21483A] hover:bg-[#18352b] text-[#FFFFFF] font-bold font-sans-inter text-sm transition-colors shadow-soil-xs"
          >
            📜 View Warehouse Receipt
          </Link>
        </div>
      )}

      {/* Cancelled Alert Guidance */}
      {isCancelledOrFailed && (
        <div className="p-4 rounded-xl bg-[#FDF0EE] border border-[#E8AEA4] text-xs text-[#B3432E] space-y-2">
          <p className="font-bold">Notice regarding this order:</p>
          <p>This transaction was either cancelled or could not be completed. No charges were permanently captured. If you need assistance, please reach out to KorraStore support.</p>
          <Link
            href="/home"
            className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg border border-[#E8AEA4] bg-[#FFFFFF] text-[#B3432E] font-semibold text-xs hover:bg-[#fcf3f2] transition-colors mt-1"
          >
            Browse Marketplace
          </Link>
        </div>
      )}
    </div>
  );
};
