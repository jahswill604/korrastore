// components/layout/top-nav.tsx — Top Application Navigation Bar for KorraStore.
// Renders the fixed top bar matching desktop-ui.png and mobile-ui.png:
// KorraStore logo (left), pill search bar (center on desktop), bell notification icon & user avatar (right).
// Used in: AppShell component shell (app/layout.tsx).

import * as React from "react";
import Link from "next/link";

interface TopNavProps {
  userName?: string;
  avatarUrl?: string | null;
}

// ----------------------------------------------------------------------------
// TopNav — Renders top header bar matching UI design mockups strictly.
// ----------------------------------------------------------------------------
export function TopNav({ userName = "Amara", avatarUrl }: TopNavProps) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-[#E4DCC8] bg-white px-4 py-3 md:px-8 shadow-2xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Left: Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl select-none group-hover:scale-105 transition-transform">🌾</span>
          <span className="font-serif-dm text-xl font-bold text-[var(--soil)] tracking-tight">
            KorraStore
          </span>
        </Link>

        {/* Center: Search Bar (Desktop ≥640px) */}
        <div className="hidden sm:flex flex-1 max-w-md items-center gap-2 rounded-xl border border-[#E4DCC8] bg-[#F7F4EA] px-3.5 py-2 text-xs text-[var(--soil)] shadow-inner transition-colors focus-within:border-[var(--harvest-wheat)] focus-within:bg-white">
          <span className="text-sm text-[var(--soil-secondary)]">🔍</span>
          <input
            type="text"
            placeholder="Search commodities..."
            className="w-full bg-transparent text-xs text-[var(--soil)] placeholder-[var(--soil-secondary)] focus:outline-none font-sans-inter"
          />
        </div>

        {/* Right: Notifications Bell + User Avatar */}
        <div className="flex items-center gap-3">
          {/* Notifications Bell Button */}
          <Link href="/notifications">
            <button
              type="button"
              aria-label="View notifications"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E4DCC8] bg-white text-base text-[var(--soil)] hover:bg-[#F7F4EA] transition-colors relative"
            >
              🔔
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[var(--danger)]" />
            </button>
          </Link>

          {/* User Avatar Circle */}
          <Link href="/profile">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--harvest-wheat)] text-xs font-bold text-[var(--soil)] border border-[#D4C9A8] shadow-2xs overflow-hidden select-none hover:opacity-90 transition-opacity">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt={userName} className="h-full w-full object-cover" />
              ) : (
                <span>{userName.charAt(0).toUpperCase()}</span>
              )}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
