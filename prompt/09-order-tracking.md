# Prompt: Order Tracking — KorraStore

## Goal

Build `/orders` (list) and `/orders/[orderId]` (detail): a buyer's order history and
per-order fulfillment progress — sourcing → in transit → stored/delivered — per
`AGENTS.md` §7's order lifecycle. Desktop + mobile, light mode only. Read-only; this
prompt does not change order status (that's admin-only, `18-admin-orders.md`).

## Skills read

- `.agents/skills/supabase/SKILL.md` — order reads scoped to the owning buyer.
- `02-design-system.md` — `Card`, `StatusStepper`, `PriceDisplay`, `Badge`,
  `EmptyState`, `Pagination`.
- `40-order-status-stepper.md` — the stepper component this page's detail view
  relies on (build the shared component there; this page consumes it).
- `AGENTS.md` §7 (order status enum, payment status separate from fulfillment).

## Existing code inspected

- `08-checkout.md` — orders are created here as `pending_payment`; this prompt is
  the buyer-facing view of their subsequent progress.
- `26-paystack-webhook.md` — advances `pending_payment → paid` and beyond; not
  built yet at this point in the phase sequence, so this prompt should tolerate
  orders sitting at `pending_payment` in dev/test without erroring.

## Decisions / assumptions

- **List view is a simple reverse-chronological list**, filterable by status
  (All / In progress / Stored / Delivered / Cancelled), no pagination complexity
  beyond the shared `Pagination` primitive.
- **Detail view's stepper reflects fulfillment status only**; payment status
  (`payments` table) is shown separately as a small badge, not merged into the
  stepper, per `AGENTS.md` §7's separation of payment vs. fulfillment status.
- **Cancelled/failed orders** show a distinct non-stepper state (a clear "Order
  cancelled" / "Payment failed" message) rather than forcing them into the
  stepper's visual language.

## Visual interpretation (light mode only)

### List — Desktop
Content max-width ~900px. Status filter `Tabs` at top. Below: a stacked list of
order rows (`Card`, full width) — commodity name + `GradeBadge`, quantity, total
price (`PriceDisplay`), order date, current status `Badge`, "View details" link.

### List — Mobile
Same rows, full width, status filter as a horizontally scrollable segmented row.

### Detail — Desktop
Header: order ID, date, total (`PriceDisplay`). `StatusStepper` (sourcing → in
transit → stored/delivered) prominent near the top, current step highlighted.
Below: order summary card (commodity, grade, quantity, unit price, total), payment
status `Badge` (separate from the stepper), and, once `stored`, a link to the
resulting holding in My Storage and to the receipt (`11-receipt-detail.md`).

### Detail — Mobile
Same content stacked, stepper rendered as a compact vertical list rather than a
horizontal stepper if space is tight (confirm which reads better at ~375px during
implementation and pick one consistently).

### Empty state
No orders yet → `EmptyState` pointing back to `/home` ("You haven't bought anything
yet — browse the marketplace").

## Files likely to change / add

- `app/orders/page.tsx`, `app/orders/[orderId]/page.tsx` — Server Components.
- `components/orders/order-row.tsx`, `order-status-filter.tsx` (client — URL param
  state), `order-summary-card.tsx`.
- `lib/supabase/queries/orders.ts` — add `getBuyerOrders(userId, filters)`,
  `getOrderDetail(userId, orderId)`.

## Implementation requirements

- Server Component pages; filter control is the only client boundary on the list
  page.
- Order detail must 404/redirect (not leak data) if the order does not belong to
  the requesting buyer — enforced by RLS, verified here.

## Security requirements

- All reads scoped to `auth.uid()` via RLS; a buyer cannot view another buyer's
  order by guessing an `orderId`.

## Acceptance criteria

- List shows all of the buyer's orders with working status filtering.
- Detail view shows the correct stepper state, payment status badge, and links to
  the holding/receipt once `stored`.
- Cancelled/failed orders render their distinct state, not a broken stepper.
- Layout matches spec at mobile/desktop.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`.

## Manual test steps

1. `npm run dev`; sign in as a buyer with at least one order in a non-terminal
   status; visit `/orders`.
2. Filter by status; confirm the list updates correctly.
3. Open an order's detail page; confirm the stepper and payment badge reflect the
   real order/payment state.
4. Seed or reach a `stored` order; confirm the holding/receipt links appear and
   work.
5. Seed a `cancelled` or `failed` order; confirm its distinct non-stepper state
   renders correctly.
6. Attempt to visit another user's `orderId` directly — confirm it's blocked.
7. Resize to ~375px and ~1440px — confirm layout matches spec.
