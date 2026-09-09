// __tests__/buy-only-ui.test.tsx — Regression tests for the buy-only MVP surface.

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { NAV_ITEMS } from '@/components/layout/nav-rail';
import { HoldingActions } from '@/components/my-storage/holding-actions';
import { HoldingCard } from '@/components/my-storage/holding-card';
import type { HoldingWithCurrentValue } from '@/lib/supabase/queries/holdings';

describe('buy-only navigation', () => {
  it('keeps the supported destinations in their intended order', () => {
    expect(NAV_ITEMS.map(({ label, href }) => ({ label, href }))).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Store', href: '/marketplace' },
      { label: 'Storage', href: '/my-storage' },
      { label: 'Receipts', href: '/receipts' },
      { label: 'Orders', href: '/orders' },
      { label: 'Notifications', href: '/notifications' },
      { label: 'Profile', href: '/profile' },
    ]);
  });

  it('does not expose resale or transfer destinations', () => {
    const labels = NAV_ITEMS.map((item) => item.label.toLowerCase());
    const hrefs = NAV_ITEMS.map((item) => item.href);

    expect(labels).not.toContain('resale');
    expect(labels).not.toContain('transfer');
    expect(hrefs).not.toContain('/resale');
    expect(hrefs).not.toContain('/transfer');
  });
});

describe('buy-only holding actions', () => {
  function renderActions(availableQuantity: number) {
    return renderToStaticMarkup(
      <HoldingActions
        holdingId="holding-42"
        availableQuantity={availableQuantity}
        commodityName="Premium Rice"
      />
    );
  }

  it('renders delivery as the only holding action', () => {
    const markup = renderActions(5);

    expect(markup).toContain('id="delivery-btn-holding-42"');
    expect(markup).toContain('Request delivery for Premium Rice');
    expect(markup).toContain('>Delivery</button>');
    expect(markup).not.toContain('Resell');
    expect(markup).not.toContain('Buyback');
  });

  it('marks delivery available when quantity is positive', () => {
    const markup = renderActions(0.001);

    expect(markup).toContain('aria-disabled="false"');
    expect(markup).not.toContain('pointer-events-none');
    expect(markup).not.toContain('No available quantity');
  });

  it.each([0, -1])('marks delivery unavailable at the non-positive boundary (%s)', (quantity) => {
    const markup = renderActions(quantity);

    expect(markup).toContain('aria-disabled="true"');
    expect(markup).toContain('title="No available quantity in Premium Rice"');
    expect(markup).toContain('pointer-events-none');
  });

  it('keeps resale and buyback absent when actions are composed by a full holding card', () => {
    const holding: HoldingWithCurrentValue = {
      id: 'holding-42',
      userId: 'user-1',
      commodityId: 'commodity-1',
      commodityName: 'Premium Rice',
      commodityCode: 'RICE',
      commodityUnit: 'bag',
      commodityImageUrl: null,
      gradeId: 'grade-a',
      gradeCode: 'A',
      gradeName: 'Grade A',
      warehouseId: 'warehouse-1',
      warehouseName: 'Central Silo',
      warehouseLocation: 'Kano',
      quantity: 5,
      reservedQuantity: 0,
      availableQuantity: 5,
      unitPurchasePrice: 60_000,
      totalCostBasis: 300_000,
      currentUnitPrice: 62_500,
      currentTotalValue: 312_500,
      profitLoss: 12_500,
      profitLossPercentage: 4.1667,
      purchasedAt: '2026-09-09T12:00:00.000Z',
      status: 'stored',
    };

    const markup = renderToStaticMarkup(<HoldingCard holding={holding} />);

    expect(markup).toContain('id="delivery-btn-holding-42"');
    expect(markup).not.toContain('Resell');
    expect(markup).not.toContain('Buyback');
  });
});
