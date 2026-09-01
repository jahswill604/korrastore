// components/ui/button.tsx — Core Button component for KorraStore.
// Renders tactile, accessible button elements using KorraStore design tokens (Harvest Wheat, Soil, Paper outline, Destructive Red).
// Used in: forms, marketplace cards, modal footers, CTA triggers.

import * as React from "react";
import { cn } from "@/lib/utils";

// Interface for Button properties, extending standard HTML button attributes.
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // Visual variant styling option
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  // Button size dimensions option
  size?: "sm" | "md" | "lg";
  // Loading state boolean spinner indicator
  isLoading?: boolean;
}

// Button primitive component definition.
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading = false, children, disabled, ...props }, ref) => {
    // Base styles for all buttons (typography, transition, focus ring)
    const baseStyles =
      "inline-flex items-center justify-center font-sans-inter font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--harvest-wheat)] disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none rounded-[10px]";

    // Variant style map
    const variants = {
      primary:
        "bg-[var(--harvest-wheat)] text-[var(--soil)] hover:bg-[#c9a45b] active:bg-[#b8934a] shadow-soil-sm border border-transparent",
      secondary:
        "bg-[var(--husk)] text-[#FFFFFF] hover:bg-[#967848] active:bg-[#856738] shadow-soil-sm border border-transparent",
      outline:
        "bg-[var(--paper)] text-[var(--soil)] border border-[var(--border-color)] hover:bg-[#eae4d5] active:bg-[#ded6c3]",
      ghost:
        "bg-transparent text-[var(--soil)] hover:bg-[#eae4d5] active:bg-[#ded6c3]",
      destructive:
        "bg-[var(--danger)] text-[#FFFFFF] hover:bg-[#9d3a27] active:bg-[#873120] shadow-soil-sm border border-transparent",
    };

    // Size style map
    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
