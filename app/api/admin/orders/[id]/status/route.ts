// app/api/admin/orders/[id]/status/route.ts — Admin Controlled Status Advancement Route.
// Enforces admin role verification, validates transitions against the state machine, and updates order status.
// Used in: components/admin/orders/status-advance-control.tsx

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { advanceOrderStatus, ALLOWED_STATUS_TRANSITIONS } from '@/lib/supabase/queries/admin/orders';
import { OrderFulfillmentStatus } from '@/lib/supabase/queries/orders';

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
    const { targetStatus, notes } = body;

    if (!targetStatus) {
      return NextResponse.json({ error: 'targetStatus is required.' }, { status: 400 });
    }

    // 3. Execute controlled status advancement
    const result = await advanceOrderStatus(
      orderId,
      targetStatus as OrderFulfillmentStatus,
      user.id,
      notes
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to update status.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Order status advanced to ${targetStatus}.`,
      updatedStatus: result.updatedStatus,
    });
  } catch (err: any) {
    console.error('Error in POST /api/admin/orders/[id]/status:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
