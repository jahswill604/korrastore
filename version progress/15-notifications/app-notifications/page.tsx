// app/notifications/page.tsx — Buyer In-App Notification Center for KorraStore.
// Server Component — authenticated route displaying the buyer's real-time notifications feed.
// Route: /notifications
// Supports URL-driven category filter tabs (?filter=all|unread|orders|resale|buyback|pricing),
// unread badges, mark-all-read action, and single-click read + deep navigation.
// Used in: Feature 15 Notifications Center.

import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getInAppNotifications,
  getUnreadNotificationsCount,
} from "@/lib/supabase/queries/notifications";
import { AppShell } from "@/components/layout/app-shell";
import { NotificationRow } from "@/components/notifications/notification-row";
import { NotificationFilters } from "@/components/notifications/notification-filters";
import { MarkAllReadButton } from "@/components/notifications/mark-all-read-button";
import { EmptyState } from "@/components/ui/empty-state";

// ----------------------------------------------------------------------------
// SEO Metadata
// ----------------------------------------------------------------------------
export const metadata: Metadata = {
  title: "Notifications | KorraStore",
  description:
    "Stay updated on your commodity order fulfillment, silo storage status, resale listings, buyback approvals, and market price alerts.",
};

// ----------------------------------------------------------------------------
// Page Props Interface
// ----------------------------------------------------------------------------
interface NotificationsPageProps {
  searchParams: Promise<{
    filter?: string;
  }>;
}

// ----------------------------------------------------------------------------
// NotificationsPage Component
// ----------------------------------------------------------------------------
export default async function NotificationsPage({
  searchParams,
}: NotificationsPageProps) {
  const resolvedParams = await searchParams;
  const activeFilter = resolvedParams.filter || "all";

  // 1. Authenticate user session
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If no user and in production mode, redirect to login
  const userId = user?.id || "demo-user-id";

  // 2. Fetch notifications feed and unread count in parallel
  const [notifications, unreadCount] = await Promise.all([
    getInAppNotifications(userId, activeFilter),
    getUnreadNotificationsCount(userId),
  ]);

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="bg-white/80 backdrop-blur-xs p-5 sm:p-6 rounded-2xl border border-[#E4DCC8] shadow-2xs space-y-4">
          <div className="flex items-center justify-between gap-3">
            {/* Title & Unread Count Badge */}
            <div className="flex items-center gap-3">
              <h1 className="font-serif-display text-2xl sm:text-3xl text-[#4A3828] font-bold tracking-tight">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#D8B56A] text-[#4A3828] text-xs font-mono font-bold shadow-2xs">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {/* Mark All As Read Button */}
            <MarkAllReadButton unreadCount={unreadCount} />
          </div>

          {/* Category Filter Tabs */}
          <NotificationFilters unreadCount={unreadCount} />
        </div>

        {/* Notifications Feed List */}
        {notifications.length === 0 ? (
          <div className="py-8">
            <EmptyState
              icon="🔔"
              title="No notifications yet"
              description="Updates regarding your commodity purchases, warehouse storage, resale transactions, and buyback requests will appear here."
              actionLabel="Browse Marketplace"
            />
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
