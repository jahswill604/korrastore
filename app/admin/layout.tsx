// app/admin/layout.tsx — Admin Shell Layout & Server-Side Security Guard for KorraStore.
// Enforces server-side triple-layer role verification (Layer 2) and renders Admin Navigation Rail + Mobile Tab Bar.
// Used in: All /admin/* routes.
// Security Rule: Re-verifies getUser() and profiles.role === 'admin'. Non-admins are immediately bounced to /home.

import * as React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { AdminNavRail } from "@/components/admin/layout/admin-nav-rail";
import { AdminBottomTabBar } from "@/components/admin/layout/admin-bottom-tab-bar";
import { AdminHeader } from "@/components/admin/layout/admin-header";

export const metadata = {
  title: "Admin Operations | KorraStore",
  description: "Administrative control center and operational management hub for KorraStore commodity operations.",
};

// ----------------------------------------------------------------------------
// AdminLayout Component
// ----------------------------------------------------------------------------

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layer 2 Defense in Depth: Re-verify session and role on the server
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/admin");
  }

  if (!user.isAdmin) {
    // Non-admin sessions are bounced away to the buyer marketplace
    redirect("/");
  }

  return (
    <div className="min-h-screen flex bg-[#F7F4EA] text-[#4A3828] font-sans-inter">
      {/* Desktop Admin Sidebar */}
      <AdminNavRail
        adminEmail={user.email}
        adminName={user.fullName || "Administrator"}
      />

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 lg:pb-10">
        {/* Top Header */}
        <AdminHeader
          adminEmail={user.email}
          adminName={user.fullName || "Administrator"}
        />

        {/* Dynamic Admin Page Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Mobile Bottom Tab Navigation */}
        <AdminBottomTabBar />
      </div>
    </div>
  );
}
