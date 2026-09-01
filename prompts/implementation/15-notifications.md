# Implementation Prompt: Feature 15 — Notifications Center

## Goal
Build `/notifications`: a buyer-facing notification center displaying an in-app feed of essential transactional and market updates (purchases, fulfillment statuses, resale activities, buyback approvals, and commodity price changes). Backed by the unified `notifications` outbox table with channel `'in_app'`, supporting unread tracking, mark-as-read interactions, deep-link navigation, and global navigation badge counter integration. Desktop + mobile, strictly light mode only.

---

## Context Files to Read Before Writing Any Code
1. `prompt/15-notifications.md` & `prompts/15-notifications.md` — canonical feature spec, decisions, and acceptance criteria
2. `AGENTS.md` — architecture, ledger rules, and Feature 15 Notifications Center rules
3. `.agents/skills/supabase/SKILL.md` — DB queries, RLS scoping (`auth.uid() = user_id`), `notifications` table structure
4. `prompts/02-design-system.md` — `Card`, `Badge`, `EmptyState`, `Pagination`, `PriceDisplay`
5. `docs/overview.md` — existing codebase architecture and file maps

---

## Design References
- **Desktop UI**: `prompts/ui degine/15-notifications/desktop-ui.png`
- **Mobile UI**: `prompts/ui degine/15-notifications/mobile-ui.png`
- **Backend Workflow**: `prompts/backend-wookflow/15-notifications/workflow.png`
- **Brand Reference**: `ui refrence/ChatGPT Image Aug 30, 2026, 11_53_48 AM.png`

---

## Design Tokens & Palette (Light Mode Only)

| Token | Value | Usage |
|-------|-------|-------|
| Paper | `#F7F4EA` | Page background, card backgrounds |
| Soil | `#4A3828` | Primary text, titles, headings |
| Harvest Wheat | `#D8B56A` | Active nav rail pill, unread accent left border & dot, 'Mark all as read' |
| Husk | `#A88958` | Secondary labels, timestamps, muted icons |
| Deep Grain Green | `#21483A` | Order/silo status icon, success tags |
| Trust Indigo | `#303B63` | Buyback & informational icons |
| Border | `#E4DCC8` | Card outlines, divider lines |
| Danger | `#B3432E` | Alerts / declined updates |

---

## Database & Schema Considerations
1. **Schema Check**:
   - `notifications` table with columns: `id`, `user_id`, `channel` (`'in_app' | 'email' | 'sms'`), `type` (`'order_status' | 'resale_sold' | 'buyback_status' | 'price_alert' | 'general'`), `title`, `body`, `metadata` (JSONB for links like `order_id`, `listing_id`, `buyback_id`, `commodity_id`), `is_read` (boolean, default `false`), `read_at` (timestamptz, nullable), `created_at`.
   - Index on `(user_id, channel, is_read)` for blazing-fast indexed unread count queries.
2. **RLS Policies**:
   - `SELECT`, `UPDATE` strictly restricted to `auth.uid() = user_id`.

---

## Files to Create & Update

### 1. `lib/supabase/queries/notifications.ts` (New/Update)
- `getInAppNotifications(userId: string, filter?: string)`:
  - Fetches notifications where `user_id = userId` AND `channel = 'in_app'`, ordered by `created_at DESC`.
  - Supports optional category filter (`'all'`, `'unread'`, `'orders'`, `'resale'`, `'buyback'`, `'pricing'`).
- `getUnreadNotificationsCount(userId: string)`:
  - Fast indexed query counting `is_read = false` where `channel = 'in_app'` and `user_id = userId`.
- `markNotificationAsRead(userId: string, notificationId: string)`:
  - Updates `is_read = true` and `read_at = NOW()` for `id = notificationId` and `user_id = userId`.
- `markAllNotificationsAsRead(userId: string)`:
  - Updates all unread in-app notifications for `user_id = userId` to `is_read = true`, `read_at = NOW()`.

### 2. `app/api/notifications/[id]/read/route.ts` (New — POST API)
- Marks a single notification as read for the authenticated session.
- Validates user identity via `supabase.auth.getUser()`.

### 3. `app/api/notifications/read-all/route.ts` (New — POST API)
- Marks all in-app notifications as read for the authenticated user.

### 4. `components/notifications/notification-row.tsx` (New — Client Component)
- Renders individual notification card:
  - Category icon (Silo green for orders, Gold tag for resale, Indigo tick for buyback, Green trend for price alert).
  - Unread visual indicator (Harvest Wheat left border + golden status dot).
  - Title, body snippet, and formatted relative timestamp (e.g., "10m ago", "Yesterday").
  - On click: calls read API, updates local state, and navigates via Next.js router to the target link if specified in metadata.

### 5. `components/notifications/mark-all-read-button.tsx` (New — Client Component)
- Interactive button to mark all notifications as read.
- Desktop: Text button with checkmark icon in header.
- Mobile: Compact icon button in top bar.
- Dispatches server action/API and refreshes router.

### 6. `components/notifications/notification-filters.tsx` (New — Client Component)
- URL-driven tab filters: `All`, `Unread`, `Orders`, `Resale`, `Buyback`, `Pricing`.

### 7. `app/notifications/page.tsx` (New — Server Component)
- Authenticated route via `supabase.auth.getUser()` (redirects to `/login?redirect=/notifications` if unauthenticated).
- Parallel fetching of user notifications and unread count.
- Renders inside `AppShell` with active `Notifications` nav pill.
- Empty state via `EmptyState` component when no notifications match.

### 8. `components/layout/header.tsx` & `components/layout/nav-rail.tsx` (Update)
- Dynamically display unread notification counter badge on the notification bell icon and nav rail items.

---

## Security & Architecture Rules
1. All database operations strictly scoped to `auth.uid() = user_id`.
2. Unread counts run via indexed `SELECT COUNT(*)` to avoid full payload overhead on regular page transitions.
3. Light mode only — no dark mode tokens.

---

## Verification & Checks
```bash
npm run typecheck
npm run lint
npm run build
```
