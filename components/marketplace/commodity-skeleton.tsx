// components/marketplace/commodity-skeleton.tsx — Skeleton Loader Grid for KorraStore Marketplace.
// Displays placeholder loading cards matching the real CommodityCard dimensions during server-side data loading.
// Used in: app/home/loading.tsx and marketplace browse fallback views.

import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

// ----------------------------------------------------------------------------
// CommodityCardSkeleton — individual skeleton item matching CommodityCard layout.
// ----------------------------------------------------------------------------
export function CommodityCardSkeleton() {
  return (
    <Card className="flex flex-col justify-between overflow-hidden border border-[var(--border)] bg-[var(--paper)]">
      <div>
        {/* Photo Placeholder */}
        <Skeleton className="h-44 w-full rounded-none" />

        {/* Header Placeholder */}
        <CardHeader className="p-4 pb-2 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>

        {/* Content Placeholder */}
        <CardContent className="p-4 pt-1 space-y-3">
          <Skeleton className="h-16 w-full rounded-lg" />
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
          </div>
        </CardContent>
      </div>

      {/* Footer Button Placeholder */}
      <CardFooter className="p-4 pt-0">
        <Skeleton className="h-10 w-full rounded-lg" />
      </CardFooter>
    </Card>
  );
}

// ----------------------------------------------------------------------------
// CommoditySkeletonGrid — renders a 4-card skeleton grid.
// ----------------------------------------------------------------------------
export function CommoditySkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CommodityCardSkeleton key={i} />
      ))}
    </div>
  );
}
