// app/api/admin/orders/[id]/exception/route.ts — Admin Exception Resolution API Route.
// Allows authorized administrators to allocate inventory or issue refund cancellations on exception-state orders.
// Used in: components/admin/orders/exception-resolution-panel.tsx

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { resolveOrderException } from '@/lib/supabase/queries/admin/orders';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await context.params;

    // 1. Authenticate session & verify admin role
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin privileges required.' }, { status: 403 });
    }

    // 2. Parse payload
    const body = await request.json();
    const { action, warehouseId, notes } = body;

    if (!action || (action !== 'allocate_inventory' && action !== 'refund_and_cancel')) {
      return NextResponse.json({ error: 'Valid action ("allocate_inventory" | "refund_and_cancel") is required.' }, { status: 400 });
    }

    // 3. Execute exception resolution
    const result = await resolveOrderException(
      orderId,
      action,
      user.id,
      { warehouseId, notes }
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to resolve exception.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: action === 'allocate_inventory' ? 'Exception resolved and inventory allocated.' : 'Order cancelled and refund logged.',
    });
  } catch (err: any) {
    console.error('Error in POST /api/admin/orders/[id]/exception:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
