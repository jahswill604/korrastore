// components/admin/inventory/grade-editor.tsx — Inline Grade Editor Component (Client Component).
// Allows administrators to add, edit, and deactivate commodity grades inline within the commodity modal.
// Used in: components/admin/inventory/commodity-form-modal.tsx

"use client";

import * as React from "react";
import type { CommodityGrade } from "@/lib/types/admin-inventory";

// ----------------------------------------------------------------------------
// Props
// ----------------------------------------------------------------------------

interface GradeEditorProps {
  grades: CommodityGrade[];
  commodityId?: string;
  onChange: (grades: CommodityGrade[]) => void;
}

// ----------------------------------------------------------------------------
// GradeEditor Component
// ----------------------------------------------------------------------------

export function GradeEditor({ grades, commodityId, onChange }: GradeEditorProps) {
  const [newGradeName, setNewGradeName] = React.useState("");
  const [newGradeCode, setNewGradeCode] = React.useState("");
  const [newGradeDesc, setNewGradeDesc] = React.useState("");

  const handleAddGrade = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newGradeName.trim()) return;

    const code = newGradeCode.trim() || newGradeName.trim().charAt(0).toUpperCase();
    const newGrade: CommodityGrade = {
      id: `temp_${Date.now()}`,
      commodity_id: commodityId || "",
      code,
      name: newGradeName.trim(),
      description: newGradeDesc.trim() || null,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onChange([...grades, newGrade]);
    setNewGradeName("");
    setNewGradeCode("");
    setNewGradeDesc("");
  };

  const handleToggleActive = (index: number) => {
    const updated = [...grades];
    updated[index] = {
      ...updated[index],
      active: !updated[index].active,
    };
    onChange(updated);
  };

  const handleRemoveGrade = (index: number) => {
    const updated = grades.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-[#4A3828] uppercase tracking-wider">
          Quality Grades ({grades.length})
        </label>
      </div>

      {/* Grade List */}
      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {grades.length === 0 ? (
          <div className="text-xs text-[#A88958] p-3 text-center bg-white/60 rounded-xl border border-dashed border-[#E4DCC8]">
            No quality grades added yet. Add Grade A / Grade B below.
          </div>
        ) : (
          grades.map((grade, index) => (
            <div
              key={grade.id || index}
              className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-colors ${
                grade.active
                  ? "bg-white border-[#E4DCC8]"
                  : "bg-[#F5EFE0]/60 border-[#E4DCC8]/40 opacity-60"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-6 h-6 rounded-md bg-[#21483A]/10 text-[#21483A] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                  {grade.code}
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#4A3828] truncate">
                    {grade.name}
                  </div>
                  {grade.description && (
                    <div className="text-[10px] text-[#A88958] truncate">
                      {grade.description}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleActive(index)}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-colors ${
                    grade.active
                      ? "bg-[#21483A]/10 text-[#21483A] border-[#21483A]/20"
                      : "bg-[#A88958]/10 text-[#A88958] border-[#A88958]/20"
                  }`}
                >
                  {grade.active ? "Active" : "Inactive"}
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveGrade(index)}
                  className="text-xs text-[#B3432E] hover:bg-[#B3432E]/10 p-1 rounded-md transition-colors"
                  title="Remove grade"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Grade Sub-form */}
      <div className="p-3 bg-[#F5EFE0] rounded-xl border border-[#E4DCC8] space-y-2">
        <div className="text-[11px] font-semibold text-[#6B5A48] uppercase tracking-wider">
          + Add New Grade
        </div>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="text"
            placeholder="Code (e.g. A)"
            value={newGradeCode}
            onChange={(e) => setNewGradeCode(e.target.value)}
            className="h-8 px-2.5 text-xs rounded-lg bg-white border border-[#E4DCC8] text-[#4A3828] focus:ring-1 focus:ring-[#D8B56A]"
          />
          <input
            type="text"
            placeholder="Grade Name (e.g. Grade A Premium)"
            value={newGradeName}
            onChange={(e) => setNewGradeName(e.target.value)}
            className="col-span-2 h-8 px-2.5 text-xs rounded-lg bg-white border border-[#E4DCC8] text-[#4A3828] focus:ring-1 focus:ring-[#D8B56A]"
          />
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Description / Specs (optional)"
            value={newGradeDesc}
            onChange={(e) => setNewGradeDesc(e.target.value)}
            className="flex-1 h-8 px-2.5 text-xs rounded-lg bg-white border border-[#E4DCC8] text-[#4A3828] focus:ring-1 focus:ring-[#D8B56A]"
          />
          <button
            type="button"
            onClick={handleAddGrade}
            disabled={!newGradeName.trim()}
            className="h-8 px-3 text-xs font-semibold rounded-lg bg-[#D8B56A] text-[#4A3828] hover:bg-[#D8B56A]/90 transition-colors disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
