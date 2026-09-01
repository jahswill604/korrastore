// components/layout/bottom-tab-bar.tsx — Mobile Bottom Navigation Bar component for KorraStore.
// Renders fixed bottom navigation tab bar visible on mobile viewports (< 640px / md breakpoint).
// Used in: AppShell, mobile layout view.

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-rail";

// BottomTabBar component definition.
export const BottomTabBar: React.FC<{ className?: string }> = ({ className }) => {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFFFF] border-t border-[var(--border-color)] px-2 py-2 flex items-center justify-around shadow-soil-lg font-sans-inter text-[var(--soil)]",
        className
      )}
    >
      {NAV_ITEMS.slice(0, 5).map((item) => {
        const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium transition-all rounded-[8px]",
              isActive
                ? "text-[var(--deep-grain-green)] font-bold"
                : "text-[var(--soil-tertiary)] hover:text-[var(--soil)]"
            )}
          >
            <span className={cn("text-lg mb-0.5", isActive && "scale-110")}>{item.icon}</span>
            <span className="truncate max-w-[64px]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
