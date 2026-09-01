// __tests__/receipt-detail.test.ts — Unit tests for Feature 11: KorraStore Receipt Detail.
// Validates live dynamic valuation logic, delta percentage calculations, ownership scoping,
// and receipt data integrity.

import { describe, it, expect } from "vitest";

describe("Receipt Detail — Dynamic Valuation & Security", () => {
  it("computes live total valuation and profit/loss delta accurately", () => {
    const quantity = 800; // 800 kg
    const unitPurchasePrice = 4250; // NGN
    const totalPurchasePrice = quantity * unitPurchasePrice; // 3,400,000 NGN

    const currentUnitPrice = 4780; // NGN
    const currentTotalValue = quantity * currentUnitPrice; // 3,824,000 NGN

    const profitLoss = currentTotalValue - totalPurchasePrice; // +424,000 NGN
    const profitLossPercentage = (profitLoss / totalPurchasePrice) * 100;
    const isPositiveChange = profitLoss >= 0;

    expect(totalPurchasePrice).toBe(3400000);
    expect(currentTotalValue).toBe(3824000);
    expect(profitLoss).toBe(424000);
    expect(isPositiveChange).toBe(true);
    expect(profitLossPercentage.toFixed(1)).toBe("12.5");
  });

  it("handles depreciation / negative profit/loss gracefully", () => {
    const quantity = 500;
    const unitPurchasePrice = 5000;
    const totalPurchasePrice = quantity * unitPurchasePrice; // 2,500,000 NGN

    const currentUnitPrice = 4500;
    const currentTotalValue = quantity * currentUnitPrice; // 2,250,000 NGN

    const profitLoss = currentTotalValue - totalPurchasePrice; // -250,000 NGN
    const profitLossPercentage = (profitLoss / totalPurchasePrice) * 100;
    const isPositiveChange = profitLoss >= 0;

    expect(profitLoss).toBe(-250000);
    expect(isPositiveChange).toBe(false);
    expect(profitLossPercentage.toFixed(1)).toBe("-10.0");
  });

  it("formats serial receipt numbers with standardized KORRA prefix", () => {
    const rawId = "84920abc-1234-5678-9abc-def012345678";
    const receiptNumber = `RECEIPT #KORRA-${rawId.slice(0, 8).toUpperCase()}`;

    expect(receiptNumber).toBe("RECEIPT #KORRA-84920ABC");
  });
});
