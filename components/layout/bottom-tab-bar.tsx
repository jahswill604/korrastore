// components/layout/bottom-tab-bar.tsx — Mobile Bottom Navigation Bar component for KorraStore.
// Renders fixed bottom navigation tab bar visible on mobile viewports (< 640px / md breakpoint).
// Used in: AppShell, mobile layout view.

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-rail";

// 5 primary mobile bottom bar tabs matching mobile-ui.png.
// Looked up by iconName rather than array index — indices shift whenever
// NAV_ITEMS gains or loses an entry (see bug: removing Resale/Transfer from
// NAV_ITEMS silently broke the old NAV_ITEMS[8] lookup below).
const MOBILE_TAB_ICON_NAMES = ["home", "store", "storage", "orders", "profile"];
const MOBILE_TABS = MOBILE_TAB_ICON_NAMES.map((iconName) =>
  NAV_ITEMS.find((item) => item.iconName === iconName)
).filter((item): item is (typeof NAV_ITEMS)[number] => Boolean(item));

// BottomTabBar component definition.
export const BottomTabBar: React.FC<{ className?: string }> = ({ className }) => {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFFFF] border-t border-[#E4DCC8] px-2 py-2 flex items-center justify-around shadow-soil-lg font-sans-inter text-[#4A3828]",
        className
      )}
    >
      {MOBILE_TABS.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium transition-all rounded-[8px]",
              isActive
                ? "text-[#D8B56A] font-bold"
                : "text-[#4A3828]/60 hover:text-[#4A3828]"
            )}
          >
            <span className={cn("text-lg mb-0.5 flex items-center justify-center transition-transform", isActive && "scale-110 text-[#D8B56A]")}>{item.iconSvg}</span>
            <span className="truncate max-w-[64px] font-sans-inter">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

