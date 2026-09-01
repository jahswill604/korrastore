# Implementation Prompt: Feature 16 — Profile & Account Settings

## Goal
Build `/profile`: a comprehensive buyer-facing profile and account management interface for KorraStore. Allows buyers to manage their identity (full name, initials avatar, role badge, member since info), contact details (email address, phone number with Supabase Auth verified change flows), security actions (logout from active session), and protected account termination (guarded two-step deletion requiring zero active holdings, orders, resale listings, or pending buybacks). Backed by `profiles` table, Supabase Auth APIs, and `audit_logs`. Desktop + mobile, strictly light mode only.

---

## Context Files to Read Before Writing Any Code
1. `prompt/16-profile-settings.md` & `prompts/16-profile-settings.md` — canonical feature spec, decisions, and acceptance criteria
2. `AGENTS.md` — architecture, ledger rules, and Feature 16 Profile & Account Settings rules
3. `.agents/skills/supabase/SKILL.md` — DB queries, RLS scoping (`auth.uid() = user_id`), `profiles` table structure
4. `prompts/02-design-system.md` — `Card`, `Button`, `Modal`, `Toast`, `Badge`, `Avatar`
5. `docs/overview.md` — existing codebase architecture and file maps

---

## Design References
- **Desktop UI**: `prompts/ui degine/16-profile-settings/desktop-ui.png`
- **Mobile UI**: `prompts/ui degine/16-profile-settings/mobile-ui.png`
- **Backend Workflow**: `prompts/backend-wookflow/16-profile-settings/workflow.png`
- **Brand Reference**: `ui refrence/ChatGPT Image Aug 30, 2026, 11_53_48 AM.png`

---

## Design Tokens & Palette (Light Mode Only)

| Token | Value | Usage |
|-------|-------|-------|
| Paper | `#F7F4EA` | Page background, card backgrounds, input fill base |
| Soil | `#4A3828` | Primary text, titles, headings, active nav indicator |
| Harvest Wheat | `#D8B56A` | Active nav rail pill, active section indicator, Save button CTA |
| Husk | `#A88958` | Secondary labels, timestamps, member status info |
| Deep Grain Green | `#21483A` | Avatar background, verified buyer badge |
| Trust Indigo | `#303B63` | Informational links, secondary buttons |
| Border | `#E4DCC8` | Card outlines, input borders, divider lines |
| Danger | `#B3432E` | Account deletion button, destructive warnings |

---

## Database & Schema Considerations
1. **Profiles Table**:
   - `profiles` table with columns: `id` (references `auth.users`), `full_name`, `email`, `phone_number`, `role` (`'user' | 'admin'`), `created_at`, `updated_at`.
2. **RLS Policies**:
   - `SELECT`, `UPDATE` strictly restricted to `auth.uid() = id`.
3. **Financial Invariants for Deletion**:
   - Query `holdings` (ensure `quantity = 0` or no rows).
   - Query `orders` (ensure no rows where `status IN ('pending_payment', 'sourcing', 'in_transit')`).
   - Query `resale_listings` (ensure no rows where `status = 'active'`).
   - Query `buyback_requests` (ensure no rows where `status IN ('pending', 'approved')`).
4. **Audit Logging**:
   - Record account deletion event in `audit_logs` before terminating user record.

---

## Files to Create & Update

### 1. `lib/supabase/queries/profile.ts` (New)
- `getProfile(userId: string)`:
  - Fetches the user profile from `profiles` where `id = userId`.
- `updateProfile(userId: string, data: { full_name?: string })`:
  - Updates profile metadata in `profiles` where `id = userId`.

### 2. `app/api/profile/route.ts` (New — POST API)
- Updates user display name and profile fields.
- Verifies session via `supabase.auth.getUser()`.
- Updates `profiles` table scoped to `auth.uid()`.

### 3. `app/api/account/delete/route.ts` (New — POST API)
- Verifies session via `supabase.auth.getUser()`.
- Validates typed confirmation string (e.g. `confirmation: "DELETE"`).
- Checks all four financial invariant rules server-side:
  - Active holdings (`quantity > 0`)
  - In-progress orders (`pending_payment`, `sourcing`, `in_transit`)
  - Active resale listings (`active`)
  - In-progress buyback requests (`pending`, `approved`)
- If any active financial records exist, returns HTTP 400 with a detailed descriptive error explaining why deletion is blocked.
- If all clear, creates an `audit_logs` entry, uses service-role Supabase client to delete the auth user, and signs out.

### 4. `components/profile/section-nav.tsx` (New — Client Component)
- Desktop: Left vertical navigation tabs (Personal Profile, Contact Details, Security & Password, Account Actions).
- Mobile: Horizontally scrollable pill tabs at top of page.
- Smooth section switching with URL search param or active state.

### 5. `components/profile/profile-form.tsx` (New — Client Component)
- Large circular initials avatar with `Verified Buyer` badge and role indicator.
- Full Name input field with real-time feedback.
- Save Changes button with toast notification on update.

### 6. `components/profile/contact-form.tsx` (New — Client Component)
- Email address display + "Change Email" button triggering Supabase Auth verified email change modal/prompt.
- Phone number display + "Change Phone" button.
- Clear contextual guidance that credentials require email/SMS confirmation to take effect.

### 7. `components/profile/account-section.tsx` (New — Client Component)
- Session logout button calling server-side logout action.
- "Delete Account" button launching destructive confirmation modal (`DeleteAccountModal`).
- Two-step typed confirmation modal requiring user to type "DELETE".
- Displays informative error banner if deletion is blocked due to active financial holdings or open trades.

### 8. `app/profile/page.tsx` (New — Server Component)
- Protected route: verifies session via `supabase.auth.getUser()` (redirects unauthenticated visitors to `/login?redirect=/profile`).
- Fetches profile data via `getProfile(userId)`.
- Renders inside `AppShell` with active `Profile` nav rail pill.

---

## Security & Architecture Rules
1. All profile operations strictly scoped to `auth.uid() = id`.
2. Email/phone updates MUST go through Supabase Auth's verified change flows, never direct unvalidated database overwrites.
3. Account deletion MUST enforce financial invariant checks server-side to prevent orphaning active warehouse stock or pending financial obligations.
4. Light mode only — no dark mode tokens.

---

## Verification & Checks
```bash
npm run typecheck
npm run lint
npm run build
```
