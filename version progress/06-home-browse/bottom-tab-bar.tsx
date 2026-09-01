// components/layout/bottom-tab-bar.tsx — Mobile Bottom Navigation Tab Bar for KorraStore.
// Renders fixed bottom navigation tab bar matching mobile-ui.png mockup.
// Used in: AppShell layout component shell (components/layout/app-shell.tsx).

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// Mobile tab item definition interface
interface TabItem {
  label: string;
  href: string;
  icon: string;
}

// Mobile bottom tab bar items matching mobile-ui.png mockup
const MOBILE_TABS: TabItem[] = [
  { label: "Home", href: "/", icon: "🏠" },
  { label: "Store", href: "/", icon: "🏪" },
  { label: "Storage", href: "/my-storage", icon: "📦" },
  { label: "Orders", href: "/orders", icon: "📄" },
  { label: "Profile", href: "/profile", icon: "👤" },
];

// ----------------------------------------------------------------------------
// BottomTabBar — Renders fixed bottom navigation bar for small screens.
// ----------------------------------------------------------------------------
export function BottomTabBar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around bg-white border-t border-[#E4DCC8] py-2 px-3 md:hidden shadow-soil-md",
        className
      )}
    >
      {MOBILE_TABS.map((tab, idx) => {
        const isActive = idx === 0 ? pathname === "/" : pathname?.startsWith(tab.href) && tab.href !== "/";

        return (
          <Link
            key={`${tab.href}-${idx}`}
            href={tab.href}
            className={cn(
              "flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-semibold transition-colors select-none",
              isActive
                ? "text-[var(--husk)] font-bold"
                : "text-[var(--soil-secondary)] hover:text-[var(--soil)]"
            )}
          >
            <span className={cn("text-base", isActive && "scale-110")}>{tab.icon}</span>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
