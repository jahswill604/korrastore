// Server-rendering regressions for PR #4's useSyncExternalStore mount/time snapshots.
// The server output must be deterministic so hydration starts from matching markup.

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdminPriceHistoryChart } from "@/components/admin/pricing/admin-price-history-chart";
import { PriceHistoryChart } from "@/components/commodity/price-history-chart";
import { ResaleCard } from "@/components/resale/resale-card";
import type { PriceHistoryPoint as AdminPriceHistoryPoint } from "@/lib/types/admin-pricing";
import type { PriceHistoryPoint } from "@/lib/types";
import type { PublicResaleListing } from "@/lib/supabase/queries/resale";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const buyerHistory: PriceHistoryPoint[] = [
  { date: "2026-09-01", formattedDate: "Sep 1", price: 1_000 },
  { date: "2026-09-02", formattedDate: "Sep 2", price: 1_100 },
];

const adminHistory: AdminPriceHistoryPoint[] = [
  {
    id: "price-1",
    commodity_id: "rice-1",
    grade_id: null,
    price: 1_000,
    change_reason: "Market update",
    recorded_at: "2026-09-01T00:00:00.000Z",
    formatted_date: "Sep 1",
  },
];

const listing: PublicResaleListing = {
  id: "listing-1",
  holdingId: "holding-1",
  commodityId: "rice-1",
  commodityName: "Premium Rice",
  commodityCode: "RICE-NG",
  commodityUnit: "kg",
  commodityImageUrl: null,
  gradeId: "grade-a",
  gradeCode: "A",
  gradeName: "Grade A",
  warehouseId: "warehouse-1",
  warehouseName: "Kano Silo",
  warehouseLocation: "Kano",
  quantity: 25,
  unitPrice: 1_000,
  totalListingPrice: 25_000,
  benchmarkMarketPrice: 1_100,
  priceDeltaPercentage: -9.1,
  sellerDisplayName: "KorraStore Seller #1234",
  status: "active",
  expiresAt: null,
  createdAt: "2026-09-01T00:00:00.000Z",
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("hydration-safe server snapshots", () => {
  it("renders the buyer chart placeholder on the server even when data exists", () => {
    const firstRender = renderToStaticMarkup(
      <PriceHistoryChart priceHistory={buyerHistory} commodityName="Rice" />
    );
    const secondRender = renderToStaticMarkup(
      <PriceHistoryChart priceHistory={buyerHistory} commodityName="Rice" />
    );

    expect(firstRender).toBe(secondRender);
    expect(firstRender).toContain("Loading interactive price history chart...");
    expect(firstRender).not.toContain("recharts-responsive-container");
  });

  it("renders the admin chart placeholder on the server even when data exists", () => {
    const markup = renderToStaticMarkup(
      <AdminPriceHistoryChart
        history={adminHistory}
        commodityName="Rice"
        unit="kg"
      />
    );

    expect(markup).toContain("Loading historical price chart...");
    expect(markup).not.toContain("recharts-responsive-container");
  });

  it("uses the stable resale-card server label without reading the wall clock", () => {
    vi.spyOn(Date, "now").mockImplementation(() => {
      throw new Error("Date.now must not run while producing server markup");
    });

    const markup = renderToStaticMarkup(<ResaleCard listing={listing} />);

    expect(markup).toContain("Recently listed");
    expect(markup).not.toContain("Listed today");
    expect(markup).not.toMatch(/Listed \d+d ago/);
  });

  it("keeps the resale-card server label stable for an invalid timestamp", () => {
    const markup = renderToStaticMarkup(
      <ResaleCard listing={{ ...listing, createdAt: "not-a-date" }} />
    );

    expect(markup).toContain("Recently listed");
  });
});
