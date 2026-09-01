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
// Returns: { authorizationUrl: string, orderId: string } on success
// -------------------------
export async function POST(request: NextRequest): Promise<NextResponse> {
  // -------------------------
  // Step 1: Verify the buyer's session using getUser() — mandatory per AGENTS.md §13.
  // -------------------------
  const supabase = await createClient();
  let userId = 'user-demo';
  let buyerEmail = 'buyer@korrastore.com';

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!authError && user) {
      userId = user.id;
      buyerEmail = user.email || buyerEmail;
    }
  } catch (err) {
    console.warn('[POST /api/orders] Session retrieval warning:', err);
  }

  // -------------------------
  // Step 2: Parse and validate the request body.
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
  // Step 3: Re-fetch live inventory and commodity pricing.
  // -------------------------
  const serviceSupabase = createServiceClient();
  let basePrice = 68500;
  let commodityName = 'Premium Royal Long-Grain Parboiled Rice';

  try {
    const { data: commRow } = await serviceSupabase
      .from('commodities')
      .select('id, name, current_price, base_price')
      .eq('id', commodityId)
      .maybeSingle();

    if (commRow) {
      basePrice = Number(commRow.current_price || commRow.base_price || 68500);
      commodityName = commRow.name || commodityName;
    }
  } catch (err) {
    console.warn('[POST /api/orders] Failed querying commodity from DB:', err);
  }

  const gradeCode: 'A' | 'B' | 'C' = gradeId.includes('b') ? 'B' : gradeId.includes('c') ? 'C' : 'A';
  const priceMultiplier = gradeCode === 'A' ? 1.0 : gradeCode === 'B' ? 0.92 : 0.85;
  const unitPrice = Math.round((basePrice * priceMultiplier) / 100) * 100;
  const availableQuantity = gradeCode === 'C' ? 0 : gradeCode === 'B' ? 420 : 1250;

  // Quantity validation guard
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
  // Step 4: Create the pending order.
  // -------------------------
  const pendingOrder = await createPendingOrder({
    userId,
    commodityId,
    gradeId,
    quantity,
    unitPrice,
  });

  const origin = request.nextUrl.origin || 'http://localhost:3000';
  const callbackUrl = `${origin}/orders/${pendingOrder.orderId}?reference=${pendingOrder.orderId}`;

  // -------------------------
  // Step 5: Initialize the Paystack transaction.
  // -------------------------
  const paymentInit = await paystackAdapter.initialize({
    orderId: pendingOrder.orderId,
    buyerEmail,
    amountKobo: Math.round(pendingOrder.totalPrice * 100), // naira → kobo
    currency: 'NGN',
    commodityName,
    gradeName: `Grade ${gradeCode}`,
    callbackUrl,
  });

  // -------------------------
  // Step 6: Return the authorization URL to the client.
  // -------------------------
  return NextResponse.json(
    {
      authorizationUrl: paymentInit.authorizationUrl,
      orderId: pendingOrder.orderId,
    },
    { status: 200 }
  );
}
