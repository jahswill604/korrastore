// components/admin/inventory/movement-history-modal.tsx — Movement History Timeline Modal (Client Component).
// Displays the full immutable ledger audit trail for a specific inventory line.
// Fetches records from GET /api/admin/inventory/[inventoryId]/movements.
// Used in: components/admin/inventory/inventory-tab.tsx

"use client";

import * as React from "react";
import type { InventoryMovement } from "@/lib/types/admin-inventory";

// ----------------------------------------------------------------------------
// Props
// ----------------------------------------------------------------------------

interface MovementHistoryModalProps {
  inventoryId: string;
  label: string;
  compact?: boolean;
}

// ----------------------------------------------------------------------------
// MovementTypeBadge Helper
// ----------------------------------------------------------------------------

function MovementTypeBadge({ type }: { type: string }) {
  const normalized = (type || "").toUpperCase();
  let style = "bg-[#A88958]/10 text-[#A88958] border-[#A88958]/20";

  if (normalized === "ADJUSTMENT") {
    style = "bg-[#D8B56A]/20 text-[#4A3828] border-[#D8B56A]/40 font-bold";
  } else if (normalized === "INBOUND" || normalized === "PURCHASE") {
    style = "bg-[#21483A]/10 text-[#21483A] border-[#21483A]/20";
  } else if (normalized === "OUTBOUND" || normalized === "DELIVERY_OUT") {
    style = "bg-[#B3432E]/10 text-[#B3432E] border-[#B3432E]/20";
  } else if (normalized.includes("ALLOCAT")) {
    style = "bg-[#303B63]/10 text-[#303B63] border-[#303B63]/20";
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${style}`}>
      {normalized}
    </span>
  );
}

// ----------------------------------------------------------------------------
// MovementHistoryModal Component
// ----------------------------------------------------------------------------

export function MovementHistoryModal({
  inventoryId,
  label,
  compact = false,
}: MovementHistoryModalProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [movements, setMovements] = React.useState<InventoryMovement[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchMovements = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/inventory/${inventoryId}/movements`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load movement ledger");
      }
      setMovements(data.movements || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load history";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    fetchMovements();
  };

  return (
    <>
      {/* Trigger Button */}
      {compact ? (
        <button
          type="button"
          onClick={handleOpen}
          className="flex-1 py-2 px-3 text-xs font-semibold rounded-lg border border-[#E4DCC8] text-[#6B5A48] bg-white hover:bg-[#F5EFE0] transition-colors text-center"
        >
          History
        </button>
      ) : (
        <button
          type="button"
          onClick={handleOpen}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#E4DCC8] text-[#6B5A48] bg-white hover:bg-[#F5EFE0] transition-colors shadow-xs"
        >
          History
        </button>
      )}

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div
            className="w-full max-w-2xl bg-[#F7F4EA] rounded-2xl border border-[#E4DCC8] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#E4DCC8] flex items-center justify-between bg-white/60">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#4A3828]">
                  Ledger Movement History
                </h3>
                <p className="text-xs text-[#A88958] mt-0.5">{label}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[#A88958] hover:text-[#4A3828] text-lg p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {isLoading ? (
                <div className="py-12 text-center text-xs text-[#A88958]">
                  Loading ledger records...
                </div>
              ) : error ? (
                <div className="p-4 text-xs bg-[#B3432E]/10 border border-[#B3432E]/30 text-[#B3432E] rounded-xl">
                  {error}
                </div>
              ) : movements.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#A88958]">
                  No movement entries recorded for this inventory line.
                </div>
              ) : (
                <div className="space-y-3">
                  {movements.map((m) => {
                    const isPositive = m.quantity > 0;
                    const formattedDate = new Date(m.created_at).toLocaleString("en-NG", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    });

                    return (
                      <div
                        key={m.id}
                        className="bg-white p-3.5 rounded-xl border border-[#E4DCC8] shadow-2xs space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <MovementTypeBadge type={m.movement_type} />
                            <span className="text-xs text-[#A88958]">{formattedDate}</span>
                          </div>
                          <div className="text-right">
                            <span
                              className={`font-mono text-sm font-bold ${
                                isPositive ? "text-[#21483A]" : "text-[#B3432E]"
                              }`}
                            >
                              {isPositive ? `+${m.quantity.toLocaleString()}` : m.quantity.toLocaleString()} kg
                            </span>
                          </div>
                        </div>

                        {/* Reason / Notes */}
                        {m.notes && (
                          <div className="text-xs text-[#4A3828] bg-[#F5EFE0] p-2 rounded-lg border border-[#E4DCC8]/60">
                            <strong>Reason:</strong> {m.notes}
                          </div>
                        )}

                        {/* Balance After & Admin Meta */}
                        <div className="flex items-center justify-between text-[11px] text-[#A88958] pt-1 border-t border-[#E4DCC8]/40">
                          <div>
                            Balance After: <span className="font-mono font-semibold text-[#4A3828]">{m.balance_after?.toLocaleString()} kg</span>
                          </div>
                          {m.created_by && (
                            <div className="font-mono text-[10px]">
                              Admin ID: {m.created_by.slice(0, 8)}...
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-[#E4DCC8] bg-white/60 text-right">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#F7F4EA] border border-[#E4DCC8] text-[#4A3828] hover:bg-[#F5EFE0] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
