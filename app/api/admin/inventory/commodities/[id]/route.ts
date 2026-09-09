// app/api/admin/inventory/commodities/[id]/route.ts — Admin Commodity Update & Toggle API for KorraStore.
// PUT: full update of a specific commodity by ID.
// PATCH: toggle active status (soft deactivate / reactivate).
// Security: Admin role verified on every request.
// Used in: components/admin/inventory/commodity-form-modal.tsx

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { upsertCommodity, toggleCommodityActive, upsertGrade, deactivateGrade } from '@/lib/supabase/queries/admin/inventory';
import { UpsertCommodityPayload, UpsertGradePayload } from '@/lib/types/admin-inventory';

// ----------------------------------------------------------------------------
// Admin Role Guard Helper
// ----------------------------------------------------------------------------

async function requireAdmin(): Promise<{ adminId: string } | NextResponse> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return { adminId: user.id };
}

// ----------------------------------------------------------------------------
// PUT /api/admin/inventory/commodities/[id] — Full update
/**
 * Updates the commodity identified by the route parameter.
 *
 * @returns A response containing the updated commodity, or an error response for unauthorized access, invalid JSON, or an update failure.
 */

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const result = await upsertCommodity({ ...body, id } as unknown as UpsertCommodityPayload);
  if (!result) return NextResponse.json({ error: 'Failed to update commodity' }, { status: 500 });

  return NextResponse.json({ commodity: result });
}

// ----------------------------------------------------------------------------
// PATCH /api/admin/inventory/commodities/[id] — Toggle active / grade operations
/**
 * Updates a commodity's active status or manages one of its grades.
 *
 * @param params - Route parameters containing the commodity identifier.
 * @returns A response indicating the operation result or an error.
 */

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Handle toggle active
  if ('active' in body) {
    const ok = await toggleCommodityActive(id, Boolean(body.active));
    if (!ok) return NextResponse.json({ error: 'Failed to update active status' }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // Handle grade upsert
  if (body.action === 'upsert_grade' && body.grade) {
    const grade = await upsertGrade(body.grade as unknown as UpsertGradePayload);
    if (!grade) return NextResponse.json({ error: 'Failed to save grade' }, { status: 500 });
    return NextResponse.json({ grade });
  }

  // Handle grade deactivate
  if (body.action === 'deactivate_grade' && body.grade_id) {
    const ok = await deactivateGrade(body.grade_id as string);
    if (!ok) return NextResponse.json({ error: 'Failed to deactivate grade' }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Unknown PATCH action' }, { status: 400 });
}
