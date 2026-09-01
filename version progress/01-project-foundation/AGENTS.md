<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Feature 01: Project Foundation (KorraStore)

## Architecture & Layering Rules
- **Framework**: Next.js 16 (App Router) + TypeScript.
- **Supabase Clients**:
  - `lib/supabase/client.ts`: Browser anon key client.
  - `lib/supabase/server.ts`: Server cookie-bound client via `@supabase/ssr`.
  - `lib/supabase/service.ts`: Service-role client guarded by `import "server-only"`.
- **Environment Scaffolding**: `.env.example` must contain safe placeholders for `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`, `RESEND_API_KEY`, `TERMII_API_KEY`.
- **Testing & Tooling**: `package.json` scripts must include `dev`, `build`, `start`, `lint`, `typecheck`, `test`.
- **Documentation**: All new/updated code must include inline file & block comments and be recorded in `docs/overview.md`.

