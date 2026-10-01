// app/api/admin/inventory/warehouses/[id]/route.ts — Admin Warehouse Update & Toggle API.
// PUT: full update of a specific warehouse by ID.
// PATCH: toggle active status.
// Security: Admin role verified on every request.
// Used in: components/admin/inventory/warehouse-form-modal.tsx

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { upsertWarehouse, toggleWarehouseActive } from '@/lib/supabase/queries/admin/inventory';
import { UpsertWarehousePayload } from '@/lib/types/admin-inventory';

/**
 * Authenticates the current user and verifies administrator access.
 *
 * @returns The administrator's user ID, or an unauthorized or forbidden response.
 */
async function requireAdmin(): Promise<{ adminId: string } | NextResponse> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return { adminId: user.id };
}

/**
 * Updates a warehouse identified by the route parameter.
 *
 * @returns A response containing the updated warehouse or an error status.
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

  const result = await upsertWarehouse({ ...body, id } as unknown as UpsertWarehousePayload);
  if (!result) return NextResponse.json({ error: 'Failed to update warehouse' }, { status: 500 });
  return NextResponse.json({ warehouse: result });
}

// PATCH /api/admin/inventory/warehouses/[id] — toggle active
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

  if ('active' in body) {
    const ok = await toggleWarehouseActive(id, Boolean(body.active));
    if (!ok) return NextResponse.json({ error: 'Failed to update warehouse status' }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Unknown PATCH action' }, { status: 400 });
}
