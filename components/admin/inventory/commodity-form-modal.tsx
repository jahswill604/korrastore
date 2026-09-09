// components/admin/inventory/commodity-form-modal.tsx — Add/Edit Commodity Modal (Client Component).
// Provides an administrative form to create or edit commodities and their nested quality grades.
// Used in: components/admin/inventory/commodities-tab.tsx

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { AdminCommodity, CommodityGrade } from "@/lib/types/admin-inventory";
import { GradeEditor } from "./grade-editor";

// ----------------------------------------------------------------------------
// Props
// ----------------------------------------------------------------------------

interface CommodityFormModalProps {
  commodity?: AdminCommodity; // If provided → Edit mode. If omitted → Add mode.
  isOpen: boolean;
  onClose: () => void;
}

// ----------------------------------------------------------------------------
// CommodityFormModal Component
/**
 * Displays a modal for creating or editing a commodity and managing its quality grades.
 *
 * @param commodity - The commodity to edit; omit to create a new commodity.
 * @param isOpen - Whether the modal is visible.
 * @param onClose - Callback invoked after the modal is closed or successfully saved.
 */

export function CommodityFormModal({
  commodity,
  isOpen,
  onClose,
}: CommodityFormModalProps) {
  const router = useRouter();
  const isEdit = Boolean(commodity?.id);

  const [name, setName] = React.useState(commodity?.name || "");
  const [code, setCode] = React.useState(commodity?.code || "");
  const [description, setDescription] = React.useState(commodity?.description || "");
  const [unit, setUnit] = React.useState(commodity?.unit || "kg");
  const [basePrice, setBasePrice] = React.useState<number>(commodity?.base_price || 0);
  const [currentPrice, setCurrentPrice] = React.useState<number>(commodity?.current_price || 0);
  const [active, setActive] = React.useState(commodity?.active ?? true);
  const [grades, setGrades] = React.useState<CommodityGrade[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Reset form fields whenever the modal is (re)opened, or a different
  // commodity is being edited. Adjusting state during render (rather than in
  // a useEffect) is the pattern React recommends for "reset state when a prop
  // changes" — see https://react.dev/learn/you-might-not-need-an-effect
  const resetIdentity = isOpen ? (commodity ? `edit:${commodity.id}` : "create") : null;
  const [prevResetIdentity, setPrevResetIdentity] = React.useState<string | null>(null);
  if (resetIdentity !== prevResetIdentity) {
    setPrevResetIdentity(resetIdentity);
    if (resetIdentity && commodity) {
      setName(commodity.name);
      setCode(commodity.code);
      setDescription(commodity.description || "");
      setUnit(commodity.unit || "kg");
      setBasePrice(commodity.base_price || 0);
      setCurrentPrice(commodity.current_price || 0);
      setActive(commodity.active ?? true);
    } else if (resetIdentity === "create") {
      setName("");
      setCode("");
      setDescription("");
      setUnit("kg");
      setBasePrice(0);
      setCurrentPrice(0);
      setActive(true);
      setGrades([
        {
          id: `temp_1`,
          commodity_id: "",
          code: "A",
          name: "Grade A Premium",
          description: "High purity, cleaned & sorted",
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: `temp_2`,
          commodity_id: "",
          code: "B",
          name: "Grade B Standard",
          description: "Standard market grade",
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
    }
    if (resetIdentity) setError(null);
  }

  // Fetching this commodity's full grade list from the server on open IS a
  // genuine effect (reading from an external system), so it stays here.
  React.useEffect(() => {
    if (isOpen && commodity) {
      fetch(`/api/admin/inventory/commodities`)
        .then((res) => res.json())
        .catch(() => {});
    }
  }, [isOpen, commodity]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError("Name and Code are required.");
      return;
    }
    if (basePrice <= 0 || currentPrice <= 0) {
      setError("Base price and current price must be greater than 0.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        id: commodity?.id,
        code: code.trim(),
        name: name.trim(),
        description: description.trim() || null,
        unit: unit.trim(),
        base_price: basePrice,
        current_price: currentPrice,
        active,
      };

      const res = await fetch("/api/admin/inventory/commodities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save commodity");
      }

      // If new grades were added, save them via PATCH
      const savedCommodityId = data.commodity?.id;
      if (savedCommodityId && grades.length > 0) {
        for (const g of grades) {
          if (g.id.startsWith("temp_")) {
            await fetch(`/api/admin/inventory/commodities/${savedCommodityId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "upsert_grade",
                grade: {
                  commodity_id: savedCommodityId,
                  code: g.code,
                  name: g.name,
                  description: g.description,
                  active: g.active,
                },
              }),
            });
          }
        }
      }

      onClose();
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save commodity";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div
        className="w-full max-w-xl bg-[#F7F4EA] rounded-2xl border border-[#E4DCC8] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E4DCC8] flex items-center justify-between bg-white/60 shrink-0">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#4A3828]">
              {isEdit ? `Edit Commodity: ${commodity?.name}` : "Add New Commodity"}
            </h3>
            <p className="text-xs text-[#A88958] mt-0.5">
              Define agricultural commodity specs, base pricing, and quality grades.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="text-[#A88958] hover:text-[#4A3828] text-lg p-1 rounded-md"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 text-xs bg-[#B3432E]/10 border border-[#B3432E]/30 text-[#B3432E] rounded-lg">
              {error}
            </div>
          )}

          {/* Name & Code */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-[#4A3828] uppercase tracking-wider mb-1">
                Commodity Name <span className="text-[#B3432E]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rice (Ofada)"
                className="w-full h-10 px-3 text-xs rounded-xl bg-white border border-[#E4DCC8] text-[#4A3828] focus:ring-2 focus:ring-[#D8B56A]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4A3828] uppercase tracking-wider mb-1">
                Code <span className="text-[#B3432E]">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. RICE-OFD"
                className="w-full h-10 px-3 font-mono text-xs uppercase rounded-xl bg-white border border-[#E4DCC8] text-[#4A3828] focus:ring-2 focus:ring-[#D8B56A]"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#4A3828] uppercase tracking-wider mb-1">
              Description / Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Premium stone-free parboiled Ofada rice from Ogun State."
              className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#E4DCC8] text-[#4A3828] focus:ring-2 focus:ring-[#D8B56A]"
            />
          </div>

          {/* Unit & Prices */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#4A3828] uppercase tracking-wider mb-1">
                Base Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-xl bg-white border border-[#E4DCC8] text-[#4A3828] focus:ring-2 focus:ring-[#D8B56A]"
              >
                <option value="kg">kg (Kilogram)</option>
                <option value="bag">bag (50kg Bag)</option>
                <option value="ton">ton (Metric Ton)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4A3828] uppercase tracking-wider mb-1">
                Base Price (₦)
              </label>
              <input
                type="number"
                value={basePrice === 0 ? "" : basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value) || 0)}
                placeholder="60000"
                className="w-full h-10 px-3 font-mono text-xs rounded-xl bg-white border border-[#E4DCC8] text-[#4A3828] focus:ring-2 focus:ring-[#D8B56A]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4A3828] uppercase tracking-wider mb-1">
                Current Price (₦)
              </label>
              <input
                type="number"
                value={currentPrice === 0 ? "" : currentPrice}
                onChange={(e) => setCurrentPrice(Number(e.target.value) || 0)}
                placeholder="68500"
                className="w-full h-10 px-3 font-mono text-xs rounded-xl bg-white border border-[#E4DCC8] text-[#4A3828] focus:ring-2 focus:ring-[#D8B56A]"
                required
              />
            </div>
          </div>

          {/* Active Status Toggle */}
          <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#E4DCC8]">
            <div>
              <div className="text-xs font-semibold text-[#4A3828]">Active Marketplace Status</div>
              <div className="text-[11px] text-[#A88958]">
                If active, buyers can view and purchase this commodity on the store.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActive(!active)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                active
                  ? "bg-[#21483A]/10 text-[#21483A] border-[#21483A]/20"
                  : "bg-[#A88958]/10 text-[#A88958] border-[#A88958]/20"
              }`}
            >
              {active ? "Active" : "Inactive"}
            </button>
          </div>

          {/* Nested Grade Editor */}
          <div className="pt-2 border-t border-[#E4DCC8]">
            <GradeEditor
              grades={grades}
              commodityId={commodity?.id}
              onChange={setGrades}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-[#E4DCC8]">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-2.5 text-xs font-semibold rounded-xl border border-[#E4DCC8] text-[#6B5A48] bg-white hover:bg-[#F5EFE0] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim() || !code.trim()}
              className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-[#D8B56A] text-[#4A3828] hover:bg-[#D8B56A]/90 transition-colors shadow-sm disabled:opacity-50"
            >
              {isLoading ? "Saving..." : isEdit ? "Update Commodity" : "Create Commodity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
