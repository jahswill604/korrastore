// components/ui/skeleton.tsx — Skeleton Loader placeholder component for KorraStore.
// Renders animated loading skeleton shapes matching warm Paper & Husk background tones during async data fetches.
// Used in: marketplace card loading, receipt detail placeholders, portfolio skeleton state.

import * as React from "react";
import { cn } from "@/lib/utils";

// Skeleton component definition.
export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[8px] bg-[var(--border-color)]/60 border border-[var(--border-color)]/40",
        className
      )}
      {...props}
    />
  );
};
