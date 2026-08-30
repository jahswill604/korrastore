# Prompt: Commodity Details — KorraStore

## Goal

Build `/commodities/[commodityId]`: price breakdown by grade, available quantity,
price history chart, and storage/fulfillment info, with a clear path into the buy
flow. Desktop + mobile, light mode only.

## Skills read

- `.agents/skills/supabase/SKILL.md` — reads for a single commodity + its grades +
  `price_history`.
- `02-design-system.md` — `Card`, `PriceDisplay`, `GradeBadge`, `Tabs`.
- `AGENTS.md` §6 (Recharts for price history), §7 (schema).
- `06-home-browse.md` — cards here link into this page.

## Existing code inspected

- `lib/supabase/queries/commodities.ts` (from `06-home-browse.md`) — extend with a
  single-commodity fetch rather than duplicating query logic.

## Decisions / assumptions

- **Grade selector drives the displayed price** — a segmented control (A/B/C, using
  `GradeBadge` styling) updates the shown price and available quantity for that
  grade; the "Buy" CTA carries the selected grade into checkout.
- **Price history chart** shows the commodity's price trend (default 30 days, with
  a 7d/30d/90d/All range selector) using Recharts, styled with KorraStore's token
  colors (Harvest Wheat line, Paper background) rather than the library's default
  theme.
- **Storage/fulfillment info** is static descriptive copy per commodity (e.g.
  "Stored in climate-controlled KorraStore warehouses; request delivery anytime
  from My Storage") — not tied to a specific warehouse until after purchase.

## Visual interpretation (light mode only)

### Layout — Desktop (≥1024px)
Two-column: left (~60%) commodity photo/hero, name (DM Serif Display), description,
storage/fulfillment info block; right (~40%, sticky) purchase panel — grade
selector, current price (`PriceDisplay`, large/`numeric-lg`), available quantity for
the selected grade, quantity input preview (full selector lives on checkout), "Buy
now" primary `Button`. Below the two-column region, full-width: price history chart
in a `Card` with the range selector as `Tabs` above it.

### Layout — Mobile (<640px)
Stacked: hero image, name/description, grade selector (horizontally scrollable chip
row if needed), price + quantity, sticky "Buy now" button pinned above the bottom
tab bar/safe area, storage info below, then the price history chart full-width
(range selector as a compact segmented control).

### Unavailable state
If the selected grade has zero available quantity, replace the "Buy now" button with
a disabled state + "Currently unavailable — check back soon" note, and let the buyer
switch grades without losing their place.

## Files likely to change / add

- `app/commodities/[commodityId]/page.tsx` — Server Component.
- `components/commodity/grade-selector.tsx` (client), `price-history-chart.tsx`
  (client — Recharts), `purchase-panel.tsx` (client — grade selection state feeding
  the Buy CTA), `storage-info.tsx`.
- `lib/supabase/queries/commodities.ts` — add `getCommodityDetails(commodityId)`
  (commodity + grades + per-grade availability + price history rows).
- `lib/types.ts` — `CommodityDetails`, `GradeAvailability`, `PriceHistoryPoint`.

## Implementation requirements

- Server Component page; grade selector, chart, and purchase panel are the client
  boundaries.
- "Buy now" navigates to `/checkout?commodityId=...&gradeId=...`, not a direct
  mutation from this page (checkout owns the actual order creation, per
  `08-checkout.md`).
- Chart data comes from `price_history`, not recomputed client-side.

## Security requirements

- Public read (commodity/grade/price data is not sensitive); no service-role client
  needed.

## Acceptance criteria

- Page renders correct price/availability per grade, updating when the grade
  selector changes.
- Price history chart renders real `price_history` data with a working range
  selector.
- Unavailable grades show the disabled/unavailable state instead of a broken buy
  flow.
- Layout matches spec at mobile/desktop.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`.

## Manual test steps

1. `npm run dev`; from `/home`, open a commodity's details page.
2. Switch grades — confirm price/availability update correctly.
3. Change the price history range selector — confirm the chart updates.
4. Select a grade with zero availability (seed one if needed) — confirm the
   disabled/unavailable state renders.
5. Click "Buy now" — confirm navigation to `/checkout` with the correct commodity
   and grade carried over.
6. Resize to ~375px and ~1440px — confirm layout matches spec.
