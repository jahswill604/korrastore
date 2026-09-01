# Feature 05: Onboarding — KorraStore Implementation Prompt

## Context references
- UI design: `prompts/ui degine/05-onboarding/desktop-preview.html` + `mobile-preview.html`
- Backend workflow: `prompts/backend-wookflow/05-onboarding/workflow.html`
- Design system rules: `AGENTS.md` Feature 02 block
- Auth rules: `AGENTS.md` Feature 04 block
- DB schema: `supabase/migrations/0001_init.sql` (profiles table L100–107)
- RLS policies: `supabase/migrations/0002_rls.sql` (profiles policies L49–59)
- Button component: `components/ui/button.tsx`
- LedgerReceipt component: `components/ui/ledger-receipt.tsx`
- Server client: `lib/supabase/server.ts`
- Auth callback (to modify): `app/auth/callback/route.ts`
- Middleware base (version archive): `version progress/04-auth/middleware.ts`

## What to build

A three-step skippable onboarding carousel shown once to new buyers immediately after signup, before `/home`. Completing or skipping sets `profiles.onboarding_completed = true`.

## Files to create / modify

### 1. `supabase/migrations/0005_add_onboarding_flag.sql`
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;
```

### 2. `lib/supabase/queries/profile.ts`
- `markOnboardingComplete(userId)` — server-side UPDATE using createClient()
- `getOnboardingStatus(userId)` — SELECT onboarding_completed FROM profiles

### 3. `middleware.ts` (project root)
Based on `version progress/04-auth/middleware.ts`. Add:
- `/onboarding` to PROTECTED_BUYER_ROUTES (needs session)
- After confirming authenticated user is on a buyer route, check `onboarding_completed`. If false AND not already on `/onboarding`, redirect to `/onboarding`.
- If authenticated user visits `/onboarding` but `onboarding_completed = true`, redirect to `/home`.

### 4. `app/onboarding/actions.ts`
`"use server"` server action calling `markOnboardingComplete`.

### 5. `app/onboarding/page.tsx`
Server component. Renders `<StepCarousel />`. Passes userId as prop.

### 6. `components/onboarding/step-carousel.tsx`
`"use client"`. Three steps: Buy / Track / Resell-Buyback. Skip + Next/Get Started. Calls server action on complete/skip, then `router.push("/home")`.

### 7. Modify `app/auth/callback/route.ts`
After successful code exchange for `role = user`, check `onboarding_completed`. If false → redirect `/onboarding`.

## Design rules (strictly enforced)
- Light mode only. Paper (#F7F4EA) background, Harvest Wheat (#D8B56A) CTAs.
- Desktop: centered card ~560px max-width, Skip top-right of card, dots row, Next/Get Started bottom-right.
- Mobile (≤768px): Full-viewport layout, no floating card, Skip pinned top-right.
- DM Serif Display for headlines, Inter for body, IBM Plex Mono for mono/numbers.
- Security: onboarding write scoped to auth.uid() via RLS (no service role needed).
- `"use client"` only on StepCarousel, not page.tsx.
