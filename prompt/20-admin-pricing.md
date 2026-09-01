# Prompt: Admin Pricing — KorraStore

## Goal

Build `/admin/pricing`: admin-controlled commodity pricing (retail/sale price and
buyback price, per grade if prices vary by grade) with full price history and
automatic propagation to holdings' current values across the platform. Desktop +
mobile, light mode only.

## Skills read

- `.agents/skills/supabase/SKILL.md` — `price_history` writes, the
  `holdings_with_current_value` view (confirms price changes propagate without
  rewriting holdings).
- `02-design-system.md` — `Card`, `PriceDisplay`, chart primitives (Recharts, reused
  from `07-commodity-details.md`'s pattern).
- `AGENTS.md` §16 (pricing/valuation rules — never store current value on a
  holding), §12 (`POST /api/admin/pricing`).

## Existing code inspected

- `07-commodity-details.md` — the buyer-facing price history chart this page's data
  also feeds.
- `14-buyback.md` — the separate buyback price field this page manages.

## Decisions / assumptions

- **Price update form** per commodity (and per grade, if grades carry distinct
  prices — confirm the schema decision from `03-database-schema.md`): new sale
  price, new buyback price, effective immediately or scheduled (v1: immediate only,
  no future-dated scheduling unless requested).
- **Every price change inserts a new `price_history` row** rather than updating a
  single current-price field in place — `commodities.current_price` (or
  equivalent) is a denormalized "latest" pointer kept in sync with the newest
  `price_history` row in the same transaction, so reads stay cheap while history
  stays complete.
- **A confirmation step** shows the price delta (e.g. "+₦50/kg, +4.2%") before
  committing, since this instantly affects every holder's portfolio value platform-
  wide.

## Visual interpretation (light mode only)

### Layout — Desktop (≥1024px)
Table of commodities: name, current sale price, current buyback price, last
updated date, "Update price" action. Selecting a commodity opens a panel/modal:
current price shown, new sale price + new buyback price inputs, a live-computed
delta preview, price history chart (Recharts) below for context, "Confirm update"
button (behind the delta-preview confirmation).

### Layout — Mobile (<640px)
Table collapses to stacked cards; update panel becomes a full-screen sheet with the
same content, chart condensed but still legible.

## Files likely to change / add

- `app/admin/pricing/page.tsx`.
- `components/admin/pricing/pricing-table.tsx`, `update-price-modal.tsx` (client),
  `price-delta-preview.tsx`, `price-history-chart.tsx` (reused/extended from
  `07-commodity-details.md`'s chart component if shapes match).
- `lib/supabase/queries/admin/pricing.ts` — `getAllCommodityPrices()`,
  `updateCommodityPrice(commodityId, newSalePrice, newBuybackPrice, adminId)` —
  inserts `price_history` + updates the denormalized current-price pointer
  atomically.

## Implementation requirements

- Price updates never touch `holdings` rows — propagation is purely a function of
  the shared valuation query/view reading the latest price at request time.
- Every update writes both `price_history` and `audit_logs`.
- `"use client"` scoped to the update modal.

## Security requirements

- Admin-role-gated at layout, page, and API route level.

## Acceptance criteria

- Updating a commodity's price immediately reflects in `/home`, commodity details,
  and every affected holder's `/my-storage` current value, without any write to
  `holdings`.
- Price history chart accurately reflects all historical price points.
- Layout matches spec at mobile/desktop.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`.

## Manual test steps

1. `npm run dev`; sign in as admin; visit `/admin/pricing`.
2. Update a commodity's sale price; confirm the delta preview is correct before
   confirming.
3. Confirm the update; check `/home` and an affected buyer's `/my-storage` reflect
   the new price/value immediately.
4. Confirm the price history chart includes the new data point.
5. Resize to ~375px and ~1440px — confirm layout matches spec.
