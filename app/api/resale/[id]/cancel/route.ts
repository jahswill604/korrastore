// app/api/resale/[id]/cancel/route.ts — Resale Listing Cancellation Endpoint for KorraStore.
// POST: Authenticated seller endpoint to cancel an active listing and release reserved holding balance.
// Enforces ownership (auth.uid() = seller_id) and records immutable holding movement audit record.
// Used by: components/resale/cancel-listing-dialog.tsx

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cancelResaleListing } from '@/lib/supabase/queries/resale';

// ----------------------------------------------------------------------------
// POST Handler: Cancel Resale Listing
// ----------------------------------------------------------------------------

export async function POST(
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
        { error: 'Unauthorized: You must be logged in to cancel a listing.' },
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

    // 2. Execute cancellation & release reserved holding quantity
    const result = await cancelResaleListing(user.id, listingId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to cancel listing.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Listing cancelled successfully and reserved quantity released.',
    });
  } catch (error) {
    console.error('[POST /api/resale/[id]/cancel] Internal error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
