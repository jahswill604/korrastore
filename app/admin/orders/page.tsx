// app/admin/orders/page.tsx — Admin Orders Management List Page for KorraStore.
// Renders the operational order listing with multi-status tabs, search bar, dense desktop table, mobile cards, and pagination.
// Security: Admin role verification enforced by app/admin/layout.tsx and service client queries.
// Used in: /admin/orders

import * as React from "react";
import { getAllAdminOrders } from "@/lib/supabase/queries/admin/orders";
import { OrderFilterBar } from "@/components/admin/orders/order-filter-bar";
import { OrdersTable } from "@/components/admin/orders/orders-table";
import { OrdersMobileList } from "@/components/admin/orders/orders-mobile-list";
import { AdminOrdersPagination } from "@/components/admin/orders/admin-orders-pagination";

export const dynamic = "force-dynamic";

interface AdminOrdersPageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  const resolvedParams = await searchParams;
  const currentStatus = resolvedParams.status || "all";
  const currentSearch = resolvedParams.search || "";
  const currentPage = Number(resolvedParams.page) || 1;

  // 1. Fetch filtered orders and operational counters
  const { orders, metrics, totalPages, totalCount } = await getAllAdminOrders({
    status: currentStatus,
    search: currentSearch,
    page: currentPage,
    limit: 15,
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Operational Context */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-[#E4DCC8]">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#4A3828] font-bold">
            Orders Management
          </h1>
          <p className="text-xs sm:text-sm text-[#A88958] mt-0.5">
            Monitor, advance fulfillment stages, and triage exceptions across all customer commodity orders.
          </p>
        </div>

        {/* Live Counter Badge */}
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#FCFAF5] border border-[#E4DCC8] flex items-center gap-2 text-xs shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#21483A]" />
            <span className="font-medium text-[#4A3828]">Total Orders:</span>
            <span className="font-mono font-bold text-[#D8B56A]">
              {metrics.totalOrders}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <OrderFilterBar
        metrics={metrics}
        currentStatus={currentStatus}
        currentSearch={currentSearch}
      />

      {/* Desktop Dense Table View (≥1024px) */}
      <div className="hidden lg:block">
        <OrdersTable orders={orders} />
      </div>

      {/* Mobile Stacked Card View (<1024px) */}
      <div className="block lg:hidden">
        <OrdersMobileList orders={orders} />
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pt-4 flex justify-center">
          <AdminOrdersPagination
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
      )}
    </div>
  );
}

