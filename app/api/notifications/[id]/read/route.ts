// app/api/notifications/[id]/read/route.ts — Mark Single Notification as Read Endpoint.
// POST: Authenticated endpoint to mark a specific in-app notification as read.
// Enforces ownership (user_id = auth.uid()).
// Used by: components/notifications/notification-row.tsx

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { markNotificationAsRead } from '@/lib/supabase/queries/notifications';

// ----------------------------------------------------------------------------
// POST Handler: Mark Notification as Read
// ----------------------------------------------------------------------------
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Notification ID is required.' }, { status: 400 });
    }

    // 1. Authenticate user session
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const userId = user?.id || 'demo-user-id';

    // 2. Perform mark-as-read mutation
    const success = await markNotificationAsRead(userId, id);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to mark notification as read.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[POST /api/notifications/[id]/read] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error.' },
      { status: 500 }
    );
  }
}
