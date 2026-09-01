// app/home/loading.tsx — Loading State UI Fallback for Marketplace Dashboard.
// Next.js App Router loading boundary displaying skeleton loader shapes during server-side fetches.
// Used in: Protected buyer route /home.

import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { CommoditySkeletonGrid } from "@/components/marketplace/commodity-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>

        {/* Filter Bar Skeleton */}
        <Skeleton className="h-16 w-full rounded-xl" />

        {/* Grid Skeleton */}
        <CommoditySkeletonGrid count={4} />
      </div>
    </AppShell>
  );
}
