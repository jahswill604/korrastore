// app/admin/page.tsx — Admin Dashboard Landing Page for KorraStore.
// Renders key operational metrics, needs-attention triage panel, and audit activity stream.
// Used in: /admin route.

import * as React from "react";
import Link from "next/link";
import {
  getAdminDashboardStats,
  getNeedsAttentionItems,
  getRecentAuditActivity,
} from "@/lib/supabase/queries/admin/dashboard";
import { StatTile } from "@/components/admin/dashboard/stat-tile";
import { NeedsAttentionList } from "@/components/admin/dashboard/needs-attention-list";
import { RecentActivityFeed } from "@/components/admin/dashboard/recent-activity-feed";

// ----------------------------------------------------------------------------
// AdminDashboardPage Server Component
// ----------------------------------------------------------------------------

export default async function AdminDashboardPage() {
  // Fetch live aggregated metrics in parallel
  const [stats, attentionItems, activities] = await Promise.all([
    getAdminDashboardStats(),
    getNeedsAttentionItems(),
    getRecentAuditActivity(8),
  ]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* -------------------------------------------------------------------- */}
      {/* 1. Page Header & Quick Overview Banner                               */}
      {/* -------------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#E4DCC8] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="font-serif-display font-bold text-2xl sm:text-3xl text-[#4A3828] tracking-tight">
              Operational Overview
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#D8B56A]/20 text-[#4A3828] border border-[#D8B56A]/40">
              Live Feed
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6B5A48]">
            Real-time status across physical commodity silos, fulfillment pipelines, and peer-to-peer trades.
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/admin/inventory"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#D8B56A] text-[#4A3828] hover:bg-[#A88958] hover:text-white transition-all shadow-sm"
          >
            <span>🌾</span>
            <span>Manage Silos</span>
          </Link>
          <Link
            href="/admin/pricing"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#F7F4EA] text-[#4A3828] border border-[#E4DCC8] hover:bg-[#E4DCC8] transition-all"
          >
            <span>🏷️</span>
            <span>Update Pricing</span>
          </Link>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 2. Top Metrics Stat Tiles Grid                                       */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Open Orders */}
        <StatTile
          title="Open Orders"
          value={stats.openOrdersCount}
          subtext="In sourcing or transit"
          badge={{
            text: stats.openOrdersCount > 10 ? "High Volume" : "Active",
            variant: stats.openOrdersCount > 10 ? "warning" : "neutral",
          }}
          icon={
            <svg className="w-5 h-5 text-[#303B63]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
          href="/admin/orders"
        />

        {/* Pending Buybacks */}
        <StatTile
          title="Pending Buybacks"
          value={stats.pendingBuybacksCount}
          subtext="Awaiting admin approval"
          badge={{
            text: stats.pendingBuybacksCount > 0 ? "Requires Review" : "Clear",
            variant: stats.pendingBuybacksCount > 0 ? "warning" : "success",
          }}
          icon={
            <svg className="w-5 h-5 text-[#C7862B]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          href="/admin/resale-buybacks"
        />

        {/* Active Resale Listings */}
        <StatTile
          title="Resale Listings"
          value={stats.activeResaleCount}
          subtext="P2P marketplace items"
          badge={{
            text: "Marketplace",
            variant: "neutral",
          }}
          icon={
            <svg className="w-5 h-5 text-[#4A3828]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          }
          href="/admin/resale-buybacks"
        />

        {/* Low Inventory Alerts */}
        <StatTile
          title="Low Stock Alerts"
          value={stats.lowInventoryAlertsCount}
          subtext="Under 500kg reserve"
          badge={{
            text: stats.lowInventoryAlertsCount > 0 ? "Replenish" : "Optimal",
            variant: stats.lowInventoryAlertsCount > 0 ? "danger" : "success",
          }}
          icon={
            <svg className="w-5 h-5 text-[#B3432E]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
          href="/admin/inventory"
        />

        {/* Total Platform Silo Valuation */}
        <StatTile
          title="Silo Valuation"
          value={`₦${(stats.totalPlatformInventoryValue / 1000000).toFixed(1)}M`}
          subtext={`${stats.totalStorageQuantityKg.toLocaleString()} kg stored`}
          badge={{
            text: "Physical Assets",
            variant: "success",
          }}
          icon={
            <svg className="w-5 h-5 text-[#21483A]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
          href="/admin/inventory"
        />
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 3. Main Operational Region: Needs Attention & Audit Activity         */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Needs Attention Triage Panel */}
        <div className="lg:col-span-7 space-y-6">
          <NeedsAttentionList items={attentionItems} />

          {/* Quick Operations Matrix Card */}
          <div className="p-5 rounded-2xl bg-white border border-[#E4DCC8] shadow-sm space-y-3">
            <h3 className="font-serif-display font-bold text-base text-[#4A3828]">
              Operational Quick Links
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <Link
                href="/admin/orders"
                className="p-3 rounded-xl bg-[#F7F4EA] border border-[#E4DCC8]/80 hover:border-[#D8B56A] hover:bg-[#D8B56A]/10 transition-colors text-center group"
              >
                <div className="text-xl mb-1 group-hover:scale-110 transition-transform">📦</div>
                <div className="text-xs font-bold text-[#4A3828]">Orders Desk</div>
                <div className="text-[10px] text-[#A88958]">Fulfill & Verify</div>
              </Link>
              <Link
                href="/admin/inventory"
                className="p-3 rounded-xl bg-[#F7F4EA] border border-[#E4DCC8]/80 hover:border-[#D8B56A] hover:bg-[#D8B56A]/10 transition-colors text-center group"
              >
                <div className="text-xl mb-1 group-hover:scale-110 transition-transform">🌾</div>
                <div className="text-xs font-bold text-[#4A3828]">Silo Inventory</div>
                <div className="text-[10px] text-[#A88958]">Intake & Stock</div>
              </Link>
              <Link
                href="/admin/pricing"
                className="p-3 rounded-xl bg-[#F7F4EA] border border-[#E4DCC8]/80 hover:border-[#D8B56A] hover:bg-[#D8B56A]/10 transition-colors text-center group"
              >
                <div className="text-xl mb-1 group-hover:scale-110 transition-transform">🏷️</div>
                <div className="text-xs font-bold text-[#4A3828]">Price Feeds</div>
                <div className="text-[10px] text-[#A88958]">Commodity Rates</div>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Real-Time Recent Activity Timeline */}
        <div className="lg:col-span-5 space-y-6">
          <RecentActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  );
}
