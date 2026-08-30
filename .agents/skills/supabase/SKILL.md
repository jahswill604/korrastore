---
name: supabase
description: Use whenever implementing or touching KorraStore's Supabase Auth, PostgreSQL schema/migrations, Row Level Security (RLS) policies, Storage (receipts/documents), or database queries — including the commodities/holdings/ledger/orders/resale/buyback tables. Always consult this before writing any Supabase client code, RLS policy, migration, or query against KorraStore's schema, since KorraStore has specific ledger, RLS, and query-pattern rules that differ from generic Supabase usage. Trigger on mentions of Supabase, RLS, migrations, holdings, ledger tables, or "database".
---

# Supabase (KorraStore)

Supabase is KorraStore's source of truth for Auth, PostgreSQL, and Storage. This skill covers the KorraStore-specific patterns — not generic Supabase docs. For anything not covered here, consult the official Supabase docs for the installed `@supabase/supabase-js` / `@supabase/ssr` version before guessing at API shape.

## Client setup

KorraStore uses three distinct Supabase clients. Never mix them up.

1. **Browser client** (`lib/supabase/client.ts`) — anon key, used only in client components for read-only, RLS-governed queries (e.g. reading the current user's own profile). Never used for writes to financial/ownership tables.
2. **Server client** (`lib/supabase/server.ts`) — anon key + user's session cookie (via `@supabase/ssr`), used in Server Components, Server Actions, and Route Handlers for anything scoped to "the current logged-in user." Still governed by RLS.
3. **Service role client** (`lib/supabase/service.ts`) — service role key, **server-only**, used exclusively by the Ledger, Payments, Valuation, and admin domain services (see AGENTS.md section 5) to bypass RLS for controlled system writes (e.g. creating a holding after a verified payment, writing `inventory_movements`). Never import this client into anything reachable from a client component or an unauthenticated code path.

```ts
// lib/supabase/service.ts — server-only
import { createClient } from '@supabase/supabase-js'

export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}
```

Rule: if a file imports the service role client, it must never be imported by a Client Component, and it must live under a server-only module boundary (e.g. `import 'server-only'` at the top).

## Auth

- Supabase Auth is the **only** authentication system (see AGENTS.md section 15). Email/password + email verification, and phone OTP, both go through Supabase Auth's built-in flows — do not hand-roll OTP logic.
- If Termii is later wired in as the SMS provider behind Supabase's phone-auth config, that's an infrastructure-level Supabase Auth provider setting, not custom application code. Check Supabase's current SMS provider documentation before configuring.
- `profiles` table extends `auth.users` (one row per user, `id` = `auth.users.id` foreign key). `profiles.role` is `'user' | 'admin'`.
- On sign-up, a trigger or server-side hook creates the matching `profiles` row with `role = 'user'` by default. Only manual/admin action changes a profile to `role = 'admin'` — never allow this via a user-editable API.

## Row Level Security (RLS)

RLS must be enabled on every table containing user data or financial/ownership state. General pattern:

- **`profiles`** — users can `select`/`update` their own row (except `role`, which no client role may update — only the service role, via server-side admin tooling). Admins can `select` all rows.
- **`holdings`, `orders`, `order_items`, `receipts`, `buyback_requests`** — owning user can `select` their own rows only. No client-side `insert`/`update`/`delete` policy at all — these are written exclusively via the service role client from server-side domain services. Admins can `select` all rows.
- **`resale_listings`** — any authenticated user can `select` active listings (with seller identity excluded/anonymized at the query layer, not just the UI — see below). The listing owner can `select` their own listing with full detail. Writes go through server actions using the service role, never direct client inserts.
- **`inventory_movements`, `holding_movements`, `audit_logs`** — no client `select`/`insert`/`update` policy for regular users at all. Admins get `select` only. All writes are service-role-only from the Ledger.
- **`commodities`, `commodity_grades`, `price_history`** — public/authenticated `select`. Writes are admin-only via service role.

Write a migration for every policy change. Never disable RLS on a table "temporarily" — if a query needs elevated access, use the service role client server-side instead.

### Anonymizing resale sellers

Do not rely on RLS alone to hide seller identity in `resale_listings` — RLS can restrict row access but a naive `select *` from an authorized service-role query will still include seller columns. Instead:

- Create a public-facing view or explicit column list (`resale_listings_public`) that excludes `seller_id`/joins to `profiles`, and surfaces only a derived label like `'KorraStore Seller #' || right(seller_id::text, 4)`.
- Buyer-facing queries read from this view. Admin queries read from the base table directly (service role, admin-role-gated route).

## The ledger is the only writer of balances

Per AGENTS.md section 9: only the Ledger domain service (using the service role client) may write to `inventory_movements` and `holding_movements`, and by extension the derived `quantity` fields on `holdings` and `inventory`. Never write a quantity update from a Route Handler or Server Action directly — always go through the Ledger service function, which writes the movement row and the balance update in the same transaction.

```ts
// Example shape — actual implementation lives in the Ledger domain service
await ledger.recordHoldingMovement({
  holdingId,
  type: 'RESALE',
  quantity: -300,
  reference: { type: 'resale_transaction', id: resaleTransactionId },
  actorId: userId,
})
```

## Concurrency: preventing overselling

Any flow that reserves or debits a quantity (create resale listing, submit buyback request, request delivery) must check available (unreserved) quantity and apply the change atomically, not as two separate read-then-write calls. Use a Postgres function (`SECURITY DEFINER`, called via `.rpc()`) that does the check-and-update inside a single transaction with row-level locking (`SELECT ... FOR UPDATE`), rather than doing the check in application code and the update in a second round-trip.

```sql
-- Example: reserve quantity for a resale listing (schema-specific fields may differ)
create or replace function reserve_holding_quantity(p_holding_id uuid, p_quantity numeric)
returns void
language plpgsql
security definer
as $$
declare
  available numeric;
begin
  select quantity - reserved_quantity into available
  from holdings
  where id = p_holding_id
  for update;

  if available < p_quantity then
    raise exception 'insufficient_available_quantity';
  end if;

  update holdings
  set reserved_quantity = reserved_quantity + p_quantity
  where id = p_holding_id;
end;
$$;
```

## The joined-table filter gotcha

Do not use `.eq('foreignTable.column', value)` to filter on a joined table in supabase-js — this generates broken PostgREST SQL and causes runtime errors:

```ts
// WRONG — breaks at runtime
const { data } = await supabase
  .from('holdings')
  .select('*, commodities(name)')
  .eq('commodities.active', true)
```

Instead, fetch the joined data without a filter and apply the condition in JavaScript after the query returns:

```ts
// RIGHT
const { data } = await supabase
  .from('holdings')
  .select('*, commodities(name, active)')

const activeOnly = data?.filter((h) => h.commodities?.active)
```

Or, for cases where filtering server-side genuinely matters (large tables), use a Postgres view or RPC function instead of relying on PostgREST's nested filter syntax.

## Storage (receipts)

- Bucket: `receipts` (or similar), server-only writes via the service role client from the receipt-generation step of the purchase pipeline (AGENTS.md section 8).
- Store the file path in `receipts.storage_path`; generate a signed URL on read (short expiry) rather than making the bucket public.
- Never let a client upload directly to the `receipts` bucket — receipts are system-generated, not user-uploaded.

## Migrations

- Every schema change updates: the migration SQL, `supabase/schema.sql`, and `lib/supabase/types.ts` (regenerate via `supabase gen types typescript`) — in the same change, per AGENTS.md section 7.
- Name migrations descriptively and sequentially (e.g. `0007_add_resale_listing_expiry.sql`).
- Never edit a migration that has already been applied to a shared environment — write a new migration instead.

## Checklist before shipping a Supabase change

- [ ] RLS enabled and policy written for any new table
- [ ] Balance-affecting writes go through the Ledger, not ad hoc updates
- [ ] Concurrency-sensitive reservations use a locking RPC, not read-then-write
- [ ] Seller/user identity anonymized where required (resale)
- [ ] `schema.sql` and `types.ts` regenerated
- [ ] No `.eq('foreignTable.col', ...)` joined-table filters
- [ ] Service role client only used server-side, only in domain services
