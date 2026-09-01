# Prompt: Admin Settings — KorraStore

## Goal

Build `/admin/settings`: platform-level configuration — low-inventory alert
thresholds, resale listing default/max expiration, admin user management (granting/
revoking the `admin` role) — and general platform info. Desktop + mobile, light
mode only.

## Skills read

- `.agents/skills/supabase/SKILL.md` — `profiles.role` updates (admin-granting is
  extremely sensitive — service-role only, admin-gated), settings storage pattern.
- `02-design-system.md` — `Card`, `Modal`, `Badge`, `Button`.
- `AGENTS.md` §13 (role is never client-editable outside this explicit admin flow),
  §21 (config values, not secrets — no credentials live here).

## Existing code inspected

- `17-admin-dashboard.md` — reads the low-inventory threshold this page manages.
- `13-create-resale.md` — reads the resale expiration options this page configures.

## Decisions / assumptions

- **A single `platform_settings` table** (key/value, or a small typed table with
  named columns — prefer named columns for the known v1 settings rather than a
  generic key/value blob, for type safety) holds: `low_inventory_threshold`,
  `resale_default_expiration_days`, `resale_max_expiration_days`.
- **Admin user management** is a separate, more sensitive section: search for a
  user by email, view their current role, and a "Grant admin" / "Revoke admin"
  action requiring a typed confirmation (per `AGENTS.md` §21's principal that role
  is never casually editable) — granting admin to the wrong account is a serious
  mistake, so this action is deliberately friction-heavy.
- **No multi-tier admin permissions** for the MVP (per `AGENTS.md` §6's explicit
  out-of-scope) — just `user`/`admin`, no granular permission sets.

## Visual interpretation (light mode only)

### Platform settings — Desktop & Mobile
Simple form inside a `Card`: numeric inputs for the threshold/expiration settings,
"Save" button with a success `Toast`.

### Admin user management — Desktop
Search input (by email). Result shows the user's current role `Badge` and a
"Grant admin" or "Revoke admin" button (whichever is applicable) that opens a
confirmation `Modal` requiring the admin to type the target user's email to
confirm, plus a short reason field (logged to `audit_logs`).

### Admin user management — Mobile
Same content, search result card stacks the role badge and action button.

## Files likely to change / add

- `app/admin/settings/page.tsx`.
- `components/admin/settings/platform-settings-form.tsx` (client),
  `admin-user-search.tsx` (client), `grant-revoke-admin-modal.tsx` (client).
- `supabase/migrations/000X_platform_settings.sql` — the settings table + seed
  defaults.
- `lib/supabase/queries/admin/settings.ts` — `getPlatformSettings()`,
  `updatePlatformSettings(...)`, `setUserRole(userId, role, adminId, reason)`.
- `app/api/admin/settings/route.ts` — `POST`, admin-role-gated.

## Implementation requirements

- `setUserRole` writes to `profiles.role` via the service-role client only, never
  via a client-editable path, and always logs to `audit_logs` with the acting
  admin, target user, old role, new role, and reason.
- Platform settings changes are logged to `audit_logs` as well (lower severity, but
  still recorded).

## Security requirements

- Admin-role-gated at layout, page, and API route level.
- Role changes require typed confirmation of the target user's email, reducing the
  chance of an accidental grant/revoke.

## Acceptance criteria

- Platform settings save and correctly affect the pages that read them (low-
  inventory alert on `17-admin-dashboard.md`, expiration options on
  `13-create-resale.md`).
- Granting/revoking admin correctly updates `profiles.role`, requires typed
  confirmation, and is logged with a reason.
- Layout matches spec at mobile/desktop.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test`
  (unauthorized role-change attempt rejected).

## Manual test steps

1. `npm run dev`; sign in as admin; visit `/admin/settings`.
2. Update the low-inventory threshold; confirm it saves and affects the dashboard
   alert.
3. Search for a test user; grant admin, confirming the typed-email confirmation
   step; verify the user's role updates and `audit_logs` records it.
4. Revoke that same admin grant; confirm it reverts correctly.
5. Resize to ~375px and ~1440px — confirm layout matches spec.
