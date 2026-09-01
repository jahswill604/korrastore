// components/admin/dashboard/needs-attention-list.tsx — Triage Panel for KorraStore Operations.
// Surfaces critical inventory deficits, pending buybacks, and stuck orders requiring immediate admin action.
// Used in: app/admin/page.tsx

import * as React from "react";
import Link from "next/link";
import { NeedsAttentionItem } from "@/lib/supabase/queries/admin/dashboard";
import { cn } from "@/lib/utils";

// ----------------------------------------------------------------------------
// Type Definitions
// ----------------------------------------------------------------------------

export interface NeedsAttentionListProps {
  items: NeedsAttentionItem[];
}

// ----------------------------------------------------------------------------
// NeedsAttentionList Component
// ----------------------------------------------------------------------------

export const NeedsAttentionList: React.FC<NeedsAttentionListProps> = ({ items }) => {
  if (!items || items.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-white border border-[#E4DCC8] text-center space-y-2">
        <div className="text-3xl">✨</div>
        <div className="text-sm font-semibold text-[#4A3828]">No Urgent Actions Required</div>
        <div className="text-xs text-[#A88958]">All orders, inventory silos, and liquidation queues are operational.</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-[#E4DCC8] shadow-sm overflow-hidden">
      {/* Panel Header */}
      <div className="p-5 border-b border-[#E4DCC8] flex items-center justify-between bg-[#FDFBF7]">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#B3432E] animate-pulse" />
          <h2 className="font-serif-display font-bold text-lg text-[#4A3828]">
            Needs Attention ({items.length})
          </h2>
        </div>
        <span className="text-xs font-semibold text-[#A88958] uppercase tracking-wider">
          Action Queue
        </span>
      </div>

      {/* Item List */}
      <div className="divide-y divide-[#E4DCC8]/70">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F7F4EA]/40 transition-colors"
          >
            {/* Left Info */}
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {/* Severity Badge */}
                <span
                  className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                    item.severity === "urgent" && "bg-[#B3432E]/10 text-[#B3432E] border border-[#B3432E]/30",
                    item.severity === "warning" && "bg-[#C7862B]/10 text-[#C7862B] border border-[#C7862B]/30",
                    item.severity === "info" && "bg-[#303B63]/10 text-[#303B63] border border-[#303B63]/30"
                  )}
                >
                  {item.severity}
                </span>

                <div className="text-sm font-bold text-[#4A3828] truncate">
                  {item.title}
                </div>
              </div>

              <p className="text-xs text-[#6B5A48] line-clamp-2">
                {item.description}
              </p>
            </div>

            {/* Right Action Button */}
            <div className="shrink-0 flex items-center sm:self-center">
              <Link
                href={item.targetUrl}
                className={cn(
                  "w-full sm:w-auto inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm",
                  item.severity === "urgent"
                    ? "bg-[#D8B56A] text-[#4A3828] hover:bg-[#A88958] hover:text-white"
                    : "bg-[#F7F4EA] text-[#4A3828] border border-[#E4DCC8] hover:bg-[#E4DCC8]"
                )}
              >
                <span>{item.actionLabel}</span>
                <span className="ml-1 text-[11px]">→</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
