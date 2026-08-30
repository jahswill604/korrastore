# Prompt: Auth Pages & Role-Based Routing — KorraStore

## Goal

Implement Supabase Auth end-to-end: sign-up (email + phone), sign-in, session-aware
app shell, and the **one login, two experiences** routing rule from `AGENTS.md`
§13 — after authentication, the server checks `profiles.role` and routes admins to
`/admin` and regular users to `/home`. Build the sign-in/sign-up screens (desktop +
mobile, light mode only) plus server-side plumbing (server/browser/middleware
clients, protected-route middleware).

**In scope:** account creation, login, logout, session refresh, role-based
redirect, route protection for both buyer and admin route trees.
**Out of scope:** profile editing beyond what's needed for signup
(`16-profile-settings.md`), OAuth providers (email + phone OTP only for v1 — do not
add Google/GitHub login without being asked).

## Skills read

- `.agents/skills/supabase/SKILL.md` — browser/server/middleware client setup,
  `getUser()` vs `getSession()` security note, phone OTP via Supabase Auth, RLS.
- `02-design-system.md` — `Button`, `Card`, `Badge` tokens.
- `AGENTS.md` §13 (one login two experiences, admin role check server-side only),
  §15 (Termii is SMS-only, not a parallel OTP system), §21 (env vars).

## Existing code inspected

- `01-project-foundation.md` — `lib/supabase/client.ts` / `server.ts` stubs.
- `03-database-schema.md` — `profiles` table + signup trigger (`role = 'user'`
  default) already exist by the time this prompt runs.
- `02-design-system.md` — confirm `Button`, `Card` exist; add
  `components/ui/input.tsx` here if the design-system pass didn't include a text
  input primitive.

## Decisions / assumptions

- **No global `<AuthProvider>` context** — session state is read server-side
  per-request via the server client; client components needing live auth state
  (nav rail avatar/logout) use a small `useUser()` hook backed by
  `supabase.auth.onAuthStateChange`.
- **Sign-up captures email + password + phone number.** Phone OTP verification via
  Supabase Auth's phone flow runs either at signup or as a required step before
  first purchase (decide: require phone verification before checkout, since
  physical delivery/buyback payouts likely need a verified contact — flag this
  explicitly in the implementation and confirm with the user if ambiguous).
- **Protected routes:**
  - Buyer tree (session required, `role = user` or `admin` both allowed to view,
    but UI in nav differs): `/home`, `/commodities/*`, `/checkout`, `/orders/*`,
    `/my-storage`, `/receipts/*`, `/resale/*`, `/buyback/*`, `/notifications`,
    `/profile`.
  - Admin tree (session + `role = admin` required, hard-enforced server-side):
    `/admin`, `/admin/orders`, `/admin/inventory`, `/admin/pricing`,
    `/admin/resale`, `/admin/buybacks`, `/admin/reports`, `/admin/support`,
    `/admin/settings`.
  - Public: `/`, `/login`, `/signup`.
- **Redirect behavior:** signed-out user hitting a protected route → redirect to
  `/login?redirect=<original path>`; after login, redirect back to it, unless the
  original path is under `/admin` and the user is not an admin — in that case,
  after login, redirect to `/home` instead of back to the disallowed admin path.
- **Email/password + phone OTP only for v1.** No magic link, no OAuth.

## Visual interpretation (light mode only)

### Layout (both screens, both breakpoints)
Centered single-column auth card on a full-bleed Paper background (no nav rail on
these two pages) — the first "wow" moment before the buyer ever sees the
marketplace, styled to evoke a warehouse ledger's cover page rather than a generic
SaaS auth screen.

- **Desktop (≥1024px):** card max-width ~420px, vertically centered, generous
  whitespace either side; a subtle textured/paper-grain background treatment
  (CSS-only) rather than a glassy gradient glow, consistent with the KorraStore
  aesthetic.
- **Mobile (<640px):** card fills the width with 24px side padding, same vertical
  centering.

### Card content
- KorraStore wordmark (DM Serif Display) top of card.
- H2 heading ("Welcome back" / "Create your account"), body-md subcopy.
- Sign-up: email, phone number (with country-code aware input), password, show/hide
  toggle, primary `Button` (full width).
- Sign-in: email, password, show/hide toggle, primary `Button`.
- Secondary link row between the two routes.
- Inline error state (a `danger`-tinted banner) below the heading for invalid
  credentials/existing email — never a browser alert.
- Loading state on the submit button (spinner + disabled) during the request.
- If phone verification is required post-signup: an OTP-entry screen/step
  immediately follows successful sign-up, styled consistently with the auth card.

## Files likely to change / add

- `lib/supabase/client.ts`, `lib/supabase/server.ts` (finalize from the Phase 01
  stubs).
- `middleware.ts` (or `proxy.ts` — confirm current Next.js filename convention) —
  session refresh, protected-route redirect, and the role-based redirect logic for
  `/admin/*`.
- `app/login/page.tsx`, `app/signup/page.tsx`, `app/verify-phone/page.tsx`.
- `components/auth/auth-card.tsx`, `auth-form.tsx` (client), `otp-form.tsx` (client),
  `background-texture.tsx`.
- `lib/hooks/use-user.ts`.
- `app/api/auth/logout/route.ts` (or a server action).
- `.env.example` — confirm `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` present.

## Implementation requirements

- Auth forms are client components; the card shell stays a Server Component where
  possible.
- Use `getUser()` (never `getSession()`) in middleware/server checks.
- The admin-role check is read from `profiles.role` via a server-side query on every
  request to an admin route — never cached client-side, never inferred from email.
- Surface Supabase's actual error message rather than a generic one.

## Security requirements

- `SUPABASE_SERVICE_ROLE_KEY` never touches these pages.
- Middleware re-verifies via `getUser()` on every request to a protected route.
- Logout invalidates the session server-side, not just local state.
- A non-admin manually navigating to any `/admin/*` path receives a redirect/403,
  even with a valid session.

## Acceptance criteria

- Signing up creates a Supabase user + `profiles` row (`role = 'user'`) and, once
  phone verification (if required) completes, lands the buyer on `/home`.
- An account with `role = 'admin'` signing in lands on `/admin`, not `/home`.
- Visiting any protected route while signed out redirects to
  `/login?redirect=...`; visiting an admin route as a non-admin redirects to
  `/home` regardless of the `redirect` param.
- Invalid credentials show an inline error, not a crash.
- Both screens match the visual spec at mobile/desktop.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test` (add a test
  covering "non-admin hitting an admin route gets redirected" per `AGENTS.md` §19).

## Manual test steps

1. `npm run dev`; visit `/signup`, create an account with a test email/phone/
   password.
2. Complete phone verification if required; confirm redirect to `/home` and a
   `profiles` row exists with `role = 'user'`.
3. Log out; visit `/home` directly — confirm redirect to `/login?redirect=/home`.
4. Manually set a test account's `role` to `admin` in Supabase; log in — confirm
   redirect to `/admin`.
5. While signed in as the non-admin account, manually navigate to `/admin/orders` —
   confirm redirect/403, not a rendered admin page.
6. Try an invalid password — confirm inline error, not a page crash.
7. Resize to ~375px and ~1440px on both auth screens — confirm layout matches spec.
