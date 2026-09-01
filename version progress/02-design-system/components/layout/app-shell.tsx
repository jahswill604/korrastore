// components/layout/app-shell.tsx — Shared Application Shell Layout component for KorraStore.
// Wraps application pages with desktop NavRail sidebar and mobile BottomTabBar navigation shell.
// Used in: feature route pages (marketplace, portfolio, ledger, design-system).

import * as React from "react";
import { NavRail } from "./nav-rail";
import { BottomTabBar } from "./bottom-tab-bar";
import { cn } from "@/lib/utils";

// Interface for AppShell props.
export interface AppShellProps {
  children: React.ReactNode;
  className?: string;
}

// AppShell component definition.
export const AppShell: React.FC<AppShellProps> = ({ children, className }) => {
  return (
    <div className="min-h-screen flex bg-[var(--paper)] text-[var(--soil)] font-sans-inter">
      {/* Desktop Navigation Rail Sidebar */}
      <NavRail />

      {/* Main Content Area Container */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <main className={cn("flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto", className)}>
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Tab Bar */}
      <BottomTabBar />
    </div>
  );
};
