# Prompt: My Storage (Portfolio) — KorraStore

## Goal

Build `/my-storage`: the buyer's owned commodities — quantity, purchase price,
current value, grade, and storage status — with entry points into resell, request
buyback, or request delivery for each holding. Desktop + mobile, light mode only.
Current value is always computed at read time from `quantity × current commodity
price`, per `AGENTS.md` §7 — never a stored column.

## Skills read

- `.agents/skills/supabase/SKILL.md` — the `holdings_with_current_value` view (from
  `03-database-schema.md`), reserved-vs-available quantity distinction.
- `02-design-system.md` — `Card`, `LedgerReceipt`, `PriceDisplay`, `GradeBadge`,
  `QuantitySelector`, `EmptyState`.
- `AGENTS.md` §7 (holdings can be split; never merge across acquisitions), §9
  (reserved quantity from active resale listings/buyback requests must be
  reflected here, not just total quantity).

## Existing code inspected

- `03-database-schema.md` — `holdings`, `holding_movements`,
  `holdings_with_current_value` view.
- `12-resale-marketplace.md` / `13-create-resale.md` / `14-buyback.md` (built
  later in this phase) — this page's action buttons link into those flows; if they
  don't exist yet at implementation time, stub the links behind a "coming soon" note
  rather than a broken route, and revisit once those prompts land.

## Decisions / assumptions

- **Each holding is its own card/row** — holdings from different purchases are
  never merged in this view even if they're the same commodity/grade, since they
  may have different purchase prices/dates (per `AGENTS.md` §7).
- **Available vs. reserved quantity is shown explicitly** — if part of a holding is
  reserved by an active resale listing or pending buyback request, the card shows
  "X kg available, Y kg reserved" rather than just a single total, so the buyer
  understands why they can't resell/buyback the full amount.
- **Total portfolio value** is shown as a summary stat at the top (sum of all
  holdings' current value), computed server-side from the same view, not
  re-derived client-side.

## Visual interpretation (light mode only)

### Layout — Desktop (≥1024px)
Content max-width ~1100px. Top: summary strip (total portfolio value in
`PriceDisplay`/`numeric-lg`, total holdings count, a simple value-over-time
sparkline if reasonable to compute from `price_history` — omit if it adds
significant complexity for v1). Below: a grid (2–3 columns) of holding cards, each
styled with a `LedgerReceipt`-adjacent treatment (not the full receipt component,
which is reserved for actual receipts, but sharing its "ledger ticket" visual
language) — commodity name, `GradeBadge`, quantity (available/reserved split),
purchase price vs. current value (`PriceDisplay` with a delta indicator), warehouse/
storage status, and three actions: "Resell", "Request buyback", "Request delivery".

### Layout — Mobile (<640px)
Summary strip condensed to a single stat row (horizontally scrollable if more than
2–3 stats); holding cards stack single-column, same content, actions as a row of
compact buttons at the card's bottom.

### Empty state
No holdings yet → `EmptyState` pointing to `/home` ("Nothing in storage yet — make
your first purchase").

## Files likely to change / add

- `app/my-storage/page.tsx` — Server Component.
- `components/my-storage/portfolio-summary.tsx`, `holding-card.tsx`,
  `holding-actions.tsx` (client — action button dispatch to resell/buyback/delivery
  routes).
- `lib/supabase/queries/holdings.ts` — `getBuyerHoldings(userId)` (from the
  `holdings_with_current_value` view, including reserved-quantity computation),
  `getPortfolioSummary(userId)`.

## Implementation requirements

- Server Component page; only the action-button row needs `"use client"` (routing
  to other pages, no direct mutation here).
- Never compute or cache "current value" outside the shared view/query — every page
  showing a holding's value must use the same source of truth.
- Reserved quantity is computed from active `resale_listings` +
  `buyback_requests` against the holding, not stored redundantly.

## Security requirements

- All reads scoped to `auth.uid()` via RLS.

## Acceptance criteria

- Portfolio summary and each holding's current value update correctly when the
  underlying commodity price changes (verify by adjusting a test commodity's price
  and reloading).
- Available/reserved quantity split is accurate against active resale/buyback
  activity.
- Actions correctly link to (or clearly stub, if not yet built) resell/buyback/
  delivery flows.
- Layout matches spec at mobile/desktop.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`.

## Manual test steps

1. `npm run dev`; sign in as a buyer with at least one `stored` holding; visit
   `/my-storage`.
2. Confirm current value matches `quantity × current price` for the commodity.
3. Change the commodity's price in the admin/dev tooling (or directly in Supabase
   for this test) and reload — confirm the holding's current value updates without
   any write to the holding itself.
4. Create an active resale listing against part of a holding (once
   `13-create-resale.md` exists) and confirm the available/reserved split updates
   correctly here.
5. Resize to ~375px and ~1440px — confirm layout matches spec.
