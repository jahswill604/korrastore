// __tests__/orders-route.test.ts — Unit tests for authenticated order creation.
// The route is exercised directly with Supabase, catalog, and Paystack mocked.

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  getUser: vi.fn(),
  getCheckoutCommodity: vi.fn(),
  createPendingOrder: vi.fn(),
  initialize: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({ createClient: mocks.createClient }));
vi.mock('@/lib/supabase/queries/orders', () => ({
  getCheckoutCommodity: mocks.getCheckoutCommodity,
  createPendingOrder: mocks.createPendingOrder,
}));
vi.mock('@/lib/domain/payments/paystack-adapter', () => ({
  paystackAdapter: { initialize: mocks.initialize },
}));

import { POST } from '@/app/api/orders/route';

function orderRequest(body: unknown, raw = false) {
  return new NextRequest('https://shop.korrastore.test/api/orders', {
    method: 'POST',
    body: raw ? String(body) : JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

async function bodyOf(response: Response) {
  return response.json() as Promise<Record<string, unknown>>;
}

describe('POST /api/orders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createClient.mockResolvedValue({ auth: { getUser: mocks.getUser } });
    mocks.getUser.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'buyer@example.com' } },
      error: null,
    });
    mocks.getCheckoutCommodity.mockResolvedValue({
      commodityId: 'commodity-1',
      commodityName: 'Premium Rice',
      gradeId: 'grade-a',
      gradeName: 'Grade A',
      gradeCode: 'A',
      unitPrice: 62_500,
      availableQuantity: 10,
      unit: 'bag',
      imageUrl: null,
    });
    mocks.createPendingOrder.mockResolvedValue({
      orderId: 'order-1',
      userId: 'user-1',
      totalPrice: 126_250.005,
      paystackReference: 'order-1',
    });
    mocks.initialize.mockResolvedValue({
      authorizationUrl: 'https://checkout.paystack.test/order-1',
      paystackReference: 'order-1',
      accessCode: 'access-1',
    });
  });

  it.each([
    ['an authentication error', { data: { user: null }, error: { message: 'expired session' } }],
    ['no authenticated user', { data: { user: null }, error: null }],
  ])('returns 401 for %s before reading or processing an order', async (_label, authResult) => {
    mocks.getUser.mockResolvedValue(authResult);
    const request = orderRequest({ commodityId: 'commodity-1', gradeId: 'grade-a', quantity: 2 });
    const jsonSpy = vi.spyOn(request, 'json');

    const response = await POST(request);

    expect(response.status).toBe(401);
    expect(await bodyOf(response)).toEqual({ error: 'You must be signed in to place an order.' });
    expect(jsonSpy).not.toHaveBeenCalled();
    expect(mocks.getCheckoutCommodity).not.toHaveBeenCalled();
    expect(mocks.initialize).not.toHaveBeenCalled();
  });

  it('returns 400 for malformed JSON', async () => {
    const response = await POST(orderRequest('{not-json', true));

    expect(response.status).toBe(400);
    expect(await bodyOf(response)).toEqual({ error: 'Invalid request body. Expected JSON.' });
    expect(mocks.getCheckoutCommodity).not.toHaveBeenCalled();
  });

  it.each([
    ['missing commodityId', { gradeId: 'grade-a', quantity: 1 }, 'commodityId is required.'],
    ['non-string commodityId', { commodityId: 42, gradeId: 'grade-a', quantity: 1 }, 'commodityId is required.'],
    ['missing gradeId', { commodityId: 'commodity-1', quantity: 1 }, 'gradeId is required.'],
    ['non-string gradeId', { commodityId: 'commodity-1', gradeId: 42, quantity: 1 }, 'gradeId is required.'],
    ['missing quantity', { commodityId: 'commodity-1', gradeId: 'grade-a' }, 'quantity must be a positive number.'],
    ['zero quantity', { commodityId: 'commodity-1', gradeId: 'grade-a', quantity: 0 }, 'quantity must be a positive number.'],
    ['negative quantity', { commodityId: 'commodity-1', gradeId: 'grade-a', quantity: -1 }, 'quantity must be a positive number.'],
    ['non-number quantity', { commodityId: 'commodity-1', gradeId: 'grade-a', quantity: '2' }, 'quantity must be a positive number.'],
  ])('returns 400 for %s', async (_label, requestBody, error) => {
    const response = await POST(orderRequest(requestBody));

    expect(response.status).toBe(400);
    expect(await bodyOf(response)).toEqual({ error });
    expect(mocks.getCheckoutCommodity).not.toHaveBeenCalled();
    expect(mocks.createPendingOrder).not.toHaveBeenCalled();
  });

  it('returns 404 when the live checkout lookup has no matching commodity and grade', async () => {
    mocks.getCheckoutCommodity.mockResolvedValue(null);

    const response = await POST(
      orderRequest({ commodityId: 'unknown', gradeId: 'unknown-grade', quantity: 1 })
    );

    expect(response.status).toBe(404);
    expect(await bodyOf(response)).toEqual({ error: 'Commodity or grade not found.' });
    expect(mocks.getCheckoutCommodity).toHaveBeenCalledWith('unknown', 'unknown-grade');
    expect(mocks.createPendingOrder).not.toHaveBeenCalled();
    expect(mocks.initialize).not.toHaveBeenCalled();
  });

  it('rejects quantity above live availability without creating or initializing payment', async () => {
    const response = await POST(
      orderRequest({ commodityId: 'commodity-1', gradeId: 'grade-a', quantity: 11 })
    );

    expect(response.status).toBe(422);
    expect(await bodyOf(response)).toEqual({
      error: 'Only 10 units available. Please reduce your quantity.',
      available: 10,
    });
    expect(mocks.createPendingOrder).not.toHaveBeenCalled();
    expect(mocks.initialize).not.toHaveBeenCalled();
  });

  it('accepts the exact stock boundary and initializes Paystack from trusted server data', async () => {
    const response = await POST(
      orderRequest({ commodityId: 'commodity-1', gradeId: 'grade-a', quantity: 10 })
    );

    expect(response.status).toBe(200);
    expect(await bodyOf(response)).toEqual({
      authorizationUrl: 'https://checkout.paystack.test/order-1',
      orderId: 'order-1',
    });
    expect(mocks.createPendingOrder).toHaveBeenCalledWith({
      userId: 'user-1',
      commodityId: 'commodity-1',
      gradeId: 'grade-a',
      quantity: 10,
      unitPrice: 62_500,
    });
    expect(mocks.initialize).toHaveBeenCalledWith({
      orderId: 'order-1',
      buyerEmail: 'buyer@example.com',
      amountKobo: 12_625_001,
      currency: 'NGN',
      commodityName: 'Premium Rice',
      gradeName: 'Grade A',
      callbackUrl: 'https://shop.korrastore.test/orders/order-1?reference=order-1',
    });
  });

  it('uses the route fallback email when the authenticated account has no email', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-1', email: null } }, error: null });

    const response = await POST(
      orderRequest({ commodityId: 'commodity-1', gradeId: 'grade-a', quantity: 1 })
    );

    expect(response.status).toBe(200);
    expect(mocks.initialize).toHaveBeenCalledWith(
      expect.objectContaining({ buyerEmail: 'buyer@korrastore.com' })
    );
  });
});
