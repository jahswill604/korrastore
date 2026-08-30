# Prompt: Project Foundation — KorraStore

## Goal

Initialize the Next.js (App Router) + TypeScript project skeleton that every later
prompt builds on: base folder structure, tooling, environment variable scaffolding,
and the three Supabase client factories (browser/server/service-role) stubbed but
not yet wired to real tables. No design tokens (that's `02-design-system.md`), no
auth (`04-auth.md`), no schema (`03-database-schema.md`) — this prompt is pure
project plumbing.

## Skills read

- `AGENTS.md` §6 (tech stack), §21 (env vars, code standards), §22 (commands/checks).
- `.agents/skills/supabase/SKILL.md` — client factory shapes (browser/server/service
  role), server-only boundary conventions.

## Existing code inspected

- Empty repository / fresh `create-next-app` output. Confirm the installed Next.js
  major version and whether Tailwind was scaffolded as v3 (`tailwind.config.ts`) or
  v4 (`@theme` in CSS) before writing any config — do not assume from memory; check
  `package.json` and `node_modules/next/dist/docs/`.

## Decisions / assumptions

- **Package manager:** npm (matches `AGENTS.md` §22's `npm run ...` commands).
- **Folder structure** follows the `AGENTS.md` §5 layering: `app/` (routes),
  `components/ui/` (primitives, added in `02-design-system.md`),
  `components/<feature>/` (feature UI), `lib/supabase/` (clients + queries),
  `lib/domain/` (Ledger / Payments / Valuation / Notifications services, added in
  Phase 04), `lib/types.ts`, `supabase/schema.sql` + `supabase/migrations/`.
- **No UI framework decision beyond Tailwind + shadcn/ui conventions yet** — actual
  components arrive in `02-design-system.md`.
- **Testing:** set up Vitest (or the project's already-configured runner if one
  exists — check first) with a `npm run test` script per `AGENTS.md` §22, even
  though no tests exist yet in this pass; later prompts (esp. payments/ledger) add
  real suites here.

## Files likely to change / add

- `package.json` — scripts: `dev`, `build`, `start`, `typecheck` (`tsc --noEmit`),
  `lint` (`eslint`), `test` (`vitest run` or equivalent).
- `tsconfig.json` — strict mode on, path alias `@/*` → project root.
- `app/layout.tsx` — minimal root layout, KorraStore metadata (title, description,
  favicon placeholder), `<html lang="en">`, no font/theme wiring yet (arrives in
  `02-design-system.md`).
- `app/page.tsx` — temporary placeholder ("KorraStore — coming soon") until
  `06-home-browse.md` implements the real marketplace at a decided route (confirm
  whether `/` is the public marketing/browse entry or redirects to `/home` once
  `04-auth.md`'s one-login-two-experiences redirect exists — flag this for
  `04-auth.md` to resolve, don't guess it here).
- `lib/supabase/client.ts` — browser client factory stub (anon key).
- `lib/supabase/server.ts` — server client factory stub (anon key + session cookie
  via `@supabase/ssr`).
- `lib/supabase/service.ts` — service-role client factory stub, marked
  `import "server-only"` at the top, not imported anywhere yet.
- `lib/types.ts` — empty shared-types file, populated incrementally by later prompts.
- `.env.example` — full canonical list per `AGENTS.md` §21, placeholder values only.
- `.gitignore` — standard Next.js ignores + `.env.local`.
- `README.md` — setup instructions (install, env vars, `npm run dev`).

## Implementation requirements

- `lib/supabase/service.ts` must be unreachable from any client component — verify
  no `"use client"` file imports it.
- `.env.example` and `AGENTS.md`'s env table must match exactly; if they diverge,
  fix `.env.example`, not `AGENTS.md`.
- No business logic, no Supabase tables assumed to exist yet — this prompt does not
  read or write any data.

## Security requirements

- No real credentials committed anywhere, including `.env.example` (placeholders
  only) or test fixtures.

## Acceptance criteria

- `npm run dev` starts cleanly and serves the placeholder home page.
- `npm run typecheck`, `npm run lint`, `npm run build`, and `npm run test` (with zero
  tests, a passing empty run) all succeed.
- `.env.example` contains every variable from `AGENTS.md` §21 with safe placeholders.
- Folder structure matches the layering described above.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test`.

## Manual test steps

1. Clone the repo fresh, copy `.env.example` to `.env.local` with real dev
   credentials, run `npm install && npm run dev`.
2. Visit `/` — confirm the placeholder page renders with no console errors.
3. Confirm `lib/supabase/service.ts` is not imported by any file under
   `components/` or any `"use client"` file (`grep -r "service-role\|service.ts" .`
   as a sanity check).
