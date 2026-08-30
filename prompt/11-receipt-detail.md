# Prompt: Receipt Detail — KorraStore

## Goal

Build `/receipts/[receiptId]`: the full digital ownership receipt view for a
completed purchase — the app's signature "physical ledger ticket" moment — plus a
downloadable/shareable version. Desktop + mobile, light mode only.

## Skills read

- `.agents/skills/supabase/SKILL.md` — Storage signed URLs for the underlying
  receipt file.
- `02-design-system.md` — the `LedgerReceipt` primitive (built there; this page
  composes it with real data at full size).
- `AGENTS.md` §8 (receipt issued as part of the purchase pipeline), §7 (`receipts`
  table).

## Existing code inspected

- `02-design-system.md` — `LedgerReceipt` component shell.
- `09-order-tracking.md` — order detail links here once an order reaches `stored`.
- `26-paystack-webhook.md` (later prompt) — actually generates and stores the
  receipt file; this prompt renders it, tolerating "receipt not yet generated" for
  orders not yet at that stage during earlier-phase testing.

## Decisions / assumptions

- **The on-page receipt is rendered from structured data** (commodity, quantity,
  grade, purchase value, current value, ownership status, order/receipt IDs, date),
  not just an embedded image of a generated PDF — so it can update its "current
  value" live even though the receipt was issued at purchase time. A downloadable
  PDF/image snapshot (generated server-side at issuance, per `AGENTS.md` §8) is
  available as a separate "Download" action for record-keeping, but the on-page
  view is always live data.

## Visual interpretation (light mode only)

### Layout — Desktop (≥1024px)
Centered content, max-width ~640px. Breadcrumb back to the order. The `LedgerReceipt`
rendered at full size: perforated-edge visual treatment, dashed section dividers,
sections for — Commodity (name, `GradeBadge`), Quantity, Purchase price (per unit +
total, at time of purchase), Current value (live, with delta indicator vs. purchase
price), Ownership status (Stored / Delivered / Partially resold, etc.), Warehouse/
storage location, Receipt ID + issue date. Below the receipt: "Download receipt"
and "View in My Storage" buttons.

### Layout — Mobile (<640px)
Same receipt content, full width, comfortably readable without shrinking text below
`body-sm`; action buttons stacked full-width below.

### Not-yet-generated state
If an order hasn't reached the point where a receipt exists yet, show a clear
"Your receipt will appear here once your order is confirmed" message instead of a
broken/empty receipt shell.

## Files likely to change / add

- `app/receipts/[receiptId]/page.tsx` — Server Component.
- `components/receipts/receipt-view.tsx` (composes `LedgerReceipt` with real data),
  `download-receipt-button.tsx` (client — triggers signed-URL download).
- `lib/supabase/queries/receipts.ts` — `getReceiptDetail(userId, receiptId)`
  (joins `receipts` + `holdings` for live current value + `orders` for purchase
  context).

## Implementation requirements

- Server Component page; only the download button needs `"use client"`.
- Current value on this page uses the same shared query/view as `10-my-storage.md`
  — no duplicated valuation logic.
- Download action fetches a short-lived signed URL server-side, never exposes a
  public Storage URL.

## Security requirements

- Reads scoped to `auth.uid()` via RLS; a buyer cannot view another buyer's receipt
  by guessing a `receiptId`.
- Signed URLs are short-expiry and generated per-request, not cached long-term.

## Acceptance criteria

- Receipt renders all required fields accurately, with current value live-updating
  against the underlying commodity price.
- Download produces the correct stored file via a signed URL.
- Not-yet-generated state renders correctly for orders that haven't reached that
  point.
- Layout matches spec at mobile/desktop.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`.

## Manual test steps

1. `npm run dev`; sign in as a buyer with a `stored` order; open its receipt from
   `/orders/[orderId]` or `/my-storage`.
2. Confirm all receipt fields are accurate against the underlying order/holding.
3. Change the commodity's price and reload — confirm current value updates on the
   receipt.
4. Click "Download receipt" — confirm the correct file downloads via a signed URL.
5. Attempt to visit another buyer's `receiptId` directly — confirm it's blocked.
6. Resize to ~375px and ~1440px — confirm layout matches spec.
