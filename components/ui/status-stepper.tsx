// components/ui/status-stepper.tsx — Order & Buyback Progress Stepper primitive for KorraStore.
// Renders visual step progression indicators for order lifecycle, sourcing transit, and silo storage verification.
// Used in: order detail view, buyback status tracker, receipt detail timeline.

import * as React from "react";
import { cn } from "@/lib/utils";

// Interface defining individual step state item.
export interface StepItem {
  id: string;
  label: string;
  description?: string;
}

// Interface for StatusStepper props.
export interface StatusStepperProps extends React.HTMLAttributes<HTMLDivElement> {
  // Array of step definitions
  steps?: StepItem[];
  // Current active step index (0-indexed)
  currentStepIndex?: number;
}

// StatusStepper primitive component definition.
export const StatusStepper = React.forwardRef<HTMLDivElement, StatusStepperProps>(
  ({ className, steps = [], currentStepIndex = 0, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("w-full py-4 font-sans-inter", className)} {...props}>
        <ol className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-0 relative">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <li
                key={step.id}
                className="flex sm:flex-col items-center sm:items-center text-left sm:text-center flex-1 relative group w-full sm:w-auto"
              >
                {/* Connecting Line (Desktop) */}
                {idx < steps.length - 1 && (
                  <div
                    className={cn(
                      "hidden sm:block absolute top-4 left-[50%] right-[-50%] h-[3px] z-0 transition-colors duration-300",
                      isCompleted ? "bg-[var(--deep-grain-green)]" : "bg-[var(--border-color)]"
                    )}
                  />
                )}

                {/* Step Circle Indicator */}
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm z-10 transition-all duration-200 shrink-0",
                    isCompleted
                      ? "bg-[var(--deep-grain-green)] text-[#FFFFFF] shadow-soil-sm"
                      : isCurrent
                      ? "bg-[var(--harvest-wheat)] text-[var(--soil)] ring-4 ring-[var(--harvest-wheat)]/30 font-extrabold"
                      : "bg-[var(--paper)] border-2 border-[var(--border-color)] text-[var(--soil-tertiary)]"
                  )}
                >
                  {isCompleted ? "✓" : idx + 1}
                </div>

                {/* Step Label Content */}
                <div className="ml-3 sm:ml-0 sm:mt-2.5">
                  <span
                    className={cn(
                      "block text-xs font-semibold tracking-tight",
                      isCurrent
                        ? "text-[var(--soil)] font-bold text-sm"
                        : isCompleted
                        ? "text-[var(--deep-grain-green)] font-semibold"
                        : "text-[var(--soil-tertiary)]"
                    )}
                  >
                    {step.label}
                  </span>
                  {step.description && (
                    <span className="block text-[11px] text-[var(--soil-tertiary)] mt-0.5 max-w-[140px]">
                      {step.description}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    );
  }
);

StatusStepper.displayName = "StatusStepper";
