// version progress/06-home-browse-v2-redesign/app-shell.tsx — Shared App Shell with Top Header & Collapsible Nav.

"use client";

import * as React from "react";
import Link from "next/link";
import { NavRail } from "./nav-rail";
import { BottomTabBar } from "@/components/layout/bottom-tab-bar";
import { cn } from "@/lib/utils";

export interface AppShellProps {
  children: React.ReactNode;
  className?: string;
  userName?: string;
  userAvatarUrl?: string;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  className,
  userAvatarUrl,
}) => {
  const [isNavCollapsed, setIsNavCollapsed] = React.useState(true);

  return (
    <div className="min-h-screen flex bg-[#F7F4EA] text-[var(--soil)] font-sans-inter">
      <NavRail
        isCollapsed={isNavCollapsed}
        onToggleCollapse={() => setIsNavCollapsed((prev) => !prev)}
      />

      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        <header className="sticky top-0 z-20 w-full bg-[#F7F4EA]/90 backdrop-blur-md px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between gap-4 border-b border-[#E4DCC8]/60">
          <Link href="/" className="flex items-center space-x-2 shrink-0">
            <span className="text-xl sm:text-2xl">🌾</span>
            <span className="font-serif-dm font-bold text-lg sm:text-xl text-[var(--soil)] tracking-tight">
              KorraStore
            </span>
          </Link>

          <div className="flex-1 max-w-md mx-2 sm:mx-6">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--soil-secondary)]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="search"
                placeholder="Search commodities..."
                aria-label="Search commodities"
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm font-medium rounded-2xl bg-[#EDE8DA]/80 border border-[#E4DCC8] text-[var(--soil)] placeholder:text-[var(--soil-secondary)]/70 focus:outline-none focus:ring-2 focus:ring-[var(--harvest-wheat)] focus:bg-white transition-all shadow-2xs"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2.5 sm:space-x-4 shrink-0">
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

        <main className={cn("flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6", className)}>
          {children}
        </main>
      </div>

      <BottomTabBar />
    </div>
  );
};
