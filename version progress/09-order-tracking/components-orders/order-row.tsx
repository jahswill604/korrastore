// components/orders/order-row.tsx — Order Card Row Component for KorraStore Order History.
// Renders an individual order card with commodity thumbnail, grade badge, quantity, total price, and fulfillment status badge.
// Used in: app/orders/page.tsx (Order History List view).

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { GradeBadge } from "@/components/ui/grade-badge";
import { PriceDisplay } from "@/components/ui/price-display";
import { BuyerOrderSummary, OrderFulfillmentStatus } from "@/lib/supabase/queries/orders";
import { cn } from "@/lib/utils";

// Helper function to return visual badge status and label for fulfillment stages
export function getFulfillmentBadgeConfig(status: OrderFulfillmentStatus) {
  switch (status) {
    case "pending_payment":
      return {
        label: "Pending Payment",
        customClass: "bg-[#FBF3D5] text-[#8C6B1C] border-[#E8D69A]",
      };
    case "sourcing":
      return {
        label: "Sourcing",
        customClass: "bg-[#EDE8DA] text-[#4A3828] border-[#D8D0BA]",
      };
    case "in_transit":
      return {
        label: "In Transit",
        customClass: "bg-[#D8B56A]/20 text-[#856519] border-[#D8B56A]/40 font-bold",
      };
    case "stored":
      return {
        label: "Stored in Silo",
        customClass: "bg-[#21483A]/10 text-[#21483A] border-[#21483A]/30 font-bold",
      };
    case "delivered":
      return {
        label: "Delivered",
        customClass: "bg-[#21483A]/10 text-[#21483A] border-[#21483A]/30 font-bold",
      };
    case "cancelled":
    case "failed":
      return {
        label: status === "cancelled" ? "Cancelled" : "Payment Failed",
        customClass: "bg-[#FDF0EE] text-[#B3432E] border-[#E8AEA4]",
      };
    default:
      return {
        label: "Processing",
        customClass: "bg-[#EDE8DA] text-[#4A3828]",
      };
  }
}

export interface OrderRowProps {
  order: BuyerOrderSummary;
  className?: string;
}

export const OrderRow: React.FC<OrderRowProps> = ({ order, className }) => {
  const badgeConfig = getFulfillmentBadgeConfig(order.status);

  // Format creation date
  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Card
      className={cn(
        "p-4 sm:p-5 hover:border-[#D8B56A] transition-all duration-200 bg-[#FFFFFF] shadow-soil-xs hover:shadow-soil-sm",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Side: Thumbnail & Order Info */}
        <div className="flex items-start sm:items-center space-x-3.5 sm:space-x-4">
          {/* Commodity Thumbnail */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#F7F4EA] border border-[#E4DCC8] flex items-center justify-center shrink-0 overflow-hidden relative">
            {order.item.imageUrl ? (
              <Image
                src={order.item.imageUrl}
                alt={order.item.commodityName}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <span className="text-2xl select-none">🌾</span>
            )}
          </div>

          {/* Commodity Details & Metadata */}
          <div className="space-y-1">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h3 className="font-serif-display text-base sm:text-lg font-bold text-[#4A3828] leading-tight">
                {order.item.commodityName}
              </h3>
              <GradeBadge grade={order.item.gradeCode} size="sm" />
            </div>

            <div className="flex items-center space-x-2 text-xs font-sans-inter text-[#4A3828]/70">
              <span className="font-semibold text-[#4A3828]">
                {order.item.quantity} {order.item.unit === "ton" ? "Tons" : "Bags"}
              </span>
              <span>•</span>
              <span className="font-mono-plex text-[#A88958]">{formattedDate}</span>
            </div>

            <div className="text-[11px] font-mono-plex text-[#4A3828]/50">
              Order ID: #{order.id.slice(0, 8).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Right Side: Total Price, Status Badge & View Button */}
        <div className="flex items-center justify-between sm:justify-end sm:space-x-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E4DCC8]/60">
          <div className="text-left sm:text-right space-y-1">
            <PriceDisplay
              amount={order.totalPrice}
              size="md"
              className="font-bold text-[#4A3828]"
            />
            <div>
              <span
                className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                  badgeConfig.customClass
                )}
              >
                {badgeConfig.label}
              </span>
            </div>
          </div>

          {/* View Details Action Link */}
          <Link
            href={`/orders/${order.id}`}
            className="inline-flex items-center justify-center p-2 rounded-xl text-[#4A3828] bg-[#F7F4EA] hover:bg-[#D8B56A] transition-all duration-200 text-sm font-semibold shrink-0 group focus:outline-none"
            aria-label={`View details for order ${order.id}`}
          >
            <svg
              className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </Card>
  );
};
