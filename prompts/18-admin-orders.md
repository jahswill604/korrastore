# Prompt: Admin Orders — KorraStore

## Goal

Build `/admin/orders`: list and manage all orders across all buyers — filter by
status, view detail, and manually advance fulfillment status
(sourcing → in transit → stored/delivered) or resolve exception/reconciliation
states. Desktop + mobile, light mode only.

## Skills read

- `.agents/skills/supabase/SKILL.md` — service-role admin queries, audit logging on
  every mutation.
- `02-design-system.md` — `Card`, `StatusStepper`, `Badge`, `Pagination`, `Modal`.
- `AGENTS.md` §7 (order status enum), §8 (exception/reconciliation state), §12
  (`POST /api/admin/orders/[id]/status`).

## Existing code inspected

- `09-order-tracking.md` — the buyer-facing read-only equivalent; this admin view
  adds mutation and cross-buyer visibility.
- `17-admin-dashboard.md` — "Needs attention" links here filtered to
  exception-state orders.

## Decisions / assumptions

- **Status advancement is a controlled action**, not a free-text field — admin picks
  the next valid status from the order's current state (e.g. from `sourcing`, only
  `in_transit` or `cancelled` are valid next steps), preventing invalid transitions.
- **Exception/reconciliation orders** (payment succeeded, inventory couldn't be
  allocated — per `AGENTS.md` §8) are visually flagged distinctly and require an
  explicit admin resolution action (e.g. "Allocate now" once inventory is
  available, or "Refund and cancel") rather than a normal status dropdown.
- **Every status change is written to `audit_logs`** with the admin's identity, the
  order ID, previous status, new status, and timestamp.

## Visual interpretation (light mode only)

### List — Desktop
`AdminNavRail` + content. Filter bar (status `Tabs` including an "Exceptions" tab),
search-by-buyer/order-ID text input. Table (not cards, for admin density): order ID,
buyer (name/email), commodity, quantity, total, payment status `Badge`, fulfillment
status `Badge`, date, "View" action.

### List — Mobile
Table collapses to stacked row-cards (admin mobile use is lower-priority than
desktop, but must remain usable) — same fields, condensed.

### Detail — Desktop
Order summary (buyer info, commodity/grade/quantity/total), `StatusStepper`
(read display), a status-advancement control (dropdown limited to valid next
statuses + "Update status" button), payment record summary, and, if in an
exception state, a distinct resolution panel with the relevant action(s).

### Detail — Mobile
Same content stacked.

## Files likely to change / add

- `app/admin/orders/page.tsx`, `app/admin/orders/[orderId]/page.tsx`.
- `components/admin/orders/orders-table.tsx`, `order-filter-bar.tsx` (client),
  `status-advance-control.tsx` (client), `exception-resolution-panel.tsx` (client).
- `lib/supabase/queries/admin/orders.ts` — `getAllOrders(filters)`,
  `getOrderDetailAdmin(orderId)`, `advanceOrderStatus(orderId, newStatus, adminId)`,
  `resolveOrderException(orderId, action, adminId)`.
- `app/api/admin/orders/[id]/status/route.ts` — `POST`, admin-role-gated.

## Implementation requirements

- Status transitions are validated server-side against an explicit allowed-
  transitions map — never accept an arbitrary status string from the client.
- Every mutation writes an `audit_logs` row in the same transaction as the status
  change.
- Exception resolution that involves allocating inventory calls the Ledger (per
  `28-inventory-ledger.md`), never updates `orders`/`inventory` directly from this
  route.

## Security requirements

- Admin-role-gated at layout, page, and API route level.
- All admin mutations logged to `audit_logs` with the acting admin's identity.

## Acceptance criteria

- List shows all orders with working filters/search, including an Exceptions
  filter.
- Status advancement only allows valid next-state transitions and is logged.
- Exception orders show a distinct resolution panel and resolving one correctly
  updates order/inventory/holding state via the Ledger.
- Layout matches spec at mobile/desktop.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test` (invalid
  status transition rejected; unauthorized non-admin access rejected).

## Manual test steps

1. `npm run dev`; sign in as admin; visit `/admin/orders`.
2. Filter by status and search by a known buyer/order ID; confirm results.
3. Open an order in `sourcing`; advance it to `in_transit`; confirm the buyer's
   `/orders/[orderId]` view reflects the change and `audit_logs` recorded it.
4. Attempt an invalid transition (e.g. `stored` → `sourcing`) via a direct API call;
   confirm server-side rejection.
5. Seed or trigger an exception-state order; confirm the resolution panel appears
   and resolving it correctly updates the ledger/holding.
6. Resize to ~375px and ~1440px — confirm layout matches spec.
