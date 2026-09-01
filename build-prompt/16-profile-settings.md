# Feature 16: Profile & Account Settings — Build Prompt

## Overview
Implement `/profile`: the buyer-facing identity, contact, security, and account management page for KorraStore. Provides display name updates, initials avatar, Supabase Auth verified email/phone modification flows, active session logout, and guarded two-step account deletion that protects financial ledger integrity (blocks termination if active holdings, orders, resale listings, or pending buybacks exist) across desktop and mobile in light mode.

## References & Design Artifacts
- **Prompt Spec**: `prompt/16-profile-settings.md` & `prompts/16-profile-settings.md`
- **Desktop UI Design**: `prompts/ui degine/16-profile-settings/desktop-ui.png`
- **Mobile UI Design**: `prompts/ui degine/16-profile-settings/mobile-ui.png`
- **Backend Workflow**: `prompts/backend-wookflow/16-profile-settings/workflow.png`
- **Implementation Spec**: `prompts/implementation/16-profile-settings.md`
- **Design System & Architecture Rules**: `AGENTS.md` Feature 02 & Feature 16

## Instructions for Agent
Strictly read all referenced files before writing any code. Follow all design tokens (Light mode only, Harvest Wheat `#D8B56A`, Soil `#4A3828`, Deep Grain Green `#21483A`, Paper `#F7F4EA`, Border `#E4DCC8`, Danger `#B3432E`), RLS security constraints (`auth.uid() = id`), inline code comments, and documentation rules.

## Core Implementation Steps
1. **Database Queries**: `lib/supabase/queries/profile.ts` — fetch profile record and execute profile updates scoped to `auth.uid()`.
2. **API Routes**:
   - `app/api/profile/route.ts` (POST) — session-authenticated profile updates.
   - `app/api/account/delete/route.ts` (POST) — server-side guarded account deletion enforcing financial invariant checks across `holdings`, `orders`, `resale_listings`, and `buyback_requests` before user removal and audit logging.
3. **UI Components**:
   - `components/profile/section-nav.tsx` (desktop vertical tab rail, mobile scrollable pill tabs).
   - `components/profile/profile-form.tsx` (avatar, name input, role badge, save action).
   - `components/profile/contact-form.tsx` (email/phone displays with Supabase verification flows).
   - `components/profile/account-section.tsx` (logout action, delete account button with two-step typed confirmation modal and invariant guard warnings).
4. **App Route**: `app/profile/page.tsx` (authenticated Server Component inside `AppShell` with active `Profile` navigation pill).
