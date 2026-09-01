# Prompt: Pagination Component — KorraStore

## Goal

Fully implement the `Pagination` primitive stubbed in `02-design-system.md` and
apply it consistently to every list/table view that can grow large: marketplace
browse, resale browse, order history, admin orders, admin support search results.
Light mode only.

## Skills read

- `02-design-system.md` — token shell/stub.
- `06-home-browse.md`, `09-order-tracking.md`, `12-resale-marketplace.md`,
  `18-admin-orders.md`, `23-admin-support.md` — the consumers.

## Decisions / assumptions

- **URL-param-driven pagination** (`?page=2`) for buyer-facing pages, consistent
  with `06-home-browse.md`'s filter/sort approach, so pages stay server-rendered
  and shareable/bookmarkable.
- **Page size**: a sensible default (e.g. 20 items) per list type, defined once
  per query function rather than scattered magic numbers.
- **Component shows**: previous/next controls, current page indicator, and (on
  desktop, where space allows) a few surrounding page numbers; mobile shows just
  previous/next + "Page X of Y" text to save space.

## Files likely to change / add

- `components/ui/pagination.tsx` (final implementation).
- Update query functions in `lib/supabase/queries/commodities.ts`,
  `orders.ts`, `resale.ts`, and the admin equivalents to accept
  `page`/`pageSize` and return a total count alongside results.
- Update the consuming pages' Server Components to read `page` from
  `searchParams` and pass it through.

## Implementation requirements

- Total-count queries are efficient (e.g. a single count query alongside the page
  query, not fetching all rows to count them in JS).
- Pagination state lives in the URL for buyer-facing pages; admin pages may use
  the same pattern for consistency.

## Security requirements

None beyond the general rule that page/pageSize values are validated/clamped
server-side (no unbounded `pageSize` accepted from a query param).

## Acceptance criteria

- Every listed page correctly paginates real data, with working previous/next and
  page-number navigation.
- URL reflects the current page and is shareable/bookmarkable on buyer-facing
  pages.
- Mobile pagination control is usable and legible at ~375px.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`.

## Manual test steps

1. Seed enough commodities/orders/resale-listings to exceed one page; visit each
   of the listed pages and confirm pagination works correctly.
2. Navigate via URL directly to `?page=2`; confirm the correct page renders.
3. Attempt an out-of-range or negative page param; confirm it's clamped/handled
   gracefully, not a crash.
4. Resize to ~375px — confirm the mobile pagination control remains usable.
