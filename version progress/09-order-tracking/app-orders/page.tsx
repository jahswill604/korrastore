// app/orders/page.tsx — Server Component for KorraStore Buyer Order History.
// Renders the list of buyer orders with status filtering and AppShell navigation wrapper.
// Security: Requires active session verified against Supabase Auth (redirects unauthenticated to /login).
// Used in: /orders route.

import * as React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getBuyerOrders } from "@/lib/supabase/queries/orders";
import { AppShell } from "@/components/layout/app-shell";
import { OrderStatusFilter } from "@/components/orders/order-status-filter";
import { OrderRow } from "@/components/orders/order-row";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = {
  title: "My Orders — KorraStore",
  description: "Track your agricultural commodity purchases, sourcing status, and silo storage verification.",
};

interface OrdersPageProps {
  searchParams: Promise<{
    status?: string;
    page?: string;
  }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  // --------------------------------------------------------------------------
  // 1. Session Verification
  // --------------------------------------------------------------------------
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/orders");
  }

  // --------------------------------------------------------------------------
  // 2. Fetch Buyer Orders with URL-driven filters
  // --------------------------------------------------------------------------
  const resolvedParams = await searchParams;
  const currentStatus = resolvedParams.status || "all";

  const orders = await getBuyerOrders(user.id, {
    status: currentStatus,
  });

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E4DCC8] pb-4">
          <div>
            <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#4A3828]">
              Order History & Tracking
            </h1>
            <p className="text-xs sm:text-sm font-sans-inter text-[#4A3828]/70 mt-1">
              Track your grain purchases, transit progress, and warehouse silo verification.
            </p>
          </div>

          <Link
            href="/home"
            className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-[#D8B56A] text-[#4A3828] bg-[#F7F4EA] hover:bg-[#D8B56A]/20 transition-colors inline-flex items-center space-x-1.5"
          >
            <span>🌾</span>
            <span>Browse Commodities</span>
          </Link>
        </div>

        {/* Status Filter Tabs */}
        <OrderStatusFilter activeStatus={currentStatus} />

        {/* Orders List / Empty State */}
        {orders.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title={currentStatus === "all" ? "No orders found" : `No orders with status "${currentStatus}"`}
              description={
                currentStatus === "all"
                  ? "You haven't purchased any commodities yet. Browse the KorraStore catalog to start storing grains in verified silos."
                  : "Try selecting a different filter tab or explore available marketplace commodities."
              }
            />
            <div className="text-center -mt-2">
              <Link
                href="/home"
                className="inline-flex items-center justify-center h-10 px-5 rounded-[10px] bg-[#D8B56A] text-[#4A3828] font-sans-inter font-semibold text-sm hover:bg-[#c9a45b] shadow-soil-sm transition-colors"
              >
                Explore Marketplace
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
