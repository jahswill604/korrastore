# Prompt: Inventory Ledger Domain Service — KorraStore

## Goal

Extract and finalize the Inventory Ledger as a proper domain service at
`lib/domain/ledger/inventory-ledger.ts`, consolidating the write functions
introduced ad hoc in `19-admin-inventory.md` and consumed by `26-paystack-webhook.md`
(primary-purchase allocation), so there is exactly one code path that ever writes
`inventory_movements` or updates cached `inventory.quantity`. Backend only.

## Skills read

- `.agents/skills/supabase/SKILL.md` — ledger-only balance-write rule, concurrency-
  locking RPC pattern.
- `AGENTS.md` §9 (movement types, ledger authority rule).

## Existing code inspected

- `19-admin-inventory.md` — `adjustInventory(...)` implemented inline there; move
  it here and update that prompt's import.
- `26-paystack-webhook.md` — inventory allocation call site for primary purchases.
- `03-database-schema.md` — the locking reservation/adjustment Postgres function.

## Decisions / assumptions

- **One exported service object/module** with a function per movement type:
  `allocateForOrder(orderId, items)` (BUY-side allocation for a primary purchase),
  `adjustInventory(inventoryId, delta, reason, adminId)` (admin manual adjustment),
  and any others needed by later features. Each function writes the movement row
  and updates the cached balance in a single transaction/RPC call — never two
  separate round-trips.
- **No function in this module ever accepts a client-supplied final balance** —
  every write is a delta + a movement type + a reference, never a raw "set
  quantity to X" call (except the admin adjustment path, which is explicitly a
  delta with a required reason, not a raw overwrite either).

## Files likely to change / add

- `lib/domain/ledger/inventory-ledger.ts` — the consolidated service.
- Update `app/admin/inventory/*` and `app/api/webhooks/paystack/*` call sites to
  import from here instead of any inline duplicate.
- `lib/domain/ledger/__tests__/inventory-ledger.test.ts` — covers concurrent
  allocation attempts against the same limited stock.

## Implementation requirements

- Every function delegates the actual balance mutation to the Postgres locking
  function from `03-database-schema.md` — no direct `UPDATE inventory SET
  quantity = ...` in application code.
- Every function is independently unit-testable against a test database/mock.

## Security requirements

- This module is only ever imported by server-only code (webhook handler, admin
  API routes) — never by anything client-reachable.

## Acceptance criteria

- All prior call sites (`19-admin-inventory.md`, `26-paystack-webhook.md`) now
  import from this single module with no behavior change.
- Concurrent allocation attempts against limited stock: exactly the correct number
  succeed, none oversell.
- Every write produces a matching movement row; balance always equals the sum of
  movements for that inventory line.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test` (concurrency
  test, balance-consistency test per `AGENTS.md` §19).

## Manual test steps

1. Run the existing admin-inventory and webhook manual test flows from
   `19-admin-inventory.md` / `26-paystack-webhook.md` again post-refactor; confirm
   identical behavior.
2. Run a concurrency test: two near-simultaneous orders against a commodity/grade
   with exactly enough stock for one — confirm exactly one succeeds and the other
   gets a clear insufficient-stock/exception outcome, not a negative balance.
3. Sum a test inventory line's `inventory_movements` and confirm it matches the
   cached `inventory.quantity` exactly.
