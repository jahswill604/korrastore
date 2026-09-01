// components/layout/nav-rail.tsx — Desktop Navigation Rail Sidebar component for KorraStore.
// Renders vertical sidebar navigation rail (240px wide on desktop ≥ 1024px, collapsing to icon bar on tablet).
// Used in: AppShell, main buyer application layout.

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// Nav item definition interface.
export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

// Default application navigation items list.
export const NAV_ITEMS: NavItem[] = [
  { label: "Marketplace", href: "/marketplace", icon: "🌾" },
  { label: "Storage Ledger", href: "/ledger", icon: "📜" },
  { label: "Portfolio", href: "/portfolio", icon: "📊" },
  { label: "Resale", href: "/resale", icon: "🔄" },
  { label: "Design System", href: "/design-system", icon: "🎨" },
];

// NavRail component definition.
export const NavRail: React.FC<{ className?: string }> = ({ className }) => {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col w-60 border-r border-[var(--border-color)] bg-[var(--paper-card)] min-h-screen py-6 px-4 font-sans-inter text-[var(--soil)] shrink-0 shadow-soil-sm z-20",
        className
      )}
    >
      {/* KorraStore Logo & Branding */}
      <div className="flex items-center space-x-2.5 px-3 pb-6 border-b border-[var(--border-color)] mb-6">
        <span className="text-2xl">🌾</span>
        <div>
          <h1 className="font-serif-display font-bold text-lg text-[var(--soil)] leading-tight">
            KorraStore
          </h1>
          <span className="text-[10px] text-[var(--husk)] font-mono-plex font-semibold tracking-wide uppercase">
            AGRICULTURAL LEDGER
          </span>
        </div>
      </div>

      {/* Navigation Rail Links */}
      <nav className="flex-1 space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3.5 py-2.5 rounded-[10px] text-sm font-semibold transition-all duration-150 group",
                isActive
                  ? "bg-[var(--harvest-wheat)] text-[var(--soil)] shadow-soil-sm"
                  : "text-[var(--soil-secondary)] hover:text-[var(--soil)] hover:bg-[var(--paper)]"
              )}
            >
              <span className="text-base group-hover:scale-110 transition-transform">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer System Status Badge */}
      <div className="pt-4 border-t border-[var(--border-color)] px-3 text-[11px] text-[var(--soil-tertiary)] font-mono-plex">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[var(--deep-grain-green)] animate-pulse" />
          <span>KorraStore v0.1.0</span>
        </div>
      </div>
    </aside>
  );
};
