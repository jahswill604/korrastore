// components/admin/layout/admin-header.tsx — Admin Top Header for KorraStore.
// Displays breadcrumbs, operational status badge, live timestamp, and admin identity.
// Used in: app/admin/layout.tsx

"use client";

import * as React from "react";
import Link from "next/link";

// ----------------------------------------------------------------------------
// AdminHeader Component
// ----------------------------------------------------------------------------

export interface AdminHeaderProps {
  adminEmail?: string | null;
  adminName?: string | null;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  adminEmail = "admin@korrastore.com",
  adminName = "Administrator",
}) => {
  const [currentTime, setCurrentTime] = React.useState<string>("");

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-20 w-full bg-[#F7F4EA]/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4 border-b border-[#E4DCC8]">
      {/* Left: Mobile Brand & Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link href="/admin" className="lg:hidden flex items-center gap-1.5 font-serif-display font-bold text-lg text-[#4A3828]">
          <span>🌾</span>
          <span>Admin</span>
        </Link>
        <div className="hidden sm:flex items-center gap-2 text-xs text-[#A88958]">
          <span className="font-semibold text-[#4A3828]">KorraStore</span>
          <span>/</span>
          <span>Operations Control</span>
        </div>
      </div>

      {/* Center: Silos & System Live Health Pill */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#21483A]/10 border border-[#21483A]/20 text-[11px] font-mono font-medium text-[#21483A]">
        <span className="w-2 h-2 rounded-full bg-[#21483A] animate-pulse" />
        <span>Silos Live & Synchronized</span>
      </div>

      {/* Right: Live Clock + Switch Link + Avatar */}
      <div className="flex items-center gap-3 sm:gap-4">
        {currentTime && (
          <div className="hidden xl:block text-xs font-mono text-[#A88958]">
            {currentTime} (WAT)
          </div>
        )}

        {/* Quick Buyer Portal Switch */}
        <Link
          href="/"
          className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-[#303B63] bg-[#303B63]/5 hover:bg-[#303B63]/10 border border-[#303B63]/20 transition-colors"
        >
          <span>Store</span>
          <span className="text-[10px]">↗</span>
        </Link>

        {/* Admin Avatar */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#21483A] text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {adminName ? adminName.charAt(0).toUpperCase() : "A"}
          </div>
          <div className="hidden sm:block text-left leading-tight">
            <div className="text-xs font-semibold text-[#4A3828]">
              {adminName || "Admin"}
            </div>
            <div className="text-[10px] text-[#A88958] font-mono">
              ROLE: ADMIN
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
