// components/admin/layout/admin-nav-rail.tsx — Desktop Admin Navigation Rail for KorraStore.
// Renders persistent 240px administrative sidebar with 8 operational sections and buyer store switcher.
// Used in: app/admin/layout.tsx (Desktop viewports ≥ 1024px).

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// ----------------------------------------------------------------------------
// Type Definitions
// ----------------------------------------------------------------------------

export interface AdminNavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
}

// ----------------------------------------------------------------------------
// Navigation Items Definition
// ----------------------------------------------------------------------------

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  {
    label: "Inventory",
    href: "/admin/inventory",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    label: "Pricing",
    href: "/admin/pricing",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    label: "Resale & Buybacks",
    href: "/admin/resale-buybacks",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  {
    label: "Reports",
    href: "/admin/reports",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    label: "Support",
    href: "/admin/support",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

// ----------------------------------------------------------------------------
// AdminNavRail Component
// ----------------------------------------------------------------------------

export interface AdminNavRailProps {
  adminEmail?: string | null;
  adminName?: string | null;
}

export const AdminNavRail: React.FC<AdminNavRailProps> = ({
  adminEmail = "admin@korrastore.com",
  adminName = "Admin Ops",
}) => {
  const pathname = usePathname();

  return (
    <aside
      className="hidden lg:flex flex-col w-64 shrink-0 bg-[#F7F4EA] border-r border-[#E4DCC8] min-h-screen sticky top-0 h-screen z-30 select-none"
      aria-label="Admin Navigation"
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-[#E4DCC8]/70 flex items-center justify-between">
        <Link href="/admin" className="flex items-center space-x-2.5 group">
          <span className="text-2xl transition-transform group-hover:scale-110">🌾</span>
          <div>
            <div className="font-serif-display font-bold text-lg text-[#4A3828] leading-tight">
              KorraStore
            </div>
            <div className="text-[10px] font-mono font-bold tracking-wider text-[#A88958] uppercase">
              Operations Hub
            </div>
          </div>
        </Link>
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#21483A]/10 text-[#21483A] border border-[#21483A]/20">
          Admin
        </span>
      </div>

      {/* Main Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider uppercase text-[#A88958]">
          Management
        </div>

        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "bg-[#D8B56A] text-[#4A3828] font-semibold shadow-sm"
                  : "text-[#6B5A48] hover:bg-[#E4DCC8]/50 hover:text-[#4A3828]"
              )}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#4A3828] rounded-r" />
              )}
              
              <span className={cn(
                "shrink-0 transition-colors",
                isActive ? "text-[#4A3828]" : "text-[#A88958] group-hover:text-[#4A3828]"
              )}>
                {item.icon}
              </span>

              <span className="truncate">{item.label}</span>

              {item.badge && (
                <span className="ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#4A3828]/10 text-[#4A3828]">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Area: Switch to Buyer Store & Admin Info */}
      <div className="p-3 border-t border-[#E4DCC8]/80 bg-[#F5EFE0]/40 space-y-2">
        {/* Switch to Buyer Portal link */}
        <Link
          href="/"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#303B63] hover:bg-[#303B63]/10 transition-colors"
        >
          <span className="flex items-center gap-2">
            <span>🛒</span>
            <span>Switch to Buyer Store</span>
          </span>
          <span>↗</span>
        </Link>

        {/* Admin User Card */}
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white/60 border border-[#E4DCC8]/60">
          <div className="w-8 h-8 rounded-full bg-[#21483A] text-white flex items-center justify-center font-bold text-xs shrink-0">
            {adminName ? adminName.charAt(0).toUpperCase() : "A"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-[#4A3828] truncate">
              {adminName || "Administrator"}
            </div>
            <div className="text-[10px] text-[#A88958] truncate">
              {adminEmail || "admin@korrastore.com"}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
