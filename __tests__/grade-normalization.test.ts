// __tests__/grade-normalization.test.ts — Unit coverage for shared commodity grade normalization.
// Ensures buyback display values always resolve to a supported GradeBadge value.

import { describe, expect, it } from "vitest";
import { normalizeCommodityGrade } from "@/components/ui/grade-badge";

describe("normalizeCommodityGrade", () => {
  it("maps the buyback Standard label to Grade B", () => {
    expect(normalizeCommodityGrade("Standard", "B")).toBe("Grade B");
  });

  it("uses a valid grade code when the name is unknown", () => {
    expect(normalizeCommodityGrade("Warehouse Select", "C")).toBe("Grade C");
  });

  it("preserves the Grade A fallback for unknown values", () => {
    expect(normalizeCommodityGrade("Warehouse Select", "unknown")).toBe("Grade A");
  });
});
