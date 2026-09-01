// app/admin/inventory/page.tsx — Admin Inventory & Warehouses Management Page (Server Component).
// Renders the 3-tab operational stock control interface for KorraStore administrators.
// Tabs: Inventory Balances (with ledger adjustments), Commodities & Grades, Warehouses.
// Security: Role-gated at layout + server query level.
// Used in: /admin/inventory route.

import * as React from "react";
import Link from "next/link";
import {
  getInventoryStats,
  getInventoryLines,
  getCommodities,
  getWarehouses,
} from "@/lib/supabase/queries/admin/inventory";
import { InventoryTab } from "@/components/admin/inventory/inventory-tab";
import { CommoditiesTab } from "@/components/admin/inventory/commodities-tab";
import { WarehousesTab } from "@/components/admin/inventory/warehouses-tab";

// ----------------------------------------------------------------------------
// Metadata
// ----------------------------------------------------------------------------

export const metadata = {
  title: "Inventory & Warehouses | KorraStore Admin",
  description:
    "Manage agricultural commodities, quality grades, warehouse silos, and real-time inventory balances with auditable movement ledger.",
};

// ----------------------------------------------------------------------------
// Props
// ----------------------------------------------------------------------------

interface AdminInventoryPageProps {
  searchParams: Promise<{
    tab?: string;
    commodity?: string;
    warehouse?: string;
  }>;
}

// ----------------------------------------------------------------------------
// StatCard Helper
// ----------------------------------------------------------------------------

function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
}) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-[#E4DCC8] shadow-2xs space-y-1">
      <div className="flex items-center justify-between text-xs text-[#A88958] font-semibold uppercase tracking-wider">
        <span>{title}</span>
        {icon && <span>{icon}</span>}
      </div>
      <div className="font-mono text-2xl font-bold text-[#4A3828]">{value}</div>
      {subtitle && <div className="text-xs text-[#6B5A48]">{subtitle}</div>}
    </div>
  );
}

// ----------------------------------------------------------------------------
// AdminInventoryPage Component
// ----------------------------------------------------------------------------

export default async function AdminInventoryPage({ searchParams }: AdminInventoryPageProps) {
  const resolvedParams = await searchParams;
  const activeTab = resolvedParams.tab || "inventory";
  const commodityFilter = resolvedParams.commodity;
  const warehouseFilter = resolvedParams.warehouse;

  // Fetch all parallel server queries
  const [stats, inventoryLines, commodities, warehouses] = await Promise.all([
    getInventoryStats(),
    getInventoryLines({
      commodity_id: commodityFilter,
      warehouse_id: warehouseFilter,
    }),
    getCommodities(),
    getWarehouses(),
  ]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A3828]">
            Inventory & Silo Management
          </h1>
          <p className="text-sm text-[#A88958] mt-1">
            Real-time silo storage tracking, commodity specs, and auditable stock adjustment ledger.
          </p>
        </div>
      </div>

      {/* Metric Stat Cards (4-column grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Stored Stock"
          value={`${stats.total_quantity_kg.toLocaleString()} kg`}
          subtitle="Across all active silos"
          icon="🌾"
        />
        <StatCard
          title="Silo Capacity"
          value={`${stats.silo_capacity_pct}%`}
          subtitle="Total platform capacity used"
          icon="🏢"
        />
        <StatCard
          title="Active Commodities"
          value={stats.active_commodities}
          subtitle="Available for trading"
          icon="📦"
        />
        <StatCard
          title="Storage Hubs"
          value={stats.active_warehouses}
          subtitle="Climate-controlled silos"
          icon="📍"
        />
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-[#E4DCC8] pb-1 flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex space-x-2">
          <Link
            href="/admin/inventory?tab=inventory"
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
              activeTab === "inventory"
                ? "bg-[#D8B56A] text-[#4A3828] shadow-xs"
                : "text-[#6B5A48] hover:bg-[#E4DCC8]/40 hover:text-[#4A3828]"
            }`}
          >
            Inventory Balances ({inventoryLines.length})
          </Link>
          <Link
            href="/admin/inventory?tab=commodities"
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
              activeTab === "commodities"
                ? "bg-[#D8B56A] text-[#4A3828] shadow-xs"
                : "text-[#6B5A48] hover:bg-[#E4DCC8]/40 hover:text-[#4A3828]"
            }`}
          >
            Commodities & Grades ({commodities.length})
          </Link>
          <Link
            href="/admin/inventory?tab=warehouses"
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
              activeTab === "warehouses"
                ? "bg-[#D8B56A] text-[#4A3828] shadow-xs"
                : "text-[#6B5A48] hover:bg-[#E4DCC8]/40 hover:text-[#4A3828]"
            }`}
          >
            Warehouses & Silos ({warehouses.length})
          </Link>
        </div>
      </div>

      {/* Filter Strip for Inventory Tab */}
      {activeTab === "inventory" && (
        <div className="flex flex-wrap items-center gap-3 p-3 bg-white rounded-xl border border-[#E4DCC8]">
          <span className="text-xs font-semibold text-[#A88958] uppercase tracking-wider">
            Filter:
          </span>

          {/* Commodity Filter */}
          <Link
            href={`/admin/inventory?tab=inventory${warehouseFilter ? `&warehouse=${warehouseFilter}` : ""}`}
            className={`px-3 py-1 text-xs rounded-lg border font-medium transition-colors ${
              !commodityFilter
                ? "bg-[#21483A] text-white border-[#21483A]"
                : "bg-[#F5EFE0] text-[#4A3828] border-[#E4DCC8] hover:bg-[#E4DCC8]"
            }`}
          >
            All Commodities
          </Link>
          {commodities.map((c) => (
            <Link
              key={c.id}
              href={`/admin/inventory?tab=inventory&commodity=${c.id}${
                warehouseFilter ? `&warehouse=${warehouseFilter}` : ""
              }`}
              className={`px-3 py-1 text-xs rounded-lg border font-medium transition-colors ${
                commodityFilter === c.id
                  ? "bg-[#21483A] text-white border-[#21483A]"
                  : "bg-[#F5EFE0] text-[#4A3828] border-[#E4DCC8] hover:bg-[#E4DCC8]"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      {/* Active Tab Content */}
      <div className="pt-2">
        {activeTab === "inventory" && (
          <InventoryTab
            lines={inventoryLines}
            commodities={commodities}
            warehouses={warehouses}
          />
        )}
        {activeTab === "commodities" && (
          <CommoditiesTab commodities={commodities} />
        )}
        {activeTab === "warehouses" && (
          <WarehousesTab warehouses={warehouses} />
        )}
      </div>
    </div>
  );
}
