// components/ui/input.tsx — Accessible Form Input primitive for KorraStore.
// Renders single-line text, password, email, and phone inputs styled with KorraStore design tokens.
// Used in: Auth pages (/login, /signup, /verify-phone), checkout, profile settings, and search filters.

import * as React from "react";
import { cn } from "@/lib/utils";

// Interface for Input properties, extending standard HTML input attributes.
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // Optional field label displayed above the input
  label?: string;
  // Error message rendered beneath the input in Danger red
  error?: string;
  // Helper hint text displayed beneath the input when no error is present
  helperText?: string;
  // Prefix element rendered inside the left side of the input (e.g. icon or country code)
  prefixElement?: React.ReactNode;
  // Suffix element rendered inside the right side of the input (e.g. password visibility toggle)
  suffixElement?: React.ReactNode;
  // Container wrapper class name
  containerClassName?: string;
}

// Input component definition with ref forwarding.
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      helperText,
      prefixElement,
      suffixElement,
      containerClassName,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    // Generate a unique ID if none is provided for accessible label association
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className={cn("w-full flex flex-col gap-1.5 text-left", containerClassName)}>
        {/* Field Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-wider text-[var(--soil)] font-sans-inter select-none"
          >
            {label}
          </label>
        )}

        {/* Input Wrapper with Slot Elements */}
        <div className="relative flex items-center w-full">
          {/* Prefix Slot */}
          {prefixElement && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[var(--husk)] select-none z-10">
              {prefixElement}
            </div>
          )}

          {/* Core Input Element */}
          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={cn(
              "w-full h-11 px-4 py-2 text-sm font-sans-inter text-[var(--soil)] bg-[#FFFFFF] border rounded-[10px] transition-all duration-150",
              "placeholder:text-[#9A8F82] focus:outline-none focus:ring-2 focus:ring-[var(--harvest-wheat)] focus:border-[var(--harvest-wheat)]",
              "disabled:bg-[#F2EFE9] disabled:text-[#A89F91] disabled:cursor-not-allowed disabled:border-[var(--border-color)]",
              error
                ? "border-[var(--danger)] focus:ring-[var(--danger)] focus:border-[var(--danger)]"
                : "border-[var(--border-color)] hover:border-[var(--husk)]",
              prefixElement ? "pl-11" : "pl-4",
              suffixElement ? "pr-11" : "pr-4",
              className
            )}
            {...props}
          />

          {/* Suffix Slot */}
          {suffixElement && (
            <div className="absolute right-3.5 flex items-center text-[var(--husk)] select-none z-10">
              {suffixElement}
            </div>
          )}
        </div>

        {/* Validation Error Message */}
        {error && (
          <p
            id={errorId}
            role="alert"
            className="text-xs font-medium text-[var(--danger)] font-sans-inter flex items-center gap-1 mt-0.5"
          >
            <svg
              className="w-3.5 h-3.5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path strokeWidth="2" strokeLinecap="round" d="M12 8v4m0 4h.01" />
            </svg>
            <span>{error}</span>
          </p>
        )}

        {/* Helper Hint Text */}
        {!error && helperText && (
          <p id={helperId} className="text-xs text-[#7A6A58] font-sans-inter mt-0.5">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
