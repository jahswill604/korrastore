# Implementation Directives: 01-project-foundation — KorraStore

## Target Architecture & Folder Layering
- `app/layout.tsx`: Root HTML shell with KorraStore metadata, UTF-8 charset, viewport tag, and `<html lang="en">`.
- `app/page.tsx`: Placeholder home screen ("KorraStore — Own food. Earn value. Launching Soon") with minimal inline status indicators.
- `lib/supabase/client.ts`: Browser Supabase client instantiation using `@supabase/supabase-js` or `@supabase/ssr` with `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `lib/supabase/server.ts`: Server Supabase client factory using `@supabase/ssr` with Next.js `cookies()` helper for Server Components and Server Actions.
- `lib/supabase/service.ts`: Administrative Service-Role Supabase client factory with `import "server-only";` header to prevent any client-side imports or leaks.
- `lib/types.ts`: Central export file for global domain types (stubbed with placeholder interfaces).
- `.env.example`: Canonical environment variables scaffolding file containing:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `PAYSTACK_SECRET_KEY`
  - `PAYSTACK_PUBLIC_KEY`
  - `RESEND_API_KEY`
  - `TERMII_API_KEY`
- `package.json`: Scripts:
  - `"dev": "next dev"`
  - `"build": "next build"`
  - `"start": "next start"`
  - `"lint": "eslint"`
  - `"typecheck": "tsc --noEmit"`
  - `"test": "vitest run"`

## Code Documentation Standards
- Every file MUST contain a top-level file header comment explaining its role, location, and imports.
- Block-level comments on imports, helper factories, and exported functions.
- All code additions will be tracked in `docs/overview.md`.
