# Prompt: Admin Support Tools — KorraStore

## Goal

Build `/admin/support`: a lookup tool for support staff to find a specific user and
see a unified view of their orders, holdings, resale listings, buyback requests,
and notifications — for answering support questions and resolving disputes.
Desktop + mobile, light mode only. Read-mostly, with narrow, explicit override
actions (not a general-purpose edit-anything panel).

## Skills read

- `.agents/skills/supabase/SKILL.md` — service-role cross-table admin reads scoped
  to a specific `userId`.
- `02-design-system.md` — `Card`, `Tabs`, `Badge`, `Pagination`.
- `AGENTS.md` §13 (admins see real identity; every mutation still goes through the
  Ledger/Payments/audit rules — support tools don't bypass them).

## Existing code inspected

- `18-admin-orders.md`, `21-admin-resale-buyback.md` — this page links out to those
  for actual mutations rather than duplicating their action logic; support search
  is a fast way to *find* the relevant records, not a parallel mutation surface.

## Decisions / assumptions

- **Search by email, phone, or user ID** returns a single matched user's unified
  profile view.
- **Unified view is read-only tabs**: Orders, Holdings, Resale Listings, Buyback
  Requests, Notifications — each reusing the admin table/list components already
  built (`18-admin-orders.md`'s table, etc.) filtered to this one user, with "View
  full record" links out to the canonical admin page for any action.
- **One narrow override action** lives here: manually resending a notification
  (e.g. a receipt email that failed to send) — since that's a common, low-risk
  support task that doesn't fit naturally under Orders/Resale/Buyback admin pages.

## Visual interpretation (light mode only)

### Search — Desktop & Mobile
A single centered search input at the top ("Search by email, phone, or user ID"),
submit button. No results shown until a search is performed.

### Unified view — Desktop
User header (name, email, phone, `role` badge, signup date). Below: `Tabs` (Orders /
Holdings / Resale / Buybacks / Notifications), each rendering the relevant filtered
table reusing existing admin table components. A "Resend notification" action
appears on individual notification rows within the Notifications tab.

### Unified view — Mobile
Same structure, tabs as a horizontally scrollable segmented row, tables collapse to
stacked cards (reusing the same collapse pattern as their canonical admin pages).

## Files likely to change / add

- `app/admin/support/page.tsx`.
- `components/admin/support/user-search.tsx` (client), `user-summary-header.tsx`,
  `user-detail-tabs.tsx` (client — tab state), `resend-notification-button.tsx`
  (client).
- `lib/supabase/queries/admin/support.ts` — `findUserByQuery(query)`,
  `getUserUnifiedView(userId)` (composes existing admin query functions filtered to
  one user rather than duplicating query logic).
- `app/api/admin/notifications/[id]/resend/route.ts` — `POST`, admin-role-gated.

## Implementation requirements

- Reuses existing admin table components/query functions filtered by `userId`
  rather than forking parallel implementations.
- Resending a notification re-enqueues it to the outbox (same mechanism as the
  original send), never bypasses the outbox to call Resend/Termii directly.

## Security requirements

- Admin-role-gated at layout, page, and API route level.
- Search results and unified view are only reachable within the admin-role-gated
  tree.

## Acceptance criteria

- Searching by email/phone/user ID correctly finds and displays the matching
  user's unified record.
- Each tab shows accurate, correctly filtered data for that user.
- Resend-notification action successfully re-enqueues and is logged.
- Layout matches spec at mobile/desktop.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`.

## Manual test steps

1. `npm run dev`; sign in as admin; visit `/admin/support`, search for a known test
   buyer by email.
2. Confirm the unified view shows accurate orders/holdings/resale/buyback/
   notification data for that user.
3. Resend a notification; confirm it re-enqueues and is logged in `audit_logs`.
4. Search for a nonexistent user; confirm a clear "no results" state.
5. Resize to ~375px and ~1440px — confirm layout matches spec.
