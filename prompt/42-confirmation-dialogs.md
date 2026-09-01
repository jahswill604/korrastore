# Prompt: Confirmation Dialogs — KorraStore

## Goal

Standardize destructive/consequential-action confirmation across the app (delete
account, cancel resale listing, admin reject buyback, admin cancel listing, admin
grant/revoke role) into one reusable `ConfirmDialog` pattern built on the `Modal`
primitive, replacing any bespoke confirmation UI introduced ad hoc in earlier
prompts. Light mode only.

## Skills read

- `02-design-system.md` — `Modal` primitive.
- `16-profile-settings.md` (delete account), `13-create-resale.md` (cancel
  listing), `21-admin-resale-buyback.md` (reject/cancel), `24-admin-settings.md`
  (grant/revoke role) — the confirmation flows this pass consolidates.

## Existing code inspected

- Each of the above prompts' own confirmation modal implementation.

## Decisions / assumptions

- **Two confirmation tiers**:
  1. **Standard confirm** — a `Modal` with a clear description of the consequence
     and "Confirm"/"Cancel" buttons (used for: cancel resale listing, admin reject
     buyback with reason, admin cancel listing).
  2. **Typed confirmation** — requires typing a specific phrase or the target's
     email/ID before the confirm button enables (used for: delete account, admin
     grant/revoke role) — reserved for actions that are either irreversible or
     unusually high-impact.
- **One shared component `ConfirmDialog`** supports both tiers via a
  `requireTypedConfirmation` prop, rather than each flow building its own modal
  from scratch.

## Files likely to change / add

- `components/ui/confirm-dialog.tsx` (client) — the shared component.
- Update call sites in `16-profile-settings.md`'s delete-account flow,
  `13-create-resale.md`'s cancel-listing flow, `21-admin-resale-buyback.md`'s
  reject/cancel flows, and `24-admin-settings.md`'s grant/revoke-role flow to use
  this shared component instead of any bespoke modal.

## Implementation requirements

- Typed-confirmation variant disables the confirm button until the typed input
  exactly matches the required phrase/value.
- Satisfies `36-accessibility.md`'s modal focus-trap/return requirements (inherits
  from the base `Modal`).
- Destructive actions always use the `Button` destructive variant for the confirm
  action.

## Security requirements

None beyond ensuring the confirmation UI never bypasses the actual server-side
authorization/validation of the action it confirms — this is a UX safeguard, not a
security control.

## Acceptance criteria

- All five listed flows use the same underlying component with consistent visual
  treatment and behavior.
- Typed-confirmation flows correctly gate the confirm action until the exact match
  is typed.
- Standard-confirm flows work with a single clear confirm/cancel choice.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`.

## Manual test steps

1. Re-test delete-account, cancel-resale-listing, admin-reject-buyback, admin-
   cancel-listing, and admin-grant/revoke-role flows; confirm all use the same
   visual/interaction pattern now.
2. Confirm typed-confirmation flows correctly block confirmation until the exact
   phrase/value is entered.
3. Confirm all dialogs are keyboard-operable and trap/return focus correctly.
