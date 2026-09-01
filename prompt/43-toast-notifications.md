# Prompt: Toast Notifications Component — KorraStore

## Goal

Fully implement the `Toast` primitive stubbed in `02-design-system.md` and
standardize its use across the app for transient success/info/error feedback
(profile saved, listing created, notification resent, etc.), replacing any ad hoc
inline "Saved!" text introduced in earlier prompts. Light mode only.

## Skills read

- `02-design-system.md` — token shell/stub.
- Every prompt that mentions "a brief success toast" (`16-profile-settings.md`,
  `13-create-resale.md`, `20-admin-pricing.md`, `24-admin-settings.md`, etc.).

## Decisions / assumptions

- **A single toast host/provider** mounted once in the root layout (buyer and
  admin trees can share it, or each tree mounts its own instance if layout
  structure makes that cleaner — decide during implementation, but avoid
  duplicating the underlying toast-queue logic).
- **Variants**: success (Deep Grain Green accent), error (danger accent), info
  (Trust Indigo accent) — each with an icon + message, auto-dismissing after a
  reasonable duration (~4s), with a manual dismiss (×) always available.
- **Toasts are for transient, non-blocking feedback only** — anything requiring
  the user to make a decision uses `ConfirmDialog` (`42-confirmation-dialogs.md`)
  or an inline error banner (`34-error-states.md`), not a toast.

## Files likely to change / add

- `components/ui/toast.tsx`, `toast-provider.tsx` (client), `use-toast.ts` (hook).
- `app/layout.tsx` (and `app/admin/layout.tsx` if separate) — mount the provider.
- Update call sites across profile settings, create-resale, admin pricing, admin
  settings, and any other "brief success toast" reference to use `useToast()`
  instead of ad hoc inline state.

## Implementation requirements

- Toast queue supports multiple simultaneous toasts (stacked, not overwriting each
  other).
- Auto-dismiss timing is pausable on hover/focus so a user reading a toast doesn't
  have it disappear mid-read.
- Satisfies `36-accessibility.md`: toasts use an appropriate ARIA live region so
  screen readers announce them without requiring focus to move.

## Security requirements

None — pure UI feedback.

## Acceptance criteria

- All prior "brief success toast" references now use this single shared
  component/hook.
- Multiple toasts stack correctly without overlapping or replacing each other
  unexpectedly.
- Screen readers announce toast content via a live region.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`.

## Manual test steps

1. Save a profile change, create a resale listing, update a commodity's price, and
   change a platform setting — confirm each shows a consistent success toast.
2. Trigger two actions in quick succession; confirm both toasts stack visibly
   rather than one replacing the other.
3. Hover over a toast; confirm its auto-dismiss timer pauses.
4. Use a screen reader; confirm toast content is announced without manual focus.
