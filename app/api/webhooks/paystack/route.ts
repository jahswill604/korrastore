// app/api/webhooks/paystack/route.ts — POST /api/webhooks/paystack
//
// The purchase-to-ownership pipeline (AGENTS.md §8/§9/§14, prompt/26-paystack-webhook.md).
// This is the single place an order is allowed to move pending_payment -> paid.
//
// Steps:
//   1. Verify the request really came from Paystack (HMAC-SHA512 signature over
//      the RAW request body, using PAYSTACK_SECRET_KEY). Reject if it doesn't match.
//   2. Only act on `charge.success` events.
//   3. Re-verify the transaction directly against Paystack's own API — the webhook
//      body is never trusted for the "did this actually succeed" decision.
//   4. Idempotency: insert into `payments` first, keyed on the unique `reference`
//      column. A unique-violation means this event was already processed, so we
//      return 200 immediately without repeating any side effect.
//   5. Allocate inventory + create/update the buyer's holding via the ledger
//      domain service, advance the order to `paid`, issue a receipt, and queue
//      an in-app notification.
//
// Security: This route MUST stay a Route Handler (not a Server Action) reading
// the raw body — never JSON.parse before verifying the signature.

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServiceClient } from '@/lib/supabase/service';
import { paystackAdapter } from '@/lib/domain/payments/paystack-adapter';
import { allocatePurchaseToHolding } from '@/lib/domain/ledger/holdings-ledger';
import { createInAppNotification } from '@/lib/supabase/queries/notifications';

interface PaystackWebhookEvent {
  event: string;
  data: {
    reference: string;
    status: string;
    amount: number;
    customer?: { email?: string };
  };
}

// -------------------------
// Verifies the `x-paystack-signature` header against an HMAC-SHA512 of the
// raw request body, computed with PAYSTACK_SECRET_KEY. Returns false (and
// logs) if the secret isn't configured — signature checks cannot be skipped.
// -------------------------
function isValidSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || secret.includes('placeholder')) {
    console.warn('[paystack webhook] PAYSTACK_SECRET_KEY not configured — cannot verify signature.');
    return false;
  }
  if (!signatureHeader) {
    return false;
  }
  const expected = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
  // Constant-time comparison to avoid timing attacks.
  const expectedBuf = Buffer.from(expected, 'utf8');
  const givenBuf = Buffer.from(signatureHeader, 'utf8');
  if (expectedBuf.length !== givenBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, givenBuf);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // -------------------------
  // Step 1: Read the RAW body first — signature verification requires the
  // exact bytes Paystack sent, before any JSON parsing.
  // -------------------------
  const rawBody = await request.text();
  const signatureHeader = request.headers.get('x-paystack-signature');

  if (!isValidSignature(rawBody, signatureHeader)) {
    console.error('[paystack webhook] Signature verification failed. Rejecting request.');
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
  }

  let event: PaystackWebhookEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  // Paystack sends many event types (transfer.success, subscription.*, etc.) —
  // we only care about successful charges here.
  if (event.event !== 'charge.success') {
    return NextResponse.json({ received: true, ignored: event.event }, { status: 200 });
  }

  const reference = event.data?.reference;
  if (!reference) {
    return NextResponse.json({ error: 'Missing transaction reference.' }, { status: 400 });
  }

  // -------------------------
  // Step 2: Re-verify server-to-server. NEVER trust the webhook payload alone
  // for the success/failure decision — Paystack's docs require this.
  // -------------------------
  const verification = await paystackAdapter.verify(reference);
  if (!verification.success || verification.status !== 'success') {
    console.warn('[paystack webhook] Re-verification did not confirm success:', reference, verification.status);
    return NextResponse.json({ received: true, verified: false }, { status: 200 });
  }

  const db = createServiceClient();

  // -------------------------
  // Step 3: Fetch the order this reference belongs to. In KorraStore's checkout
  // flow, the Paystack reference IS the order UUID (see app/api/orders/route.ts).
  // -------------------------
  const { data: order, error: orderFetchError } = await db
    .from('orders')
    .select('id, user_id, status, total_amount')
    .eq('id', reference)
    .maybeSingle();

  if (orderFetchError || !order) {
    console.error('[paystack webhook] No matching order for reference:', reference, orderFetchError?.message);
    // Return 200 so Paystack doesn't retry forever on an order we'll never find
    // (e.g. a stale/demo reference); the failure is logged for investigation.
    return NextResponse.json({ received: true, matchedOrder: false }, { status: 200 });
  }

  // -------------------------
  // Step 4: Idempotency guard. Insert into `payments` first — its `reference`
  // column is UNIQUE. A conflict means this webhook fired more than once for
  // the same transaction (Paystack retries on any non-2xx, or duplicate
  // delivery), so we skip all downstream side effects and return success.
  // -------------------------
  const { error: paymentInsertError } = await db.from('payments').insert({
    order_id: order.id,
    user_id: order.user_id,
    reference,
    amount: (verification.amountKobo / 100).toFixed(4),
    status: 'success',
    channel: 'paystack',
    paid_at: new Date().toISOString(),
    raw_payload: event,
  });

  if (paymentInsertError) {
    const alreadyProcessed = paymentInsertError.code === '23505'; // unique_violation
    if (alreadyProcessed) {
      return NextResponse.json({ received: true, alreadyProcessed: true }, { status: 200 });
    }
    console.error('[paystack webhook] Failed to record payment:', paymentInsertError.message);
    return NextResponse.json({ error: 'Failed to record payment.' }, { status: 500 });
  }

  // Extra guard: if the order was somehow already marked paid (shouldn't
  // happen given the payments-table idempotency check above), don't re-run
  // the ledger allocation.
  if (order.status !== 'pending_payment') {
    return NextResponse.json({ received: true, alreadyPaid: true }, { status: 200 });
  }

  // -------------------------
  // Step 5: Load the order's line item to know what to allocate.
  // -------------------------
  const { data: orderItem, error: itemError } = await db
    .from('order_items')
    .select('commodity_id, grade_id, quantity, unit_price')
    .eq('order_id', order.id)
    .single();

  if (itemError || !orderItem) {
    console.error(
      '[paystack webhook] CRITICAL: payment recorded but order has no line item:',
      order.id, itemError?.message
    );
    return NextResponse.json(
      { error: 'Order has no line item — manual reconciliation required.' },
      { status: 500 }
    );
  }

  // Pick the warehouse with the most available stock for this commodity/grade.
  // (order_items doesn't carry a warehouse_id — KorraStore fulfils from
  // whichever warehouse currently holds the most free inventory.)
  const { data: candidateInventory } = await db
    .from('inventory')
    .select('warehouse_id, quantity, allocated_quantity')
    .eq('commodity_id', orderItem.commodity_id)
    .eq('grade_id', orderItem.grade_id);

  const bestWarehouse = (candidateInventory || [])
    .map((row) => ({
      warehouseId: row.warehouse_id as string,
      available: Number(row.quantity) - Number(row.allocated_quantity),
    }))
    .sort((a, b) => b.available - a.available)[0];

  if (!bestWarehouse || bestWarehouse.available < Number(orderItem.quantity)) {
    console.error(
      '[paystack webhook] CRITICAL: payment recorded but insufficient inventory to fulfil order:',
      order.id
    );
    // Do not fail the webhook (payment is already captured) — flag it as an
    // exception the admin dashboard's exception-resolution flow can pick up.
    await db
      .from('orders')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('id', order.id);
    await db.from('audit_logs').insert({
      user_id: order.user_id,
      action: 'ORDER_PAYMENT_INVENTORY_MISMATCH',
      entity_type: 'order',
      entity_id: order.id,
      new_data: { reference, orderItem },
    });
    return NextResponse.json({ received: true, allocationFailed: true }, { status: 200 });
  }

  try {
    const allocation = await allocatePurchaseToHolding({
      orderId: order.id,
      userId: order.user_id,
      commodityId: orderItem.commodity_id,
      gradeId: orderItem.grade_id,
      warehouseId: bestWarehouse.warehouseId,
      quantity: Number(orderItem.quantity),
      unitPrice: Number(orderItem.unit_price),
    });

    // -------------------------
    // Step 6: Advance the order to `paid`.
    // -------------------------
    await db
      .from('orders')
      .update({ status: 'paid', updated_at: new Date().toISOString() })
      .eq('id', order.id);

    // -------------------------
    // Step 7: Issue a receipt for the buyer.
    // -------------------------
    const receiptNumber = `RCPT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${order.id.slice(0, 8).toUpperCase()}`;
    await db.from('receipts').insert({
      holding_id: allocation.holdingId,
      order_id: order.id,
      user_id: order.user_id,
      receipt_number: receiptNumber,
      metadata: {
        quantity: orderItem.quantity,
        unitPrice: orderItem.unit_price,
        totalAmount: order.total_amount,
        commodityId: orderItem.commodity_id,
        gradeId: orderItem.grade_id,
      },
    });

    // -------------------------
    // Step 8: Notify the buyer.
    // -------------------------
    await createInAppNotification({
      userId: order.user_id,
      type: 'order_status',
      title: 'Payment confirmed',
      body: `Your payment for order #${order.id.slice(0, 8).toUpperCase()} was successful. Your storage holding has been updated.`,
      payload: { orderId: order.id, holdingId: allocation.holdingId },
    });

    return NextResponse.json({ received: true, processed: true }, { status: 200 });
  } catch (err) {
    // Payment is captured but ledger allocation failed — this must not be
    // silently swallowed. Log loudly and flag for manual admin reconciliation
    // rather than losing the buyer's money and goods.
    console.error('[paystack webhook] CRITICAL: ledger allocation failed after payment capture:', err);
    await db.from('audit_logs').insert({
      user_id: order.user_id,
      action: 'ORDER_PAYMENT_LEDGER_FAILURE',
      entity_type: 'order',
      entity_id: order.id,
      new_data: { reference, error: err instanceof Error ? err.message : String(err) },
    });
    return NextResponse.json(
      { error: 'Payment captured but allocation failed — flagged for manual review.' },
      { status: 500 }
    );
  }
}
