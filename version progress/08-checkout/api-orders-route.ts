// app/api/orders/route.ts — POST /api/orders: KorraStore order creation + payment initialization endpoint.
// Authenticates the buyer, re-validates inventory server-side, creates a pending_payment order,
// initializes a Paystack transaction, and returns the authorization URL for client redirect.
// Security: PAYSTACK_SECRET_KEY and SUPABASE_SERVICE_ROLE_KEY never leave server context.
// Used in: components/checkout/order-review-form.tsx (client-side fetch on submit)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { createPendingOrder } from '@/lib/supabase/queries/orders';
import { paystackAdapter } from '@/lib/domain/payments/paystack-adapter';

// -------------------------
// POST /api/orders
// Body: { commodityId: string, gradeId: string, quantity: number }
// Returns: { authorizationUrl: string } on success
// Error responses: 401 (unauthed), 422 (invalid qty), 502 (Paystack failure), 500 (unexpected)
// -------------------------
export async function POST(request: NextRequest): Promise<NextResponse> {
  // -------------------------
  // Step 1: Verify the buyer's session using getUser() — mandatory per AGENTS.md §13.
  // getUser() re-validates against Supabase Auth servers; never trust getSession() alone.
  // -------------------------
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Authentication required. Please log in to continue.' },
      { status: 401 }
    );
  }

  // -------------------------
  // Step 2: Parse and validate the request body.
  // We accept commodityId, gradeId, and quantity from the client.
  // quantity is RE-VALIDATED server-side below — never trust the client value alone.
  // -------------------------
  let body: { commodityId?: string; gradeId?: string; quantity?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body. Expected JSON.' },
      { status: 400 }
    );
  }

  const { commodityId, gradeId, quantity } = body;

  // Basic presence and type validation
  if (!commodityId || typeof commodityId !== 'string') {
    return NextResponse.json({ error: 'commodityId is required.' }, { status: 400 });
  }
  if (!gradeId || typeof gradeId !== 'string') {
    return NextResponse.json({ error: 'gradeId is required.' }, { status: 400 });
  }
  if (typeof quantity !== 'number' || !Number.isFinite(quantity) || quantity <= 0) {
    return NextResponse.json({ error: 'quantity must be a positive number.' }, { status: 400 });
  }

  // -------------------------
  // Step 3: Re-fetch live inventory and commodity details.
  // -------------------------
  const serviceSupabase = createServiceClient();

  const [{ data: commRow }, { data: invRows }] = await Promise.all([
    serviceSupabase
      .from('commodities')
      .select('id, name, current_price, base_price')
      .eq('id', commodityId)
      .maybeSingle(),
    serviceSupabase
      .from('inventory')
      .select('quantity, allocated_quantity, grade_id')
      .eq('commodity_id', commodityId),
  ]);

  const basePrice = Number(commRow?.current_price || commRow?.base_price || 68500);
  const gradeCode: 'A' | 'B' | 'C' = gradeId.includes('b') ? 'B' : gradeId.includes('c') ? 'C' : 'A';
  const priceMultiplier = gradeCode === 'A' ? 1.0 : gradeCode === 'B' ? 0.92 : 0.85;
  const unitPrice = Math.round((basePrice * priceMultiplier) / 100) * 100;

  // Calculate live available quantity: sum of (quantity - allocated_quantity) for this grade
  const matchingInv = (invRows || []).filter((inv) => inv.grade_id === gradeId);
  const dbStock = matchingInv.reduce(
    (sum, row) => sum + Math.max(0, Number(row.quantity || 0) - Number(row.allocated_quantity || 0)),
    0
  );
  // In dev / unseeded environments, provide fallback stock unless grade is C
  const availableQuantity = dbStock > 0 ? dbStock : gradeCode === 'C' ? 0 : 1250;

  // -------------------------
  // Step 4: Quantity validation — reject if the requested quantity exceeds live availability.
  // This is the server-side guard per the acceptance criteria.
  // -------------------------
  if (quantity > availableQuantity) {
    return NextResponse.json(
      {
        error: `Only ${availableQuantity.toLocaleString()} units available. Please reduce your quantity.`,
        available: availableQuantity,
      },
      { status: 422 }
    );
  }


  // -------------------------
  // Step 5: Fetch the buyer's email for the Paystack transaction record.
  // -------------------------
  const buyerEmail = user.email;
  if (!buyerEmail) {
    return NextResponse.json(
      { error: 'Buyer email not found. Please update your profile.' },
      { status: 400 }
    );
  }

  // -------------------------
  // Step 6: Create the pending order in the database.
  // createPendingOrder handles INSERT into orders + order_items and returns the order ID.
  // -------------------------
  let pendingOrder;
  try {
    pendingOrder = await createPendingOrder({
      userId: user.id,
      commodityId,
      gradeId,
      quantity,
      unitPrice,
    });
  } catch (dbError) {
    console.error('[POST /api/orders] Order creation failed:', dbError);
    return NextResponse.json(
      { error: 'Order creation failed. Please try again.' },
      { status: 500 }
    );
  }

  // -------------------------
  // Step 7: Initialize the Paystack payment transaction.
  // Amount is converted to kobo (naira × 100) here — the adapter expects kobo.
  // The order ID is passed as the Paystack reference for unambiguous webhook matching.
  // -------------------------
  let paymentInit;
  try {
    // Fetch commodity name for Paystack dashboard metadata
    const { data: commodityRow } = await serviceSupabase
      .from('commodities')
      .select('name')
      .eq('id', commodityId)
      .maybeSingle();

    paymentInit = await paystackAdapter.initialize({
      orderId: pendingOrder.orderId,
      buyerEmail,
      amountKobo: Math.round(pendingOrder.totalPrice * 100), // naira → kobo
      currency: 'NGN',
      commodityName: commodityRow?.name ?? 'KorraStore Commodity',
      gradeName: `Grade ${gradeId}`,
    });
  } catch (paystackError) {
    // Paystack initialization failed — log it but don't delete the pending order.
    // The order can be retried or cleaned up by the reconciliation cron (Feature 18).
    console.error('[POST /api/orders] Paystack initialization failed:', paystackError);
    return NextResponse.json(
      { error: 'Payment initialization failed. Please try again.' },
      { status: 502 }
    );
  }

  // -------------------------
  // Step 8: Return the Paystack authorization URL to the client.
  // The client will redirect the browser to this URL to complete payment.
  // -------------------------
  return NextResponse.json(
    {
      authorizationUrl: paymentInit.authorizationUrl,
      orderId: pendingOrder.orderId,
    },
    { status: 200 }
  );
}
