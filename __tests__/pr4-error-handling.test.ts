// Unit tests for PR #4's unknown-error narrowing in route and query boundaries.
// Non-Error thrown values must use deterministic fallbacks instead of property access.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
  getLiveBuybackPrice: vi.fn(),
  submitBuybackRequest: vi.fn(),
  markNotificationAsRead: vi.fn(),
  markAllNotificationsAsRead: vi.fn(),
  createServiceClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createServerClient }));
vi.mock("@/lib/supabase/service", () => ({ createServiceClient: mocks.createServiceClient }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/queries/buyback", () => ({
  getLiveBuybackPrice: mocks.getLiveBuybackPrice,
  submitBuybackRequest: mocks.submitBuybackRequest,
}));
vi.mock("@/lib/supabase/queries/notifications", () => ({
  markNotificationAsRead: mocks.markNotificationAsRead,
  markAllNotificationsAsRead: mocks.markAllNotificationsAsRead,
}));

import { GET as getBuybackPrice } from "@/app/api/buybacks/price/route";
import { POST as postBuyback } from "@/app/api/buybacks/route";
import { POST as markOneRead } from "@/app/api/notifications/[id]/read/route";
import { POST as markAllRead } from "@/app/api/notifications/read-all/route";
import {
  cancelResaleListing,
  createResaleListing,
  updateListingPrice,
} from "@/lib/supabase/queries/resale";

const authenticatedClient = {
  auth: {
    getUser: vi.fn().mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    }),
  },
};

async function responseBody(response: Response): Promise<Record<string, unknown>> {
  return response.json() as Promise<Record<string, unknown>>;
}

describe("PR #4 route error handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createServerClient.mockResolvedValue(authenticatedClient);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a successful live buyback price response", async () => {
    mocks.getLiveBuybackPrice.mockResolvedValue(900);

    const response = await getBuybackPrice(
      new Request("http://localhost/api/buybacks/price?commodityId=rice-1") as never
    );

    expect(response.status).toBe(200);
    await expect(responseBody(response)).resolves.toEqual({
      success: true,
      commodityId: "rice-1",
      buybackPrice: 900,
    });
  });

  it("rejects a missing commodity ID before querying", async () => {
    const response = await getBuybackPrice(
      new Request("http://localhost/api/buybacks/price") as never
    );

    expect(response.status).toBe(400);
    expect(mocks.getLiveBuybackPrice).not.toHaveBeenCalled();
  });

  it("preserves a caught Error message from the buyback-price query", async () => {
    mocks.getLiveBuybackPrice.mockRejectedValue(new Error("price lookup failed"));

    const response = await getBuybackPrice(
      new Request("http://localhost/api/buybacks/price?commodityId=rice-1") as never
    );

    expect(response.status).toBe(500);
    await expect(responseBody(response)).resolves.toEqual({ error: "price lookup failed" });
  });

  it("uses a generic buyback-price response for a non-Error rejection", async () => {
    mocks.getLiveBuybackPrice.mockRejectedValue({ message: "unsafe duck-typed message" });

    const response = await getBuybackPrice(
      new Request("http://localhost/api/buybacks/price?commodityId=rice-1") as never
    );

    expect(response.status).toBe(500);
    await expect(responseBody(response)).resolves.toEqual({ error: "Internal Server Error" });
  });

  it("uses the authenticated user when submitting a valid buyback", async () => {
    mocks.submitBuybackRequest.mockResolvedValue({
      success: true,
      requestId: "request-1",
      totalAmount: 1_800,
    });

    const response = await postBuyback(
      new Request("http://localhost/api/buybacks", {
        method: "POST",
        body: JSON.stringify({ holdingId: "holding-1", quantity: 2 }),
      }) as never
    );

    expect(response.status).toBe(200);
    expect(mocks.submitBuybackRequest).toHaveBeenCalledWith({
      userId: "user-1",
      holdingId: "holding-1",
      quantity: 2,
    });
  });

  it("returns a generic buyback-submission response for a thrown primitive", async () => {
    mocks.submitBuybackRequest.mockRejectedValue("database unavailable");

    const response = await postBuyback(
      new Request("http://localhost/api/buybacks", {
        method: "POST",
        body: JSON.stringify({ holdingId: "holding-1", quantity: 2 }),
      }) as never
    );

    expect(response.status).toBe(500);
    await expect(responseBody(response)).resolves.toEqual({ error: "Internal Server Error" });
  });

  it.each([
    ["single-notification handler", markOneRead, "Internal server error."],
    ["mark-all handler", markAllRead, "Internal server error."],
  ])("uses a generic response when the %s receives a non-Error auth failure", async (_name, handler, message) => {
    mocks.createServerClient.mockRejectedValue({ message: "do not expose me" });

    const response =
      handler === markOneRead
        ? await markOneRead(new Request("http://localhost") as never, {
            params: Promise.resolve({ id: "notification-1" }),
          })
        : await markAllRead(new Request("http://localhost") as never);

    expect(response.status).toBe(500);
    await expect(responseBody(response)).resolves.toEqual({ error: message });
  });
});

describe("PR #4 resale query error handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.createServiceClient.mockReturnValue({
      from: () => {
        throw "non-error database failure";
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses the create-listing fallback for a non-Error database failure", async () => {
    await expect(
      createResaleListing({
        userId: "user-1",
        holdingId: "holding-1",
        quantity: 5,
        unitPrice: 1_000,
      })
    ).resolves.toEqual({ success: false, error: "An unexpected error occurred." });
  });

  it("uses the update-price fallback for a non-Error database failure", async () => {
    await expect(updateListingPrice("user-1", "listing-1", 1_100)).resolves.toEqual({
      success: false,
      error: "An unexpected error occurred.",
    });
  });

  it("uses the cancellation fallback for a non-Error database failure", async () => {
    await expect(cancelResaleListing("user-1", "listing-1")).resolves.toEqual({
      success: false,
      error: "An unexpected error occurred.",
    });
  });

  it("preserves real Error messages while rejecting invalid prices early", async () => {
    mocks.createServiceClient.mockReturnValue({
      from: () => {
        throw new Error("resale database failed");
      },
    });

    await expect(updateListingPrice("user-1", "listing-1", 1_100)).resolves.toEqual({
      success: false,
      error: "resale database failed",
    });
    await expect(updateListingPrice("user-1", "listing-1", 0)).resolves.toEqual({
      success: false,
      error: "Price must be greater than zero.",
    });
  });
});
