// components/commodity/purchase-panel.tsx — Interactive Purchase Panel for Commodity Details.
// Handles per-grade selection state, live price recalculation, quantity adjustment, and Buy CTA navigation to /checkout.
// Renders sticky card on desktop and inline purchase section + sticky bottom CTA on mobile matching desktop-ui.png and mobile-ui.png.
// Used in: app/commodities/[commodityId]/page.tsx

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { GradeAvailability } from "@/lib/types";
import { GradeSelector } from "@/components/commodity/grade-selector";
import { PriceDisplay } from "@/components/ui/price-display";
import { Button } from "@/components/ui/button";

interface PurchasePanelProps {
  commodityId: string;
  commodityName: string;
  unit: string;
  grades: GradeAvailability[];
}

export function PurchasePanel({
  commodityId,
  commodityName,
  unit,
  grades,
}: PurchasePanelProps) {
  const router = Router();
  const [selectedGrade, setSelectedGrade] = React.useState<GradeAvailability>(
    grades[0] || {
      gradeId: "grade-a",
      gradeName: "Grade A",
      gradeCode: "A",
      unitPrice: 68500,
      availableQuantity: 1250,
      stockStatus: "in_stock",
    }
  );

  const [quantity, setQuantity] = React.useState<number>(1);

  const handleGradeSelect = (grade: GradeAvailability) => {
    setSelectedGrade(grade);
    setQuantity(1);
  };

  const isAvailable = selectedGrade.availableQuantity > 0;
  const totalPrice = selectedGrade.unitPrice * quantity;

  const handleBuyNow = () => {
    if (!isAvailable) return;
    router.push(
      `/checkout?commodityId=${encodeURIComponent(commodityId)}&gradeId=${encodeURIComponent(selectedGrade.gradeId)}&qty=${quantity}`
    );
  };

  return (
    <div className="space-y-6">
      {/* DESKTOP / MAIN PANEL CARD */}
      <div className="p-6 rounded-[24px] bg-white border border-[#E4DCC8] shadow-soil-sm space-y-6">
        <div className="flex items-center justify-between border-b border-[#E4DCC8] pb-4">
          <h3 className="font-serif-display text-lg font-bold text-[#4A3828]">
            Purchase Panel
          </h3>
          <span className="font-sans-inter text-xs text-[#6B5A48] bg-[#F7F4EA] px-2.5 py-1 rounded-full border border-[#E4DCC8]">
            Live Inventory
          </span>
        </div>

        {/* Grade Selector */}
        <div className="space-y-2">
          <label className="block font-sans-inter text-xs font-semibold text-[#6B5A48]">
            Select Quality Grade
          </label>
          <GradeSelector
            grades={grades}
            selectedGradeId={selectedGrade.gradeId}
            onSelectGrade={handleGradeSelect}
          />
        </div>

        {/* Dynamic Price Display */}
        <div className="space-y-1 bg-[#F7F4EA] p-4 rounded-2xl border border-[#E4DCC8]">
          <span className="block font-sans-inter text-xs text-[#6B5A48]">Unit Price ({selectedGrade.gradeName})</span>
          <div className="flex items-baseline space-x-1.5">
            <PriceDisplay
              amount={selectedGrade.unitPrice}
              size="lg"
              className="text-[#4A3828]"
            />
            <span className="font-mono-plex text-xs text-[#6B5A48]">/ {unit}</span>
          </div>
        </div>

        {/* Stock & Quantity Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-sans-inter text-xs font-semibold text-[#6B5A48]">
              Stock Availability
            </span>
            <span
              className={`font-mono-plex text-xs font-bold ${
                isAvailable ? "text-[#21483A]" : "text-[#B3432E]"
              }`}
            >
              {isAvailable
                ? `🟢 ${selectedGrade.availableQuantity.toLocaleString()} ${unit}s available`
                : "🔴 Out of Stock"}
            </span>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E4DCC8]">
            <span className="font-sans-inter text-xs text-[#6B5A48]">Order Quantity ({unit}s)</span>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={!isAvailable || quantity <= 1}
                className="w-8 h-8 rounded-lg bg-[#F7F4EA] border border-[#E4DCC8] flex items-center justify-center text-[#4A3828] font-bold disabled:opacity-40 hover:bg-[#EFE9D9] transition-colors cursor-pointer"
              >
                -
              </button>
              <span className="font-mono-plex font-bold text-sm text-[#4A3828] min-w-[24px] text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(selectedGrade.availableQuantity, q + 1))}
                disabled={!isAvailable || quantity >= selectedGrade.availableQuantity}
                className="w-8 h-8 rounded-lg bg-[#F7F4EA] border border-[#E4DCC8] flex items-center justify-center text-[#4A3828] font-bold disabled:opacity-40 hover:bg-[#EFE9D9] transition-colors cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Total Price Estimate */}
        {isAvailable && quantity > 1 && (
          <div className="flex items-center justify-between text-xs font-sans-inter pt-1">
            <span className="text-[#6B5A48]">Estimated Total:</span>
            <span className="font-mono-plex font-bold text-base text-[#4A3828]">
              ₦{totalPrice.toLocaleString()}
            </span>
          </div>
        )}

        {/* Unavailable Banner or Buy Button */}
        {!isAvailable ? (
          <div className="p-4 rounded-xl bg-[#FDECEA] border border-[#F8C4C1] text-center space-y-1">
            <span className="block font-sans-inter text-xs font-bold text-[#B3432E]">
              Currently Unavailable
            </span>
            <p className="font-sans-inter text-[11px] text-[#6B5A48]">
              This grade is currently out of stock. Please select another grade or check back soon.
            </p>
          </div>
        ) : (
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={handleBuyNow}
            className="w-full bg-[#D8B56A] hover:bg-[#C29E53] text-[#4A3828] font-bold py-3.5 shadow-xs"
          >
            Buy Now
          </Button>
        )}
      </div>

      {/* MOBILE STICKY BOTTOM CTA BAR */}
      <div className="md:hidden fixed bottom-[65px] left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-[#E4DCC8] z-30 shadow-soil-md flex items-center justify-between space-x-3">
        <div>
          <span className="block font-sans-inter text-[10px] text-[#6B5A48]">Total Price</span>
          <span className="font-mono-plex text-base font-bold text-[#4A3828]">
            ₦{totalPrice.toLocaleString()}
          </span>
        </div>
        <Button
          type="button"
          disabled={!isAvailable}
          onClick={handleBuyNow}
          className="flex-1 bg-[#D8B56A] hover:bg-[#C29E53] text-[#4A3828] font-bold py-3 text-sm disabled:opacity-50"
        >
          {isAvailable ? "Buy Now" : "Unavailable"}
        </Button>
      </div>
    </div>
  );
}

// Router helper wrapper
function Router() {
  return useRouter();
}
