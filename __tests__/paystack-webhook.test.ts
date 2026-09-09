// __tests__/paystack-webhook.test.ts — Handler-level tests for Paystack fulfillment.
// External payment, ledger, notification, and Supabase boundaries are mocked.

import crypto from 'crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { createMockSupabase, MockSupabaseResults } from './test-utils/mock-supabase';

const mocks = vi.hoisted(() => ({
  createServiceClient: vi.fn(),
  verify: vi.fn(),
  allocatePurchaseToHolding: vi.fn(),
  createInAppNotification: vi.fn(),
}));

vi.mock('@/lib/supabase/service', () => ({ createServiceClient: mocks.createServiceClient }));
vi.mock('@/lib/domain/payments/paystack-adapter', () => ({
  paystackAdapter: { verify: mocks.verify },
}));
vi.mock('@/lib/domain/ledger/holdings-ledger', () => ({
  allocatePurchaseToHolding: mocks.allocatePurchaseToHolding,
}));
vi.mock('@/lib/supabase/queries/notifications', () => ({
  createInAppNotification: mocks.createInAppNotification,
}));

import { POST } from '@/app/api/webhooks/paystack/route';

const SECRET = 'sk_test_real_secret_key';
const ORDER_ID = '12345678-1234-1234-1234-123456789012';

function webhookBody(overrides: Record<string, unknown> = {}) {
  return JSON.stringify({
    event: 'charge.success',
    data: { reference: ORDER_ID, status: 'success', amount: 12_500_000 },
    ...overrides,
  });
}

function signatureFor(rawBody: string, secret = SECRET) {
  return crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
}

function requestFor(rawBody: string, signature: string | null = signatureFor(rawBody)) {
  const headers = new Headers({ 'content-type': 'application/json' });
  if (signature !== null) headers.set('x-paystack-signature', signature);
  return new NextRequest('http://localhost/api/webhooks/paystack', {
    method: 'POST',
    body: rawBody,
    headers,
  });
}

async function responseBody(response: Response) {
  return response.json() as Promise<Record<string, unknown>>;
}

function successfulDatabase(overrides: MockSupabaseResults = {}) {
  return createMockSupabase({
    'orders.select.maybeSingle': {
      data: { id: ORDER_ID, user_id: 'user-1', status: 'pending_payment', total_amount: '125000.0000' },
      error: null,
    },
    'payments.insert.then': { error: null },
    'order_items.select.single': {
      data: { commodity_id: 'commodity-1', grade_id: 'grade-a', quantity: '2', unit_price: '62500' },
      error: null,
    },
    'inventory.select.then': {
      data: [
        { warehouse_id: 'warehouse-low', quantity: '8', allocated_quantity: '7' },
        { warehouse_id: 'warehouse-best', quantity: '20', allocated_quantity: '3' },
      ],
      error: null,
    },
    'orders.update.then': { error: null },
    'receipts.insert.then': { error: null },
    'audit_logs.insert.then': { error: null },
    ...overrides,
  });
}

describe('POST /api/webhooks/paystack', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-09T12:00:00.000Z'));
    process.env.PAYSTACK_SECRET_KEY = SECRET;
    mocks.verify.mockResolvedValue({
      success: true,
      reference: ORDER_ID,
      amountKobo: 12_500_000,
      status: 'success',
      customerEmail: 'buyer@example.com',
    });
    mocks.allocatePurchaseToHolding.mockResolvedValue({ holdingId: 'holding-1' });
    mocks.createInAppNotification.mockResolvedValue(undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    delete process.env.PAYSTACK_SECRET_KEY;
  });

  describe('request authentication and parsing', () => {
    it.each([
      ['missing secret', undefined],
      ['placeholder secret', 'sk_test_placeholder'],
    ])('rejects a valid-looking signature when the %s is configured', async (_label, secret) => {
      if (secret === undefined) delete process.env.PAYSTACK_SECRET_KEY;
      else process.env.PAYSTACK_SECRET_KEY = secret;
      const rawBody = webhookBody();

      const response = await POST(requestFor(rawBody, signatureFor(rawBody, secret ?? SECRET)));

      expect(response.status).toBe(401);
      expect(await responseBody(response)).toEqual({ error: 'Invalid signature.' });
      expect(mocks.verify).not.toHaveBeenCalled();
      expect(mocks.createServiceClient).not.toHaveBeenCalled();
    });

    it.each([
      ['missing header', null],
      ['wrong secret', signatureFor(webhookBody(), 'wrong-secret')],
      ['wrong length', 'not-a-sha512-digest'],
    ])('rejects a request with a %s', async (_label, signature) => {
      const response = await POST(requestFor(webhookBody(), signature));

      expect(response.status).toBe(401);
      expect(mocks.verify).not.toHaveBeenCalled();
    });

    it('rejects body tampering after the signature was generated', async () => {
      const original = webhookBody();
      const tampered = webhookBody({ data: { reference: 'attacker-order' } });

      const response = await POST(requestFor(tampered, signatureFor(original)));

      expect(response.status).toBe(401);
      expect(mocks.verify).not.toHaveBeenCalled();
    });

    it('returns 400 for malformed JSON only after its raw signature is accepted', async () => {
      const rawBody = '{invalid-json';

      const response = await POST(requestFor(rawBody));

      expect(response.status).toBe(400);
      expect(await responseBody(response)).toEqual({ error: 'Invalid JSON body.' });
      expect(mocks.verify).not.toHaveBeenCalled();
    });

    it('acknowledges unrelated Paystack events without verification or database work', async () => {
      const rawBody = webhookBody({ event: 'transfer.success' });

      const response = await POST(requestFor(rawBody));

      expect(response.status).toBe(200);
      expect(await responseBody(response)).toEqual({ received: true, ignored: 'transfer.success' });
      expect(mocks.verify).not.toHaveBeenCalled();
      expect(mocks.createServiceClient).not.toHaveBeenCalled();
    });

    it('rejects charge events without a transaction reference', async () => {
      const rawBody = webhookBody({ data: { status: 'success', amount: 100 } });

      const response = await POST(requestFor(rawBody));

      expect(response.status).toBe(400);
      expect(await responseBody(response)).toEqual({ error: 'Missing transaction reference.' });
      expect(mocks.verify).not.toHaveBeenCalled();
    });
  });

  describe('server-side verification and idempotency', () => {
    it.each([
      [{ success: false, status: 'failed' }],
      [{ success: true, status: 'abandoned' }],
    ])('acknowledges but does not fulfill a transaction Paystack does not verify', async (verification) => {
      mocks.verify.mockResolvedValue({
        reference: ORDER_ID,
        amountKobo: 12_500_000,
        customerEmail: 'buyer@example.com',
        ...verification,
      });

      const response = await POST(requestFor(webhookBody()));

      expect(response.status).toBe(200);
      expect(await responseBody(response)).toEqual({ received: true, verified: false });
      expect(mocks.verify).toHaveBeenCalledWith(ORDER_ID);
      expect(mocks.createServiceClient).not.toHaveBeenCalled();
    });

    it('acknowledges a verified transaction whose order cannot be found', async () => {
      const db = successfulDatabase({
        'orders.select.maybeSingle': { data: null, error: { message: 'not found' } },
      });
      mocks.createServiceClient.mockReturnValue(db.client);

      const response = await POST(requestFor(webhookBody()));

      expect(response.status).toBe(200);
      expect(await responseBody(response)).toEqual({ received: true, matchedOrder: false });
      expect(db.operation('payments', 'insert')).toBeUndefined();
    });

    it('treats a payment reference unique violation as an idempotent replay', async () => {
      const db = successfulDatabase({
        'payments.insert.then': { error: { code: '23505', message: 'duplicate reference' } },
      });
      mocks.createServiceClient.mockReturnValue(db.client);

      const response = await POST(requestFor(webhookBody()));

      expect(response.status).toBe(200);
      expect(await responseBody(response)).toEqual({ received: true, alreadyProcessed: true });
      expect(mocks.allocatePurchaseToHolding).not.toHaveBeenCalled();
      expect(db.operation('order_items', 'select')).toBeUndefined();
    });

    it('returns 500 for non-idempotency payment insert failures', async () => {
      const db = successfulDatabase({
        'payments.insert.then': { error: { code: '42501', message: 'permission denied' } },
      });
      mocks.createServiceClient.mockReturnValue(db.client);

      const response = await POST(requestFor(webhookBody()));

      expect(response.status).toBe(500);
      expect(await responseBody(response)).toEqual({ error: 'Failed to record payment.' });
      expect(mocks.allocatePurchaseToHolding).not.toHaveBeenCalled();
    });

    it('does not allocate an order already beyond pending_payment', async () => {
      const db = successfulDatabase({
        'orders.select.maybeSingle': {
          data: { id: ORDER_ID, user_id: 'user-1', status: 'paid', total_amount: '125000.0000' },
          error: null,
        },
      });
      mocks.createServiceClient.mockReturnValue(db.client);

      const response = await POST(requestFor(webhookBody()));

      expect(response.status).toBe(200);
      expect(await responseBody(response)).toEqual({ received: true, alreadyPaid: true });
      expect(mocks.allocatePurchaseToHolding).not.toHaveBeenCalled();
    });
  });

  describe('fulfillment', () => {
    it('returns a reconciliation error when the paid order has no line item', async () => {
      const db = successfulDatabase({
        'order_items.select.single': { data: null, error: { message: 'missing item' } },
      });
      mocks.createServiceClient.mockReturnValue(db.client);

      const response = await POST(requestFor(webhookBody()));

      expect(response.status).toBe(500);
      expect(await responseBody(response)).toEqual({
        error: 'Order has no line item — manual reconciliation required.',
      });
      expect(mocks.allocatePurchaseToHolding).not.toHaveBeenCalled();
    });

    it('flags insufficient free inventory and records an audit entry without allocating', async () => {
      const db = successfulDatabase({
        'inventory.select.then': {
          data: [{ warehouse_id: 'warehouse-1', quantity: '10', allocated_quantity: '9' }],
          error: null,
        },
      });
      mocks.createServiceClient.mockReturnValue(db.client);

      const response = await POST(requestFor(webhookBody()));

      expect(response.status).toBe(200);
      expect(await responseBody(response)).toEqual({ received: true, allocationFailed: true });
      expect(mocks.allocatePurchaseToHolding).not.toHaveBeenCalled();
      expect(db.operation('orders', 'update')?.payload).toMatchObject({ status: 'failed' });
      expect(db.operation('audit_logs', 'insert')?.payload).toMatchObject({
        action: 'ORDER_PAYMENT_INVENTORY_MISMATCH',
        entity_id: ORDER_ID,
      });
    });

    it('also flags allocation when no warehouse inventory rows exist', async () => {
      const db = successfulDatabase({ 'inventory.select.then': { data: null, error: null } });
      mocks.createServiceClient.mockReturnValue(db.client);

      const response = await POST(requestFor(webhookBody()));

      expect(response.status).toBe(200);
      expect(await responseBody(response)).toEqual({ received: true, allocationFailed: true });
      expect(mocks.allocatePurchaseToHolding).not.toHaveBeenCalled();
    });

    it('fulfills through the warehouse with the most unallocated stock', async () => {
      const db = successfulDatabase();
      mocks.createServiceClient.mockReturnValue(db.client);

      const response = await POST(requestFor(webhookBody()));

      expect(response.status).toBe(200);
      expect(await responseBody(response)).toEqual({ received: true, processed: true });
      expect(mocks.allocatePurchaseToHolding).toHaveBeenCalledWith({
        orderId: ORDER_ID,
        userId: 'user-1',
        commodityId: 'commodity-1',
        gradeId: 'grade-a',
        warehouseId: 'warehouse-best',
        quantity: 2,
        unitPrice: 62500,
      });
      expect(db.operation('payments', 'insert')?.payload).toMatchObject({
        order_id: ORDER_ID,
        reference: ORDER_ID,
        amount: '125000.0000',
        status: 'success',
        channel: 'paystack',
      });
      expect(db.operation('orders', 'update')?.payload).toMatchObject({ status: 'paid' });
      expect(db.operation('receipts', 'insert')?.payload).toEqual({
        holding_id: 'holding-1',
        order_id: ORDER_ID,
        user_id: 'user-1',
        receipt_number: 'RCPT-20260909-12345678',
        metadata: {
          quantity: '2',
          unitPrice: '62500',
          totalAmount: '125000.0000',
          commodityId: 'commodity-1',
          gradeId: 'grade-a',
        },
      });
      expect(mocks.createInAppNotification).toHaveBeenCalledWith({
        userId: 'user-1',
        type: 'order_status',
        title: 'Payment confirmed',
        body: expect.stringContaining('#12345678'),
        payload: { orderId: ORDER_ID, holdingId: 'holding-1' },
      });
    });

    it('records a ledger reconciliation audit when allocation throws', async () => {
      const db = successfulDatabase();
      mocks.createServiceClient.mockReturnValue(db.client);
      mocks.allocatePurchaseToHolding.mockRejectedValue(new Error('inventory movement failed'));

      const response = await POST(requestFor(webhookBody()));

      expect(response.status).toBe(500);
      expect(await responseBody(response)).toEqual({
        error: 'Payment captured but allocation failed — flagged for manual review.',
      });
      expect(db.operation('audit_logs', 'insert')?.payload).toMatchObject({
        action: 'ORDER_PAYMENT_LEDGER_FAILURE',
        entity_id: ORDER_ID,
        new_data: { reference: ORDER_ID, error: 'inventory movement failed' },
      });
      expect(db.operation('receipts', 'insert')).toBeUndefined();
      expect(mocks.createInAppNotification).not.toHaveBeenCalled();
    });
  });
});
