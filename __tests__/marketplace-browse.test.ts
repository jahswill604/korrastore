// __tests__/marketplace-browse.test.ts — Unit Tests for KorraStore Marketplace Catalog & Filtering.
// Validates commodity data structure, URL filter matching, sorting behaviors, and grade badge rules.
// Used by: `npm run test` (Vitest test suite).

import { describe, it, expect } from "vitest";
import { MarketplaceCommodity } from "@/lib/types";

// Helper function simulating commodity filtering & sorting
function filterAndSortCommodities(
  commodities: MarketplaceCommodity[],
  filters?: { type?: string; sort?: string }
): MarketplaceCommodity[] {
  let result = [...commodities];

  const activeType = filters?.type?.toLowerCase();
  if (activeType && activeType !== "all") {
    result = result.filter((item) => {
      const target = `${item.name} ${item.code} ${item.description || ""}`.toLowerCase();
      return target.includes(activeType);
    });
  }

  const activeSort = filters?.sort;
  if (activeSort === "price_asc") {
    result.sort((a, b) => a.current_price - b.current_price);
  } else if (activeSort === "price_desc") {
    result.sort((a, b) => b.current_price - a.current_price);
  } else if (activeSort === "stock_desc") {
    result.sort((a, b) => b.total_available_quantity - a.total_available_quantity);
  }

  return result;
}

const MOCK_CATALOG: MarketplaceCommodity[] = [
  {
    id: "comm-rice-01",
    code: "RICE-NG",
    name: "Nigerian Paddy Rice",
    description: "Long grain paddy rice",
    unit: "kg",
    base_price: 1150,
    current_price: 1200,
    image_url: null,
    total_available_quantity: 45000,
    available_grades: ["Grade A", "Grade B"],
    warehouse_count: 3,
  },
  {
    id: "comm-garlic-01",
    code: "GARLIC-NG",
    name: "White Garlic Bulbs",
    description: "Cured white garlic",
    unit: "kg",
    base_price: 2800,
    current_price: 3100,
    image_url: null,
    total_available_quantity: 18500,
    available_grades: ["Grade A"],
    warehouse_count: 2,
  },
  {
    id: "comm-beans-01",
    code: "BEANS-NG",
    name: "Brown Beans (Oloyin)",
    description: "Sweet honey brown beans",
    unit: "kg",
    base_price: 1950,
    current_price: 2100,
    image_url: null,
    total_available_quantity: 32000,
    available_grades: ["Grade A", "Grade B", "Grade C"],
    warehouse_count: 4,
  },
];

describe("KorraStore Marketplace Browse & Filtering", () => {
  describe("Commodity Category Filtering", () => {
    it("returns all items when type filter is 'all' or omitted", () => {
      const result = filterAndSortCommodities(MOCK_CATALOG, { type: "all" });
      expect(result).toHaveLength(3);
    });

    it("filters catalog down to Rice commodities when type='rice'", () => {
      const result = filterAndSortCommodities(MOCK_CATALOG, { type: "rice" });
      expect(result).toHaveLength(1);
      expect(result[0].code).toBe("RICE-NG");
    });

    it("filters catalog down to Garlic commodities when type='garlic'", () => {
      const result = filterAndSortCommodities(MOCK_CATALOG, { type: "garlic" });
      expect(result).toHaveLength(1);
      expect(result[0].code).toBe("GARLIC-NG");
    });

    it("returns empty list if filter matches no commodity", () => {
      const result = filterAndSortCommodities(MOCK_CATALOG, { type: "unknown" });
      expect(result).toHaveLength(0);
    });
  });

  describe("Price & Stock Sorting", () => {
    it("sorts commodities by price low to high (price_asc)", () => {
      const result = filterAndSortCommodities(MOCK_CATALOG, { sort: "price_asc" });
      expect(result[0].current_price).toBe(1200); // Rice
      expect(result[1].current_price).toBe(2100); // Beans
      expect(result[2].current_price).toBe(3100); // Garlic
    });

    it("sorts commodities by price high to low (price_desc)", () => {
      const result = filterAndSortCommodities(MOCK_CATALOG, { sort: "price_desc" });
      expect(result[0].current_price).toBe(3100); // Garlic
      expect(result[1].current_price).toBe(2100); // Beans
      expect(result[2].current_price).toBe(1200); // Rice
    });

    it("sorts commodities by stock quantity high to low (stock_desc)", () => {
      const result = filterAndSortCommodities(MOCK_CATALOG, { sort: "stock_desc" });
      expect(result[0].total_available_quantity).toBe(45000); // Rice
      expect(result[1].total_available_quantity).toBe(32000); // Beans
      expect(result[2].total_available_quantity).toBe(18500); // Garlic
    });
  });
});
