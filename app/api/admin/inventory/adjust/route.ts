// app/api/admin/inventory/adjust/route.ts — Admin Inventory Adjustment API for KorraStore.
// POST: performs a ledger-safe stock adjustment via adjustInventory() domain service.
//       Requires a non-empty reason. Never updates inventory.quantity directly.
// Security: Admin role verified. Uses service-role client via domain service.
// Used in: components/admin/inventory/adjust-inventory-modal.tsx

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { adjustInventory } from '@/lib/domain/ledger/inventory-ledger';
import type { AdjustInventoryPayload } from '@/lib/types/admin-inventory';

// ----------------------------------------------------------------------------
// Admin Role Guard Helper
// ----------------------------------------------------------------------------

async function requireAdmin(): Promise<{ adminId: string } | NextResponse> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden: admin access required' }, { status: 403 });
  return { adminId: user.id };
}

// ----------------------------------------------------------------------------
// POST /api/admin/inventory/adjust
// ----------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;
  const { adminId } = guard as { adminId: string };

  let body: AdjustInventoryPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Validate all required fields before calling domain service
  if (!body.inventory_id) {
    return NextResponse.json({ error: 'inventory_id is required' }, { status: 400 });
  }
  if (body.delta == null || body.delta === 0) {
    return NextResponse.json({ error: 'delta must be a non-zero number' }, { status: 400 });
  }
  if (!body.reason?.trim()) {
    return NextResponse.json({ error: 'reason is required and cannot be empty' }, { status: 400 });
  }

  try {
    // Delegate entirely to domain service — the only authorised path for quantity changes
    const result = await adjustInventory(
      body.inventory_id,
      body.delta,
      body.reason.trim(),
      adminId
    );

    return NextResponse.json({
      success: true,
      result,
      message: `Stock adjusted by ${body.delta > 0 ? '+' : ''}${body.delta}. New balance: ${result.new_quantity}.`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Adjustment failed';
    console.error('[POST /api/admin/inventory/adjust] error:', message);
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
