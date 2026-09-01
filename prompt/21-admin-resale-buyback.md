# Prompt: Admin Resale & Buyback Management — KorraStore

## Goal

Build `/admin/resale` and `/admin/buybacks`: admin visibility into all resale
listings/transactions (including real, non-anonymized seller identity for support/
disputes/compliance) and the buyback approval/rejection/payout workflow. Desktop +
mobile, light mode only.

## Skills read

- `.agents/skills/supabase/SKILL.md` — admin reads against the base
  `resale_listings` table (not the anonymized public view — admins see real seller
  identity per `AGENTS.md` §10), the locking function for buyback approval.
- `.agents/skills/paystack/SKILL.md` — buyback payout initiation via the
  `PaymentProvider` adapter.
- `02-design-system.md` — `Card`, `Badge`, `Modal`, `Pagination`.
- `AGENTS.md` §10 (resale, seller identity visible to admins), §11 (buyback
  approval flow), §12 (`POST /api/admin/buybacks/[id]/approve` and `/reject`).

## Existing code inspected

- `12-resale-marketplace.md` / `13-create-resale.md` — the anonymized buyer-facing
  views; this admin view is the non-anonymized counterpart.
- `14-buyback.md` — buyer-facing request submission; this is the admin processing
  side.

## Decisions / assumptions

- **Resale admin view is read-mostly** — admins can view all listings/transactions
  (with real seller/buyer identity) for support and dispute resolution, and have a
  "Cancel listing" override action for policy violations, but do not create
  listings on a user's behalf.
- **Buyback admin view is the primary workflow surface**: a queue of `pending`
  requests, each with "Approve" and "Reject" actions; approving triggers the
  Ledger to reduce the holding and the Payments service to initiate payout (per
  `AGENTS.md` §11); rejecting requires a reason, releases the reservation, and
  notifies the buyer.

## Visual interpretation (light mode only)

### Resale admin — Desktop
Filter bar (status, commodity). Table: listing ID, seller (real name/email —
explicitly not anonymized here), commodity, grade, quantity, price, status, listed
date, "View" / "Cancel listing" actions.

### Resale admin — Mobile
Table collapses to stacked cards.

### Buyback admin — Desktop
Status `Tabs` (Pending / Approved / Rejected / Paid), Pending tab prioritized/
default. Table: request ID, buyer (real identity), commodity, grade, quantity,
payout amount, requested date, "Approve" / "Reject" actions inline for Pending
rows. Approve opens a confirmation modal (payout amount, confirm payout method);
Reject opens a modal requiring a reason.

### Buyback admin — Mobile
Same tabs/table pattern, collapsed to stacked cards with the same actions.

## Files likely to change / add

- `app/admin/resale/page.tsx`, `app/admin/buybacks/page.tsx`.
- `components/admin/resale/resale-admin-table.tsx`, `cancel-listing-modal.tsx`
  (client).
- `components/admin/buybacks/buyback-queue-table.tsx`, `approve-modal.tsx`
  (client), `reject-modal.tsx` (client).
- `lib/supabase/queries/admin/resale.ts` — `getAllResaleListings(filters)`,
  `adminCancelListing(listingId, adminId)`.
- `lib/supabase/queries/admin/buybacks.ts` — `getBuybackRequests(filters)`,
  `approveBuyback(requestId, adminId)`, `rejectBuyback(requestId, reason, adminId)`.
- `app/api/admin/buybacks/[id]/approve/route.ts`,
  `app/api/admin/buybacks/[id]/reject/route.ts` — `POST`, admin-role-gated.

## Implementation requirements

- Approving a buyback: Ledger writes a `BUYBACK` movement reducing the holding,
  Payments initiates payout via the `PaymentProvider` adapter, status →
  `approved` then `paid` once payout confirms (or `approved` immediately with a
  separate payout-confirmation step, depending on the payout provider's
  synchronicity — confirm during implementation and reflect the real flow, don't
  assume instant payout).
- Rejecting a buyback releases the reserved quantity back to the holding via the
  same locking function used to reserve it.
- Every approve/reject/cancel action writes to `audit_logs` with the admin's
  identity and reason (for rejections/cancellations).

## Security requirements

- Admin-role-gated at layout, page, and API route level.
- Real seller/buyer identity is only ever rendered inside this admin-role-gated
  tree — never leaked into any buyer-facing response.

## Acceptance criteria

- Resale admin view shows real seller identity and supports listing cancellation
  with correct reservation release.
- Buyback queue correctly processes approve (Ledger debit + payout) and reject
  (reservation release + reason recorded) flows.
- All actions are logged to `audit_logs`.
- Layout matches spec at mobile/desktop.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test`
  (unauthorized admin access; buyback approval reduces holding correctly).

## Manual test steps

1. `npm run dev`; sign in as admin; visit `/admin/resale` — confirm real seller
   identity is visible (unlike the buyer-facing `/resale` view).
2. Cancel a test listing; confirm its reservation is released back to the seller's
   holding.
3. Visit `/admin/buybacks`; approve a pending request; confirm the holding is
   debited via the Ledger and payout is initiated.
4. Reject a different pending request with a reason; confirm the reservation is
   released and the buyer sees the rejection reason in `/buyback/[requestId]`.
5. Resize to ~375px and ~1440px — confirm layout matches spec.
