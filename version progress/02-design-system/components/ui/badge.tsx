// components/ui/badge.tsx — Semantic Status Badge component for KorraStore.
// Renders semantic status pills (Stored, In Transit, Pending, Cancelled, Informational) using design tokens.
// Used in: order lists, buyback status labels, inventory table tags.

import * as React from "react";
import { cn } from "@/lib/utils";

// Interface for Badge component props.
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  // Variant mapping to status semantics
  variant?: "stored" | "pending" | "cancelled" | "info" | "outline";
}

// Badge primitive definition.
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "stored", children, ...props }, ref) => {
    const variants = {
      stored:
        "bg-[var(--deep-grain-green)]/15 text-[var(--deep-grain-green)] border-[var(--deep-grain-green)]/30 font-semibold",
      pending:
        "bg-[var(--warning)]/15 text-[var(--warning)] border-[var(--warning)]/30 font-semibold",
      cancelled:
        "bg-[var(--danger)]/15 text-[var(--danger)] border-[var(--danger)]/30 font-semibold",
      info:
        "bg-[var(--trust-indigo)]/15 text-[var(--trust-indigo)] border-[var(--trust-indigo)]/30 font-semibold",
      outline:
        "bg-[var(--paper)] text-[var(--soil)] border-[var(--border-color)] font-medium",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border font-sans-inter tracking-wide transition-colors",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
