# Prompt: Responsive Behavior Audit — KorraStore

## Goal

Audit every page built across Phases 02–04 at the three core breakpoints (mobile
`<640px`, tablet `640–1024px`, desktop `≥1024px`) and fix any overflow, cramped
touch targets, or layout breakage — a cross-cutting QA pass rather than new
feature work. Light mode only.

## Skills read

- `02-design-system.md` — breakpoint definitions, nav rail/bottom-tab-bar
  responsive rule.
- Every page prompt's "Visual interpretation" section, which already specifies
  desktop/mobile behavior — this pass verifies the implementation matches, at
  tablet width too (which individual prompts specified less precisely).

## Existing code inspected

- Every `app/**/page.tsx` and its components built in Phases 02–04.

## Decisions / assumptions

- **Tablet (`640–1024px`) gets an explicit pass**, since individual page prompts
  mostly specified desktop and mobile precisely but left tablet to "in between" —
  this prompt defines the tablet behavior for any component where it wasn't
  explicit: typically, grids drop to 2 columns, the nav rail collapses to an
  icon-only rail (not yet the bottom tab bar), and side-by-side detail layouts
  (commodity details, order detail) stack earlier than desktop's threshold if
  content would otherwise feel cramped.
- **Touch targets** on mobile are audited for a minimum ~44px tap area
  (buttons, quantity selector steppers, table-row-card tap targets).

## Files likely to change / add

- No new routes — this is a fix-forward pass across existing components. Likely
  touch points: `components/layout/nav-rail.tsx` (icon-only tablet variant),
  `components/marketplace/commodity-card.tsx`, `components/commodity/purchase-
  panel.tsx`, `components/my-storage/holding-card.tsx`, admin tables' tablet
  collapse behavior, `components/ui/quantity-selector.tsx` (tap target size).

## Implementation requirements

- No horizontal scroll/overflow at 375px on any route (except intentionally
  horizontally-scrollable rows like filter chips, which must not scroll the whole
  page).
- Every interactive control meets a reasonable minimum touch-target size on
  mobile.
- Tablet width never shows a broken hybrid of desktop and mobile layouts (e.g. a
  cut-off sidebar or overlapping cards).

## Security requirements

None — pure UI/QA.

## Acceptance criteria

- Every route in the app renders without horizontal overflow and with usable
  touch targets at 375px, 768px, and 1440px.
- Nav rail correctly shows icon-only at tablet width, full labels at desktop, and
  the bottom tab bar below 640px.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`.

## Manual test steps

1. Walk every route built so far at 375px, 768px, and 1440px; note and fix any
   overflow, cramped, or broken layout.
2. Specifically check the nav rail's three states (bottom tab bar / icon-only rail
   / full rail) transition correctly at the breakpoint boundaries.
3. On an actual touch device or touch-emulation mode, confirm buttons/steppers/
   row-taps are comfortably tappable, not requiring precision taps.
