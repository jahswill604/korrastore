// components/layout/nav-rail.tsx — Desktop Collapsible Navigation Sidebar for KorraStore.
// Renders collapsible vertical navigation rail (240px expanded, 72px collapsed).
// Features 9 action items with gold container for active item and collapse/expand toggle.
// Used in: AppShell component (Desktop viewports ≥ 768px/1024px).

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// Interface for Navigation items
export interface NavItem {
  label: string;
  href: string;
  iconName: string;
  iconSvg: React.ReactNode;
}

// ----------------------------------------------------------------------------
// NAV_ITEMS — 9 vertical action items matching desktop-ui.png mockup
// ----------------------------------------------------------------------------
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

// Props interface for NavRail
export interface NavRailProps {
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

// ----------------------------------------------------------------------------
// NavRail — Collapsible Desktop Sidebar component matching desktop-ui.png.
// ----------------------------------------------------------------------------
export const NavRail: React.FC<NavRailProps> = ({
  className,
  isCollapsed: externalCollapsed,
  onToggleCollapse,
}) => {
  const pathname = usePathname();
  const [internalCollapsed, setInternalCollapsed] = React.useState(true);

  // Use external controlled collapsed state if provided, else internal state
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
        "hidden md:flex flex-col bg-[#F7F4EA] border-r border-[#E4DCC8] min-h-screen py-6 px-3.5 transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shrink-0 select-none z-30 overflow-x-hidden",
        isCollapsed ? "w-20" : "w-64",
        className
      )}
    >
      {/* Top Sidebar Bar: Collapse/Expand Toggle & Optional Expanded Title */}
      <div
        className={cn(
          "w-full flex items-center mb-6 px-1 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isCollapsed ? "justify-center" : "justify-between"
        )}
      >
        {!isCollapsed && (
          <span className="font-mono-plex text-[11px] font-bold text-[#4A3828]/60 uppercase tracking-wider truncate">
            Navigation
          </span>
        )}
        
        {/* Toggle Collapse/Expand Button with Smooth Rotation */}
        <button
          type="button"
          onClick={handleToggle}
          aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          className="p-2 rounded-xl text-[#4A3828] hover:bg-[#EDE8DA] transition-all duration-200 focus:outline-none cursor-pointer shrink-0 active:scale-95"
        >
          <svg
            className={cn(
              "w-5 h-5 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
              isCollapsed ? "rotate-180" : "rotate-0"
            )}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Navigation Links — Vertical 9 Action List */}
      <nav className="w-full flex-1 space-y-1.5">
        {NAV_ITEMS.map((item) => {
          // Check if current route matches active link
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
                "flex items-center h-12 rounded-2xl group transition-all duration-200 overflow-hidden",
                isCollapsed ? "px-3 justify-center" : "px-3.5 space-x-3.5",
                isActive
                  ? "bg-[#D8B56A] text-[#4A3828] shadow-xs font-bold"
                  : "text-[#4A3828]/75 hover:text-[#4A3828] hover:bg-[#EDE8DA]"
              )}
            >
              {/* Fixed Icon Anchor (prevents horizontal jumps during transition) */}
              <div
                className={cn(
                  "w-6 h-6 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110",
                  isActive ? "text-[#4A3828]" : "text-[#4A3828]/80"
                )}
              >
                {item.iconSvg}
              </div>

              {/* Smooth Opacity & Max-Width Label Fade (prevents DOM mounting layout snaps) */}
              <span
                className={cn(
                  "font-sans-inter text-sm font-semibold truncate whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                  isCollapsed ? "opacity-0 max-w-0 pointer-events-none" : "opacity-100 max-w-[160px]"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Branding for Expanded View with Smooth Fade */}
      <div
        className={cn(
          "w-full pt-4 border-t border-[#E4DCC8] px-2 text-[11px] font-mono-plex text-[#6B5A48] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden whitespace-nowrap",
          isCollapsed ? "opacity-0 max-h-0 pt-0 border-t-0" : "opacity-100 max-h-12"
        )}
      >
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#21483A] animate-pulse shrink-0" />
          <span>KorraStore v1.0</span>
        </div>
      </div>
    </aside>
  );
};

