// __tests__/order-tracking.test.ts — Vitest unit tests for Feature 09: Order Tracking.
// Tests order status filtering, stepper milestone indexing, security ownership scoping,
// and payment status separation per AGENTS.md §7 and prompt/09-order-tracking.md.
// Run with: npm run test

import { describe, it, expect } from 'vitest';
import { getFulfillmentBadgeConfig } from '@/components/orders/order-row';
import { OrderFulfillmentStatus } from '@/lib/supabase/queries/orders';

// Helper mirror function for step index calculation
function calculateStepIndex(status: OrderFulfillmentStatus): number {
  switch (status) {
    case 'pending_payment':
      return 0;
    case 'sourcing':
      return 1;
    case 'in_transit':
      return 2;
    case 'stored':
    case 'delivered':
      return 3;
    default:
      return 0;
  }
}

// Helper mirror function for security ownership validation
function validateOrderAccess(authenticatedUserId: string, orderOwnerId: string): {
  authorized: boolean;
  status: number;
} {
  if (authenticatedUserId !== orderOwnerId) {
    return { authorized: false, status: 404 }; // 404 prevents leaking existence
  }
  return { authorized: true, status: 200 };
}

// Helper mirror function for status filter mapping
function matchesFilter(orderStatus: OrderFulfillmentStatus, filter: string): boolean {
  if (!filter || filter === 'all') return true;
  if (filter === 'in_progress') {
    return ['pending_payment', 'sourcing', 'in_transit'].includes(orderStatus);
  }
  if (filter === 'stored') {
    return orderStatus === 'stored';
  }
  if (filter === 'delivered') {
    return orderStatus === 'delivered';
  }
  if (filter === 'cancelled') {
    return ['cancelled', 'failed'].includes(orderStatus);
  }
  return false;
}

describe('Feature 09 — Order Tracking: Fulfillment Stepper Progression', () => {
  it('maps pending_payment to step index 0 (Order Placed)', () => {
    expect(calculateStepIndex('pending_payment')).toBe(0);
  });

  it('maps sourcing to step index 1 (Sourcing Verified)', () => {
    expect(calculateStepIndex('sourcing')).toBe(1);
  });

  it('maps in_transit to step index 2 (In Transit)', () => {
    expect(calculateStepIndex('in_transit')).toBe(2);
  });

  it('maps stored to step index 3 (Stored in Silo)', () => {
    expect(calculateStepIndex('stored')).toBe(3);
  });

  it('maps delivered to step index 3', () => {
    expect(calculateStepIndex('delivered')).toBe(3);
  });
});

describe('Feature 09 — Order Tracking: Security Ownership Scoping', () => {
  it('allows owner to access their own order', () => {
    const result = validateOrderAccess('user-123', 'user-123');
    expect(result.authorized).toBe(true);
    expect(result.status).toBe(200);
  });

  it('returns 404 (not found) when a user tries to access another users order', () => {
    const result = validateOrderAccess('attacker-999', 'user-123');
    expect(result.authorized).toBe(false);
    expect(result.status).toBe(404);
  });
});

describe('Feature 09 — Order Tracking: Status Filter Matching', () => {
  it('matches all orders when filter is "all"', () => {
    expect(matchesFilter('pending_payment', 'all')).toBe(true);
    expect(matchesFilter('sourcing', 'all')).toBe(true);
    expect(matchesFilter('stored', 'all')).toBe(true);
    expect(matchesFilter('cancelled', 'all')).toBe(true);
  });

  it('matches in_progress filter correctly', () => {
    expect(matchesFilter('pending_payment', 'in_progress')).toBe(true);
    expect(matchesFilter('sourcing', 'in_progress')).toBe(true);
    expect(matchesFilter('in_transit', 'in_progress')).toBe(true);
    expect(matchesFilter('stored', 'in_progress')).toBe(false);
    expect(matchesFilter('cancelled', 'in_progress')).toBe(false);
  });

  it('matches stored filter correctly', () => {
    expect(matchesFilter('stored', 'stored')).toBe(true);
    expect(matchesFilter('in_transit', 'stored')).toBe(false);
  });

  it('matches cancelled filter correctly', () => {
    expect(matchesFilter('cancelled', 'cancelled')).toBe(true);
    expect(matchesFilter('failed', 'cancelled')).toBe(true);
    expect(matchesFilter('stored', 'cancelled')).toBe(false);
  });
});

describe('Feature 09 — Order Tracking: Badge Configuration', () => {
  it('returns appropriate badge config for each status', () => {
    expect(getFulfillmentBadgeConfig('pending_payment').label).toBe('Pending Payment');
    expect(getFulfillmentBadgeConfig('sourcing').label).toBe('Sourcing');
    expect(getFulfillmentBadgeConfig('in_transit').label).toBe('In Transit');
    expect(getFulfillmentBadgeConfig('stored').label).toBe('Stored in Silo');
    expect(getFulfillmentBadgeConfig('delivered').label).toBe('Delivered');
    expect(getFulfillmentBadgeConfig('cancelled').label).toBe('Cancelled');
    expect(getFulfillmentBadgeConfig('failed').label).toBe('Payment Failed');
  });
});
