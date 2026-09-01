# Prompt: Search Component — KorraStore

## Goal

Implement a reusable `SearchInput` component and back it with real search
capability for the two places KorraStore needs it: buyer-facing commodity/resale
search (a plain substring/name search, not semantic — KorraStore has no AI search
requirement) and admin support's user lookup
(`23-admin-support.md`, by email/phone/user ID). Light mode only.

## Skills read

- `02-design-system.md` — input styling tokens.
- `06-home-browse.md`, `12-resale-marketplace.md`, `23-admin-support.md` — the
  three consumers.

## Existing code inspected

- `23-admin-support.md`'s `user-search.tsx` — already implements a single-purpose
  version of this; this prompt generalizes it and adds the buyer-facing use case
  that `06-home-browse.md`/`12-resale-marketplace.md` didn't originally include
  (their filter bars covered type/sort but not free-text search — this prompt adds
  it as an enhancement to those pages' filter bars).

## Decisions / assumptions

- **One `SearchInput` component**: a text input with a debounced `onSearch`
  callback, a clear (×) button once text is entered, and a loading indicator slot
  for async search (admin user lookup) vs. instant client-side substring filtering
  (commodity/resale name search, since those lists are small enough for v1 not to
  need a server round-trip per keystroke).
- **Buyer-facing search** is added as an additional control within
  `FilterBar` (`45-filters.md`) on `/home` and `/resale`, filtering by commodity
  name substring, debounced client-side over the already-fetched page of results
  (not a new server endpoint) — consistent with `06-home-browse.md`'s original
  note that server-side filtering can be added later if the library grows large.
- **Admin search** (`23-admin-support.md`) remains a real server round-trip
  (email/phone/user ID lookup against Supabase), using the same input component
  with its loading-indicator slot active.

## Files likely to change / add

- `components/ui/search-input.tsx` (client) — the shared component.
- Update `components/marketplace/filter-bar.tsx` and
  `components/resale/resale-filter-bar.tsx` to include a `SearchInput` alongside
  existing type/sort controls.
- Update `components/admin/support/user-search.tsx` to use the shared component.

## Implementation requirements

- Debounce timing is consistent (e.g. 250–300ms) across both usage patterns.
- Client-side substring search on buyer pages never sends a new request per
  keystroke; admin search's server round-trip is debounced to avoid excessive
  queries.

## Security requirements

- Admin search results remain scoped within the admin-role-gated tree, per
  `23-admin-support.md`'s existing rules — this prompt only changes the input
  component, not the authorization boundary.

## Acceptance criteria

- `/home` and `/resale` support a working free-text commodity-name filter
  alongside existing type/sort filters.
- Admin support search behaves identically to before, now using the shared
  component.
- No excessive request volume from either usage pattern (verified via debounce).

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`.

## Manual test steps

1. On `/home` and `/resale`, type a partial commodity name; confirm the list
   filters correctly without a full page reload or excessive requests.
2. On `/admin/support`, search by a known user's email/phone/ID; confirm results
   still work identically to before the refactor.
3. Clear the search input via the × button on both usage patterns; confirm the
   list/result resets correctly.
