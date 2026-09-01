# Version Progress — 01-project-foundation

## Overview
This folder contains the complete, self-contained snapshot of **Version 01: Project Foundation** (`01-project-foundation`).

- **Version Name**: `01-project-foundation`
- **Feature**: Initial Next.js 16 (App Router) + TypeScript plumbing, Supabase client factories (`client.ts`, `server.ts`, `service.ts`), environment variable scaffolding (`.env.example`), Vitest configuration, and overview documentation (`docs/overview.md`).

## Included Assets & Code
- `app/`: Root layout shell (`layout.tsx`) and foundation status landing page (`page.tsx`).
- `lib/`:
  - `types.ts`: Global domain types.
  - `supabase/client.ts`: Browser anon key Supabase client.
  - `supabase/server.ts`: Server cookie-bound Supabase client via `@supabase/ssr`.
  - `supabase/service.ts`: Service-role administrative Supabase client guarded by `import "server-only"`.
- `docs/`: `overview.md` code documentation.
- `prompts/`: Feature requirement and implementation guides.
- `prompts/ui degine/01-project-foundation/`: Mobile and Desktop UI mockups (`mobile-ui.png`, `desktop-ui.png`).
- `prompts/backend-wookflow/01-project-foundation/`: Backend workflow diagram (`workflow.png`).
- `build-prompt/01-project-foundation.md`: Contextual build prompt.
- `.env.example`, `AGENTS.md`, `package.json`, `vitest.config.mts`.
