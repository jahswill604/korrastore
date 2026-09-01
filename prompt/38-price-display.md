# Prompt: Price Display Component — KorraStore

## Goal

Fully implement the `PriceDisplay` primitive stubbed in `02-design-system.md`: a
consistent, IBM Plex Mono–rendered currency/value display used everywhere a price,
total, or value appears across the app, with an optional delta indicator. Light
mode only.

## Skills read

- `02-design-system.md` — token shell/stub, IBM Plex Mono usage rule.
- Every page that renders a price/value (`06`, `07`, `08`, `09`, `10`, `11`, `12`,
  `13`, `14`, `20`, `22`) — this component must serve all of them consistently.

## Decisions / assumptions

- **Props**: `value` (numeric, in the app's base currency unit — confirm whether
  this is naira or kobo internally and always convert at the display boundary,
  never mid-calculation), `size` (`sm | md | lg`, mapping to the numeric type
  scale from `02-design-system.md`), `delta` (optional: a comparison value used to
  show a +/− change, e.g. current value vs. purchase price), `deltaFormat`
  (`absolute | percent`).
- **Currency formatting** uses `Intl.NumberFormat` with the correct locale/currency
  (Nigerian Naira, ₦) rather than manual string formatting.
- **Delta indicator** always pairs color with a `+`/`−` symbol (never color alone,
  per `36-accessibility.md`'s rule) — Deep Grain Green + `▲`/`+` for positive,
  danger + `▼`/`−` for negative, a neutral tone for exactly zero change.

## Files likely to change / add

- `components/ui/price-display.tsx` (final implementation, replacing the
  `02-design-system.md` stub).
- `lib/utils/currency.ts` — `formatCurrency(value)`, `formatDelta(current,
  previous, format)`.
- Update every call site across the pages listed above to use the finalized props
  consistently (audit for any inline `₦${value}` string formatting introduced ad
  hoc in earlier prompts and replace it with this component).

## Implementation requirements

- No page formats currency manually outside this component — a single source of
  truth for currency display formatting.
- IBM Plex Mono is applied via the component's own styling, not left to each call
  site to remember.

## Security requirements

None — pure display, no calculation of financial totals happens inside this
component (it only formats a value it's given; the value itself is always computed
server-side or from a trusted query).

## Acceptance criteria

- Every price/value across the app renders via this component with consistent
  formatting and font.
- Delta indicator correctly shows positive/negative/neutral with both color and
  symbol.
- No ad hoc currency-formatting code remains elsewhere in the codebase.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test`
  (formatting edge cases: zero, negative, large numbers, decimal quantities).

## Manual test steps

1. Visit `/home`, a commodity's details page, `/my-storage`, an order detail, and
   `/admin/pricing` — confirm all prices render identically formatted, in IBM Plex
   Mono.
2. On `/my-storage`, confirm a holding with current value above/below/equal to its
   purchase price shows the correct delta color + symbol.
3. Grep the codebase for manual `₦`/currency string interpolation outside this
   component; confirm none remain.
