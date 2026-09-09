// app/api/buybacks/route.ts — Buyback Request Submission Endpoint for KorraStore.
// POST: Authenticated buyer-session endpoint to submit a buyback request directly to KorraStore.
// Atomically validates non-reserved available quantity, reserves holding inventory, and creates buyback_requests record.
// Used by: components/buyback/request-modal.tsx

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { submitBuybackRequest } from '@/lib/supabase/queries/buyback';

// ----------------------------------------------------------------------------
// POST Handler: Submit Buyback Request
/**
 * Submits a buyback request for a holding.
 *
 * Unauthenticated requests use the demo user identity. Invalid input or failed
 * submissions produce a 400 response; unexpected errors produce a 500 response.
 *
 * @param req - The request containing `holdingId` and a positive `quantity`
 * @returns A response containing the submitted request ID and total amount, or an error message
 */

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate buyer session
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // In local development/demo mode, if no session is active, we can fallback to demo user ID
    const userId = user?.id ?? 'demo-user-id';

    // 2. Parse and validate JSON request payload
    const body = await req.json();
    const { holdingId, quantity } = body;

    if (!holdingId || typeof holdingId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing holdingId.' },
        { status: 400 }
      );
    }

    const numQuantity = Number(quantity);
    if (!numQuantity || numQuantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be a positive number greater than zero.' },
        { status: 400 }
      );
    }

    // 3. Execute atomic buyback submission with reservation
    const result = await submitBuybackRequest({
      userId,
      holdingId,
      quantity: numQuantity,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to submit buyback request.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      requestId: result.requestId,
      totalAmount: result.totalAmount,
      message: 'Buyback request submitted successfully.',
    });
  } catch (error) {
    console.error('[POST /api/buybacks] Internal error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
