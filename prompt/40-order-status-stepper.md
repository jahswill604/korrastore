# Prompt: Order Status Stepper Component — KorraStore

## Goal

Fully implement the `StatusStepper` primitive stubbed in `02-design-system.md`: a
visual progress indicator for an order's fulfillment lifecycle
(sourcing → in transit → stored/delivered), used on the buyer order-detail page and
the admin order-detail page. Light mode only.

## Skills read

- `02-design-system.md` — token shell/stub.
- `AGENTS.md` §7 (order status enum, payment status kept separate).
- `09-order-tracking.md`, `18-admin-orders.md` — the two consumers of this
  component.

## Decisions / assumptions

- **Props**: `status` (the order's current fulfillment status),
  `terminalVariant` (`cancelled | failed`, rendered as a distinct non-stepper state
  rather than forcing it into the step sequence), `orientation`
  (`horizontal | vertical`, since `09-order-tracking.md` flagged that mobile may
  read better as a vertical list — this component supports both, and the
  consuming page picks per breakpoint).
- **Steps**: Sourcing → In Transit → Stored (or Delivered, if the buyer requested
  delivery instead of storage — the stepper's final step label adapts based on
  which path the order took). Completed steps show a filled indicator + Deep Grain
  Green accent; the current step is highlighted (Harvest Wheat); future steps are
  muted.
- **Cancelled/failed rendering**: not a partially-filled stepper — a distinct
  compact state (icon + "Order cancelled"/"Payment failed" message + reason if
  available), since forcing a terminal failure into step-progress visual language
  is misleading.

## Files likely to change / add

- `components/ui/status-stepper.tsx` (final implementation).
- Update `09-order-tracking.md`'s and `18-admin-orders.md`'s detail pages to use
  the finalized component, choosing orientation per breakpoint as originally
  specified.

## Implementation requirements

- Step completion state is derived purely from the `status` enum value — no
  separate "which steps are done" prop that could drift out of sync with the
  actual status.
- Satisfies `36-accessibility.md`: current/completed step state is conveyed via
  text (e.g. `aria-current="step"`, visually-present labels), not color alone.

## Security requirements

None — pure display.

## Acceptance criteria

- Stepper accurately reflects every valid order status, including the
  delivered-vs-stored final-step variant.
- Cancelled/failed orders render the distinct terminal state, not a broken
  partial stepper.
- Both orientations render correctly and are used appropriately per breakpoint on
  both consuming pages.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`.

## Manual test steps

1. View orders in each status (`sourcing`, `in_transit`, `stored`, `delivered`,
   `cancelled`, `failed`) on both the buyer and admin order-detail pages; confirm
   the stepper (or terminal state) renders correctly for each.
2. Confirm the mobile orientation choice reads clearly at ~375px.
3. Use a screen reader to confirm the current step is announced correctly.
