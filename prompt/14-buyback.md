# Prompt: Buyback Flow — KorraStore

## Goal

Build the buyback request flow: viewing the current platform buyback price for a
holding's commodity/grade, submitting a request, and tracking its
pending/approved/rejected/paid status at `/buyback` and `/buyback/[requestId]`.
Desktop + mobile, light mode only. Buyback is user → KorraStore directly, entirely
separate from peer-to-peer resale, per `AGENTS.md` §11.

## Skills read

- `.agents/skills/supabase/SKILL.md` — the reservation/locking function (reserves
  quantity on buyback request, same mechanism as resale), RLS for
  `buyback_requests`.
- `02-design-system.md` — `Card`, `QuantitySelector`, `PriceDisplay`, `Badge`,
  `StatusStepper` (or a simpler status badge — buyback has fewer states than order
  fulfillment; decide during implementation whether the shared stepper fits or a
  simple `Badge` timeline reads better).
- `10-my-storage.md` — "Request buyback" action on a holding card opens this flow.
- `AGENTS.md` §11 (buyback lifecycle, admin-only approval).

## Existing code inspected

- `10-my-storage.md` — "Request buyback" button, currently stubbed.
- `03-database-schema.md` — `buyback_requests` schema, reservation function.

## Decisions / assumptions

- **Buyback price is admin-controlled**, read from `commodities`/`price_history`
  (a distinct "buyback price" field, separate from the retail/sale price — confirm
  the exact schema field during `03-database-schema.md`'s implementation; if a
  single `current_price` was used there without a separate buyback price, this
  prompt should flag that gap and add a `buyback_price` column rather than
  conflating it with the sale price, since buyback and retail prices are commonly
  different in a real commodity marketplace).
- **Request flow is a modal/sheet** from the holding card, similar to resale
  creation: shows current buyback price, `QuantitySelector` clamped to available
  quantity, computed payout total, "Submit buyback request" button.
- **Status list view** (`/buyback`) shows all of a buyer's requests across all
  holdings with their current status; detail view shows the specific request's
  timeline (submitted → approved/rejected → paid).

## Visual interpretation (light mode only)

### Request modal — Desktop & Mobile
Modal (desktop) / sheet (mobile): commodity + `GradeBadge` (from the holding),
current buyback price per unit (`PriceDisplay`), `QuantitySelector` clamped to
available quantity, computed total payout, a short note ("Buyback requests are
reviewed by KorraStore and typically processed within [timeframe]"), "Submit
request" button.

### Buyback list — Desktop
Content max-width ~900px. List of request rows (`Card`): commodity,
`GradeBadge`, quantity, requested payout (`PriceDisplay`), status `Badge`
(pending/approved/rejected/paid — pending/approved use Harvest Wheat/Husk, paid
uses Deep Grain Green, rejected uses danger), request date.

### Buyback list — Mobile
Same rows, full width.

### Detail view (both breakpoints)
Simple vertical timeline: Submitted (date) → Approved/Rejected (date, with a short
admin note if rejected) → Paid (date, payout amount), each step showing a
timestamp only once reached; future steps shown muted/pending.

## Files likely to change / add

- `app/buyback/page.tsx`, `app/buyback/[requestId]/page.tsx` — Server Components.
- `components/buyback/request-modal.tsx` (client), `buyback-row.tsx`,
  `buyback-timeline.tsx`.
- `lib/supabase/queries/buyback.ts` — `submitBuybackRequest(...)`,
  `getBuyerBuybackRequests(userId)`, `getBuybackRequestDetail(userId, requestId)`.
- `app/api/buybacks/route.ts` — `POST`, buyer-session-authenticated: validates
  available quantity, reserves it via the locking function, creates the request as
  `pending`.
- `supabase/migrations/000X_add_buyback_price.sql` — add `buyback_price` to
  `commodities` (or `commodity_grades`, if buyback price varies by grade — confirm
  during implementation) if not already present.

## Implementation requirements

- Submitting a request reserves the requested quantity via the same locking
  function used by resale, in the same transaction as the insert.
- Buyback price shown to the buyer always reflects the live admin-set value, never
  a cached/stale price.
- `"use client"` scoped to the request modal only.

## Security requirements

- A buyer can only submit buyback requests against their own holdings; reads/writes
  scoped via RLS.
- Approval/rejection/payout is admin-only (`21-admin-resale-buyback.md`) — no
  client-facing path can change a request's status.

## Acceptance criteria

- Submitting a request reserves the correct quantity on the holding and appears
  in `/buyback` with `pending` status.
- Attempting to request more than available (non-reserved) quantity is rejected.
- Status timeline accurately reflects the request's real state as an admin
  processes it (verify once `21-admin-resale-buyback.md` exists).
- Layout matches spec at mobile/desktop.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test` ("buyback of
  unavailable quantity" test per `AGENTS.md` §19).

## Manual test steps

1. `npm run dev`; sign in as a buyer with a `stored` holding; go to `/my-storage`,
   click "Request buyback".
2. Submit a request for part of the holding; confirm it appears in `/buyback` as
   `pending` and the holding's available/reserved split updates.
3. Attempt to request more than the available quantity; confirm rejection.
4. Once `21-admin-resale-buyback.md` exists, have an admin approve/reject/pay the
   request; confirm the buyer's detail timeline updates correctly.
5. Resize to ~375px and ~1440px — confirm layout matches spec.
