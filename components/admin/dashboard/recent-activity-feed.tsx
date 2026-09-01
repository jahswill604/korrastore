// components/admin/dashboard/recent-activity-feed.tsx — Real-Time Audit Activity Timeline for KorraStore.
// Renders the latest administrative and operational log entries from audit_logs.
// Used in: app/admin/page.tsx

import * as React from "react";
import { AdminActivityItem } from "@/lib/supabase/queries/admin/dashboard";
import { cn } from "@/lib/utils";

// ----------------------------------------------------------------------------
// Type Definitions
// ----------------------------------------------------------------------------

export interface RecentActivityFeedProps {
  activities: AdminActivityItem[];
}

// ----------------------------------------------------------------------------
// Helper for Category Icons
// ----------------------------------------------------------------------------

function getCategoryIcon(category: AdminActivityItem["category"]): {
  icon: string;
  bg: string;
  text: string;
} {
  switch (category) {
    case "order":
      return { icon: "📦", bg: "bg-[#303B63]/10", text: "text-[#303B63]" };
    case "inventory":
      return { icon: "🌾", bg: "bg-[#21483A]/10", text: "text-[#21483A]" };
    case "buyback":
      return { icon: "💰", bg: "bg-[#C7862B]/10", text: "text-[#C7862B]" };
    case "resale":
      return { icon: "🔄", bg: "bg-[#D8B56A]/20", text: "text-[#4A3828]" };
    case "pricing":
      return { icon: "🏷️", bg: "bg-[#A88958]/20", text: "text-[#4A3828]" };
    default:
      return { icon: "⚙️", bg: "bg-[#E4DCC8]/60", text: "text-[#6B5A48]" };
  }
}

// ----------------------------------------------------------------------------
// RecentActivityFeed Component
// ----------------------------------------------------------------------------

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-white border border-[#E4DCC8] text-center space-y-2">
        <div className="text-3xl">📜</div>
        <div className="text-sm font-semibold text-[#4A3828]">No Recent Activity</div>
        <div className="text-xs text-[#A88958]">Audit logs will stream here as operations occur.</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-[#E4DCC8] shadow-sm overflow-hidden">
      {/* Feed Header */}
      <div className="p-5 border-b border-[#E4DCC8] flex items-center justify-between bg-[#FDFBF7]">
        <div className="flex items-center gap-2">
          <span className="text-lg">📜</span>
          <h2 className="font-serif-display font-bold text-lg text-[#4A3828]">
            Recent Activity
          </h2>
        </div>
        <span className="text-xs font-semibold text-[#A88958] uppercase tracking-wider">
          Audit Stream
        </span>
      </div>

      {/* Timeline List */}
      <div className="p-4 sm:p-5 space-y-4">
        {activities.map((item, idx) => {
          const { icon, bg } = getCategoryIcon(item.category);
          const isLast = idx === activities.length - 1;

          return (
            <div key={item.id} className="relative flex items-start gap-3.5 group">
              {/* Vertical connector line */}
              {!isLast && (
                <div className="absolute left-4 top-9 bottom-0 w-0.5 bg-[#E4DCC8]/70 group-hover:bg-[#D8B56A]/50 transition-colors" />
              )}

              {/* Icon Bubble */}
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 z-10 border border-[#E4DCC8]/70 shadow-xs",
                  bg
                )}
              >
                <span>{icon}</span>
              </div>

              {/* Details Content */}
              <div className="flex-1 min-w-0 pb-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-bold text-[#4A3828] truncate">
                    {item.action.replace(/_/g, " ")}
                  </div>
                  <span className="text-[11px] font-mono text-[#A88958] shrink-0">
                    {item.relativeTime}
                  </span>
                </div>

                <p className="text-xs text-[#6B5A48] mt-0.5 leading-relaxed">
                  {item.description}
                </p>

                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[#A88958]">
                  <span className="font-medium text-[#303B63]">
                    {item.actorEmail}
                  </span>
                  <span>•</span>
                  <span className="uppercase font-mono tracking-wider">
                    {item.category}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
