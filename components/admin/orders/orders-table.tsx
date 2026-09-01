// components/admin/orders/orders-table.tsx — Desktop Dense Orders Management Table for KorraStore.
// Renders orders with complete fulfillment and payment metadata, status badges, and direct management shortcuts.
// Used in: app/admin/orders/page.tsx (Desktop viewports ≥ 1024px).

import * as React from "react";
import Link from "next/link";
import { AdminOrderListItem } from "@/lib/supabase/queries/admin/orders";
import { GradeBadge } from "@/components/ui/grade-badge";
import { PriceDisplay } from "@/components/ui/price-display";
import { Badge } from "@/components/ui/badge";

interface OrdersTableProps {
  orders: AdminOrderListItem[];
}

export function OrdersTable({ orders }: OrdersTableProps) {
  if (!orders || orders.length === 0) {
    return (
      <div className="bg-[#FCFAF5] border border-[#E4DCC8] rounded-2xl p-12 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-[#E4DCC8]/40 text-[#A88958] flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h3 className="font-serif text-lg text-[#4A3828] mb-1">No orders found</h3>
        <p className="text-sm text-[#A88958] max-w-sm mx-auto">
          No customer orders match the current filter or search criteria.
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

  // Helper for Fulfillment Status Badge styling
  const renderFulfillmentBadge = (order: AdminOrderListItem) => {
    if (order.isException) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#B3432E]/15 text-[#B3432E] border border-[#B3432E]/30">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B3432E] animate-pulse" />
          Exception
        </span>
      );
    }

    switch (order.status) {
      case "stored":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#21483A]/10 text-[#21483A] border border-[#21483A]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#21483A]" />
            Stored in Silo
          </span>
        );
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#21483A]/10 text-[#21483A] border border-[#21483A]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#21483A]" />
            Delivered
          </span>
        );
      case "in_transit":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#303B63]/10 text-[#303B63] border border-[#303B63]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#303B63]" />
            In Transit
          </span>
        );
      case "sourcing":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#C7862B]/10 text-[#C7862B] border border-[#C7862B]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C7862B]" />
            Sourcing
          </span>
        );
      case "pending_payment":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#A88958]/15 text-[#4A3828] border border-[#E4DCC8]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A88958]" />
            Pending Payment
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-stone-200/80 text-stone-600 border border-stone-300">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-700">
            {order.status}
          </span>
        );
    }
  };

  return (
    <div className="bg-[#FCFAF5] border border-[#E4DCC8] rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-[#F5EFE0]/70 border-b border-[#E4DCC8] text-xs font-semibold text-[#4A3828] uppercase tracking-wider">
              <th className="py-3.5 px-4">Order ID</th>
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-4">Commodity</th>
              <th className="py-3.5 px-4 text-right">Quantity</th>
              <th className="py-3.5 px-4 text-right">Total Price</th>
              <th className="py-3.5 px-4 text-center">Payment</th>
              <th className="py-3.5 px-4 text-center">Fulfillment</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4DCC8]/60 text-[#4A3828]">
            {orders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-[#F7F4EA] transition-colors duration-150 group"
              >
                {/* Order ID */}
                <td className="py-3.5 px-4">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-mono text-xs font-bold text-[#303B63] hover:text-[#4A3828] hover:underline flex items-center gap-1.5"
                  >
                    <span>#KOR-{order.id.slice(0, 8).toUpperCase()}</span>
                  </Link>
                </td>

                {/* Customer Information */}
                <td className="py-3.5 px-4 max-w-[180px]">
                  <div className="font-medium text-xs text-[#4A3828] truncate">
                    {order.buyerName}
                  </div>
                  <div className="text-[11px] text-[#A88958] truncate">
                    {order.buyerEmail}
                  </div>
                </td>

                {/* Commodity & Grade */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-xs text-[#4A3828] whitespace-nowrap">
                      {order.item.commodityName}
                    </span>
                    <GradeBadge grade={order.item.gradeCode} size="sm" />
                  </div>
                </td>

                {/* Quantity */}
                <td className="py-3.5 px-4 text-right font-mono text-xs text-[#4A3828] whitespace-nowrap">
                  {order.item.quantity.toLocaleString()} {order.item.unit}
                </td>

                {/* Total Price */}
                <td className="py-3.5 px-4 text-right font-mono text-xs font-semibold text-[#4A3828] whitespace-nowrap">
                  ₦{order.totalPrice.toLocaleString()}
                </td>

                {/* Payment Status Badge */}
                <td className="py-3.5 px-4 text-center">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${
                      order.paymentStatus === "paid"
                        ? "bg-[#21483A]/10 text-[#21483A] border border-[#21483A]/20"
                        : order.paymentStatus === "pending"
                        ? "bg-[#C7862B]/10 text-[#C7862B] border border-[#C7862B]/20"
                        : "bg-[#B3432E]/10 text-[#B3432E] border border-[#B3432E]/20"
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </td>

                {/* Fulfillment Status Badge */}
                <td className="py-3.5 px-4 text-center">
                  {renderFulfillmentBadge(order)}
                </td>

                {/* Date */}
                <td className="py-3.5 px-4 text-xs text-[#A88958] whitespace-nowrap">
                  {formatDate(order.createdAt)}
                </td>

                {/* Manage Action */}
                <td className="py-3.5 px-4 text-right">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FCFAF5] hover:bg-[#D8B56A] text-[#4A3828] border border-[#E4DCC8] hover:border-[#D8B56A] transition-all shadow-xs"
                  >
                    <span>Manage</span>
                    <svg
                      className="w-3.5 h-3.5 text-[#A88958] group-hover:text-[#4A3828]"
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
