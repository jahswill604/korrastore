// app/api/orders/route.ts — POST /api/orders: KorraStore order creation + payment initialization endpoint.
// Authenticates the buyer, re-validates inventory server-side, creates a pending_payment order,
// initializes a Paystack transaction, and returns the authorization URL for client redirect.
// Security: PAYSTACK_SECRET_KEY and SUPABASE_SERVICE_ROLE_KEY never leave server context.
// Used in: components/checkout/order-review-form.tsx (client-side fetch on submit)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createPendingOrder, getCheckoutCommodity } from '@/lib/supabase/queries/orders';
import { paystackAdapter } from '@/lib/domain/payments/paystack-adapter';

// -------------------------
// POST /api/orders
// Body: { commodityId: string, gradeId: string, quantity: number }
// Returns: { authorizationUrl: string, orderId: string } on success
/**
 * Creates an authenticated buyer's pending order and initializes its Paystack payment.
 *
 * @param request - The request containing the selected commodity, grade, and quantity.
 * @returns A response containing the Paystack authorization URL and order ID.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // -------------------------
  // Step 1: Verify the buyer's session using getUser() — mandatory per AGENTS.md §13.
  // A real purchase must be tied to a real, authenticated buyer — no silent
  // "demo user" fallback here.
  // -------------------------
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'You must be signed in to place an order.' }, { status: 401 });
  }

  const userId = user.id;
  const buyerEmail = user.email || 'buyer@korrastore.com';

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
  // Step 3: Re-fetch live commodity, grade, and inventory data server-side.
  // This is the SAME lookup the checkout page itself uses (getCheckoutCommodity),
  // so what the buyer sees before paying matches what's validated here — no
  // separate, drifting hardcoded price/stock table.
  // -------------------------
  const checkoutData = await getCheckoutCommodity(commodityId, gradeId);

  if (!checkoutData) {
    return NextResponse.json({ error: 'Commodity or grade not found.' }, { status: 404 });
  }

  const { unitPrice, availableQuantity, commodityName } = checkoutData;

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
    gradeName: checkoutData.gradeName,
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
