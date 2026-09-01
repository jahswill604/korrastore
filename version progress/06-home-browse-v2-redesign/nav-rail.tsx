// version progress/06-home-browse-v2-redesign/nav-rail.tsx — Desktop Collapsible Navigation Sidebar for KorraStore.
// Snapshot copy of nav-rail.tsx for version tracking.

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface NavItem {
  label: string;
  href: string;
  iconName: string;
  iconSvg: React.ReactNode;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    href: "/",
    iconName: "home",
    iconSvg: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      </svg>
    ),
  },
  {
    label: "Store",
    href: "/marketplace",
    iconName: "store",
    iconSvg: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 22V12h6v10" />
      </svg>
    ),
  },
  {
    label: "Storage",
    href: "/my-storage",
    iconName: "storage",
    iconSvg: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    label: "Receipts",
    href: "/receipts",
    iconName: "receipts",
    iconSvg: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: "Orders",
    href: "/orders",
    iconName: "orders",
    iconSvg: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  {
    label: "Resale",
    href: "/resale",
    iconName: "resale",
    iconSvg: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    label: "Transfer",
    href: "/transfer",
    iconName: "transfer",
    iconSvg: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    ),
  },
  {
    label: "Notifications",
    href: "/notifications",
    iconName: "notifications",
    iconSvg: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    label: "Profile",
    href: "/profile",
    iconName: "profile",
    iconSvg: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export interface NavRailProps {
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const NavRail: React.FC<NavRailProps> = ({
  className,
  isCollapsed: externalCollapsed,
  onToggleCollapse,
}) => {
  const pathname = usePathname();
  const [internalCollapsed, setInternalCollapsed] = React.useState(true);

  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed((prev) => !prev);
    }
  };

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col bg-[var(--paper)] border-r border-[#E4DCC8] min-h-screen py-5 px-3 transition-all duration-300 ease-in-out shrink-0 select-none z-30",
        isCollapsed ? "w-20 items-center" : "w-60 items-start",
        className
      )}
    >
      <div className={cn("w-full flex items-center justify-between mb-8 px-1", isCollapsed && "justify-center")}>
        {!isCollapsed && (
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🌾</span>
            <span className="font-serif-dm font-bold text-xl text-[var(--soil)] tracking-tight">
              KorraStore
            </span>
          </Link>
        )}
        
        <button
          type="button"
          onClick={handleToggle}
          aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          className="p-2 rounded-xl text-[var(--soil)] hover:bg-[#EDE8DA] transition-colors focus:outline-none"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {isCollapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
            )}
          </svg>
        </button>
      </div>

      <nav className="w-full flex-1 space-y-3">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/" || pathname === "/home"
              : pathname?.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "flex items-center transition-all duration-150 rounded-2xl group",
                isCollapsed
                  ? "justify-center w-12 h-12 mx-auto"
                  : "w-full space-x-3 px-3.5 py-3 text-sm font-semibold",
                isActive
                  ? "bg-[#D8B56A] text-[#4A3828] shadow-xs font-bold"
                  : "text-[#4A3828]/70 hover:text-[#4A3828] hover:bg-[#EDE8DA]"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center transition-transform group-hover:scale-110",
                  isActive ? "text-[#4A3828]" : "text-[#4A3828]/80"
                )}
              >
                {item.iconSvg}
              </div>
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {!isCollapsed && (
        <div className="w-full pt-4 border-t border-[#E4DCC8] px-2 text-[11px] font-mono-plex text-[var(--soil-secondary)]">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[var(--deep-grain-green)] animate-pulse" />
            <span>KorraStore v1.0</span>
          </div>
        </div>
      )}
    </aside>
  );
};
