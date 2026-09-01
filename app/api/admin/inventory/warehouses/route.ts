// app/api/admin/inventory/warehouses/route.ts — Admin Warehouse CRUD API for KorraStore.
// GET: returns all warehouses.
// POST: creates or updates a warehouse (upsert by id).
// Security: Admin role verified on every request.
// Used in: components/admin/inventory/warehouses-tab.tsx, warehouse-form-modal.tsx

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getWarehouses, upsertWarehouse } from '@/lib/supabase/queries/admin/inventory';
import type { UpsertWarehousePayload } from '@/lib/types/admin-inventory';

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
// GET /api/admin/inventory/warehouses
// ----------------------------------------------------------------------------

export async function GET() {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const warehouses = await getWarehouses();
  return NextResponse.json({ warehouses });
}

// ----------------------------------------------------------------------------
// POST /api/admin/inventory/warehouses — Create or update a warehouse
// ----------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  let body: UpsertWarehousePayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'Warehouse name is required' }, { status: 400 });
  }
  if (!body.code?.trim()) {
    return NextResponse.json({ error: 'Warehouse code is required' }, { status: 400 });
  }
  if (!body.location?.trim()) {
    return NextResponse.json({ error: 'Warehouse location is required' }, { status: 400 });
  }

  const result = await upsertWarehouse(body);
  if (!result) return NextResponse.json({ error: 'Failed to save warehouse' }, { status: 500 });

  return NextResponse.json({ warehouse: result }, { status: body.id ? 200 : 201 });
}
