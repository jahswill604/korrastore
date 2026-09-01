# Prompt: Accessibility Audit — KorraStore

## Goal

Audit every page built across Phases 02–04 for keyboard navigation, focus
management, color contrast, and screen-reader semantics — a cross-cutting QA pass
targeting WCAG 2.1 AA where practical for an MVP. Light mode only (simplifies
contrast auditing to a single palette).

## Skills read

- `02-design-system.md` — color tokens (verify contrast ratios against Paper
  background).
- Every interactive component built in Phases 01–04 (`Button`, `Modal`, `Tabs`,
  forms, tables).

## Existing code inspected

- Every client component with interactive state (modals, forms, tabs, the code/
  quantity selector, admin tables' action buttons).

## Decisions / assumptions

- **Focus trapping and return** for every `Modal`/sheet (focus moves into the
  modal on open, is trapped within it, and returns to the triggering element on
  close) — audit `Modal`'s implementation from `02-design-system.md` and every
  modal built on top of it (create-listing, buyback request, admin approve/
  reject, delete-account confirmation).
- **All interactive elements are reachable and operable via keyboard alone** —
  buttons, links, form fields, the quantity selector's increment/decrement,
  status filter tabs, table row actions.
- **Color contrast**: verify Soil-on-Paper, Harvest-Wheat-button-text, and status
  badge colors all meet at least 4.5:1 for body text / 3:1 for large text and UI
  components against their backgrounds; adjust token shades if any combination
  fails (e.g. Harvest Wheat may need a darker text color on top of it rather than
  white, depending on the actual computed contrast).
- **Semantic HTML/ARIA**: forms have associated labels, status badges/icons have
  accessible text equivalents (not color-only meaning), the `StatusStepper` and
  `LedgerReceipt` convey their information in text, not layout/color alone.

## Files likely to change / add

- Audit and patch: `components/ui/modal.tsx`, `tabs.tsx`, `button.tsx`,
  `badge.tsx`, `status-stepper.tsx`, `quantity-selector.tsx`, and every form
  component across auth, checkout, resale, buyback, and admin.
- `app/globals.css` — adjust any token shade that fails contrast auditing.

## Implementation requirements

- No information is conveyed by color alone anywhere in the app (status badges
  pair color with text/label; positive/negative value deltas pair color with a
  +/− symbol, not just green/red).
- Every form input has a properly associated `<label>` (visually present or
  `sr-only`, never a placeholder-only label).
- Interactive custom components (`Tabs`, `Modal`, `QuantitySelector`) implement the
  correct ARIA roles/attributes for their pattern.

## Security requirements

None — pure UI/QA.

## Acceptance criteria

- Every modal correctly traps and returns focus.
- Every interactive flow (sign up, checkout, create resale listing, submit
  buyback, admin approve/reject) can be completed using only a keyboard.
- All token color combinations used for text/UI meet WCAG AA contrast minimums.
- No status/value information relies on color alone.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`.

## Manual test steps

1. Using only Tab/Shift+Tab/Enter/Space/Arrow keys, complete: sign-up, a purchase
   through checkout, creating a resale listing, submitting a buyback request, and
   (as admin) approving a buyback request. Confirm no step requires a mouse.
2. Open every modal in the app via keyboard; confirm focus moves in, stays trapped,
   and returns to the trigger on close (Escape key included).
3. Run an automated contrast checker against the design-system token values;
   confirm all text/UI combinations meet AA; adjust tokens if any fail.
4. Use a screen reader (VoiceOver/NVDA) to navigate `/my-storage` and an order's
   status stepper; confirm status/value information is announced meaningfully, not
   just visually implied.
