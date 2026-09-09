// Regression tests for the PR's buy-only UI scope. These use the exported nav
// model and rendered action component rather than duplicating implementation.

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { NAV_ITEMS } from '@/components/layout/nav-rail';
import { HoldingActions } from '@/components/my-storage/holding-actions';

describe('buy-only MVP navigation', () => {
  it('does not expose resale or transfer destinations', () => {
    expect(NAV_ITEMS.map(item => item.href)).not.toContain('/resale');
    expect(NAV_ITEMS.map(item => item.href)).not.toContain('/transfers');
    expect(NAV_ITEMS.map(item => item.label)).not.toContain('Resale');
    expect(NAV_ITEMS.map(item => item.label)).not.toContain('Transfer');
  });

  it('retains the buyer destinations that remain in scope', () => {
    expect(NAV_ITEMS.map(item => item.href)).toEqual(expect.arrayContaining([
      '/', '/marketplace', '/my-storage', '/receipts', '/orders', '/notifications', '/profile',
    ]));
  });
});

describe('buy-only MVP holding actions', () => {
  it('renders delivery as the only holding action', () => {
    const markup = renderToStaticMarkup(React.createElement(HoldingActions, {
      holdingId: 'holding-1', availableQuantity: 10, commodityName: 'Premium Rice',
    }));

    expect(markup).toContain('Delivery');
    expect(markup).not.toContain('Resell');
    expect(markup).not.toContain('Buyback');
    expect((markup.match(/<button/g) ?? [])).toHaveLength(1);
  });

  it('marks delivery unavailable when no quantity remains', () => {
    const markup = renderToStaticMarkup(React.createElement(HoldingActions, {
      holdingId: 'holding-empty', availableQuantity: 0, commodityName: 'Brown Beans',
    }));

    expect(markup).toContain('aria-disabled="true"');
    expect(markup).toContain('title="No available quantity in Brown Beans"');
    expect(markup).toContain('pointer-events-none');
  });
});
