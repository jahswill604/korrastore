// app/api/admin/pricing/route.ts — Admin Pricing Update API Route for KorraStore.
// Handles atomic price updates for commodities and grades.
// Validates admin credentials via Supabase session and executes the atomic price history mutation.
// Used in: components/admin/pricing/update-price-modal.tsx

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateCommodityPricing } from '@/lib/supabase/queries/admin/pricing';
import type { UpdatePricingPayload } from '@/lib/types/admin-pricing';

// ----------------------------------------------------------------------------
// POST — Updates commodity sale and buyback price atomically
// ----------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
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

    // 3. Parse and validate payload
    const body = (await request.json()) as UpdatePricingPayload;

    if (!body.commodity_id) {
      return NextResponse.json(
        { error: 'Bad Request: Commodity ID is required.' },
        { status: 400 }
      );
    }

    const salePrice = Number(body.new_sale_price);
    const buybackPrice = Number(body.new_buyback_price);

    if (isNaN(salePrice) || salePrice <= 0) {
      return NextResponse.json(
        { error: 'Bad Request: Valid positive sale price is required.' },
        { status: 400 }
      );
    }

    if (isNaN(buybackPrice) || buybackPrice <= 0) {
      return NextResponse.json(
        { error: 'Bad Request: Valid positive buyback price is required.' },
        { status: 400 }
      );
    }

    // 4. Execute atomic update via service-role query helper
    const result = await updateCommodityPricing(
      {
        commodity_id: body.commodity_id,
        grade_id: body.grade_id || null,
        new_sale_price: salePrice,
        new_buyback_price: buybackPrice,
        change_reason: body.change_reason || 'Admin pricing update',
      },
      user.id
    );

    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    console.error('[API /api/admin/pricing POST] error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
