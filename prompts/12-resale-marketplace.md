# Prompt: Resale Marketplace (Browse) — KorraStore

## Goal

Build `/resale`: browse active peer-to-peer resale listings from other buyers, with
anonymized seller identity, and a path into purchasing a listing. Desktop + mobile,
light mode only. This prompt covers **browsing and buying** a resale listing;
**creating/managing your own listings** is `13-create-resale.md`.

## Skills read

- `.agents/skills/supabase/SKILL.md` — the `resale_listings_public` view (excludes
  seller identity), reservation/locking function for completing a purchase.
- `.agents/skills/paystack/SKILL.md` — resale purchases are paid the same way as
  primary purchases (Paystack), reusing the `PaymentProvider` adapter.
- `02-design-system.md` — `Card`, `GradeBadge`, `PriceDisplay`, `EmptyState`,
  `Pagination`.
- `AGENTS.md` §10 (resale is peer-to-peer only, seller anonymized to buyers).

## Existing code inspected

- `03-database-schema.md` — `resale_listings_public` view.
- `08-checkout.md` — reuse the `PaymentProvider`/order-creation pattern; a resale
  purchase creates an order referencing the resale listing rather than primary
  inventory.

## Decisions / assumptions

- **Listings show**: commodity, grade, quantity, asking price (per unit + total),
  anonymized seller label ("KorraStore Seller #4821"), and a listed-date. No seller
  name/phone/email anywhere in this buyer-facing view.
- **Buying a resale listing** follows the same pending-order → Paystack →
  webhook-confirms pattern as primary checkout, but the webhook's fulfillment step
  (per `AGENTS.md` §10) transfers the reserved quantity from the seller's holding to
  a new holding for the buyer via `holding_movements`, instead of allocating from
  platform inventory. That ledger transfer logic is implemented in
  `29-holdings-ledger.md`; this prompt's checkout-adjacent flow just creates the
  order/payment referencing the listing.
- **Filter/sort** mirrors `06-home-browse.md`'s pattern (commodity type, sort by
  price) for consistency.

## Visual interpretation (light mode only)

### Layout — Desktop (≥1024px)
Top: H1 "Resale Marketplace" + subcopy explaining peer-to-peer resale briefly.
Filter/sort bar (same pattern as `06-home-browse.md`). Grid (3 columns) of listing
cards: commodity name, `GradeBadge`, quantity, asking price (`PriceDisplay`),
anonymized seller label (small, `text-tertiary`), listed date, "Buy this listing"
button.

### Layout — Mobile (<640px)
Same content, filter bar horizontally scrollable, cards stack single-column.

### Empty state
No active listings for the current filter → `EmptyState` ("No resale listings match
your filters right now").

## Files likely to change / add

- `app/resale/page.tsx` — Server Component.
- `components/resale/resale-filter-bar.tsx` (client), `resale-listing-card.tsx`.
- `lib/supabase/queries/resale.ts` — `getActiveResaleListings(filters)` (reads from
  `resale_listings_public`).
- `app/api/resale/[id]/buy/route.ts` — `POST`, buyer-session-authenticated: creates
  a `pending_payment` order referencing the resale listing, reserves it against
  double-sale via the locking function, initializes Paystack payment.

## Implementation requirements

- All buyer-facing listing reads go through `resale_listings_public` — never the
  base `resale_listings` table directly from buyer-facing code.
- Buying a listing must atomically check the listing is still active/available
  before creating the order (use the locking reservation function from
  `03-database-schema.md`) to prevent two buyers purchasing the same listing
  simultaneously.
- `"use client"` scoped to the filter bar and the buy-button's loading state.

## Security requirements

- Seller identity never reaches buyer-facing responses or client code.
- Concurrent-purchase safety enforced via the locking function, not
  read-then-write application logic.

## Acceptance criteria

- Browse shows only active, anonymized listings with working filter/sort.
- Buying a listing creates a pending order and redirects to Paystack, matching the
  primary checkout pattern.
- Two simultaneous purchase attempts on the same listing: exactly one succeeds, per
  `AGENTS.md` §19's concurrency test requirement.
- Layout matches spec at mobile/desktop.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test` (concurrent
  resale purchase test per `AGENTS.md` §19).

## Manual test steps

1. `npm run dev`; seed an active resale listing from a test seller account (once
   `13-create-resale.md` exists); sign in as a different buyer; visit `/resale`.
2. Confirm the listing renders with an anonymized seller label, no real identity.
3. Filter/sort; confirm the grid updates correctly.
4. Buy the listing — confirm redirect to Paystack and a pending order created.
5. Simulate two near-simultaneous buy attempts on the same listing (e.g. two
   browser sessions) — confirm only one succeeds and the other gets a clear
   "no longer available" response.
6. Resize to ~375px and ~1440px — confirm layout matches spec.
