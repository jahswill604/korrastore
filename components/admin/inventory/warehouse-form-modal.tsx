// components/admin/inventory/warehouse-form-modal.tsx — Add/Edit Warehouse Modal (Client Component).
// Provides an administrative form to register or edit warehouse silo locations.
// Used in: components/admin/inventory/warehouses-tab.tsx

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { AdminWarehouse } from "@/lib/types/admin-inventory";

// ----------------------------------------------------------------------------
// Props
// ----------------------------------------------------------------------------

interface WarehouseFormModalProps {
  warehouse?: AdminWarehouse; // If provided → Edit mode. If omitted → Add mode.
  isOpen: boolean;
  onClose: () => void;
}

// ----------------------------------------------------------------------------
// WarehouseFormModal Component
/**
 * Provides a modal form for creating or editing an administrative warehouse record.
 *
 * @param warehouse - The warehouse to edit, or `undefined` to create a new warehouse.
 * @param isOpen - Whether the modal is visible.
 * @param onClose - Callback invoked when the modal closes or saves successfully.
 * @returns The warehouse form modal, or `null` when closed.
 */

export function WarehouseFormModal({
  warehouse,
  isOpen,
  onClose,
}: WarehouseFormModalProps) {
  const router = useRouter();
  const isEdit = Boolean(warehouse?.id);

  const [name, setName] = React.useState(warehouse?.name || "");
  const [code, setCode] = React.useState(warehouse?.code || "");
  const [location, setLocation] = React.useState(warehouse?.location || "");
  const [address, setAddress] = React.useState(warehouse?.address || "");
  const [capacity, setCapacity] = React.useState<number>(warehouse?.capacity || 0);
  const [active, setActive] = React.useState(warehouse?.active ?? true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Reset form fields whenever the modal is (re)opened, or a different
  // warehouse is being edited. Adjusting state during render (rather than in
  // a useEffect) is the pattern React recommends for "reset state when a prop
  // changes".
  const resetIdentity = isOpen ? (warehouse ? `edit:${warehouse.id}` : "create") : null;
  const [prevResetIdentity, setPrevResetIdentity] = React.useState<string | null>(null);
  if (resetIdentity !== prevResetIdentity) {
    setPrevResetIdentity(resetIdentity);
    if (resetIdentity && warehouse) {
      setName(warehouse.name);
      setCode(warehouse.code);
      setLocation(warehouse.location);
      setAddress(warehouse.address || "");
      setCapacity(warehouse.capacity || 0);
      setActive(warehouse.active ?? true);
    } else if (resetIdentity === "create") {
      setName("");
      setCode("");
      setLocation("");
      setAddress("");
      setCapacity(50000);
      setActive(true);
    }
    if (resetIdentity) setError(null);
  }

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || !location.trim()) {
      setError("Name, Code, and Location are required.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        id: warehouse?.id,
        code: code.trim().toUpperCase(),
        name: name.trim(),
        location: location.trim(),
        address: address.trim(),
        capacity,
        active,
      };

      const res = await fetch("/api/admin/inventory/warehouses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save warehouse");
      }

      onClose();
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save warehouse";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div
        className="w-full max-w-lg bg-[#F7F4EA] rounded-2xl border border-[#E4DCC8] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E4DCC8] flex items-center justify-between bg-white/60">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#4A3828]">
              {isEdit ? `Edit Warehouse: ${warehouse?.name}` : "Add New Warehouse Silo"}
            </h3>
            <p className="text-xs text-[#A88958] mt-0.5">
              Register a climate-controlled storage hub or regional silo.
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-[#B3432E]/10 border border-[#B3432E]/30 text-[#B3432E] rounded-lg">
              {error}
            </div>
          )}

          {/* Name & Code */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-[#4A3828] uppercase tracking-wider mb-1">
                Warehouse / Silo Name <span className="text-[#B3432E]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Abuja Central Silo 01"
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
                placeholder="e.g. ABJ-01"
                className="w-full h-10 px-3 font-mono text-xs uppercase rounded-xl bg-white border border-[#E4DCC8] text-[#4A3828] focus:ring-2 focus:ring-[#D8B56A]"
                required
              />
            </div>
          </div>

          {/* Location & Address */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#4A3828] uppercase tracking-wider mb-1">
                Region / State <span className="text-[#B3432E]">*</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Abuja, FCT"
                className="w-full h-10 px-3 text-xs rounded-xl bg-white border border-[#E4DCC8] text-[#4A3828] focus:ring-2 focus:ring-[#D8B56A]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4A3828] uppercase tracking-wider mb-1">
                Physical Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Plot 12, Industrial Layout, Idu, Abuja"
                className="w-full h-10 px-3 text-xs rounded-xl bg-white border border-[#E4DCC8] text-[#4A3828] focus:ring-2 focus:ring-[#D8B56A]"
              />
            </div>
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-xs font-semibold text-[#4A3828] uppercase tracking-wider mb-1">
              Storage Capacity (kg)
            </label>
            <input
              type="number"
              value={capacity === 0 ? "" : capacity}
              onChange={(e) => setCapacity(Number(e.target.value) || 0)}
              placeholder="50000"
              className="w-full h-10 px-3 font-mono text-xs rounded-xl bg-white border border-[#E4DCC8] text-[#4A3828] focus:ring-2 focus:ring-[#D8B56A]"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#E4DCC8]">
            <div>
              <div className="text-xs font-semibold text-[#4A3828]">Active Storage Hub</div>
              <div className="text-[11px] text-[#A88958]">
                Only active warehouses accept new inventory allocations.
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

          {/* Actions */}
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
              disabled={isLoading || !name.trim() || !code.trim() || !location.trim()}
              className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-[#D8B56A] text-[#4A3828] hover:bg-[#D8B56A]/90 transition-colors shadow-sm disabled:opacity-50"
            >
              {isLoading ? "Saving..." : isEdit ? "Update Warehouse" : "Create Warehouse"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
