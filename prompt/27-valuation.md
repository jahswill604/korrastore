# Prompt: Valuation & Pricing Cron — KorraStore

## Goal

Implement the scheduled valuation/pricing job (`AGENTS.md` §18): a Vercel Cron
route that publishes any scheduled price updates and ensures displayed commodity
values stay current, plus the order-reconciliation and stale-resale-listing-cleanup
jobs that share the same cron infrastructure. Backend only.

## Skills read

- `.agents/skills/supabase/SKILL.md` — service-role batch reads/writes.
- `AGENTS.md` §16 (valuation never stores current value on a holding — this job
  doesn't touch `holdings` at all), §18 (cron rules, `CRON_SECRET`).

## Existing code inspected

- `20-admin-pricing.md` — the manual price-update path this job's "scheduled price
  updates" concept parallels, if scheduled (future-dated) pricing is implemented;
  if `20-admin-pricing.md` only supports immediate updates (per its own decision),
  this job's "valuation" role is limited to sanity-check reconciliation (e.g.
  confirming the denormalized current-price pointer matches the latest
  `price_history` row) rather than applying new prices itself — implement whichever
  is actually true of the pricing prompt's final scope, don't assume scheduled
  pricing exists if it wasn't built.
- `13-create-resale.md` — `expires_at` on `resale_listings`, which this job's
  cleanup step reads.
- `18-admin-orders.md` — the exception/reconciliation state this job's order-
  reconciliation step surfaces into.

## Decisions / assumptions

- **Three responsibilities, one cron entry point** (`GET /api/cron/pipeline` or
  split into distinct routes — prefer distinct routes per job for clearer logs and
  independent failure handling, all still protected by `CRON_SECRET`):
  1. **Valuation job** — reconciles/publishes pricing state (per the note above).
  2. **Order reconciliation** — finds orders stuck in an inconsistent state (e.g.
     `paid` for longer than a threshold without progressing, or in an exception
     state) and flags/logs them for admin review; does not attempt automatic
     financial correction.
  3. **Stale resale-listing cleanup** — finds `resale_listings` past `expires_at`
     still `active`, releases their reserved quantity via the locking function, and
     sets status to `expired`.
- **Each job logs a structured summary** (per `AGENTS.md` §18's logging
  expectations, mirrored from SKEW's run-logging pattern): counts processed,
  counts affected, errors.

## Files likely to change / add

- `app/api/cron/valuation/route.ts`, `app/api/cron/order-reconciliation/route.ts`,
  `app/api/cron/resale-cleanup/route.ts` — `GET`, `CRON_SECRET`-protected (skip the
  check in local development per `AGENTS.md` §18).
- `lib/pipeline/valuation.ts`, `order-reconciliation.ts`, `resale-cleanup.ts` —
  the actual job logic, reusable/testable independent of the route handler.
- `vercel.json` — cron schedule entries for all three routes.

## Implementation requirements

- Every cron route rejects requests with a missing/wrong `CRON_SECRET` outside
  local development.
- Resale cleanup releases reservations via the same locking function used
  elsewhere — never a direct `UPDATE` on the holding's reserved quantity.
- Order reconciliation only flags/logs — it does not move money or ownership
  automatically; any correction is a manual admin action in `18-admin-orders.md`.

## Security requirements

- `CRON_SECRET` never committed to `.env.local`; injected by Vercel in production.
- Cron routes are not reachable/actionable by ordinary user sessions.

## Acceptance criteria

- Expired active resale listings are correctly transitioned to `expired` with
  their reservation released.
- Stuck/exception orders are surfaced for admin review without any automatic
  financial mutation.
- All three jobs log a clear structured summary on each run.
- Requests without a valid `CRON_SECRET` are rejected in a non-local environment.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test` (resale-
  cleanup correctly releases reservation; cron route rejects missing secret).

## Manual test steps

1. Seed a resale listing with a past `expires_at` still marked `active`; call
   `GET /api/cron/resale-cleanup` locally (secret check skipped in dev); confirm it
   transitions to `expired` and the seller's holding reservation is released.
2. Seed an order stuck in an exception state; call
   `GET /api/cron/order-reconciliation`; confirm it's logged/flagged, not silently
   auto-resolved.
3. Call any cron route with a wrong `CRON_SECRET` header against a
   non-local-simulated request (e.g. temporarily flip the dev-skip flag) — confirm
   `401`.
4. Watch the dev server terminal during each run — confirm clear structured summary
   logs.
