# Prompt: Create & Manage Resale Listings — KorraStore

## Goal

Build the seller-side resale flow: creating a listing against an owned holding
(from `/my-storage`), and a `/resale/my-listings` view to manage (edit price,
cancel) active/sold/expired listings. Desktop + mobile, light mode only.

## Skills read

- `.agents/skills/supabase/SKILL.md` — the reservation/locking function (reserves
  quantity on the holding when a listing is created), RLS for
  `resale_listings`/`resale_transactions`.
- `02-design-system.md` — `Card`, `QuantitySelector`, `PriceDisplay`, `GradeBadge`,
  `Badge`, `Modal`.
- `10-my-storage.md` — the "Resell" action on a holding card opens this flow.
- `AGENTS.md` §10 (resale reserves quantity, peer-to-peer only, KorraStore never
  auto-buys).

## Existing code inspected

- `10-my-storage.md` — "Resell" button per holding, currently stubbed/linking
  nowhere; this prompt implements the destination.
- `03-database-schema.md` — reservation function, `resale_listings` schema.

## Decisions / assumptions

- **Listing creation is a modal/sheet** launched from a holding card, not a
  separate full page — pre-fills commodity/grade from the holding, asks for
  quantity (clamped to the holding's *available*, non-reserved quantity) and asking
  price per unit.
- **An optional expiration** (e.g. 7/14/30 days, defaulting to 30) is set at
  creation; expired listings are released automatically by the stale-listing
  cleanup cron (`AGENTS.md` §18, implemented in a later infrastructure prompt) —
  this prompt only sets the `expires_at` value, not the cleanup job itself.
- **Editing** an active listing is limited to price (not quantity — cancel and
  recreate for a quantity change, to keep the reservation logic simple).
- **Cancelling** a listing releases its reserved quantity back to the holding
  immediately via the same locking function used to reserve it.

## Visual interpretation (light mode only)

### Create-listing modal — Desktop & Mobile
Modal (desktop) / full-screen sheet (mobile): commodity + `GradeBadge` (read-only,
from the selected holding), `QuantitySelector` clamped to available quantity,
asking-price input (per unit, with computed total shown live), expiration selector
(segmented control: 7/14/30 days), "List for resale" primary `Button`, cancel/close
affordance.

### My Listings — Desktop
Content max-width ~900px. Status filter `Tabs` (Active / Sold / Expired /
Cancelled). List of listing rows (`Card`): commodity, `GradeBadge`, quantity,
asking price, status `Badge`, listed date, and for Active listings: "Edit price"
and "Cancel listing" actions.

### My Listings — Mobile
Same rows, full width, status filter as a horizontally scrollable segmented row.

## Files likely to change / add

- `app/resale/my-listings/page.tsx` — Server Component.
- `components/resale/create-listing-modal.tsx` (client), `my-listing-row.tsx`,
  `edit-price-modal.tsx` (client), `cancel-listing-confirm.tsx` (client —
  confirmation dialog, per `42-confirmation-dialogs.md`'s pattern).
- `lib/supabase/queries/resale.ts` — add `createResaleListing(...)`,
  `getMyListings(userId, filters)`, `updateListingPrice(...)`,
  `cancelListing(...)`.
- `app/api/resale/route.ts` — `POST`, buyer-session-authenticated: validates
  available quantity, calls the reservation function, creates the listing.
- `app/api/resale/[id]/cancel/route.ts` — `POST`: releases the reservation, sets
  status `cancelled`.

## Implementation requirements

- Listing creation reserves quantity via the locking function in the same
  transaction as the insert — never reserve-then-insert as two separate calls.
- Cancelling always releases the exact reserved quantity back to the holding.
- `"use client"` scoped to the modals and the filter control.

## Security requirements

- A seller can only create/edit/cancel listings against their own holdings,
  enforced by RLS + explicit ownership checks in the route handlers.

## Acceptance criteria

- Creating a listing correctly reduces the holding's available quantity (reserved
  increases by the same amount) and appears in `/resale` for other buyers.
- Editing price updates the public listing without affecting reservation.
- Cancelling releases the reserved quantity back to the holding immediately,
  reflected in `/my-storage`.
- Attempting to list more than the available (non-reserved) quantity is rejected.
- Layout matches spec at mobile/desktop.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test` (partial
  resale and "resale of unavailable quantity" tests per `AGENTS.md` §19).

## Manual test steps

1. `npm run dev`; sign in as a buyer with a `stored` holding; go to `/my-storage`,
   click "Resell" on a holding.
2. Create a listing for part of the holding's quantity; confirm the holding's
   available/reserved split updates correctly.
3. Confirm the listing appears in `/resale` for another test account.
4. Edit the listing's price; confirm it updates without changing reservation.
5. Cancel the listing; confirm the reserved quantity is released back to the
   holding.
6. Attempt to list more than the currently available quantity; confirm it's
   rejected with a clear message.
7. Resize to ~375px and ~1440px — confirm layout matches spec.
