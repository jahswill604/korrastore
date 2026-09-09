// Direct tests for the revised POST /api/orders route. Authentication, catalog,
// persistence, and Paystack are mocked at their module boundaries.

import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(), createPendingOrder: vi.fn(), getCheckoutCommodity: vi.fn(),
  getUser: vi.fn(), initialize: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({ createClient: mocks.createClient }));
vi.mock('@/lib/supabase/queries/orders', () => ({
  createPendingOrder: mocks.createPendingOrder,
  getCheckoutCommodity: mocks.getCheckoutCommodity,
}));
vi.mock('@/lib/domain/payments/paystack-adapter', () => ({
  paystackAdapter: { initialize: mocks.initialize },
}));

import { POST } from '@/app/api/orders/route';

function orderRequest(body: unknown, origin = 'https://korrastore.test'): Request {
  const request = new Request(`${origin}/api/orders`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
  Object.defineProperty(request, 'nextUrl', { value: new URL(request.url) });
  return request;
}

async function responseBody(response: Response) {
  return response.json() as Promise<Record<string, unknown>>;
}

const validBody = { commodityId: 'commodity-1', gradeId: 'grade-a', quantity: 5 };
const checkoutData = {
  commodityId: 'commodity-1', commodityName: 'Premium Rice', gradeId: 'grade-a',
  gradeName: 'Grade A', gradeCode: 'A', unitPrice: 100, availableQuantity: 5,
  unit: 'bag', imageUrl: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getUser.mockResolvedValue({
    data: { user: { id: 'user-1', email: 'buyer@example.com' } }, error: null,
  });
  mocks.createClient.mockResolvedValue({ auth: { getUser: mocks.getUser } });
  mocks.getCheckoutCommodity.mockResolvedValue(checkoutData);
  mocks.createPendingOrder.mockResolvedValue({
    orderId: 'order-1', userId: 'user-1', totalPrice: 505, paystackReference: 'order-1',
  });
  mocks.initialize.mockResolvedValue({ authorizationUrl: 'https://paystack.test/checkout' });
});

describe('POST /api/orders — authentication and request validation', () => {
  it.each([
    { name: 'missing user', authResult: { data: { user: null }, error: null } },
    { name: 'auth error', authResult: { data: { user: null }, error: { message: 'expired session' } } },
  ])('returns 401 for an unauthenticated request with $name', async ({ authResult }) => {
    mocks.getUser.mockResolvedValue(authResult);

    const response = await POST(orderRequest(validBody) as never);

    expect(response.status).toBe(401);
    await expect(responseBody(response)).resolves.toEqual({
      error: 'You must be signed in to place an order.',
    });
    expect(mocks.getCheckoutCommodity).not.toHaveBeenCalled();
    expect(mocks.createPendingOrder).not.toHaveBeenCalled();
  });

  it('returns 400 for malformed JSON', async () => {
    const response = await POST(orderRequest('{"commodityId":') as never);

    expect(response.status).toBe(400);
    await expect(responseBody(response)).resolves.toEqual({
      error: 'Invalid request body. Expected JSON.',
    });
  });

  it.each([
    [{ gradeId: 'grade-a', quantity: 1 }, 'commodityId is required.'],
    [{ commodityId: 'commodity-1', quantity: 1 }, 'gradeId is required.'],
    [{ ...validBody, quantity: 0 }, 'quantity must be a positive number.'],
    [{ ...validBody, quantity: -1 }, 'quantity must be a positive number.'],
    [{ ...validBody, quantity: '5' }, 'quantity must be a positive number.'],
  ])('rejects invalid order fields %#', async (body, error) => {
    const response = await POST(orderRequest(body) as never);

    expect(response.status).toBe(400);
    await expect(responseBody(response)).resolves.toEqual({ error });
    expect(mocks.getCheckoutCommodity).not.toHaveBeenCalled();
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY])('rejects non-finite quantity %s', async quantity => {
    const request = {
      json: vi.fn().mockResolvedValue({ ...validBody, quantity }),
      nextUrl: new URL('https://korrastore.test/api/orders'),
    };

    const response = await POST(request as never);

    expect(response.status).toBe(400);
    await expect(responseBody(response)).resolves.toEqual({
      error: 'quantity must be a positive number.',
    });
    expect(mocks.getCheckoutCommodity).not.toHaveBeenCalled();
  });
});

describe('POST /api/orders — live catalog validation', () => {
  it('returns 404 when the live commodity/grade lookup has no match', async () => {
    mocks.getCheckoutCommodity.mockResolvedValue(null);

    const response = await POST(orderRequest(validBody) as never);

    expect(response.status).toBe(404);
    expect(mocks.getCheckoutCommodity).toHaveBeenCalledWith('commodity-1', 'grade-a');
    expect(mocks.createPendingOrder).not.toHaveBeenCalled();
  });

  it('returns live availability and 422 when requested quantity exceeds stock', async () => {
    mocks.getCheckoutCommodity.mockResolvedValue({ ...checkoutData, availableQuantity: 4 });

    const response = await POST(orderRequest(validBody) as never);

    expect(response.status).toBe(422);
    await expect(responseBody(response)).resolves.toEqual({
      error: 'Only 4 units available. Please reduce your quantity.', available: 4,
    });
    expect(mocks.createPendingOrder).not.toHaveBeenCalled();
    expect(mocks.initialize).not.toHaveBeenCalled();
  });

  it('accepts a quantity exactly equal to live available stock', async () => {
    const response = await POST(orderRequest(validBody) as never);

    expect(response.status).toBe(200);
    expect(mocks.createPendingOrder).toHaveBeenCalledWith(expect.objectContaining({ quantity: 5 }));
  });
});

describe('POST /api/orders — authenticated checkout initialization', () => {
  it('creates the order from live pricing and initializes Paystack with the authenticated buyer', async () => {
    const response = await POST(orderRequest(validBody) as never);

    expect(mocks.createPendingOrder).toHaveBeenCalledWith({
      userId: 'user-1', commodityId: 'commodity-1', gradeId: 'grade-a', quantity: 5, unitPrice: 100,
    });
    expect(mocks.initialize).toHaveBeenCalledWith({
      orderId: 'order-1', buyerEmail: 'buyer@example.com', amountKobo: 50_500, currency: 'NGN',
      commodityName: 'Premium Rice', gradeName: 'Grade A',
      callbackUrl: 'https://korrastore.test/orders/order-1?reference=order-1',
    });
    expect(response.status).toBe(200);
    await expect(responseBody(response)).resolves.toEqual({
      authorizationUrl: 'https://paystack.test/checkout', orderId: 'order-1',
    });
  });

  it('uses the server-side email fallback when the authenticated account has no email', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-1', email: null } }, error: null });

    await POST(orderRequest(validBody) as never);

    expect(mocks.initialize).toHaveBeenCalledWith(expect.objectContaining({
      buyerEmail: 'buyer@korrastore.com',
    }));
  });
});
