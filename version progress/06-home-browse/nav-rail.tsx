// components/layout/nav-rail.tsx — Desktop Navigation Rail Sidebar component for KorraStore.
// Renders vertical sidebar icon navigation rail strictly matching desktop-ui.png mockup.
// Used in: AppShell component shell (components/layout/app-shell.tsx).

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

// Default application navigation items matching desktop-ui.png mockup
export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/", icon: "🏠" },
  { label: "Storage", href: "/my-storage", icon: "📦" },
  { label: "Orders", href: "/orders", icon: "📄" },
  { label: "Resale", href: "/resale", icon: "⇄" },
  { label: "Buyback", href: "/buyback", icon: "🔄" },
  { label: "Notifications", href: "/notifications", icon: "🔔" },
  { label: "Profile", href: "/profile", icon: "👤" },
];

// NavRail component definition.
export const NavRail: React.FC<{ className?: string }> = ({ className }) => {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col items-center w-16 border-r border-[#E4DCC8] bg-white min-h-screen py-4 font-sans-inter text-[var(--soil)] shrink-0 z-20",
        className
      )}
    >
      {/* Navigation Rail Links */}
      <nav className="flex-1 space-y-3 pt-2">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                "flex items-center justify-center h-10 w-10 rounded-xl text-base transition-all duration-150 group select-none",
                isActive
                  ? "bg-[var(--harvest-wheat)] text-[var(--soil)] shadow-xs font-bold scale-105"
                  : "text-[var(--soil-secondary)] hover:text-[var(--soil)] hover:bg-[#F7F4EA]"
              )}
            >
              <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
