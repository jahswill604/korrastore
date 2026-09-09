// components/admin/orders/exception-resolution-panel.tsx — Exception Triage & Reconciliation Panel for Admin.
// Allows administrators to resolve inventory allocation exceptions via ledger allocation or refund cancellation.
// Used in: app/admin/orders/[orderId]/page.tsx

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

interface ExceptionResolutionPanelProps {
  orderId: string;
  exceptionReason?: string | null;
}

/**
 * Provides administrators with actions to resolve an order inventory exception.
 *
 * @param orderId - The identifier of the order whose exception is being resolved
 * @param exceptionReason - Optional explanation displayed for the inventory exception
 */
export function ExceptionResolutionPanel({
  orderId,
  exceptionReason,
}: ExceptionResolutionPanelProps) {
  const router = useRouter();

  const [notes, setNotes] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [activeAction, setActiveAction] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const handleResolution = async (action: "allocate_inventory" | "refund_and_cancel") => {
    setIsSubmitting(true);
    setActiveAction(action);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/exception`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to resolve order exception.");
      }

      setSuccessMsg(
        action === "allocate_inventory"
          ? "Exception cleared. Order advanced to sourcing/transit."
          : "Order cancelled and refund action logged."
      );
      setNotes("");
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
      setActiveAction(null);
    }
  };

  return (
    <div className="bg-[#B3432E]/5 border border-[#B3432E]/30 rounded-2xl p-6 shadow-sm mb-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 rounded-xl bg-[#B3432E]/15 text-[#B3432E] shrink-0">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div>
          <h3 className="font-serif text-base font-bold text-[#B3432E]">
            Exception & Reconciliation Required
          </h3>
          <p className="text-xs text-[#4A3828] mt-0.5">
            {exceptionReason ||
              "Payment verified, but warehouse inventory could not be allocated immediately."}
          </p>
        </div>
      </div>

      {/* Resolution Notes */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-[#4A3828] mb-1.5">
          Resolution Details / Audit Note
        </label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Sourced additional 500kg from Kano Silo #2 to satisfy holding."
          disabled={isSubmitting}
          className="w-full px-3.5 py-2.5 bg-white border border-[#E4DCC8] rounded-xl text-xs text-[#4A3828] placeholder-[#A88958]/60 focus:outline-none focus:ring-2 focus:ring-[#B3432E] shadow-xs"
        />
      </div>

      {/* Status Messages */}
      {errorMsg && (
        <div className="mb-3 p-2.5 rounded-xl bg-[#B3432E]/15 border border-[#B3432E]/30 text-xs text-[#B3432E] font-medium">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="mb-3 p-2.5 rounded-xl bg-[#21483A]/15 border border-[#21483A]/30 text-xs text-[#21483A] font-medium">
          {successMsg}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={() => handleResolution("allocate_inventory")}
          disabled={isSubmitting}
          className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#21483A] hover:bg-[#18352B] text-white text-xs font-bold rounded-xl transition-all shadow-sm disabled:opacity-50"
        >
          {isSubmitting && activeAction === "allocate_inventory" ? (
            <span>Allocating...</span>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Allocate via Warehouse Ledger</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleResolution("refund_and_cancel")}
          disabled={isSubmitting}
          className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#FCFAF5] hover:bg-[#B3432E]/10 text-[#B3432E] border border-[#B3432E]/30 text-xs font-bold rounded-xl transition-all disabled:opacity-50"
        >
          {isSubmitting && activeAction === "refund_and_cancel" ? (
            <span>Cancelling...</span>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Refund & Cancel Order</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
