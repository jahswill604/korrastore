# Version Progress: Feature 04 — Auth Pages & Role-Based Routing

## Overview
This version implements end-to-end Supabase authentication, Next.js Edge middleware session verification & route protection, and server-side role-based routing (**One Login, Two Experiences** routing admins to `/admin` and regular users to `/home`).

### Artifacts Implemented:
1. **Form Input Primitives**:
   - `components/ui/input.tsx`: Accessible input supporting labels, errors, prefix slots (country flag / code), and suffix slots (password reveal toggle).
2. **Auth Components**:
   - `components/auth/background-texture.tsx`: Vintage ledger paper background container.
   - `components/auth/auth-card.tsx`: Double-bordered ledger card with DM Serif Display wordmark and tab switcher.
   - `components/auth/login-form.tsx`: Client-side email + password sign-in form with error handling and role-based redirect.
   - `components/auth/signup-form.tsx`: Client-side registration form capturing name, email, Nigerian phone (+234), and password.
   - `components/auth/otp-form.tsx`: 6-digit phone OTP verification interface with auto-advance and countdown resend timer.
3. **App Router Pages & Route Handlers**:
   - `app/login/page.tsx`: Public login page redirecting logged-in users to `/admin` or `/home`.
   - `app/signup/page.tsx`: Public registration page.
   - `app/verify-phone/page.tsx`: Public phone OTP verification page.
   - `app/auth/callback/route.ts`: Code exchange handler for Supabase authentication.
   - `app/api/auth/logout/route.ts`: Server-side logout endpoint revoking session cookies.
4. **Middleware & Route Guards**:
   - `middleware.ts`: Next.js Edge Middleware verifying session via `supabase.auth.getUser()`, blocking non-admins from `/admin/*`, protecting buyer routes (`/orders`, `/my-storage`, `/checkout`, `/resale`, etc.), and redirecting signed-in users away from auth pages.
5. **State & Utilities**:
   - `lib/auth/get-current-user.ts`: Server helper querying `getUser()` and profile role.
   - `lib/hooks/use-user.ts`: Client hook subscribing to `onAuthStateChange`.
6. **Testing**:
   - `__tests__/auth-routing.test.ts`: Vitest test suite verifying "One Login, Two Experiences", admin barrier, and buyer route protection rules.
