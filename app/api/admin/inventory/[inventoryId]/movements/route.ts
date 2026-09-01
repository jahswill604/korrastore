// app/api/admin/inventory/[inventoryId]/movements/route.ts — Movement History API for KorraStore.
// GET: returns all inventory_movements for a specific inventory line, most-recent first.
// Security: Admin role verified on every request.
// Used in: components/admin/inventory/movement-history-modal.tsx

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getMovementHistory } from '@/lib/supabase/queries/admin/inventory';

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
// GET /api/admin/inventory/[inventoryId]/movements
// ----------------------------------------------------------------------------

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ inventoryId: string }> }
) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const { inventoryId } = await params;

  if (!inventoryId) {
    return NextResponse.json({ error: 'inventoryId is required' }, { status: 400 });
  }

  const movements = await getMovementHistory(inventoryId);
  return NextResponse.json({ movements });
}
