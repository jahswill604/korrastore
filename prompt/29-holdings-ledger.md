# Prompt: Holdings Ledger Domain Service — KorraStore

## Goal

Extract and finalize the Holdings Ledger as a proper domain service at
`lib/domain/ledger/holdings-ledger.ts`, consolidating every function that creates,
splits, transfers, or reduces a `holding`, so there is exactly one code path that
ever writes `holding_movements` or updates a holding's cached `quantity`/
`reserved_quantity`. Backend only.

## Skills read

- `.agents/skills/supabase/SKILL.md` — ledger-only balance-write rule, concurrency-
  locking RPC pattern, "never merge holdings from different acquisitions" rule.
- `AGENTS.md` §7 (holdings can split, never silently merge), §9 (ledger authority),
  §10/§11 (resale and buyback both mutate holdings through this service).

## Existing code inspected

- `26-paystack-webhook.md` — creates a new holding on primary purchase, and (for
  resale purchases) transfers quantity from seller to buyer.
- `13-create-resale.md` — reserves quantity on listing creation, releases on
  cancellation/expiration.
- `14-buyback.md` — reserves quantity on request submission.
- `21-admin-resale-buyback.md` — releases reservation on rejection/cancellation,
  debits the holding on buyback approval.

## Decisions / assumptions

- **One exported service** with functions: `createHoldingFromOrder(orderId,
  items)` (BUY), `reserveQuantity(holdingId, quantity, reference)` (used by both
  resale-listing creation and buyback-request submission), `releaseReservation
  (holdingId, quantity, reference)` (cancellation/rejection/expiration),
  `transferOnResale(listingId, buyerOrderId)` (RESALE — debits seller's holding,
  reserved quantity, creates/credits buyer's holding), `debitForBuyback
  (holdingId, quantity, buybackRequestId)` (BUYBACK), `debitForDelivery
  (holdingId, quantity, deliveryRequestId)` (DELIVERY, if/when a delivery-request
  flow is built beyond what's in `10-my-storage.md`'s stubbed action).
- **Holdings are never merged.** `createHoldingFromOrder` always creates a new
  `holdings` row per order, even if the buyer already holds the same commodity/
  grade from a prior purchase.

## Files likely to change / add

- `lib/domain/ledger/holdings-ledger.ts` — the consolidated service.
- Update `26-paystack-webhook.md`, `13-create-resale.md`, `14-buyback.md`,
  `21-admin-resale-buyback.md` call sites to import from here instead of any
  inline duplicate logic.
- `lib/domain/ledger/__tests__/holdings-ledger.test.ts` — covers partial resale,
  double-reservation prevention, and balance consistency.

## Implementation requirements

- Every function delegates the actual balance mutation to the Postgres locking
  function(s) from `03-database-schema.md` — no direct `UPDATE holdings SET
  quantity = ...` in application code.
- `reserveQuantity` always checks *available* (quantity − already-reserved), never
  raw total quantity, before reserving.
- Every write produces a matching `holding_movements` row referencing its origin
  (order, resale transaction, buyback request, delivery request, or admin
  adjustment).

## Security requirements

- This module is only ever imported by server-only code (webhook handler, resale/
  buyback API routes, admin routes) — never by anything client-reachable.

## Acceptance criteria

- All prior call sites now import from this single module with no behavior
  change.
- A holding's cached `quantity`/`reserved_quantity` always equals what its
  `holding_movements` history implies.
- Attempting to reserve more than available quantity (across any of resale,
  buyback, or a combination of both simultaneously) is rejected, never allowed to
  go negative.
- Partial resale correctly leaves the remainder as a smaller holding with intact
  original purchase-price/date/grade/warehouse data.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test` — must
  include, per `AGENTS.md` §19: partial resale, attempted resale of unavailable
  quantity, buyback of unavailable quantity, concurrent quantity changes,
  inventory/holding balance consistency.

## Manual test steps

1. Re-run the manual test flows from `13-create-resale.md`, `14-buyback.md`, and
   `21-admin-resale-buyback.md` post-refactor; confirm identical behavior.
2. Create a resale listing for part of a holding, then attempt a buyback request
   against more than the now-reduced available quantity — confirm rejection.
3. Attempt two near-simultaneous reservations (one resale, one buyback) against the
   same holding that together exceed its available quantity — confirm only the
   combination that fits succeeds.
4. Sum a test holding's `holding_movements` and confirm it matches the cached
   `quantity`/`reserved_quantity` exactly.
