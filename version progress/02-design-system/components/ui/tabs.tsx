// components/ui/tabs.tsx — Interactive Tab Navigation component for KorraStore.
// Client interactive tab control supporting Paper ledger tab switching with Harvest Wheat indicator.
// Used in: marketplace filter views, user portfolio holdings vs transactions, showcase page.

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Context interface for shared Tab state.
interface TabsContextType {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

// Root Tabs container component.
export const Tabs: React.FC<{
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
  onValueChange?: (value: string) => void;
}> = ({ defaultValue, className, children, onValueChange }) => {
  const [activeTab, setActiveTabState] = React.useState<string>(defaultValue);

  const setActiveTab = (id: string) => {
    setActiveTabState(id);
    onValueChange?.(id);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn("w-full font-sans-inter", className)}>{children}</div>
    </TabsContext.Provider>
  );
};

// Tabs List header container.
export const TabsList: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => {
  return (
    <div
      className={cn(
        "inline-flex items-center p-1 bg-[var(--paper)] border border-[var(--border-color)] rounded-[10px] space-x-1 shadow-soil-sm",
        className
      )}
    >
      {children}
    </div>
  );
};

// Tabs Trigger button.
export const TabsTrigger: React.FC<{
  value: string;
  className?: string;
  children: React.ReactNode;
}> = ({ value, className, children }) => {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");

  const isActive = context.activeTab === value;

  return (
    <button
      type="button"
      onClick={() => context.setActiveTab(value)}
      className={cn(
        "px-4 py-2 text-xs sm:text-sm font-semibold rounded-[8px] transition-all duration-150 cursor-pointer select-none",
        isActive
          ? "bg-[var(--harvest-wheat)] text-[var(--soil)] shadow-soil-sm"
          : "text-[var(--soil-secondary)] hover:text-[var(--soil)] hover:bg-[#eae4d5]",
        className
      )}
    >
      {children}
    </button>
  );
};

// Tabs Content panel.
export const TabsContent: React.FC<{
  value: string;
  className?: string;
  children: React.ReactNode;
}> = ({ value, className, children }) => {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");

  if (context.activeTab !== value) return null;

  return <div className={cn("mt-4 animate-in fade-in-50 duration-150", className)}>{children}</div>;
};
