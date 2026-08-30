---
name: paystack
description: Use whenever implementing or touching KorraStore's payment flow — initializing a Paystack transaction, verifying a transaction, handling the Paystack webhook, or processing buyback payouts. Always consult this before writing Paystack integration code, since KorraStore requires signature verification, server-side re-verification, and strict webhook idempotency that generic Paystack quick-start examples don't cover. Trigger on mentions of Paystack, checkout, payment, webhook, or payout.
---

# Paystack (KorraStore)

Paystack is KorraStore's payment provider for the MVP. The payment layer must stay modular (an adapter/interface) so another provider can be added later without rewriting the Ledger or order flow — never call the Paystack SDK directly from order/ledger code; go through a `PaymentProvider` interface implemented by a `PaystackAdapter`.

Consult Paystack's current API docs (https://paystack.com/docs) for exact request/response field names before implementing — do not assume field shapes from memory, since API details can change.

## Environment variables

```
PAYSTACK_SECRET_KEY               # server only — never in client code
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY   # safe for client-side checkout init
```

## Initializing a payment

Initialization happens server-side (a Server Action or `POST /api/orders` continuation) using the secret key, or via Paystack's client-side popup using the public key — either way, the **secret key never reaches browser code**.

Typical flow:

1. Order is created server-side with status `pending_payment` and a unique internal reference (e.g. the order ID or a generated reference string).
2. Call Paystack's transaction initialization endpoint with that reference, amount (in kobo, not naira — confirm the currency's minor unit), and customer email.
3. Return the authorization URL / access code to the client to complete payment.

Always pass KorraStore's own order reference to Paystack so the webhook can be matched back to the correct order without ambiguity.

## Webhook: signature verification (mandatory, first step)

`POST /api/webhooks/paystack` is the only entry point where Paystack tells KorraStore a payment succeeded. Before trusting anything in the payload:

1. Read the raw request body (do not parse-then-reserialize — signature verification requires the exact raw bytes).
2. Compute an HMAC SHA512 hash of the raw body using `PAYSTACK_SECRET_KEY`.
3. Compare it to the `x-paystack-signature` header. Reject with `401`/`400` if they don't match.

```ts
import crypto from 'crypto'

function isValidPaystackSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
    .update(rawBody)
    .digest('hex')
  return hash === signatureHeader
}
```

In Next.js Route Handlers, make sure you read `request.text()` (raw) before any `request.json()` call, since the body stream can only be consumed once.

## Webhook: server-side re-verification (mandatory, second step)

Do not trust the webhook payload's `status` field alone, even after signature verification — always re-verify the transaction directly against Paystack's transaction-verification endpoint using the transaction reference, and use *that* response as the source of truth for whether payment succeeded.

```ts
async function verifyTransaction(reference: string) {
  const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
  })
  return res.json()
}
```

Only proceed to advance the order and invoke the Ledger if this independent verification confirms success.

## Idempotency (mandatory, every time)

Paystack may deliver the same webhook event more than once. KorraStore must never, as a result of a duplicate delivery:

- create a duplicate holding
- allocate inventory twice
- issue a duplicate receipt
- record duplicate revenue in `payments`

Implementation pattern:

1. Use the Paystack transaction reference as a unique key on the `payments` table (`unique` constraint on `paystack_reference`).
2. Inside a single database transaction: attempt to insert the `payments` row with that reference. If it already exists (unique violation / or an explicit `select` finds it first with a lock), the event has already been processed — acknowledge the webhook with `200` and stop; do not re-run allocation, ledger, or receipt logic.
3. Only on first successful insert of the `payments` row does the pipeline continue: advance order → allocate inventory → Ledger creates holding → issue receipt → send notification (see AGENTS.md section 8).

Always return `200` promptly to Paystack once the event is durably recorded (even if downstream steps are queued), so Paystack doesn't keep retrying a webhook that KorraStore has already accepted. Do heavy downstream work (allocation, notifications) inside the same transaction or immediately after, but don't block the `200` response on slow external calls (e.g. email sending) — those can be handed to the notification outbox (see the `resend`/`termii` skills).

## Exception path: payment succeeded, inventory unavailable

If verified payment succeeds but inventory cannot be allocated for the order, do not silently create ownership that can't be fulfilled. Move the order into an explicit exception/reconciliation state and flag it for admin review (see AGENTS.md section 18, order reconciliation cron) rather than completing the Ledger step.

## Buyback payouts

When an admin approves a buyback request (AGENTS.md section 11), the Payments service initiates a payout through the `PaymentProvider` adapter (Paystack Transfers API, if available on the account) or an equivalent manual-payout-tracked flow if transfers aren't enabled. Confirm current Paystack Transfers API capability and requirements (e.g. transfer recipient setup, OTP-per-transfer) from the live docs before implementing, since this varies by account configuration and country. Record every payout attempt/result in `audit_logs`.

## Checklist before shipping a Paystack change

- [ ] Secret key never referenced in client-reachable code
- [ ] Webhook verifies signature against raw body before parsing
- [ ] Webhook re-verifies transaction via Paystack's API before trusting it
- [ ] `payments.paystack_reference` has a uniqueness constraint enforcing idempotency
- [ ] Duplicate webhook delivery is a no-op past the first successful processing
- [ ] Payment-succeeded-but-inventory-unavailable goes to an exception state, not silent ownership
- [ ] Payment logic lives behind a `PaymentProvider` interface, not called directly from order/ledger code
