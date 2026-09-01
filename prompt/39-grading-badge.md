# Prompt: Grading Badge Component — KorraStore

## Goal

Fully implement the `GradeBadge` primitive stubbed in `02-design-system.md`: a
compact, consistent visual indicator for commodity grade (A/B/C, per
`commodity_grades`), used across marketplace cards, details pages, holdings,
receipts, and admin tables. Light mode only.

## Skills read

- `02-design-system.md` — token shell/stub.
- `03-database-schema.md` — `commodity_grades` (`code`, `name`).
- `AGENTS.md` §7 (controlled grade system, not free text).

## Decisions / assumptions

- **Props**: `grade` (the grade code, `A | B | C` for v1, but the component should
  read from `commodity_grades` data rather than hardcoding the three codes, so an
  admin adding a new grade code later doesn't require a component change),
  `size` (`sm | md`).
- **Color mapping is distinct from status-semantic colors** (order/buyback status
  reuses Deep Grain Green/Harvest Wheat/danger for state meaning) — grade badges
  use a separate small palette (e.g. Grade A = Deep Grain Green tint, Grade B =
  Harvest Wheat tint, Grade C = Husk tint) chosen for visual distinction from
  status badges, not for any value judgment (grade is a classification, not a
  quality score implying "worse").
- **Always paired with the grade name/label as text** (e.g. "Grade A"), never a
  color swatch alone, satisfying `36-accessibility.md`'s color-isn't-the-only-
  signal rule.

## Files likely to change / add

- `components/ui/grade-badge.tsx` (final implementation).
- Update call sites across `06-home-browse.md`, `07-commodity-details.md`,
  `10-my-storage.md`, `11-receipt-detail.md`, `12-resale-marketplace.md`,
  `13-create-resale.md`, `14-buyback.md`, and admin pages to use the finalized
  component.

## Implementation requirements

- Reads available grade codes/names dynamically rather than hardcoding "A/B/C" as
  literal strings in the component (fetch or receive `commodity_grades` data from
  the caller).
- Text label is always visible, not icon/color-only.

## Security requirements

None — pure display.

## Acceptance criteria

- Grade badges render consistently across every page that shows a grade, with a
  clearly distinct visual language from status badges.
- Adding a new grade code via `19-admin-inventory.md` renders correctly here
  without a code change to this component.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`.

## Manual test steps

1. Visit `/home`, a commodity's details page, `/my-storage`, a receipt, and
   `/resale` — confirm grade badges render consistently.
2. Add a new grade code to a test commodity via `/admin/inventory`; confirm it
   renders correctly here without any code change.
3. Confirm grade badges are visually distinguishable from order/buyback status
   badges at a glance.
