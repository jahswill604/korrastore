# Prompt: Paystack Payment Initialization — KorraStore

## Goal

Implement the full `PaymentProvider` interface and its Paystack adapter, replacing
`08-checkout.md`'s and `12-resale-marketplace.md`'s stubbed initialization calls
with the real integration: transaction initialization, currency/amount handling,
and the authorization-URL redirect. This prompt does not handle the webhook
(`26-paystack-webhook.md`) — it stops at "buyer redirected to Paystack's hosted
payment page."

## Skills read

- `.agents/skills/paystack/SKILL.md` — initialization request shape, secret-key
  boundary, modular adapter pattern.
- `AGENTS.md` §14 (Paystack rules), §21 (env vars).

## Existing code inspected

- `08-checkout.md` — `lib/domain/payments/provider.ts` interface stub,
  `paystack-adapter.ts` stub.
- `12-resale-marketplace.md` — `POST /api/resale/[id]/buy` also calls
  `PaymentProvider.initialize`.

## Decisions / assumptions

- **One `PaymentProvider.initialize(order)` implementation** serves both primary
  purchases and resale purchases — both pass an order with a reference and amount;
  the adapter doesn't need to know which flow created the order.
- **Amount is always computed server-side** from `order_items`/the resale listing's
  price at the moment of initialization, never trusted from client input.
- **Currency minor-unit handling** (kobo) is centralized in the adapter, not
  scattered across call sites.

## Files likely to change / add

- `lib/domain/payments/provider.ts` — finalize the `PaymentProvider` interface:
  `initialize(order: PaymentInitRequest): Promise<PaymentInitResult>`,
  `verify(reference: string): Promise<PaymentVerification>`.
- `lib/domain/payments/paystack-adapter.ts` — full implementation per the
  `paystack` skill: builds the initialization request (reference, amount in kobo,
  customer email), calls Paystack's initialize endpoint, returns the authorization
  URL.
- `app/api/orders/route.ts`, `app/api/resale/[id]/buy/route.ts` — updated to call
  the real adapter instead of a stub.

## Implementation requirements

- `PAYSTACK_SECRET_KEY` is read only inside `paystack-adapter.ts`, never elsewhere.
- Initialization failures return a clear, distinguishable error to the calling
  route (network error vs. Paystack API error) so the UI can show a sensible
  retry message rather than a generic failure.

## Security requirements

- No Paystack credentials in client code at any point in this flow.

## Acceptance criteria

- Both primary checkout and resale purchase successfully initialize a real
  Paystack transaction and redirect the buyer to Paystack's hosted page.
- Amount sent to Paystack always matches the server-computed order/listing total,
  never a client-supplied value.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test` (adapter unit
  test with a mocked Paystack response).

## Manual test steps

1. `npm run dev`; complete a checkout flow through to the Paystack redirect using
   Paystack's test-mode keys and test card details.
2. Complete a resale purchase similarly.
3. Confirm the amount charged on Paystack's test page matches the order total
   exactly.
4. Temporarily break the Paystack secret key (invalid value) and confirm checkout
   shows a clear retry-capable error rather than a crash.
