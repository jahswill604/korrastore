// Direct unit tests for the Paystack webhook route. External payment, ledger,
// notification, and database boundaries are mocked so each handler branch is
// exercised without making network calls or requiring Supabase.

import crypto from 'crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  allocatePurchaseToHolding: vi.fn(),
  createInAppNotification: vi.fn(),
  createServiceClient: vi.fn(),
  verify: vi.fn(),
}));

vi.mock('@/lib/supabase/service', () => ({ createServiceClient: mocks.createServiceClient }));
vi.mock('@/lib/domain/payments/paystack-adapter', () => ({ paystackAdapter: { verify: mocks.verify } }));
vi.mock('@/lib/domain/ledger/holdings-ledger', () => ({
  allocatePurchaseToHolding: mocks.allocatePurchaseToHolding,
}));
vi.mock('@/lib/supabase/queries/notifications', () => ({
  createInAppNotification: mocks.createInAppNotification,
}));

import { POST } from '@/app/api/webhooks/paystack/route';

type QueryResult = { data?: unknown; error?: unknown };

function query(result: QueryResult) {
  const builder: Record<string, ReturnType<typeof vi.fn>> & PromiseLike<QueryResult> = {
    eq: vi.fn(), maybeSingle: vi.fn(), select: vi.fn(), single: vi.fn(), then: vi.fn(),
  };
  builder.eq.mockReturnValue(builder);
  builder.select.mockReturnValue(builder);
  builder.maybeSingle.mockResolvedValue(result);
  builder.single.mockResolvedValue(result);
  builder.then.mockImplementation((resolve, reject) => Promise.resolve(result).then(resolve, reject));
  return builder;
}

interface WebhookDbOptions {
  inventory?: Array<{ warehouse_id: string; quantity: number | string; allocated_quantity: number | string }>;
  item?: Record<string, unknown> | null;
  order?: Record<string, unknown> | null;
  orderError?: Record<string, unknown> | null;
  paymentError?: Record<string, unknown> | null;
}

function createWebhookDb(options: WebhookDbOptions = {}) {
  const order = options.order === undefined
    ? { id: 'order-12345678', user_id: 'user-1', status: 'pending_payment', total_amount: '505.0000' }
    : options.order;
  const item = options.item === undefined
    ? { commodity_id: 'commodity-1', grade_id: 'grade-a', quantity: '5', unit_price: '100' }
    : options.item;
  const inventory = options.inventory ?? [
    { warehouse_id: 'warehouse-small', quantity: '7', allocated_quantity: '4' },
    { warehouse_id: 'warehouse-best', quantity: '10', allocated_quantity: '5' },
  ];
  const builders = {
    auditInsert: query({ error: null }),
    inventorySelect: query({ data: inventory, error: null }),
    itemSelect: query({ data: item, error: null }),
    orderSelect: query({ data: order, error: options.orderError ?? null }),
    orderUpdate: query({ error: null }),
    paymentInsert: query({ error: options.paymentError ?? null }),
    receiptInsert: query({ error: null }),
  };
  const tables = {
    audit_logs: { insert: vi.fn(() => builders.auditInsert) },
    inventory: { select: vi.fn(() => builders.inventorySelect) },
    order_items: { select: vi.fn(() => builders.itemSelect) },
    orders: { select: vi.fn(() => builders.orderSelect), update: vi.fn(() => builders.orderUpdate) },
    payments: { insert: vi.fn(() => builders.paymentInsert) },
    receipts: { insert: vi.fn(() => builders.receiptInsert) },
  };
  const db = { from: vi.fn((table: keyof typeof tables) => tables[table]) };
  return { db, tables };
}

const secret = 'sk_test_webhook_secret';

function signedRequest(payload: unknown, signatureSecret = secret): Request {
  const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const signature = crypto.createHmac('sha512', signatureSecret).update(body).digest('hex');
  return new Request('https://korrastore.test/api/webhooks/paystack', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-paystack-signature': signature },
    body,
  });
}

function successfulEvent(overrides: Record<string, unknown> = {}) {
  return {
    event: 'charge.success',
    data: { reference: 'order-12345678', status: 'success', amount: 1, ...overrides },
  };
}

async function responseBody(response: Response) {
  return response.json() as Promise<Record<string, unknown>>;
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.PAYSTACK_SECRET_KEY = secret;
  mocks.verify.mockResolvedValue({
    success: true, status: 'success', reference: 'order-12345678', amountKobo: 50_500,
    customerEmail: 'buyer@example.com',
  });
  mocks.allocatePurchaseToHolding.mockResolvedValue({ holdingId: 'holding-1' });
  mocks.createInAppNotification.mockResolvedValue(undefined);
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.PAYSTACK_SECRET_KEY;
});

describe('POST /api/webhooks/paystack — request authentication and filtering', () => {
  it('rejects a missing signature header', async () => {
    const response = await POST(new Request('https://korrastore.test/api/webhooks/paystack', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(successfulEvent()),
    }) as never);

    expect(response.status).toBe(401);
    expect(mocks.verify).not.toHaveBeenCalled();
    expect(mocks.createServiceClient).not.toHaveBeenCalled();
  });

  it('rejects an invalid signature before performing side effects', async () => {
    const response = await POST(signedRequest(successfulEvent(), 'wrong-secret') as never);

    expect(response.status).toBe(401);
    await expect(responseBody(response)).resolves.toEqual({ error: 'Invalid signature.' });
    expect(mocks.verify).not.toHaveBeenCalled();
    expect(mocks.createServiceClient).not.toHaveBeenCalled();
  });

  it.each([undefined, 'sk_test_placeholder'])('rejects an unconfigured secret (%s)', async configuredSecret => {
    if (configuredSecret === undefined) delete process.env.PAYSTACK_SECRET_KEY;
    else process.env.PAYSTACK_SECRET_KEY = configuredSecret;

    const response = await POST(signedRequest(successfulEvent()) as never);

    expect(response.status).toBe(401);
    expect(mocks.verify).not.toHaveBeenCalled();
  });

  it('returns 400 for malformed JSON with a valid raw-body signature', async () => {
    const response = await POST(signedRequest('{"event":') as never);

    expect(response.status).toBe(400);
    await expect(responseBody(response)).resolves.toEqual({ error: 'Invalid JSON body.' });
    expect(mocks.verify).not.toHaveBeenCalled();
  });

  it('acknowledges unrelated event types without verification or database access', async () => {
    const response = await POST(signedRequest({ event: 'transfer.success', data: {} }) as never);

    expect(response.status).toBe(200);
    await expect(responseBody(response)).resolves.toEqual({ received: true, ignored: 'transfer.success' });
    expect(mocks.verify).not.toHaveBeenCalled();
    expect(mocks.createServiceClient).not.toHaveBeenCalled();
  });

  it('rejects a charge event without a transaction reference', async () => {
    const response = await POST(signedRequest({ event: 'charge.success', data: {} }) as never);

    expect(response.status).toBe(400);
    await expect(responseBody(response)).resolves.toEqual({ error: 'Missing transaction reference.' });
    expect(mocks.verify).not.toHaveBeenCalled();
  });

  it('acknowledges a transaction that Paystack does not re-verify as successful', async () => {
    mocks.verify.mockResolvedValue({ success: false, status: 'failed', amountKobo: 50_500 });

    const response = await POST(signedRequest(successfulEvent()) as never);

    expect(response.status).toBe(200);
    await expect(responseBody(response)).resolves.toEqual({ received: true, verified: false });
    expect(mocks.verify).toHaveBeenCalledWith('order-12345678');
    expect(mocks.createServiceClient).not.toHaveBeenCalled();
  });
});

describe('POST /api/webhooks/paystack — payment idempotency and reconciliation', () => {
  it('acknowledges a verified transaction that has no matching order', async () => {
    const context = createWebhookDb({ order: null });
    mocks.createServiceClient.mockReturnValue(context.db);

    const response = await POST(signedRequest(successfulEvent()) as never);

    expect(response.status).toBe(200);
    await expect(responseBody(response)).resolves.toEqual({ received: true, matchedOrder: false });
    expect(context.tables.payments.insert).not.toHaveBeenCalled();
  });

  it('treats a duplicate payment reference as processed and skips downstream side effects', async () => {
    const context = createWebhookDb({ paymentError: { code: '23505', message: 'duplicate key' } });
    mocks.createServiceClient.mockReturnValue(context.db);

    const response = await POST(signedRequest(successfulEvent()) as never);

    expect(response.status).toBe(200);
    await expect(responseBody(response)).resolves.toEqual({ received: true, alreadyProcessed: true });
    expect(mocks.allocatePurchaseToHolding).not.toHaveBeenCalled();
    expect(context.tables.receipts.insert).not.toHaveBeenCalled();
    expect(mocks.createInAppNotification).not.toHaveBeenCalled();
  });

  it('returns 500 for a non-idempotency payment insert error', async () => {
    const context = createWebhookDb({ paymentError: { code: '42501', message: 'permission denied' } });
    mocks.createServiceClient.mockReturnValue(context.db);

    const response = await POST(signedRequest(successfulEvent()) as never);

    expect(response.status).toBe(500);
    await expect(responseBody(response)).resolves.toEqual({ error: 'Failed to record payment.' });
    expect(mocks.allocatePurchaseToHolding).not.toHaveBeenCalled();
  });

  it('records the independently verified amount rather than trusting the webhook amount', async () => {
    const context = createWebhookDb({
      order: { id: 'order-12345678', user_id: 'user-1', status: 'paid', total_amount: '505' },
    });
    mocks.createServiceClient.mockReturnValue(context.db);

    const response = await POST(signedRequest(successfulEvent({ amount: 999_999_999 })) as never);

    expect(response.status).toBe(200);
    expect(context.tables.payments.insert).toHaveBeenCalledWith(expect.objectContaining({
      amount: '505.0000', reference: 'order-12345678', status: 'success',
    }));
    expect(mocks.allocatePurchaseToHolding).not.toHaveBeenCalled();
    await expect(responseBody(response)).resolves.toEqual({ received: true, alreadyPaid: true });
  });

  it('flags insufficient inventory for reconciliation and does not create ownership', async () => {
    const context = createWebhookDb({
      inventory: [{ warehouse_id: 'warehouse-1', quantity: 10, allocated_quantity: 6 }],
    });
    mocks.createServiceClient.mockReturnValue(context.db);

    const response = await POST(signedRequest(successfulEvent()) as never);

    expect(response.status).toBe(200);
    await expect(responseBody(response)).resolves.toEqual({ received: true, allocationFailed: true });
    expect(context.tables.orders.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'failed' }));
    expect(context.tables.audit_logs.insert).toHaveBeenCalledWith(expect.objectContaining({
      action: 'ORDER_PAYMENT_INVENTORY_MISMATCH', entity_id: 'order-12345678',
    }));
    expect(mocks.allocatePurchaseToHolding).not.toHaveBeenCalled();
  });

  it('returns a reconciliation error when the paid order has no line item', async () => {
    const context = createWebhookDb({ item: null });
    mocks.createServiceClient.mockReturnValue(context.db);

    const response = await POST(signedRequest(successfulEvent()) as never);

    expect(response.status).toBe(500);
    expect(mocks.allocatePurchaseToHolding).not.toHaveBeenCalled();
    await expect(responseBody(response)).resolves.toEqual({
      error: 'Order has no line item — manual reconciliation required.',
    });
  });
});

describe('POST /api/webhooks/paystack — successful purchase allocation', () => {
  it('allocates from the warehouse with the most free stock and completes all buyer side effects', async () => {
    const context = createWebhookDb();
    mocks.createServiceClient.mockReturnValue(context.db);

    const response = await POST(signedRequest(successfulEvent()) as never);

    expect(response.status).toBe(200);
    await expect(responseBody(response)).resolves.toEqual({ received: true, processed: true });
    expect(mocks.allocatePurchaseToHolding).toHaveBeenCalledWith({
      orderId: 'order-12345678', userId: 'user-1', commodityId: 'commodity-1', gradeId: 'grade-a',
      warehouseId: 'warehouse-best', quantity: 5, unitPrice: 100,
    });
    expect(context.tables.orders.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'paid' }));
    expect(context.tables.receipts.insert).toHaveBeenCalledWith(expect.objectContaining({
      holding_id: 'holding-1', order_id: 'order-12345678',
      receipt_number: expect.stringMatching(/^RCPT-\d{8}-ORDER-12$/),
    }));
    expect(mocks.createInAppNotification).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'user-1', type: 'order_status',
      payload: { orderId: 'order-12345678', holdingId: 'holding-1' },
    }));
  });

  it('accepts the exact available-stock boundary', async () => {
    const context = createWebhookDb({
      inventory: [{ warehouse_id: 'warehouse-exact', quantity: 8, allocated_quantity: 3 }],
    });
    mocks.createServiceClient.mockReturnValue(context.db);

    const response = await POST(signedRequest(successfulEvent()) as never);

    expect(response.status).toBe(200);
    expect(mocks.allocatePurchaseToHolding).toHaveBeenCalledWith(expect.objectContaining({
      warehouseId: 'warehouse-exact', quantity: 5,
    }));
  });

  it('audits a ledger failure after payment capture and returns 500', async () => {
    const context = createWebhookDb();
    mocks.createServiceClient.mockReturnValue(context.db);
    mocks.allocatePurchaseToHolding.mockRejectedValue(new Error('movement insert failed'));

    const response = await POST(signedRequest(successfulEvent()) as never);

    expect(response.status).toBe(500);
    expect(context.tables.audit_logs.insert).toHaveBeenCalledWith(expect.objectContaining({
      action: 'ORDER_PAYMENT_LEDGER_FAILURE',
      new_data: { reference: 'order-12345678', error: 'movement insert failed' },
    }));
    expect(context.tables.receipts.insert).not.toHaveBeenCalled();
    expect(mocks.createInAppNotification).not.toHaveBeenCalled();
  });
});
