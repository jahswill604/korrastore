// components/ui/price-display.tsx — Monospace Price & Value Display component for KorraStore.
// Renders numeric currency values strictly in IBM Plex Mono font face with optional percentage delta pill.
// Used in: marketplace commodity cards, portfolio total valuation, checkout summary, ledger tables.

import * as React from "react";
import { cn } from "@/lib/utils";

// Interface for PriceDisplay component props.
export interface PriceDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  // Numeric price amount or formatted price string (e.g., 450000 or "₦450,000")
  amount: number | string;
  // Optional currency symbol prefix (default: "₦")
  currency?: string;
  // Price text size preset
  size?: "sm" | "md" | "lg" | "xl";
  // Value change percentage formatted string (e.g., "+4.2%" or "-1.5%")
  delta?: string;
  // Boolean flag indicating positive value change direction
  isPositiveDelta?: boolean;
}

// PriceDisplay primitive component definition.
export const PriceDisplay = React.forwardRef<HTMLDivElement, PriceDisplayProps>(
  (
    {
      className,
      amount,
      currency = "₦",
      size = "md",
      delta,
      isPositiveDelta = true,
      ...props
    },
    ref
  ) => {
    // Format numeric value into comma-separated NGN format if raw number provided
    const formattedAmount =
      typeof amount === "number"
        ? `${currency}${amount.toLocaleString("en-NG")}`
        : amount.startsWith(currency)
        ? amount
        : `${currency}${amount}`;

    // Size preset map
    const sizes = {
      sm: "text-sm font-medium",
      md: "text-base font-semibold",
      lg: "text-xl font-bold",
      xl: "text-2xl sm:text-3xl font-bold",
    };

    return (
      <div ref={ref} className={cn("inline-flex items-center gap-2 font-mono-plex", className)} {...props}>
        <span className={cn("text-[var(--soil)] tracking-tight", sizes[size])}>
          {formattedAmount}
        </span>

        {delta && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 px-2 py-0.5 rounded-[6px] text-xs font-bold",
              isPositiveDelta
                ? "bg-[var(--deep-grain-green)]/10 text-[var(--deep-grain-green)] border border-[var(--deep-grain-green)]/20"
                : "bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20"
            )}
          >
            {isPositiveDelta ? "▲" : "▼"} {delta}
          </span>
        )}
      </div>
    );
  }
);

PriceDisplay.displayName = "PriceDisplay";
