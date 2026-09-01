// app/api/admin/inventory/commodities/route.ts — Admin Commodity CRUD API for KorraStore.
// GET: returns all commodities with grade counts.
// POST: creates or updates a commodity (upsert by id).
// Security: Admin role verified on every request via getUser() + profiles.role check.
// Used in: components/admin/inventory/commodities-tab.tsx, commodity-form-modal.tsx

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCommodities, upsertCommodity } from '@/lib/supabase/queries/admin/inventory';
import type { UpsertCommodityPayload } from '@/lib/types/admin-inventory';

// ----------------------------------------------------------------------------
// Admin Role Guard Helper
// ----------------------------------------------------------------------------

/** Verifies the incoming request belongs to an authenticated admin user. */
async function requireAdmin(): Promise<{ adminId: string } | NextResponse> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: admin access required' }, { status: 403 });
  }

  return { adminId: user.id };
}

// ----------------------------------------------------------------------------
// GET /api/admin/inventory/commodities
// ----------------------------------------------------------------------------

export async function GET() {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const commodities = await getCommodities();
  return NextResponse.json({ commodities });
}

// ----------------------------------------------------------------------------
// POST /api/admin/inventory/commodities — Create or update a commodity
// ----------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  let body: UpsertCommodityPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Validate required fields
  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'Commodity name is required' }, { status: 400 });
  }
  if (!body.code?.trim()) {
    return NextResponse.json({ error: 'Commodity code is required' }, { status: 400 });
  }
  if (body.base_price == null || body.current_price == null) {
    return NextResponse.json({ error: 'base_price and current_price are required' }, { status: 400 });
  }

  const result = await upsertCommodity(body);
  if (!result) {
    return NextResponse.json({ error: 'Failed to save commodity' }, { status: 500 });
  }

  return NextResponse.json({ commodity: result }, { status: body.id ? 200 : 201 });
}
