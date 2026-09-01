// app/api/resale/route.ts — Resale Listing Creation Endpoint for KorraStore.
// POST: Authenticated buyer-session endpoint to create a peer-to-peer resale listing from a holding.
// Atomically validates non-reserved quantity, reserves holding inventory, and creates resale_listings record.
// Used by: components/resale/create-listing-modal.tsx

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createResaleListing } from '@/lib/supabase/queries/resale';

// ----------------------------------------------------------------------------
// POST Handler: Create Resale Listing
// ----------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user session
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in to create a resale listing.' },
        { status: 401 }
      );
    }

    // 2. Parse request payload
    const body = await req.json();
    const { holdingId, quantity, unitPrice, durationDays } = body;

    // Validate presence and types
    if (!holdingId || typeof holdingId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing holdingId.' },
        { status: 400 }
      );
    }

    const numQuantity = Number(quantity);
    const numUnitPrice = Number(unitPrice);
    const numDuration = durationDays ? Number(durationDays) : 30;

    if (!numQuantity || numQuantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be a positive number.' },
        { status: 400 }
      );
    }

    if (!numUnitPrice || numUnitPrice <= 0) {
      return NextResponse.json(
        { error: 'Unit price must be a positive number.' },
        { status: 400 }
      );
    }

    if (![7, 14, 30].includes(numDuration)) {
      return NextResponse.json(
        { error: 'Duration must be 7, 14, or 30 days.' },
        { status: 400 }
      );
    }

    // 3. Execute atomic listing creation & reservation
    const result = await createResaleListing({
      userId: user.id,
      holdingId,
      quantity: numQuantity,
      unitPrice: numUnitPrice,
      durationDays: numDuration,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create resale listing.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      listingId: result.listingId,
      message: 'Listing created successfully and holding quantity reserved.',
    });
  } catch (error: any) {
    console.error('[POST /api/resale] Internal error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
