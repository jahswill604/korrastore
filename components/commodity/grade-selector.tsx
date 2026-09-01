// components/commodity/grade-selector.tsx — Quality Grade Selection Chips for Commodity Details.
// Renders segmented control / chip options (Grade A, Grade B, Grade C) using GradeBadge design primitives.
// Harvest Wheat gold fill (#D8B56A) for active selected grade matching desktop-ui.png and mobile-ui.png.
// Used in: components/commodity/purchase-panel.tsx

"use client";

import * as React from "react";
import { GradeAvailability } from "@/lib/types";

interface GradeSelectorProps {
  grades: GradeAvailability[];
  selectedGradeId: string;
  onSelectGrade: (grade: GradeAvailability) => void;
}

export function GradeSelector({
  grades,
  selectedGradeId,
  onSelectGrade,
}: GradeSelectorProps) {
  return (
    <div className="flex items-center space-x-2.5 overflow-x-auto pb-1 scrollbar-none">
      {grades.map((grade) => {
        const isSelected = grade.gradeId === selectedGradeId;
        const isOutOfStock = grade.availableQuantity === 0;

        return (
          <button
            key={grade.gradeId}
            type="button"
            onClick={() => onSelectGrade(grade)}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-full font-sans-inter text-xs font-semibold transition-all cursor-pointer ${
              isSelected
                ? "bg-[#D8B56A] text-[#4A3828] shadow-xs border border-[#C29E53]"
                : "bg-[#F7F4EA] text-[#6B5A48] border border-[#E4DCC8] hover:bg-[#EFE9D9]"
            } ${isOutOfStock ? "opacity-70" : ""}`}
          >
            <span>{grade.gradeName}</span>
            {isOutOfStock && (
              <span className="text-[10px] text-[#B3432E] font-medium ml-1">
                (Out)
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
