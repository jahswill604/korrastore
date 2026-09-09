// app/api/buybacks/price/route.ts — Live Buyback Price Endpoint for KorraStore.
// GET: Fetches the live, real-time admin-set buyback price for a given commodity ID.
// Never cached on the client to ensure transparent pricing at time of request.
// Used by: components/buyback/request-modal.tsx

import { NextRequest, NextResponse } from 'next/server';
import { getLiveBuybackPrice } from '@/lib/supabase/queries/buyback';

// ----------------------------------------------------------------------------
// GET Handler: Fetch Live Buyback Price
// ----------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const commodityId = searchParams.get('commodityId');

    if (!commodityId) {
      return NextResponse.json(
        { error: 'Missing commodityId query parameter.' },
        { status: 400 }
      );
    }

    const price = await getLiveBuybackPrice(commodityId);

    return NextResponse.json({
      success: true,
      commodityId,
      buybackPrice: price,
    });
  } catch (error) {
    console.error('[GET /api/buybacks/price] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
