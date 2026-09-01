// components/layout/app-shell.tsx — Shared Application Shell Layout component for KorraStore.
// Wraps application pages with Top Header (Logo, Search Bar, Notifications, Avatar),
// Collapsible Desktop NavRail sidebar, and Mobile BottomTabBar navigation shell.
// Used in: Feature route pages (buyer marketplace homepage, portfolio, ledger, design-system).

"use client";

import * as React from "react";
import Link from "next/link";
import { NavRail } from "./nav-rail";
import { BottomTabBar } from "./bottom-tab-bar";
import { cn } from "@/lib/utils";

// Interface for AppShell props.
export interface AppShellProps {
  children: React.ReactNode;
  className?: string;
  userName?: string;
  userAvatarUrl?: string;
}

// ----------------------------------------------------------------------------
// AppShell — Core Layout Wrapper matching desktop-ui.png and mobile-ui.png.
// ----------------------------------------------------------------------------
export const AppShell: React.FC<AppShellProps> = ({
  children,
  className,
  userAvatarUrl,
}) => {
  const [isNavCollapsed, setIsNavCollapsed] = React.useState(true);

  return (
    <div className="min-h-screen flex bg-[#F7F4EA] text-[var(--soil)] font-sans-inter">
      {/* Desktop Collapsible Navigation Rail Sidebar */}
      <NavRail
        isCollapsed={isNavCollapsed}
        onToggleCollapse={() => setIsNavCollapsed((prev) => !prev)}
      />

      {/* Main Container Area with Top Header + Content */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        {/* Top Header Bar — matching desktop-ui.png & mobile-ui.png */}
        <header className="sticky top-0 z-20 w-full bg-[#F7F4EA]/90 backdrop-blur-md px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between gap-4 border-b border-[#E4DCC8]/60">
          {/* Left Logo */}
          <Link href="/" className="flex items-center space-x-2 shrink-0">
            <span className="text-xl sm:text-2xl">🌾</span>
            <span className="font-serif-display font-bold text-lg sm:text-xl text-[#4A3828] tracking-tight">
              KorraStore
            </span>
          </Link>

          {/* Center Search Bar (Floating input with rounded pill background) */}
          <div className="flex-1 max-w-md mx-2 sm:mx-6">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B5A48]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="search"
                placeholder="Search commodities..."
                aria-label="Search commodities"
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm font-medium rounded-full bg-[#EDE8DA]/80 border border-[#E4DCC8] text-[#4A3828] placeholder:text-[#6B5A48]/70 focus:outline-none focus:ring-2 focus:ring-[#D8B56A] focus:bg-white transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Right Action Icons: Notification Bell & User Avatar */}
          <div className="flex items-center space-x-2.5 sm:space-x-4 shrink-0">
            {/* Notification Bell Button */}
            <Link
              href="/notifications"
              className="p-2 rounded-xl text-[var(--soil)] hover:bg-[#EDE8DA] transition-colors relative"
              aria-label="Notifications"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--harvest-wheat)] ring-2 ring-[#F7F4EA]" />
            </Link>

            {/* User Profile Avatar Circle */}
            <Link href="/profile" className="block focus:outline-none">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#4A3828] border-2 border-[#D8B56A] overflow-hidden flex items-center justify-center text-white text-xs font-bold shadow-xs transition-transform hover:scale-105">
                {userAvatarUrl ? (
                  // eslint-disable-next-unknown-property
                  <img src={userAvatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>A</span>
                )}
              </div>
            </Link>
          </div>
        </header>

        {/* Main Content Viewport */}
        <main className={cn("flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6", className)}>
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Tab Bar */}
      <BottomTabBar />
    </div>
  );
};

