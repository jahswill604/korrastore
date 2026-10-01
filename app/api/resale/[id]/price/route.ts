// app/api/resale/[id]/price/route.ts — Resale Listing Price Update Endpoint for KorraStore.
// PATCH: Authenticated seller endpoint to update the unit price on an active listing.
// Enforces ownership (auth.uid() = seller_id) and ensures listing is currently 'active'.
// Used by: components/resale/edit-price-modal.tsx

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateListingPrice } from '@/lib/supabase/queries/resale';

// ----------------------------------------------------------------------------
// PATCH Handler: Update Resale Listing Asking Price
/**
 * Updates the asking unit price of an authenticated user's resale listing.
 *
 * @param params - Route parameters containing the listing ID
 * @returns A response indicating whether the price update succeeded
 */

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate user session
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in to edit listing prices.' },
        { status: 401 }
      );
    }

    const { id: listingId } = await params;
    if (!listingId) {
      return NextResponse.json(
        { error: 'Missing listing ID parameter.' },
        { status: 400 }
      );
    }

    // 2. Parse payload
    const body = await req.json();
    const { unitPrice } = body;
    const numUnitPrice = Number(unitPrice);

    if (!numUnitPrice || numUnitPrice <= 0) {
      return NextResponse.json(
        { error: 'Asking unit price must be a positive number.' },
        { status: 400 }
      );
    }

    // 3. Execute price update
    const result = await updateListingPrice(user.id, listingId, numUnitPrice);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update listing price.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Listing asking price updated successfully.',
    });
  } catch (error) {
    console.error('[PATCH /api/resale/[id]/price] Internal error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
