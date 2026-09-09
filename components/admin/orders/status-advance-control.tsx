// components/admin/orders/status-advance-control.tsx — Controlled Status Advancement Selector for Admin.
// Enforces finite state machine transitions, captures optional administrative audit notes, and posts updates to API.
// Used in: app/admin/orders/[orderId]/page.tsx

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ALLOWED_STATUS_TRANSITIONS, OrderFulfillmentStatus } from "@/lib/types/admin-orders";

interface StatusAdvanceControlProps {
  orderId: string;
  currentStatus: OrderFulfillmentStatus;
  isException?: boolean;
}

/**
 * Provides controlled advancement of an order through valid fulfillment-status transitions.
 *
 * @param orderId - The identifier of the order to update.
 * @param currentStatus - The order's current fulfillment status.
 * @param isException - Whether the order is in an exception state that blocks standard advancement.
 * @returns The status advancement control interface.
 */
export function StatusAdvanceControl({
  orderId,
  currentStatus,
  isException = false,
}: StatusAdvanceControlProps) {
  const router = useRouter();
  const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];

  const [selectedStatus, setSelectedStatus] = React.useState<string>(
    allowedTransitions.length > 0 ? allowedTransitions[0].target : ""
  );
  const [adminNotes, setAdminNotes] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const isTerminal = allowedTransitions.length === 0;

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStatus) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetStatus: selectedStatus,
          notes: adminNotes.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update order status.");
      }

      setSuccessMessage(`Order status successfully updated to ${selectedStatus}.`);
      setAdminNotes("");
      router.refresh();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FCFAF5] border border-[#E4DCC8] rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-[#E4DCC8]">
        <div>
          <h3 className="font-serif text-base text-[#4A3828] font-bold">
            Controlled Status Advancement
          </h3>
          <p className="text-xs text-[#A88958]">
            Advance fulfillment stages per strict operational state transitions.
          </p>
        </div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#D8B56A]/20 text-[#4A3828] border border-[#D8B56A]/40 capitalize">
          Current: {currentStatus.replace("_", " ")}
        </span>
      </div>

      {isTerminal ? (
        <div className="p-4 rounded-xl bg-[#F7F4EA] border border-[#E4DCC8] text-center">
          <p className="text-xs text-[#4A3828] font-medium">
            This order has reached the terminal state (
            <span className="font-semibold">{currentStatus.replace("_", " ")}</span>
            ). No further fulfillment status advancement is required.
          </p>
        </div>
      ) : isException ? (
        <div className="p-4 rounded-xl bg-[#B3432E]/10 border border-[#B3432E]/25 text-center">
          <p className="text-xs text-[#B3432E] font-medium">
            This order is currently in an <strong>Exception</strong> state. Please resolve the exception using the resolution panel below before advancing standard fulfillment.
          </p>
        </div>
      ) : (
        <form onSubmit={handleStatusUpdate} className="space-y-4">
          {/* Target Status Select */}
          <div>
            <label className="block text-xs font-semibold text-[#4A3828] mb-1.5">
              Next Valid Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E4DCC8] rounded-xl text-xs text-[#4A3828] focus:outline-none focus:ring-2 focus:ring-[#D8B56A] font-medium shadow-xs"
            >
              {allowedTransitions.map((transition) => (
                <option key={transition.target} value={transition.target}>
                  {transition.label} ({transition.target})
                </option>
              ))}
            </select>
            {selectedStatus && (
              <p className="text-[11px] text-[#A88958] mt-1.5 italic">
                {allowedTransitions.find((t) => t.target === selectedStatus)?.description}
              </p>
            )}
          </div>

          {/* Optional Admin Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#4A3828] mb-1.5">
              Administrative Audit Note (Optional)
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="e.g. Sourced from Kano grain supplier; batch #849 verified."
              rows={2}
              disabled={isSubmitting}
              className="w-full px-3.5 py-2 bg-white border border-[#E4DCC8] rounded-xl text-xs text-[#4A3828] placeholder-[#A88958]/60 focus:outline-none focus:ring-2 focus:ring-[#D8B56A] shadow-xs"
            />
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-[#B3432E]/10 border border-[#B3432E]/25 text-xs text-[#B3432E] font-medium">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="p-2.5 rounded-xl bg-[#21483A]/10 border border-[#21483A]/25 text-xs text-[#21483A] font-medium">
              {successMessage}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !selectedStatus}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#D8B56A] hover:bg-[#C7A254] text-[#4A3828] text-xs font-bold rounded-xl transition-all shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-[#4A3828]" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Advancing Status...</span>
              </>
            ) : (
              <span>Update Order Status</span>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
