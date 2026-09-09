// components/admin/orders/order-audit-trail.tsx — Admin Order Audit History Timeline for KorraStore.
// Renders chronological timeline of status changes, ledger operations, and administrative actions for accountability.
// Used in: app/admin/orders/[orderId]/page.tsx

import * as React from "react";

interface AuditEntry {
  id: string;
  action: string;
  oldState: Record<string, unknown> | null;
  newState: Record<string, unknown> | null;
  actorEmail: string;
  createdAt: string;
}

interface OrderAuditTrailProps {
  auditTrail: AuditEntry[];
}

export function OrderAuditTrail({ auditTrail }: OrderAuditTrailProps) {
  if (!auditTrail || auditTrail.length === 0) {
    return (
      <div className="bg-[#FCFAF5] border border-[#E4DCC8] rounded-2xl p-6 shadow-sm">
        <h3 className="font-serif text-base text-[#4A3828] font-bold mb-1">
          Audit & Modification History
        </h3>
        <p className="text-xs text-[#A88958]">
          No administrative status modifications recorded for this order yet.
        </p>
      </div>
    );
  }

  const formatTimestamp = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString("en-NG", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "admin_order_status_update":
        return "Status Advanced";
      case "admin_order_exception_resolved":
        return "Exception Resolved";
      case "admin_order_exception_refunded":
        return "Order Cancelled & Refunded";
      default:
        return action.replace(/_/g, " ");
    }
  };

  return (
    <div className="bg-[#FCFAF5] border border-[#E4DCC8] rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-[#E4DCC8]">
        <div>
          <h3 className="font-serif text-base text-[#4A3828] font-bold">
            Administrative Audit Trail
          </h3>
          <p className="text-xs text-[#A88958]">
            Immutable record of all operational status changes and admin actions.
          </p>
        </div>
        <span className="font-mono text-xs text-[#A88958] bg-[#E4DCC8]/40 px-2.5 py-1 rounded-full">
          {auditTrail.length} {auditTrail.length === 1 ? "event" : "events"}
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E4DCC8]">
        {auditTrail.map((entry) => {
          const newStateTyped = entry.newState as { status?: string; notes?: string } | null;
          const newStatus = newStateTyped?.status;
          const notes = newStateTyped?.notes;

          return (
            <div key={entry.id} className="relative group">
              {/* Dot indicator */}
              <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-[#D8B56A] border-2 border-white shadow-xs" />

              <div className="bg-white border border-[#E4DCC8] rounded-xl p-3.5 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#4A3828] capitalize">
                      {getActionLabel(entry.action)}
                    </span>
                    {newStatus && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#21483A]/10 text-[#21483A] capitalize">
                        → {newStatus.replace("_", " ")}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[11px] text-[#A88958]">
                    {formatTimestamp(entry.createdAt)}
                  </span>
                </div>

                <div className="text-xs text-[#4A3828]/80 mb-1">
                  By: <span className="font-medium text-[#303B63]">{entry.actorEmail}</span>
                </div>

                {notes && (
                  <p className="text-xs text-[#4A3828] bg-[#F7F4EA] rounded-lg p-2 mt-1 border border-[#E4DCC8]/50 italic">
                    &ldquo;{notes}&rdquo;
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
