# Prompt: Empty States — KorraStore

## Goal

Audit and standardize every "no data yet" state across the app using the shared
`EmptyState` primitive from `02-design-system.md`, ensuring each one gives the
buyer/admin a clear, actionable next step rather than a blank area. Light mode
only.

## Skills read

- `02-design-system.md` — `EmptyState` primitive.
- Every page prompt that mentions an empty state (`06`, `09`, `10`, `12`, `15`,
  `16` and admin equivalents) — this pass standardizes them.

## Existing code inspected

- Each page's own empty-state copy/behavior as implemented in its originating
  prompt.

## Decisions / assumptions

- **`EmptyState` always has: an icon/illustration, a one-line headline, a short
  supporting sentence, and (where applicable) a primary action button** pointing
  the user toward the next useful step (e.g. "Browse the marketplace" on an empty
  `/my-storage`).
- **Admin empty states** (e.g. no pending buybacks, no flagged orders) use the
  same primitive but skip the "action button" when there's genuinely nothing to
  do (a calm "All caught up" state reads better than a forced CTA).

## Files likely to change / add

- Audit and update: `app/home/page.tsx` (no active commodities — dev-only case),
  `app/orders/page.tsx`, `app/my-storage/page.tsx`, `app/resale/page.tsx`,
  `app/notifications/page.tsx`, `app/resale/my-listings/page.tsx`,
  `app/buyback/page.tsx`, `app/admin/orders/page.tsx` (no orders matching filter),
  `app/admin/buybacks` view (no pending requests).
- `components/ui/empty-state.tsx` — confirm it supports an optional action button
  prop and an optional "calm/no-action" variant for admin "all caught up" cases.

## Implementation requirements

- No page renders a literal blank/whitespace area when a query returns zero rows —
  every such case routes through `EmptyState`.
- Copy is specific to the page's context, never a generic "No data found."

## Security requirements

None — pure UI.

## Acceptance criteria

- Every list/grid page in the app shows a context-appropriate `EmptyState` when its
  underlying query returns zero rows, verified against a fresh test account with no
  activity.
- Admin "all caught up" states read calmly, not as a forced action prompt.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`.

## Manual test steps

1. Create a brand-new buyer test account with zero orders/holdings/listings; visit
   `/orders`, `/my-storage`, `/resale/my-listings`, `/buyback`, `/notifications` —
   confirm each shows a clear, specific empty state with a sensible action where
   applicable.
2. As admin, filter `/admin/orders` to a status with zero matches, and
   `/admin/buybacks` to Pending with zero pending requests — confirm calm "all
   caught up" states, not broken/blank tables.
