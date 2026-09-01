// components/ui/card.tsx — Core Card layout primitive for KorraStore.
// Serves as the tactile Paper background container surface across all feature pages.
// Used in: commodity listings, portfolio holdings summary, receipt wrappers.

import * as React from "react";
import { cn } from "@/lib/utils";

// Interface for Card container props.
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  // Padding density preset
  padding?: "none" | "sm" | "md" | "lg";
}

// Card base surface component.
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, padding = "md", children, ...props }, ref) => {
    const paddings = {
      none: "p-0",
      sm: "p-3 sm:p-4",
      md: "p-5 sm:p-6",
      lg: "p-6 sm:p-8",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "bg-[var(--paper-card)] border border-[var(--border-color)] rounded-[12px] shadow-soil-sm text-[var(--soil)] transition-shadow duration-200",
          paddings[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

// Card Header component.
export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 mb-4", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

// Card Title component.
export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("font-sans-inter font-semibold text-lg leading-none tracking-tight text-[var(--soil)]", className)} {...props} />
  )
);
CardTitle.displayName = "CardTitle";

// Card Content container.
export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

// Card Footer container.
export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center pt-4 border-t border-[var(--border-color)] mt-4", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";
