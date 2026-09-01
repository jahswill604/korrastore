-- ==============================================================================
-- Migration: 0008_notifications_in_app.sql — In-App Notifications Support
-- Description: Adds is_read, read_at, and type columns to the notifications
--              table to support first-class in-app notification center, read status
--              tracking, and high-performance indexed unread count queries.
-- ==============================================================================

-- Add is_read, read_at, and type columns to notifications
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'general';

-- Index for blazing-fast indexed unread count queries scoped to in_app channel
CREATE INDEX IF NOT EXISTS idx_notifications_in_app_unread
  ON notifications(user_id, is_read)
  WHERE channel = 'in_app';

-- Index for ordering in-app notifications chronologically by created_at
CREATE INDEX IF NOT EXISTS idx_notifications_in_app_created
  ON notifications(user_id, created_at DESC)
  WHERE channel = 'in_app';

-- Comments
COMMENT ON COLUMN notifications.is_read IS 'Read receipt flag for in-app notifications.';
COMMENT ON COLUMN notifications.read_at IS 'Timestamp when the notification was marked as read by the user.';
COMMENT ON COLUMN notifications.type IS 'Notification event classification (order_status, resale_sold, buyback_status, price_alert, general).';
