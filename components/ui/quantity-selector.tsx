// components/ui/quantity-selector.tsx — Metric Quantity Selector component for KorraStore.
// Renders increment and decrement buttons alongside a monospace quantity input field.
// Used in: commodity purchase checkout, resale batch listing, buyback requests.

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Interface for QuantitySelector props.
export interface QuantitySelectorProps {
  // Current quantity numeric value
  value?: number;
  // Minimum allowed quantity value (default: 1)
  min?: number;
  // Maximum allowed quantity value (default: 1000)
  max?: number;
  // Step increment amount (default: 1)
  step?: number;
  // Measurement unit label (e.g., "Metric Tons", "Bags", "KG")
  unit?: string;
  // Change event callback handler
  onChange?: (value: number) => void;
  // Class name override
  className?: string;
}

// QuantitySelector primitive component definition.
export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  value = 1,
  min = 1,
  max = 1000,
  step = 1,
  unit = "Metric Tons",
  onChange,
  className,
}) => {
  const [qty, setQty] = React.useState<number>(value);

  const handleDecrement = () => {
    const nextVal = Math.max(min, qty - step);
    setQty(nextVal);
    onChange?.(nextVal);
  };

  const handleIncrement = () => {
    const nextVal = Math.min(max, qty + step);
    setQty(nextVal);
    onChange?.(nextVal);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10);
    if (!isNaN(parsed) && parsed >= min && parsed <= max) {
      setQty(parsed);
      onChange?.(parsed);
    }
  };

  return (
    <div className={cn("inline-flex flex-col gap-1 font-sans-inter", className)}>
      <div className="flex items-center space-x-1.5 bg-[var(--paper)] border border-[var(--border-color)] p-1 rounded-[10px] shadow-soil-sm">
        {/* Decrement Button */}
        <button
          type="button"
          onClick={handleDecrement}
          disabled={qty <= min}
          aria-label="Decrease quantity"
          className="w-9 h-9 flex items-center justify-center rounded-[8px] bg-[#FFFFFF] border border-[var(--border-color)] text-[var(--soil)] font-bold hover:bg-[var(--harvest-wheat)] transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          −
        </button>

        {/* Quantity Display Input */}
        <div className="flex items-center px-3 font-mono-plex">
          <input
            type="number"
            min={min}
            max={max}
            value={qty}
            onChange={handleInputChange}
            className="w-14 text-center font-bold text-base text-[var(--soil)] bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        {/* Increment Button */}
        <button
          type="button"
          onClick={handleIncrement}
          disabled={qty >= max}
          aria-label="Increase quantity"
          className="w-9 h-9 flex items-center justify-center rounded-[8px] bg-[#FFFFFF] border border-[var(--border-color)] text-[var(--soil)] font-bold hover:bg-[var(--harvest-wheat)] transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          +
        </button>
      </div>

      {unit && (
        <span className="text-[11px] text-[var(--soil-tertiary)] font-medium px-1">
          Unit: {unit}
        </span>
      )}
    </div>
  );
};
