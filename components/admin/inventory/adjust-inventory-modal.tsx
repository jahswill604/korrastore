// components/admin/inventory/adjust-inventory-modal.tsx — Stock Adjustment Modal (Client Component).
// Provides an auditable stock adjustment interface with delta stepper, required reason input,
// and safety warnings. Dispatches requests to POST /api/admin/inventory/adjust.
// Used in: components/admin/inventory/inventory-tab.tsx

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { AdminInventoryLine } from "@/lib/types/admin-inventory";

// ----------------------------------------------------------------------------
// Props
// ----------------------------------------------------------------------------

interface AdjustInventoryModalProps {
  line: AdminInventoryLine;
  compact?: boolean; // Mobile layout button
}

// ----------------------------------------------------------------------------
// AdjustInventoryModal Component
// ----------------------------------------------------------------------------

export function AdjustInventoryModal({ line, compact = false }: AdjustInventoryModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [delta, setDelta] = React.useState<number>(0);
  const [reason, setReason] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [auditAcknowledged, setAuditAcknowledged] = React.useState(false);

  // Reset state on open
  const handleOpen = () => {
    setDelta(0);
    setReason("");
    setErrorMessage(null);
    setAuditAcknowledged(false);
    setIsOpen(true);
  };

  const handleClose = () => {
    if (isLoading) return;
    setIsOpen(false);
  };

  const resultingQuantity = line.quantity + delta;
  const isNegative = resultingQuantity < 0;

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (delta === 0) {
      setErrorMessage("Adjustment delta cannot be zero.");
      return;
    }
    if (!reason.trim()) {
      setErrorMessage("Please enter an explicit reason for this adjustment.");
      return;
    }
    if (isNegative) {
      setErrorMessage("Resulting physical stock cannot be negative.");
      return;
    }
    if (!auditAcknowledged) {
      setErrorMessage("Please acknowledge the audit warning before confirming.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inventory_id: line.id,
          delta,
          reason: reason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to adjust stock");
      }

      // Success
      setIsOpen(false);
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      {compact ? (
        <button
          type="button"
          onClick={handleOpen}
          className="flex-1 py-2 px-3 text-xs font-semibold rounded-lg border border-[#D8B56A] text-[#4A3828] bg-[#D8B56A]/10 hover:bg-[#D8B56A]/20 transition-colors text-center"
        >
          Adjust Stock
        </button>
      ) : (
        <button
          type="button"
          onClick={handleOpen}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#D8B56A] text-[#4A3828] bg-[#F7F4EA] hover:bg-[#D8B56A]/20 transition-colors shadow-xs"
        >
          Adjust Stock
        </button>
      )}

      {/* Modal Dialog Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div
            className="w-full max-w-md bg-[#F7F4EA] rounded-2xl border border-[#E4DCC8] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#E4DCC8] flex items-center justify-between bg-white/60">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#4A3828]">
                  Adjust Stock Balance
                </h3>
                <p className="text-xs text-[#A88958] mt-0.5">
                  {line.commodity_name} · {line.grade_name} ({line.warehouse_name})
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="text-[#A88958] hover:text-[#4A3828] text-lg p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Balance Summary Box */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#F5EFE0] rounded-xl border border-[#E4DCC8]/60 text-center">
                <div>
                  <div className="text-[11px] text-[#A88958] uppercase font-semibold">Current Stock</div>
                  <div className="font-mono text-base font-bold text-[#4A3828]">
                    {line.quantity.toLocaleString()} {line.commodity_unit}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[#A88958] uppercase font-semibold">New Stock</div>
                  <div
                    className={`font-mono text-base font-bold ${
                      isNegative ? "text-[#B3432E]" : "text-[#21483A]"
                    }`}
                  >
                    {resultingQuantity.toLocaleString()} {line.commodity_unit}
                  </div>
                </div>
              </div>

              {/* Delta Stepper */}
              <div>
                <label className="block text-xs font-semibold text-[#4A3828] uppercase tracking-wider mb-1.5">
                  Adjustment Delta ({line.commodity_unit})
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDelta((prev) => prev - 50)}
                    className="w-10 h-10 rounded-lg bg-white border border-[#E4DCC8] text-[#4A3828] font-bold text-base hover:bg-[#F5EFE0] transition-colors flex items-center justify-center shrink-0"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={delta === 0 ? "" : delta}
                    onChange={(e) => setDelta(Number(e.target.value) || 0)}
                    placeholder="0"
                    className="flex-1 h-10 px-3 font-mono text-center text-sm font-semibold rounded-lg bg-white border border-[#E4DCC8] text-[#4A3828] focus:outline-hidden focus:ring-2 focus:ring-[#D8B56A]"
                  />
                  <button
                    type="button"
                    onClick={() => setDelta((prev) => prev + 50)}
                    className="w-10 h-10 rounded-lg bg-white border border-[#E4DCC8] text-[#4A3828] font-bold text-base hover:bg-[#F5EFE0] transition-colors flex items-center justify-center shrink-0"
                  >
                    +
                  </button>
                </div>
                <p className="text-[11px] text-[#A88958] mt-1">
                  Use positive numbers to add stock intake, negative numbers for shrinkage or deductions.
                </p>
              </div>

              {/* Reason Input (Required) */}
              <div>
                <label className="block text-xs font-semibold text-[#4A3828] uppercase tracking-wider mb-1.5">
                  Reason for Adjustment <span className="text-[#B3432E]">*</span>
                </label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Silo intake verification, moisture loss shrinkage, physical audit reconciliation"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white border border-[#E4DCC8] text-[#4A3828] placeholder-[#A88958]/60 focus:outline-hidden focus:ring-2 focus:ring-[#D8B56A]"
                  required
                />
              </div>

              {/* Audit Warning Checkbox */}
              <div className="p-3 bg-[#C7862B]/10 border border-[#C7862B]/30 rounded-xl">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={auditAcknowledged}
                    onChange={(e) => setAuditAcknowledged(e.target.checked)}
                    className="mt-0.5 rounded border-[#C7862B] text-[#D8B56A] focus:ring-[#D8B56A]"
                  />
                  <span className="text-xs text-[#4A3828] leading-tight">
                    <strong>Audit Notice:</strong> This adjustment writes an immutable entry into{" "}
                    <code>inventory_movements</code> and <code>audit_logs</code> with your admin ID.
                  </span>
                </label>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 text-xs bg-[#B3432E]/10 border border-[#B3432E]/30 text-[#B3432E] rounded-lg">
                  {errorMessage}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1 py-2.5 text-xs font-semibold rounded-xl border border-[#E4DCC8] text-[#6B5A48] bg-white hover:bg-[#F5EFE0] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || delta === 0 || !reason.trim() || !auditAcknowledged || isNegative}
                  className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-[#D8B56A] text-[#4A3828] hover:bg-[#D8B56A]/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Saving..." : "Confirm Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
