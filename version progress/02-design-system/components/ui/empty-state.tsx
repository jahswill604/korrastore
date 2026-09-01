// components/ui/empty-state.tsx — Empty Data State component for KorraStore.
// Renders clean tactile placeholder screens when lists, receipts, or transactions contain zero records.
// Used in: empty portfolio, no active receipts, zero orders list, search zero results.

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

// Interface for EmptyState props.
export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  // Emoji or icon illustration
  icon?: string;
  // Main title
  title: string;
  // Subtitle explanation text
  description: string;
  // Primary CTA action label
  actionLabel?: string;
  // Primary CTA action callback
  onAction?: () => void;
}

// EmptyState component definition.
export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      className,
      icon = "🌾",
      title,
      description,
      actionLabel,
      onAction,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-[var(--paper-card)] border-2 border-dashed border-[var(--border-color)] rounded-[16px] max-w-md mx-auto my-6 font-sans-inter text-[var(--soil)] shadow-soil-sm",
          className
        )}
        {...props}
      >
        <div className="w-16 h-16 rounded-full bg-[var(--paper)] border border-[var(--border-color)] flex items-center justify-center text-3xl mb-4 shadow-soil-sm">
          {icon}
        </div>
        <h3 className="font-serif-display text-xl text-[var(--soil)] mb-2 font-bold">{title}</h3>
        <p className="text-xs text-[var(--soil-secondary)] mb-6 max-w-xs leading-relaxed">{description}</p>
        {actionLabel && onAction && (
          <Button variant="primary" size="md" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </div>
    );
  }
);

EmptyState.displayName = "EmptyState";
