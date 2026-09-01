// components/ui/grade-badge.tsx — Commodity Quality Grade Badge primitive for KorraStore.
// Renders distinct A/B/C quality grade chips for agricultural commodities (maize, rice, cocoa, soybeans).
// Used in: marketplace cards, commodity details, ledger receipts, purchase flow.

import * as React from "react";
import { cn } from "@/lib/utils";

// Quality grade options type.
export type CommodityGrade = "Grade A" | "Grade B" | "Grade C" | "Premium" | "Export Grade" | "A+" | "A" | "B" | "C";

// Interface for GradeBadge component props.
export interface GradeBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  // Commodity quality grade
  grade: CommodityGrade;
  // Size preset
  size?: "sm" | "md";
}

// GradeBadge primitive component definition.
export const GradeBadge = React.forwardRef<HTMLSpanElement, GradeBadgeProps>(
  ({ className, grade, size = "md", ...props }, ref) => {
    // Determine color styling based on grade rank
    const isGradeA = grade === "Grade A" || grade === "Premium" || grade === "Export Grade" || grade === "A+" || grade === "A";
    const isGradeB = grade === "Grade B" || grade === "B";

    const badgeStyles = isGradeA
      ? "bg-[var(--deep-grain-green)] text-[#FFFFFF] border-[var(--deep-grain-green)]"
      : isGradeB
      ? "bg-[var(--harvest-wheat)] text-[var(--soil)] border-[var(--husk)]"
      : "bg-[var(--husk)] text-[#FFFFFF] border-[var(--soil-secondary)]";

    const sizes = {
      sm: "px-2 py-0.5 text-[11px]",
      md: "px-2.5 py-1 text-xs",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center font-sans-inter font-bold rounded-[6px] border shadow-soil-sm uppercase tracking-wide",
          badgeStyles,
          sizes[size],
          className
        )}
        {...props}
      >
        🏅 {grade}
      </span>
    );
  }
);

GradeBadge.displayName = "GradeBadge";
