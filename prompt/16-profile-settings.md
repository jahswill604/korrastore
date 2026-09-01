# Prompt: Profile & Account Settings — KorraStore

## Goal

Build `/profile`: name, phone, email, and account actions (logout, delete account).
Desktop + mobile, light mode only. KorraStore has no subscription billing (unlike a
SaaS product) — this page covers identity/account management only, not payment
methods or plans.

## Skills read

- `.agents/skills/supabase/SKILL.md` — `profiles` updates scoped to `auth.uid()`,
  Supabase Auth email/phone change flows.
- `02-design-system.md` — `Card`, `Button`, `Modal`.
- `04-auth.md` — reuses the session/logout pattern established there.

## Existing code inspected

- `04-auth.md` — `lib/hooks/use-user.ts`, logout server action/route.
- `03-database-schema.md` — `profiles` schema.

## Decisions / assumptions

- **Sections:** Profile (name, avatar placeholder — a simple initials avatar is
  fine for v1, no upload pipeline unless requested), Contact (email, phone — both
  changes go through Supabase Auth's confirmation flow, not a direct silent
  update), Account (logout, delete account).
- **Delete account** is a destructive, two-step confirmation (typed confirmation
  text, e.g. typing "DELETE") — never a single click. Deleting an account with
  active holdings/orders/listings should be blocked with a clear message rather
  than silently orphaning financial records (confirm this constraint is enforced
  server-side, not just suggested in the UI copy).

## Visual interpretation (light mode only)

### Desktop
Left: a simple vertical section nav (Profile / Contact / Account) inside the
content area. Right: the active section's form inside a `Card`, standard form-field
styling, "Save" button showing a brief success `Toast` on save.

### Mobile
Section nav becomes a horizontally scrollable tab row at top; form below, full
width.

### Delete-account flow
A `Modal` requiring the user to type a confirmation phrase before the destructive
action enables; if the account has active holdings/orders/listings, show a blocking
message explaining why deletion isn't currently possible instead of proceeding.

## Files likely to change / add

- `app/profile/page.tsx`.
- `components/profile/section-nav.tsx`, `profile-form.tsx` (client),
  `contact-form.tsx` (client), `account-section.tsx` (client — logout/delete).
- `lib/supabase/queries/profile.ts` — `getProfile`, `updateProfile`.
- `app/api/profile/route.ts` — `POST`, session-authenticated.
- `app/api/account/delete/route.ts` — `POST`, checks for active
  holdings/orders/listings before proceeding; if clear, deletes the Supabase Auth
  user (cascading per RLS/FK rules) and logs the deletion in `audit_logs`.

## Implementation requirements

- Profile/contact updates write to `profiles`/Supabase Auth, scoped to
  `auth.uid()`.
- Delete-account is blocked server-side (not just UI-side) if the account has any
  non-zero holdings, active orders, active resale listings, or pending buyback
  requests.
- `"use client"` scoped to the three forms and account-actions section.

## Security requirements

- All writes scoped to `auth.uid()`.
- Email/phone changes go through Supabase Auth's own confirmation mechanism, never
  a direct unverified overwrite.

## Acceptance criteria

- Profile/contact sections save and persist correctly, with confirmation flows for
  email/phone changes.
- Delete-account requires explicit typed confirmation and is blocked when the
  account has active financial state, with a clear explanatory message.
- Layout matches spec at mobile/desktop.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`.

## Manual test steps

1. `npm run dev`; sign in; visit `/profile`, update the display name — confirm it
   saves and persists on reload.
2. Attempt to change email/phone — confirm the appropriate Supabase confirmation
   flow triggers.
3. Attempt account deletion on an account with an active holding — confirm it's
   blocked with a clear message.
4. Attempt account deletion on a clean test account with no holdings/orders/
   listings — confirm the confirmation step works and deletion succeeds.
5. Resize to ~375px and ~1440px — confirm layout matches spec.
