# Prompt: Quantity Selector Component — KorraStore

## Goal

Fully implement the `QuantitySelector` primitive stubbed in `02-design-system.md`:
a numeric input with increment/decrement controls, unit awareness (kg/bag/ton
conversion), and min/max clamping — used in checkout, resale-listing creation, and
buyback requests. Light mode only.

## Skills read

- `02-design-system.md` — token shell/stub for this component.
- `AGENTS.md` §7 (units: commodity's base unit is kg; UI may offer bag/ton
  conversion).

## Existing code inspected

- `08-checkout.md`, `13-create-resale.md`, `14-buyback.md` — all three consume this
  component with slightly different min/max constraints (available inventory vs.
  available holding quantity).

## Decisions / assumptions

- **Props**: `value` (in the commodity's base unit, kg), `onChange`, `min` (usually
  a small positive number, e.g. 1kg), `max` (available quantity, passed by the
  caller), `unit` conversions available for this commodity (e.g. `1 bag = 50kg`,
  `1 ton = 1000kg` — conversion factors come from the commodity's config, not
  hardcoded globally, since they may differ per commodity).
- **Unit toggle**: a small segmented control (kg / bag / ton, only showing units
  the commodity defines a conversion for) next to the numeric input; switching
  units converts the displayed number but the underlying `value` stays in kg.
- **Increment/decrement buttons** step by a sensible amount per unit (e.g. 1kg
  steps in kg mode, whole-bag steps in bag mode) rather than always stepping by 1
  of whatever the base unit is.
- **Clamping**: typing or stepping past `max` clamps to `max` with a brief inline
  note ("Only 340kg available"); going below `min` clamps to `min`.

## Files likely to change / add

- `components/ui/quantity-selector.tsx` (client) — full implementation.
- `lib/utils/unit-conversion.ts` — `toBaseUnit`, `fromBaseUnit`,
  `getAvailableUnitsFor(commodity)`.
- Update call sites in checkout, create-resale, and buyback-request forms to pass
  their respective `max` and commodity unit config.

## Implementation requirements

- All internal state is kept in the base unit (kg); the unit toggle only affects
  display/step-size, never introduces rounding drift in the underlying value sent
  to the server.
- Server-side validation (per `08-checkout.md`, `13-create-resale.md`,
  `14-buyback.md`) re-checks the final kg value against live available quantity
  regardless of what the client displayed — this component is a UX aid, not the
  source of truth for validation.
- Meets the accessibility requirements from `36-accessibility.md` (keyboard
  operable increment/decrement, labeled input).

## Security requirements

None beyond the general rule that this component's output is never trusted without
server-side re-validation.

## Acceptance criteria

- Selector correctly clamps to `min`/`max`, converts between kg/bag/ton without
  drift, and steps by sensible increments per unit.
- Works identically across checkout, create-resale, and buyback-request contexts
  with only different `max` values passed in.
- Keyboard operable end-to-end.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test` (unit-
  conversion round-trip test, clamping test).

## Manual test steps

1. On the checkout page for a commodity with bag/ton conversions defined, switch
   units and confirm the displayed number converts correctly without drift when
   switching back to kg.
2. Attempt to type a value above the available quantity; confirm it clamps with a
   visible note.
3. Use only keyboard (Tab to focus, Arrow keys or +/− buttons via Enter/Space) to
   adjust the quantity; confirm it works without a mouse.
4. Repeat on the create-resale and buyback-request forms; confirm identical
   behavior with their respective max values.
