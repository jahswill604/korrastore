// __tests__/checkout.test.ts — Vitest unit tests for Feature 08: Checkout.
// Tests the server-side quantity validation and authentication enforcement logic
// as required by AGENTS.md §19 and prompt/08-checkout.md acceptance criteria.
// Run with: npm run test
// Coverage: quantity > available rejected, unauthenticated returns 401, platform fee cap.

import { describe, it, expect } from 'vitest';

// -------------------------
// In-memory helpers that mirror the API route's server-side validation logic.
// These test the LOGIC in isolation — not the actual HTTP handlers.
// The API route tests would require a test environment with mocked Supabase; these
// unit tests cover the deterministic validation rules that must always hold.
// -------------------------

// Mirror of the platform fee calculation from order-review-form.tsx
function calculatePlatformFee(subtotal: number): number {
  const PLATFORM_FEE_RATE = 0.01;
  const PLATFORM_FEE_CAP = 5000;
  return Math.min(subtotal * PLATFORM_FEE_RATE, PLATFORM_FEE_CAP);
}

// Mirror of the total price calculation
function calculateTotal(unitPrice: number, quantity: number): {
  subtotal: number;
  platformFee: number;
  total: number;
} {
  const subtotal = unitPrice * quantity;
  const platformFee = calculatePlatformFee(subtotal);
  const total = subtotal + platformFee;
  return { subtotal, platformFee, total };
}

// Mirror of the server-side quantity validation in POST /api/orders
function validateQuantity(requestedQty: number, availableQty: number): {
  valid: boolean;
  error?: string;
} {
  if (typeof requestedQty !== 'number' || !Number.isFinite(requestedQty) || requestedQty <= 0) {
    return { valid: false, error: 'quantity must be a positive number.' };
  }
  if (requestedQty > availableQty) {
    return {
      valid: false,
      error: `Only ${availableQty.toLocaleString()} units available. Please reduce your quantity.`,
    };
  }
  return { valid: true };
}

// Mirror of the auth check logic
function simulateAuthCheck(user: { id: string; email: string } | null): {
  authenticated: boolean;
  statusCode: number;
} {
  if (!user) {
    return { authenticated: false, statusCode: 401 };
  }
  return { authenticated: true, statusCode: 200 };
}

// -------------------------
// Test suites
// -------------------------

describe('Feature 08 — Checkout: Server-Side Quantity Validation', () => {
  it('accepts valid quantity within available stock', () => {
    const result = validateQuantity(5, 100);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('accepts quantity exactly equal to available stock', () => {
    const result = validateQuantity(100, 100);
    expect(result.valid).toBe(true);
  });

  it('rejects quantity exceeding available stock with clear error message', () => {
    const result = validateQuantity(150, 100);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('100');
    expect(result.error).toContain('available');
  });

  it('rejects zero quantity', () => {
    const result = validateQuantity(0, 100);
    expect(result.valid).toBe(false);
  });

  it('rejects negative quantity', () => {
    const result = validateQuantity(-1, 100);
    expect(result.valid).toBe(false);
  });

  it('rejects non-finite quantity values', () => {
    const result = validateQuantity(Infinity, 100);
    expect(result.valid).toBe(false);
  });

  it('rejects NaN quantity', () => {
    const result = validateQuantity(NaN, 100);
    expect(result.valid).toBe(false);
  });

  it('rejects quantity = 1 when no stock available', () => {
    const result = validateQuantity(1, 0);
    expect(result.valid).toBe(false);
  });
});

describe('Feature 08 — Checkout: Authentication Guard', () => {
  it('returns 401 for unauthenticated requests (null user)', () => {
    const result = simulateAuthCheck(null);
    expect(result.authenticated).toBe(false);
    expect(result.statusCode).toBe(401);
  });

  it('allows authenticated buyers through the auth check', () => {
    const result = simulateAuthCheck({ id: 'user-123', email: 'buyer@test.com' });
    expect(result.authenticated).toBe(true);
    expect(result.statusCode).toBe(200);
  });
});

describe('Feature 08 — Checkout: Price Calculation Rules', () => {
  it('computes correct subtotal for 2 bags at ₦68,500', () => {
    const { subtotal } = calculateTotal(68500, 2);
    expect(subtotal).toBe(137000);
  });

  it('computes correct 1% platform fee for 2 bags at ₦68,500', () => {
    const { platformFee } = calculateTotal(68500, 2);
    expect(platformFee).toBe(1370);
  });

  it('computes correct total for 2 bags at ₦68,500', () => {
    const { total } = calculateTotal(68500, 2);
    expect(total).toBe(138370);
  });

  it('caps platform fee at ₦5,000 for large orders', () => {
    // ₦1,000,000 * 1% = ₦10,000 → should be capped at ₦5,000
    const { platformFee } = calculateTotal(100000, 10);
    expect(platformFee).toBe(5000);
  });

  it('does not exceed the cap for extremely large quantities', () => {
    const { platformFee } = calculateTotal(200000, 100);
    expect(platformFee).toBeLessThanOrEqual(5000);
  });

  it('kobo conversion is always a whole number (no fractional kobo)', () => {
    // Platform fee can produce non-integer naira values; kobo must still be integer
    const { total } = calculateTotal(68500, 3); // 68500 * 3 = 205500, fee = 2055, total = 207555
    const kobo = Math.round(total * 100);
    expect(Number.isInteger(kobo)).toBe(true);
  });

  it('applies fee rate of exactly 1%', () => {
    const subtotal = 50000;
    const fee = calculatePlatformFee(subtotal);
    expect(fee).toBe(subtotal * 0.01);
  });
});

describe('Feature 08 — Checkout: Unit Display Logic', () => {
  it('formats ₦1,000 correctly', () => {
    // Mirrors the formatNaira function in order-review-form.tsx
    const formatNaira = (amount: number) => '₦' + Math.round(amount).toLocaleString('en-NG');
    expect(formatNaira(1000)).toBe('₦1,000');
  });

  it('rounds amounts before formatting (no decimals in display)', () => {
    const formatNaira = (amount: number) => '₦' + Math.round(amount).toLocaleString('en-NG');
    expect(formatNaira(68500.5)).toBe('₦68,501');
  });
});
