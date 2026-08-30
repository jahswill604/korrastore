# Prompt: Checkout — KorraStore

## Goal

Build `/checkout`: quantity selection, order review, and Paystack payment
initialization for a chosen commodity + grade, creating a `pending_payment` order.
Desktop + mobile, light mode only. This prompt stops at "payment initialized,
redirected to Paystack" — the webhook that confirms payment and creates the holding
is `26-paystack-webhook.md`.

## Skills read

- `.agents/skills/paystack/SKILL.md` — initialization pattern, `PaymentProvider`
  adapter boundary, currency minor-unit handling.
- `.agents/skills/supabase/SKILL.md` — order/order_items creation, RLS.
- `02-design-system.md` — `Card`, `QuantitySelector`, `PriceDisplay`, `Button`.
- `AGENTS.md` §8 (purchase-to-ownership pipeline), §12 (API route methods), §13
  (session auth on user routes).

## Existing code inspected

- `07-commodity-details.md` — "Buy now" links here with `commodityId`/`gradeId`
  query params.
- No `lib/domain/payments/` adapter yet — this prompt introduces the
  `PaymentProvider` interface and its first (Paystack) implementation.

## Decisions / assumptions

- **Single-item checkout for v1** — one commodity/grade/quantity per order; a
  cart/multi-item checkout is not built unless requested later.
- **Order is created as `pending_payment` before redirecting to Paystack**, using
  the order ID as part of the Paystack transaction reference, so the webhook can
  match back to it unambiguously (per the `paystack` skill).
- **Quantity input respects available inventory** for the selected grade — the
  `QuantitySelector` is clamped to the live available quantity, refetched on page
  load (not trusted from the details page's stale value).

## Visual interpretation (light mode only)

### Layout — Desktop (≥1024px)
Centered content, max-width ~640px. H1 "Review your order". `Card` showing:
commodity name + `GradeBadge`, `QuantitySelector` (kg, with bag/ton toggle per
`AGENTS.md` §7's UI conversion), unit price (`PriceDisplay`), computed total
(`PriceDisplay`, `numeric-lg`), a short note on storage ("Stored securely in a
KorraStore warehouse until you resell, request buyback, or delivery"). Below: "Pay
with Paystack" primary `Button` (full width), and a small security/trust note
("Payments processed securely by Paystack").

### Layout — Mobile (<640px)
Same content stacked, full width, "Pay with Paystack" button pinned above the safe
area.

### Loading / error states
While initializing payment: button shows a loading state, page is not interactive
elsewhere. If initialization fails (network/Paystack error), show an inline error
banner with a "Try again" action — never leave the buyer on a silently broken
button.

## Files likely to change / add

- `app/checkout/page.tsx` — Server Component (reads commodity/grade/available
  quantity), wraps a client order-review form.
- `components/checkout/order-review-form.tsx` (client — quantity state, submit).
- `lib/domain/payments/provider.ts` — `PaymentProvider` interface
  (`initialize(order)`, `verify(reference)`).
- `lib/domain/payments/paystack-adapter.ts` — Paystack implementation per the
  `paystack` skill.
- `lib/supabase/queries/orders.ts` — `createPendingOrder(userId, commodityId,
  gradeId, quantity)` → creates `orders` (`pending_payment`) + `order_items`,
  returns the order with its Paystack-ready reference.
- `app/api/orders/route.ts` — `POST`, learner... (buyer)-session-authenticated:
  creates the pending order, calls `PaymentProvider.initialize`, returns the
  Paystack authorization URL.

## Implementation requirements

- Order creation and payment initialization are server-only (`POST /api/orders`),
  never done client-side against Supabase directly.
- Quantity is re-validated server-side against live availability before creating the
  order — never trust the client-submitted quantity alone.
- Paystack initialization goes through the `PaymentProvider` interface, not a direct
  SDK call from route-handler code, per the `paystack` skill.
- `"use client"` scoped to the order-review form only.

## Security requirements

- `PAYSTACK_SECRET_KEY` never reaches client code.
- Order creation scoped to the authenticated buyer (`auth.uid()`); a buyer cannot
  create an order on another user's behalf.

## Acceptance criteria

- Submitting checkout creates a `pending_payment` order + `order_items` row and
  redirects the buyer to Paystack's hosted payment page.
- Quantity is clamped to real available inventory; attempting to exceed it is
  rejected server-side with a clear message.
- Failed initialization shows a retry-capable error state, not a dead button.
- Layout matches spec at mobile/desktop.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test` (cover
  "quantity exceeding availability is rejected server-side" per `AGENTS.md` §19).

## Manual test steps

1. `npm run dev`; from a commodity's details page, click "Buy now" with a valid
   grade/quantity.
2. On `/checkout`, adjust quantity, confirm the total updates correctly.
3. Submit — confirm redirect to Paystack's hosted page and a `pending_payment`
   order row exists in Supabase.
4. Attempt to submit a quantity exceeding available inventory — confirm a clear
   server-side rejection, not a silent order creation.
5. Resize to ~375px and ~1440px — confirm layout matches spec.
