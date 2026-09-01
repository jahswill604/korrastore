// components/admin/orders/orders-mobile-list.tsx — Mobile Stacked Orders List for KorraStore.
// Renders touch-friendly cards with complete fulfillment metrics and quick management buttons for smaller viewports.
// Used in: app/admin/orders/page.tsx (Mobile viewports < 1024px).

import * as React from "react";
import Link from "next/link";
import { AdminOrderListItem } from "@/lib/supabase/queries/admin/orders";
import { GradeBadge } from "@/components/ui/grade-badge";

interface OrdersMobileListProps {
  orders: AdminOrderListItem[];
}

export function OrdersMobileList({ orders }: OrdersMobileListProps) {
  if (!orders || orders.length === 0) {
    return (
      <div className="bg-[#FCFAF5] border border-[#E4DCC8] rounded-2xl p-8 text-center shadow-sm">
        <h3 className="font-serif text-base text-[#4A3828] mb-1">No orders found</h3>
        <p className="text-xs text-[#A88958]">
          Try switching status filters or clearing the search query.
        </p>
      </div>
    );
  }

  // Format date helper
  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-NG", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {orders.map((order) => {
        return (
          <div
            key={order.id}
            className={`bg-[#FCFAF5] border rounded-2xl p-4 shadow-sm transition-all ${
              order.isException
                ? "border-[#B3432E]/50 ring-1 ring-[#B3432E]/20"
                : "border-[#E4DCC8]"
            }`}
          >
            {/* Header: Order ID & Status Badges */}
            <div className="flex items-center justify-between gap-2 mb-2.5 pb-2.5 border-b border-[#E4DCC8]/60">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-[#A88958] font-medium">Order:</span>
                <span className="font-mono text-xs font-bold text-[#303B63]">
                  #KOR-{order.id.slice(0, 8).toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Payment Badge */}
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                    order.paymentStatus === "paid"
                      ? "bg-[#21483A]/10 text-[#21483A]"
                      : "bg-[#C7862B]/10 text-[#C7862B]"
                  }`}
                >
                  {order.paymentStatus}
                </span>

                {/* Fulfillment / Exception Badge */}
                {order.isException ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#B3432E] text-white">
                    Exception
                  </span>
                ) : (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                      order.status === "stored" || order.status === "delivered"
                        ? "bg-[#21483A]/10 text-[#21483A]"
                        : order.status === "in_transit"
                        ? "bg-[#303B63]/10 text-[#303B63]"
                        : "bg-[#C7862B]/10 text-[#C7862B]"
                    }`}
                  >
                    {order.status.replace("_", " ")}
                  </span>
                )}
              </div>
            </div>

            {/* Buyer Details */}
            <div className="mb-2">
              <div className="text-xs font-semibold text-[#4A3828]">
                {order.buyerName}
              </div>
              <div className="text-[11px] text-[#A88958]">{order.buyerEmail}</div>
            </div>

            {/* Commodity & Quantity Specs */}
            <div className="flex items-center justify-between text-xs py-1 text-[#4A3828]">
              <div className="flex items-center gap-1.5">
                <span className="font-medium">{order.item.commodityName}</span>
                <GradeBadge grade={order.item.gradeCode} size="sm" />
              </div>
              <span className="font-mono text-[11px] text-[#A88958]">
                {order.item.quantity.toLocaleString()} {order.item.unit}
              </span>
            </div>

            {/* Price and Date */}
            <div className="flex items-center justify-between text-xs pt-1.5 mt-1 border-t border-[#E4DCC8]/40">
              <span className="text-[11px] text-[#A88958]">{formatDate(order.createdAt)}</span>
              <div className="font-mono text-sm font-bold text-[#4A3828]">
                ₦{order.totalPrice.toLocaleString()}
              </div>
            </div>

            {/* Exception Warning Banner if active */}
            {order.isException && (
              <div className="mt-3 p-2.5 rounded-xl bg-[#B3432E]/10 border border-[#B3432E]/25 flex items-start gap-2">
                <span className="text-[#B3432E] text-xs font-bold">⚠️</span>
                <p className="text-[11px] text-[#B3432E] font-medium leading-tight">
                  {order.exceptionReason || "Reconciliation required: stock allocation failed."}
                </p>
              </div>
            )}

            {/* Manage Action Button */}
            <div className="mt-3">
              <Link
                href={`/admin/orders/${order.id}`}
                className={`w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all shadow-xs ${
                  order.isException
                    ? "bg-[#B3432E] hover:bg-[#962F1D] text-white"
                    : "bg-[#D8B56A] hover:bg-[#C7A254] text-[#4A3828]"
                }`}
              >
                <span>{order.isException ? "Triage & Resolve Exception" : "Manage Order"}</span>
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
