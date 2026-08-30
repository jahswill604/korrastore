# Prompt: Onboarding — KorraStore

## Goal

Build a short, optional first-run onboarding flow shown once after a new buyer's
account is created (post `04-auth.md`), introducing the core concept — buy real
commodities, own them as stored inventory, track value, resell or request buyback —
before landing on `/home`. Desktop + mobile, light mode only.

## Skills read

- `.agents/skills/supabase/SKILL.md` — reading/writing an `onboarding_completed`
  flag on `profiles`.
- `02-design-system.md` — `Button`, `Card`, `LedgerReceipt` (used as an illustrative
  preview, not a real receipt).
- `04-auth.md` — this flow sits between signup completion and `/home`.

## Existing code inspected

- `04-auth.md` — post-signup redirect currently points straight to `/home`; this
  prompt inserts a check before that redirect.
- `03-database-schema.md` — confirm `profiles` has (or add via a small migration
  here) an `onboarding_completed boolean default false` column.

## Decisions / assumptions

- **Three-step, skippable carousel**, not a mandatory gate — a "Skip" affordance is
  always visible. Steps: (1) "Buy real commodities" — rice/garlic/beans/melon
  illustration, (2) "Own it, track its value" — illustrative `LedgerReceipt` +
  simple value-over-time sketch, (3) "Resell or request a buyback anytime" — simple
  two-path illustration.
- Completing or skipping sets `profiles.onboarding_completed = true` so it never
  shows again.

## Visual interpretation (light mode only)

### Desktop
Centered card, max-width ~560px, on the same Paper/paper-texture background as auth.
Step content centered (illustration/icon, H2 headline, one-line body copy), dot
indicator below, "Skip" text-link top-right of the card, "Next"/"Get started"
primary `Button` bottom-right.

### Mobile
Full-viewport step content (not a floating card — feels more immersive on small
screens), same headline/body/dot-indicator/button pattern, "Skip" pinned top-right
as a small text button.

## Files likely to change / add

- `app/onboarding/page.tsx`.
- `components/onboarding/step-carousel.tsx` (client — step state, swipe/tap
  navigation on mobile).
- `supabase/migrations/000X_add_onboarding_flag.sql` (if not already present from
  `03-database-schema.md`).
- `lib/supabase/queries/profile.ts` — `markOnboardingComplete(userId)`.
- Update `middleware.ts` or the post-signup redirect in `04-auth.md`'s flow: if
  `onboarding_completed = false`, route to `/onboarding` instead of `/home`.

## Implementation requirements

- Skipping and completing both call the same `markOnboardingComplete` write —
  no separate "skipped" state needs to be tracked.
- `"use client"` scoped to the carousel only.

## Security requirements

- The onboarding-flag write is scoped to `auth.uid()`.

## Acceptance criteria

- A brand-new account sees onboarding once, then lands on `/home` on subsequent
  visits without it reappearing.
- Skip works from any step.
- Layout matches spec at mobile/desktop.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`.

## Manual test steps

1. Sign up a new test account; confirm onboarding appears before `/home`.
2. Click through all three steps; confirm landing on `/home` afterward.
3. Sign out, sign back in; confirm onboarding does not reappear.
4. Repeat with a fresh account and use "Skip" on step one; confirm the same
   completed state is recorded.
5. Resize to ~375px and ~1440px — confirm layout matches spec.
