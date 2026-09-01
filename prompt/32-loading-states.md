# Prompt: Loading States — KorraStore

## Goal

Establish a consistent loading-state pattern across every page built in Phases
02–03, replacing any ad hoc spinners introduced along the way with the shared
`Skeleton` primitive from `02-design-system.md`, applied consistently. Light mode
only.

## Skills read

- `02-design-system.md` — `Skeleton` primitive.
- Every buyer/admin page prompt (`06`–`24`) — this pass audits and standardizes
  their loading states rather than introducing new pages.

## Existing code inspected

- Each page's own loading treatment as implemented in its originating prompt
  (e.g. `06-home-browse.md`'s "skeleton cards matching the real card layout").

## Decisions / assumptions

- **Skeleton shapes mirror real content layout** exactly (card grids show skeleton
  cards in the same grid, tables show skeleton rows) — never a generic centered
  spinner for content that has a known shape.
- **A centered spinner/indicator is reserved for genuinely indeterminate, full-page
  transitions** (e.g. the brief moment during a payment-initialization redirect) —
  not for content areas with a predictable shape.
- **Next.js `loading.tsx` route-level files** are used for full-page/route-segment
  loading where applicable (e.g. `app/home/loading.tsx`), composed from the same
  `Skeleton` primitive rather than a one-off per route.

## Files likely to change / add

- `app/home/loading.tsx`, `app/commodities/[commodityId]/loading.tsx`,
  `app/my-storage/loading.tsx`, `app/orders/loading.tsx`,
  `app/resale/loading.tsx`, `app/buyback/loading.tsx`,
  `app/admin/orders/loading.tsx`, `app/admin/inventory/loading.tsx`, and any other
  route missing a loading state, following the same skeleton-shape pattern.
- Audit and update any inline loading logic in already-built client components
  (e.g. checkout's payment-init button state) to use consistent spinner styling
  from `Button`'s loading variant rather than a bespoke spinner.

## Implementation requirements

- No content-shaped route uses a bare centered spinner where a skeleton matching
  the real layout is feasible.
- Skeleton components use the same spacing/radius tokens as the real content they
  stand in for, so there's no layout shift when real content replaces them.

## Security requirements

None — pure UI.

## Acceptance criteria

- Every major route has a `loading.tsx` (or equivalent Suspense boundary) whose
  skeleton shape closely matches its real content layout, with no visible layout
  shift on load.
- No bare centered spinner remains for content with a known shape.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`.

## Manual test steps

1. Throttle network speed (browser dev tools) and navigate to each major route;
   confirm the skeleton shape closely resembles the eventual real content, with
   minimal layout shift when it resolves.
2. Confirm the checkout/payment-init button shows a proper loading state (spinner +
   disabled) rather than a bespoke treatment.
