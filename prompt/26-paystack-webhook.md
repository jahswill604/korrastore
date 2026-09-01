# Prompt: Paystack Webhook & Purchase-to-Ownership Pipeline — KorraStore

## Goal

Implement `POST /api/webhooks/paystack`: signature verification, server-side
transaction re-verification, and the full idempotent purchase-to-ownership pipeline
that advances an order to `paid`, allocates inventory, invokes the Ledger to create
a holding, issues a receipt, and enqueues a notification — per `AGENTS.md` §8. This
is the most critical correctness-sensitive prompt in the project.

## Skills read

- `.agents/skills/paystack/SKILL.md` — signature verification on raw body, server-
  side re-verification, idempotency-via-unique-reference pattern.
- `.agents/skills/supabase/SKILL.md` — service-role transactional writes, the
  ledger-only balance rule.
- `AGENTS.md` §8 (full pipeline), §9 (ledger movement rules), §14 (webhook rules).

## Existing code inspected

- `25-paystack-payment.md` — `PaymentProvider.verify(reference)`.
- `08-checkout.md` / `12-resale-marketplace.md` — order creation that this webhook
  advances.
- `28-inventory-ledger.md` / `29-holdings-ledger.md` — this webhook is the primary
  caller of both; implement the Ledger's write functions here first if this prompt
  runs before those, and note they should be extracted to the shared domain-service
  location those prompts define.

## Decisions / assumptions

- **Two order types share one webhook**: primary purchases (allocate from platform
  `inventory`) and resale purchases (transfer from the seller's `holding` via
  `holding_movements`). The webhook branches on the order's type
  (`order.source = 'primary' | 'resale'`) to call the correct Ledger function, but
  shares the same idempotency/verification/receipt/notification steps.
- **Idempotency key** is `payments.paystack_reference` with a unique constraint;
  the webhook inserts this row first, inside a transaction, before any downstream
  effect — a unique-violation means the event was already processed and the
  handler returns `200` immediately without repeating any side effect.
- **Exception path**: if payment is verified but inventory/holding allocation fails
  (e.g. a race condition depleted stock between checkout and webhook), the order
  moves to an explicit `exception` sub-state (or a dedicated flag/table row) for
  admin reconciliation — ownership is never granted without successful allocation.

## Files likely to change / add

- `app/api/webhooks/paystack/route.ts` — `POST`. Reads raw body, verifies
  signature, re-verifies transaction via `PaymentProvider.verify`, begins the
  idempotent pipeline.
- `lib/domain/payments/webhook-handler.ts` — orchestrates: idempotency check →
  advance order to `paid` → branch by order source → call
  `lib/domain/ledger/inventory-ledger.ts` (primary) or
  `lib/domain/ledger/holdings-ledger.ts` (resale) → issue receipt → enqueue
  notification. Structured, typed result object for logging.
- `lib/domain/receipts/generate-receipt.ts` — server-side receipt generation
  (structured data → stored file in Supabase Storage, per `03-database-schema.md`'s
  `receipts` table and the `supabase` skill's Storage rules).
- `lib/supabase/queries/orders.ts` — add `markOrderException(orderId, reason)`.
- Tests: `lib/domain/payments/__tests__/webhook-handler.test.ts` covering the
  `AGENTS.md` §19 scenarios below.

## Implementation requirements

- Raw body is read and signature-verified **before** any JSON parsing.
- Server-side re-verification via Paystack's API is mandatory before trusting the
  event, even after signature verification passes.
- The `payments` insert (idempotency key) and all downstream writes for a single
  event happen inside one database transaction where feasible; at minimum, the
  idempotency insert must happen before any side effect begins.
- The webhook returns `200` promptly once the event is durably recorded, even if
  slower downstream work (notification sending) is handed off to the outbox rather
  than awaited inline.
- Never create a holding or issue a receipt without a successfully verified,
  non-duplicate payment.

## Security requirements

- Webhook route performs no session-based auth (Paystack doesn't send a user
  session) — verification is entirely signature + server-side transaction check.
- `PAYSTACK_SECRET_KEY` used here, never exposed elsewhere.

## Acceptance criteria

- A valid, first-time webhook event correctly advances the order, creates the
  holding/updates it via the ledger, issues a receipt, and enqueues a
  notification.
- The same webhook event delivered twice (simulate Paystack's retry behavior)
  produces no duplicate holding, no double inventory allocation, no duplicate
  receipt, no duplicate revenue record.
- A failed/invalid signature is rejected before any processing.
- A verified payment with an allocation failure (simulate depleted stock) results
  in an exception state, never silent/broken ownership.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test` — must
  include, per `AGENTS.md` §19: duplicate payment webhook, failed payment,
  successful payment, concurrent quantity changes, inventory/holding balance
  consistency.

## Manual test steps

1. `npm run dev`; complete a real (test-mode) Paystack payment through checkout;
   confirm the webhook fires, the order advances to `paid`/`stored`, a holding
   exists, a receipt is generated, and a notification is enqueued.
2. Manually replay the same webhook payload (e.g. via Paystack's dashboard "resend"
   or a direct curl with the same reference) — confirm no duplicate holding/
   receipt/revenue is created and the response is still `200`.
3. Send a webhook payload with a tampered/invalid signature — confirm it's
   rejected before any processing.
4. Simulate an allocation failure (e.g. deplete inventory between checkout and
   webhook delivery in a test) — confirm the order enters an exception state
   visible in `18-admin-orders.md`, not a broken/partial holding.
5. Repeat steps 1–2 for a resale-purchase order — confirm the seller's holding is
   correctly debited and the buyer's new holding is correctly created via
   `holding_movements`.
