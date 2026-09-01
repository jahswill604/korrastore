# Prompt: Audit Logging — KorraStore

## Goal

Implement a consolidated audit-logging helper used consistently by every
consequential mutation across the app (Ledger writes, payment events, pricing
changes, admin actions, role changes) so `audit_logs` is a complete, trustworthy
record — replacing the ad hoc "and log to audit_logs" notes scattered across
earlier prompts with one real, tested implementation.

## Skills read

- `.agents/skills/supabase/SKILL.md` — service-role-only writes to `audit_logs`,
  no client-facing write policy.
- `AGENTS.md` §5 (audit log sits at the base of every domain-service mutation),
  §21 (auditability standards).

## Existing code inspected

- Every prior admin/ledger/payment prompt (`18`–`21`, `24`, `26`, `28`, `29`) —
  each references "log to `audit_logs`"; this prompt provides the single helper
  they should all call, and this pass updates their call sites to use it instead
  of any inline duplicate insert.

## Decisions / assumptions

- **One function**: `logAuditEvent({ actorId, actorType, action, entityType,
  entityId, before, after, reason? })` — `before`/`after` are JSON snapshots of the
  relevant fields (not full-row dumps of unrelated columns), `actorType` is
  `'user' | 'admin' | 'system'` (system for cron/webhook-triggered events with no
  human actor).
- **Called from inside the same transaction** as the mutation it's logging,
  wherever the underlying write already uses a transaction/RPC (Ledger functions,
  role changes, pricing updates) — audit logging is not a best-effort side effect
  for these; if the mutation succeeds, the log entry must exist.
- **A simple admin-facing viewer** is not built here — `17-admin-dashboard.md`'s
  "Recent activity" feed and `23-admin-support.md`'s per-user view already consume
  `audit_logs`; this prompt just guarantees the data is complete and correctly
  shaped for those.

## Files likely to change / add

- `lib/domain/audit/log-audit-event.ts` — the consolidated helper.
- Update call sites in `lib/domain/ledger/inventory-ledger.ts`,
  `holdings-ledger.ts`, `lib/domain/payments/webhook-handler.ts`,
  `lib/supabase/queries/admin/orders.ts`, `admin/pricing.ts`, `admin/settings.ts`,
  `admin/resale.ts`, `admin/buybacks.ts` to call this helper instead of any inline
  duplicate insert.
- `lib/domain/audit/__tests__/log-audit-event.test.ts`.

## Implementation requirements

- The helper never silently swallows a failure to write the audit row when called
  from within a transaction — if the audit insert fails, the encompassing
  transaction should fail too, so a mutation can never succeed without a
  corresponding log entry.
- `before`/`after` snapshots are scoped to the fields relevant to the action (e.g.
  a status change logs `{ status: 'sourcing' }` → `{ status: 'in_transit' }`, not
  every column on the order).

## Security requirements

- `audit_logs` has no client-facing write policy at all — only this
  service-role-only helper ever writes to it.

## Acceptance criteria

- Every consequential mutation exercised across the prior admin/ledger/payment
  prompts' manual test flows now produces a corresponding, correctly-shaped
  `audit_logs` row.
- A forced audit-write failure (e.g. a temporarily broken constraint) causes the
  encompassing mutation to fail as well, not silently succeed without a log entry.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test`.

## Manual test steps

1. Re-run the manual test flows from `18-admin-orders.md`, `19-admin-inventory.md`,
   `20-admin-pricing.md`, `21-admin-resale-buyback.md`, `24-admin-settings.md`, and
   `26-paystack-webhook.md`; confirm each now produces an accurate `audit_logs`
   entry (spot-check `before`/`after` values).
2. Confirm `17-admin-dashboard.md`'s "Recent activity" feed and
   `23-admin-support.md`'s per-user audit view correctly render entries from all of
   the above sources.
