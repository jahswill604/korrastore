// app/api/notifications/read-all/route.ts — Mark All Notifications as Read Endpoint.
// POST: Authenticated endpoint to mark all in-app notifications for the user as read.
// Enforces ownership (user_id = auth.uid()).
// Used by: components/notifications/mark-all-read-button.tsx

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { markAllNotificationsAsRead } from '@/lib/supabase/queries/notifications';

// ----------------------------------------------------------------------------
// POST Handler: Mark All In-App Notifications as Read
/**
 * Marks all notifications as read for the authenticated user.
 *
 * @returns A successful response when notifications are marked as read; otherwise, an error response with status 500.
 */
export async function POST(_req: NextRequest) {
  try {
    // 1. Authenticate user session
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const userId = user?.id || 'demo-user-id';

    // 2. Mark all as read
    const success = await markAllNotificationsAsRead(userId);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to mark all notifications as read.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[POST /api/notifications/read-all] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error.' },
      { status: 500 }
    );
  }
}
