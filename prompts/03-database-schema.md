# Prompt: Database Schema & RLS — KorraStore

## Goal

Create the full Supabase PostgreSQL schema, migrations, and Row Level Security
policies for KorraStore's core tables, per `AGENTS.md` §7. Backend only — no UI.
This prompt establishes the tables every later feature prompt reads/writes; it does
not populate seed data beyond minimal reference rows needed for local development.

## Skills read

- `.agents/skills/supabase/SKILL.md` — client setup, RLS patterns, ledger-only
  balance-write rule, the joined-table filter gotcha, concurrency-locking RPC
  pattern.
- `AGENTS.md` §7 (source-of-truth schema), §9 (ledger rules), §13 (admin role model).

## Existing code inspected

- `01-project-foundation.md`'s output — `lib/supabase/service.ts` stub exists;
  `supabase/` directory does not yet exist.

## Decisions / assumptions

Schema matches the model agreed for KorraStore exactly (see `AGENTS.md` §7):

```
profiles
commodities
commodity_grades
warehouses
inventory
inventory_movements

orders
order_items
payments

holdings
holding_movements
receipts

resale_listings
resale_transactions

buyback_requests

price_history

notifications
audit_logs
```

Key modeling rules (restated for implementation, see `AGENTS.md` §7 for full
rationale):

- `holdings` are never permanently 1:1 with `orders`; they can split.
- Quantities are `numeric` (decimal), not integer, on every table tracking
  commodity amounts.
- `commodity_grades` is a per-commodity table (`id`, `commodity_id`, `code`, `name`,
  `description`, `active`) — grades are not a hardcoded enum.
- `orders.status` enum: `pending_payment | paid | sourcing | in_transit | stored |
  delivered | cancelled | failed`. Payment status lives separately on `payments`,
  never combined into `orders.status`.
- `holdings.current_value` is **not** a stored column — current value is always
  `quantity * commodities.current_price` (or the latest `price_history` row),
  computed at query time via a view or in the query layer.
- `inventory_movements` and `holding_movements` are the ledger of record; `holdings`
  and `inventory` store cached balances that must always be reconstructable from
  their movement history.
- `resale_listings` references a specific `holding_id` and carries a
  `reserved_quantity`; buyer-facing reads must never expose `seller_id` directly
  (see the public view below).
- `buyback_requests.status` enum: `pending | approved | rejected | paid`.

## Files likely to change / add

- `supabase/migrations/0001_init.sql` — full initial schema: all tables above, enums,
  foreign keys, `numeric` quantity columns, `created_at`/`updated_at` timestamps,
  indexes on foreign keys and frequently-filtered columns (`orders.user_id`,
  `holdings.user_id`, `resale_listings.status`, `buyback_requests.status`).
- `supabase/migrations/0002_rls.sql` — RLS enabled + policies per the table-by-table
  rules in the `supabase` skill (owning-user `select`-only on financial/ownership
  tables, no client write policies on ledger tables, admin `select`-all via a
  `role = 'admin'` check against `profiles`).
- `supabase/migrations/0003_functions.sql` — Postgres functions: a locking
  reserve/release function for holding quantity (used by resale + buyback flows,
  see the `supabase` skill's example), and a trigger to create a `profiles` row on
  new `auth.users` signup with `role = 'user'`.
- `supabase/migrations/0004_views.sql` — `resale_listings_public` view (excludes
  `seller_id`, surfaces a derived `'KorraStore Seller #' || right(seller_id::text,
  4)` label) and a `holdings_with_current_value` view (joins `commodities` for
  live valuation without a stored column).
- `supabase/schema.sql` — the consolidated, current-state schema (generated/kept in
  sync with migrations, per `AGENTS.md` §7).
- `lib/supabase/types.ts` — generated types (`supabase gen types typescript`).
- `supabase/seed.sql` — minimal dev seed: 4 commodities (rice, garlic, beans, melon)
  each in `kg`, 3 grades per commodity (A/B/C), 1–2 warehouses, starting
  `price_history` rows. No fake orders/holdings/users — those are created through
  the app during manual testing.

## Implementation requirements

- Every quantity/price/percentage column is `numeric`, never `integer` or
  floating-point `real`/`double precision`.
- RLS is enabled on every table before any policy is written — no table is left
  open by omission.
- No table allows a client-role `insert`/`update`/`delete` on `inventory_movements`,
  `holding_movements`, or `audit_logs` — service-role only.
- Foreign keys use `on delete restrict` for anything that would silently orphan
  financial history (e.g. don't allow deleting a `commodity` that has `holdings`).

## Security requirements

- Service-role-only tables have zero client-facing write policies, not just
  "restrictive" ones.
- `resale_listings_public` view is the only thing buyer-facing queries select
  from for browsing listings; the base table is admin/service-role only for reads
  that need seller identity.

## Acceptance criteria

- All tables, enums, indexes, RLS policies, functions, and views apply cleanly via
  `supabase db push` (or the project's chosen migration runner) against a fresh
  project.
- `supabase/schema.sql` and `lib/supabase/types.ts` match the applied migrations.
- Seed data loads without error and reflects realistic starting commodities/grades/
  warehouses.
- A locking reservation function exists and correctly rejects over-reservation in a
  concurrent-call test (see manual test steps).

## Checks to run

- `npm run typecheck` (against generated types), `npm run lint`.
- Supabase migration apply/dry-run (`supabase db push` or equivalent) — report exact
  output.

## Manual test steps

1. Apply migrations to a fresh local/dev Supabase project; confirm no errors.
2. Run the seed script; confirm 4 commodities with grades and starting inventory
   exist.
3. As an anon/authenticated non-owner, attempt to `select` another user's `holdings`
   row directly via the Supabase client — confirm RLS blocks it.
4. Attempt a client-role `insert` into `inventory_movements` — confirm RLS rejects
   it (only the service role can write).
5. Call the reservation function twice concurrently for more than the available
   quantity on a test holding — confirm only one succeeds and the other raises the
   insufficient-quantity error, not a corrupted balance.
