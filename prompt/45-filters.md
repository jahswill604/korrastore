# Prompt: Filters Component — KorraStore

## Goal

Consolidate the filter-bar pattern used across `06-home-browse.md`,
`12-resale-marketplace.md`, `18-admin-orders.md`, and `19-admin-inventory.md` into
one reusable `FilterBar` component with consistent chip/dropdown behavior, rather
than each page having its own bespoke filter implementation. Light mode only.

## Skills read

- `02-design-system.md` — chip/`Tabs`/dropdown primitives this component
  composes.
- The four consuming prompts listed above.

## Existing code inspected

- Each consuming page's own filter-bar implementation as originally built.

## Decisions / assumptions

- **One `FilterBar` component** accepting a declarative config (`filters: {
  key, label, type: 'chip-group' | 'dropdown', options }[]`) and emitting changes
  either via URL params (buyer-facing pages) or local state (admin pages, where
  URL-param filtering is optional but encouraged for consistency).
- **Mobile collapse behavior**: chip groups become a horizontally scrollable row;
  if there are more than ~2 filter dimensions, additional filters collapse into a
  "Filters" sheet trigger button rather than cramming everything into one row (per
  `06-home-browse.md`'s and `12-resale-marketplace.md`'s original mobile spec).

## Files likely to change / add

- `components/ui/filter-bar.tsx` (client) — the shared component.
- Update `components/marketplace/filter-bar.tsx`,
  `components/resale/resale-filter-bar.tsx`,
  `components/admin/orders/order-filter-bar.tsx` to either wrap or be replaced by
  the shared component, keeping each page's specific filter config.

## Implementation requirements

- Filter state changes are debounced where they trigger a server round-trip (URL
  param navigation), so rapid clicking doesn't fire excessive requests.
- Component is purely configuration-driven — no page-specific filter logic lives
  inside `FilterBar` itself.

## Security requirements

None — client-side filtering UI only; actual data scoping/authorization happens in
the underlying query functions regardless of filter state.

## Acceptance criteria

- All four consuming pages use the shared component with identical interaction
  patterns (chip selection, dropdown behavior, mobile "Filters" sheet trigger when
  applicable).
- No regression in each page's specific filtering capability after the
  consolidation.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`.

## Manual test steps

1. Re-test filtering on `/home`, `/resale`, `/admin/orders`, and
   `/admin/inventory`'s inventory tab; confirm identical interaction patterns and
   no loss of filtering capability.
2. Resize to ~375px on each; confirm the mobile collapse (scrollable chips / sheet
   trigger) behaves consistently.
