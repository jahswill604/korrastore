// components/auth/auth-card.tsx — Ledger-Styled Authentication Card for KorraStore.
// Renders the branded container card with DM Serif Display typography, double-border accents, and header.
// Used in: app/login/page.tsx, app/signup/page.tsx, app/verify-phone/page.tsx.

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Props for AuthCard component
export interface AuthCardProps {
  // Title text rendered in DM Serif Display (e.g., "Welcome back" or "Create your account")
  title: string;
  // Subtitle providing context or instructions
  subtitle?: string;
  // Active auth tab ('login' | 'signup' | 'verify')
  activeTab?: "login" | "signup" | "verify";
  // Error alert banner message
  error?: string | null;
  // Success message
  successMessage?: string | null;
  // Card children (form inputs and buttons)
  children: React.ReactNode;
  // Additional container class names
  className?: string;
}

// AuthCard component definition
export function AuthCard({
  title,
  subtitle,
  activeTab,
  error,
  successMessage,
  children,
  className,
}: AuthCardProps) {
  return (
    <div
      className={cn(
        // w-full ensures the card fills mobile viewport correctly.
        // overflow-hidden prevents the ::before inner border from clipping inputs on small screens.
        "w-full bg-[#FFFFFF] border-2 border-[var(--border-color)] rounded-[18px] p-6 sm:p-8 shadow-soil-md relative overflow-hidden",
        "before:absolute before:inset-[3px] before:border before:border-[var(--border-color)]/60 before:rounded-[14px] before:pointer-events-none",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center mb-6">
        {/* KorraStore Wordmark */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 group transition-transform hover:scale-[1.02] duration-150"
        >
          <span className="font-serif-display text-3xl sm:text-4xl text-[var(--soil)] tracking-tight">
            KorraStore
          </span>
        </Link>
        <span className="text-[10px] font-mono-numbers font-semibold tracking-widest uppercase text-[var(--husk)] mt-1">
          Physical Commodity Storage & Resale
        </span>

        {/* Tab Switcher if on Login / Signup */}
        {activeTab && activeTab !== "verify" && (
          <div className="w-full grid grid-cols-2 p-1 bg-[#F2EFE9] rounded-[12px] border border-[var(--border-color)] mt-6">
            <Link
              href="/login"
              className={cn(
                "py-2 text-xs font-semibold font-sans-inter text-center rounded-[8px] transition-all duration-150 select-none",
                activeTab === "login"
                  ? "bg-[#FFFFFF] text-[var(--soil)] shadow-soil-sm"
                  : "text-[#7A6A58] hover:text-[var(--soil)]"
              )}
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className={cn(
                "py-2 text-xs font-semibold font-sans-inter text-center rounded-[8px] transition-all duration-150 select-none",
                activeTab === "signup"
                  ? "bg-[#FFFFFF] text-[var(--soil)] shadow-soil-sm"
                  : "text-[#7A6A58] hover:text-[var(--soil)]"
              )}
            >
              Sign Up
            </Link>
          </div>
        )}

        {/* Card Title & Subtitle */}
        <h1 className="font-serif-display text-2xl sm:text-3xl text-[var(--soil)] mt-5 tracking-normal">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-[#6C5E4F] font-sans-inter mt-1.5 max-w-sm">
            {subtitle}
          </p>
        )}
      </div>

      {/* Global Alert Banners */}
      {error && (
        <div
          role="alert"
          className="mb-5 p-3.5 bg-[#FDF2F0] border border-[#F5C2BA] rounded-[10px] text-xs font-medium text-[var(--danger)] font-sans-inter flex items-start gap-2.5 animate-in fade-in-50 duration-200"
        >
          <svg
            className="w-4 h-4 shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <path strokeWidth="2" strokeLinecap="round" d="M12 8v4m0 4h.01" />
          </svg>
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="mb-5 p-3.5 bg-[#EBF5F0] border border-[#BCE1CE] rounded-[10px] text-xs font-medium text-[var(--deep-grain-green)] font-sans-inter flex items-start gap-2.5 animate-in fade-in-50 duration-200"
        >
          <svg
            className="w-4 h-4 shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <path strokeWidth="2" strokeLinecap="round" d="M9 12l2 2 4-4" />
          </svg>
          <span className="leading-relaxed">{successMessage}</span>
        </div>
      )}

      {/* Card Body & Form */}
      <div>{children}</div>

      {/* Card Footer Notes */}
      <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex flex-col items-center gap-2 text-center">
        <p className="text-[11px] text-[#8C7D6E] font-sans-inter">
          Secured with Supabase Authentication & 256-bit encryption.
        </p>
        <Link
          href="/"
          className="text-xs font-semibold text-[var(--trust-indigo)] hover:underline inline-flex items-center gap-1 font-sans-inter"
        >
          ← Return to Marketplace
        </Link>
      </div>
    </div>
  );
}
