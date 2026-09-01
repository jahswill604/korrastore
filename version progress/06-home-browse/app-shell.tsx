// components/layout/app-shell.tsx — Shared Application Shell Layout component for KorraStore.
// Wraps application pages with TopNav header, desktop NavRail sidebar, and mobile BottomTabBar navigation shell.
// Used in: feature route pages (app/page.tsx, marketplace, portfolio, ledger, design-system).

import * as React from "react";
import { TopNav } from "./top-nav";
import { NavRail } from "./nav-rail";
import { BottomTabBar } from "./bottom-tab-bar";
import { cn } from "@/lib/utils";

// Interface for AppShell props.
export interface AppShellProps {
  children: React.ReactNode;
  userName?: string;
  avatarUrl?: string | null;
  className?: string;
}

// AppShell component definition matching desktop-ui.png & mobile-ui.png layout.
export const AppShell: React.FC<AppShellProps> = ({ children, userName, avatarUrl, className }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--paper)] text-[var(--soil)] font-sans-inter">
      {/* Top Application Header Bar */}
      <TopNav userName={userName} avatarUrl={avatarUrl} />

      {/* Main Body Shell (Desktop NavRail + Main Content Area) */}
      <div className="flex-1 flex min-w-0">
        {/* Desktop Navigation Rail Sidebar */}
        <NavRail />

        {/* Main Content Area Container */}
        <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
          <main className={cn("flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto", className)}>
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation Tab Bar */}
      <BottomTabBar />
    </div>
  );
};
