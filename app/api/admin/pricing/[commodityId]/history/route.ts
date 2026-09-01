// app/api/admin/pricing/[commodityId]/history/route.ts — Price History API Route for KorraStore.
// Fetches historical recorded price points for charting and analysis.
// Validates admin credentials via Supabase session.
// Used in: components/admin/pricing/update-price-modal.tsx

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCommodityPriceHistory } from '@/lib/supabase/queries/admin/pricing';

// ----------------------------------------------------------------------------
// GET — Fetches price history records for a commodity
// ----------------------------------------------------------------------------
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ commodityId: string }> }
) {
  try {
    const { commodityId } = await params;
    const supabase = await createClient();

    // 1. Verify authenticated session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required.' },
        { status: 401 }
      );
    }

    // 2. Verify admin role in profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Administrator privileges required.' },
        { status: 403 }
      );
    }

    // 3. Extract optional grade filter from searchParams
    const { searchParams } = new URL(request.url);
    const gradeId = searchParams.get('gradeId');

    // 4. Fetch price history points
    const history = await getCommodityPriceHistory(commodityId, gradeId);

    return NextResponse.json({ history }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    console.error('[API /api/admin/pricing/[commodityId]/history GET] error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
