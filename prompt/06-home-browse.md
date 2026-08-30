# Prompt: Home / Marketplace Browse — KorraStore

## Goal

Build `/home`: the buyer's marketplace entry point — browse available commodities
(rice, garlic, beans, melon) with current price, quantity available, grade options,
and a quick entry point to each commodity's details page. Desktop + mobile, light
mode only. UI displays stored data only (`AGENTS.md` §5) — prices/inventory come
from `commodities`/`inventory`, never computed here.

## Skills read

- `.agents/skills/supabase/SKILL.md` — reads scoped via RLS, the joined-table filter
  gotcha (commodity + inventory + latest price joins).
- `02-design-system.md` — `Card`, `PriceDisplay`, `GradeBadge`, `NavRail`/
  `BottomTabBar`, `Badge`, `Pagination`, `EmptyState`.
- `04-auth.md` — session available via `getUser()`.
- `AGENTS.md` §7 (commodities/inventory/price_history tables).

## Existing code inspected

- `components/layout/app-shell.tsx` from `02-design-system.md` — nav rail (desktop)
  / bottom tab bar (mobile) shell; this page renders inside it.
- No `lib/supabase/queries/commodities.ts` yet.

## Decisions / assumptions

- **Data via a server-side query function**, not client fetches — page is a Server
  Component awaiting `getMarketplaceCommodities(filters)`.
- **Filter/sort bar**: filter by commodity type (all four types) and sort by price
  (low→high, high→low) or availability. Kept simple — no full faceted search here
  (full search UI lives in `46-search.md`, reused if it grows more complex later).
- **Each card shows a representative price** (e.g. the lowest-grade/base price per
  kg) with a "from ₦X/kg" framing, since a commodity spans multiple grades with
  different prices — full grade-by-grade pricing is on the details page.

## Visual interpretation (light mode only)

### Layout — Desktop (≥1024px)
Inside the app shell (nav rail left, content right). Top: H1 "Marketplace" +
one-line subcopy, filter/sort bar (`glass`-free flat `Card` bar: commodity-type
chips + sort dropdown) inside the content area, max-width ~1200px. Below: a
responsive grid (3–4 columns) of commodity cards — each: commodity photo/icon,
name (DM Serif Display, restrained size), "from" price in `PriceDisplay` (IBM Plex
Mono), available quantity, a small grade-availability indicator (e.g. "Grades A, B,
C available"), "View details" button.

### Layout — Mobile (<640px)
Filter chips as a horizontally scrollable row at top; sort as a compact
dropdown/sheet trigger; cards stack single-column full-width, same content as
desktop cards.

### Empty / loading states
If no active commodities exist (should not happen in production, but matters for
fresh dev environments), show an `EmptyState` ("No commodities available right now
— check back soon"). While loading, show skeleton cards matching the real card
layout, not a spinner.

## Files likely to change / add

- `app/home/page.tsx` — Server Component.
- `components/marketplace/filter-bar.tsx` (client — filter/sort state via URL
  search params), `commodity-card.tsx`.
- `lib/supabase/queries/commodities.ts` — `getMarketplaceCommodities(filters)`:
  joins `commodities` + aggregated `inventory` availability + latest
  `price_history`/`commodities.current_price`. Avoid the joined-filter gotcha —
  fetch unfiltered and filter in JS, or use a Postgres view.
- `lib/types.ts` — add `MarketplaceCommodity` shape.

## Implementation requirements

- Server Component page; filter/sort state lives in URL search params so the page
  stays server-rendered and shareable/bookmarkable, with a small client component
  only for the interactive chip/dropdown controls that update the URL.
- No mutation logic on this page — pure read/display.

## Security requirements

- Reads scoped to `select`-permitted rows via RLS (public commodity data — see
  `03-database-schema.md`); no service-role client needed here.

## Acceptance criteria

- `/home` lists all active commodities with correct price/availability/grade info.
- Filtering by commodity type and sorting by price both work via URL params and are
  reflected correctly in the rendered grid.
- No horizontal overflow at 375px.
- Layout matches spec at mobile/desktop.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`.

## Manual test steps

1. `npm run dev`; sign in; visit `/home`.
2. Confirm all seeded commodities render with correct price/availability/grade
   info.
3. Filter by a single commodity type — confirm the grid updates and the URL
   reflects the filter.
4. Sort by price high→low — confirm order changes correctly.
5. Resize to ~375px, ~768px, ~1440px — confirm layout matches spec at each.
