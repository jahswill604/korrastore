# Prompt: Error States — KorraStore

## Goal

Audit and standardize error handling across the app: route-level error boundaries
(`error.tsx`), inline form/action errors, and payment/webhook failure states,
ensuring every failure mode surfaces a clear, honest message rather than a generic
crash or silent failure. Light mode only.

## Skills read

- `02-design-system.md` — error banner styling (danger-tinted), `Toast` for
  transient errors.
- `08-checkout.md`, `26-paystack-webhook.md`, `04-auth.md` — the payment/auth
  failure paths this pass standardizes.

## Existing code inspected

- Each page's own error handling as implemented in its originating prompt (e.g.
  checkout's "inline error banner with Try again", auth's inline credential
  error).

## Decisions / assumptions

- **Route-level `error.tsx`** exists for every major route segment (buyer and
  admin trees), showing a calm "Something went wrong" message with a "Try again"
  action (Next.js's error boundary reset) and, in development only, the actual
  error detail.
- **Inline/action errors** (form validation, failed mutation) use a `danger`-
  tinted banner near the relevant control, never a browser `alert()`.
- **Transient/non-blocking errors** (e.g. a background notification-send failure
  the user doesn't need to act on) surface as a `Toast`, not a blocking banner.
- **Payment/financial errors are never vague** — "Payment could not be verified,
  please contact support with order #1234" rather than "Something went wrong,"
  since the buyer needs an actionable reference for support.

## Files likely to change / add

- `app/error.tsx`, `app/admin/error.tsx` (and nested segment-level `error.tsx`
  where a more specific message is warranted, e.g. `app/checkout/error.tsx`).
- Audit and update inline error handling in: `components/auth/auth-form.tsx`,
  `components/checkout/order-review-form.tsx`, `components/resale/create-listing-
  modal.tsx`, `components/buyback/request-modal.tsx`, admin mutation forms.

## Implementation requirements

- No `alert()`/`confirm()` browser dialogs anywhere in the app.
- Every user-facing error message is specific enough to be actionable (references
  what failed and, where relevant, an order/reference ID).
- Development-only error detail (stack traces, raw error messages) never renders
  in production builds.

## Security requirements

- Error messages never leak internal implementation detail (stack traces, SQL
  errors, internal IDs beyond user-facing reference numbers) in production.

## Acceptance criteria

- Every major route segment has an appropriate `error.tsx` with a working "Try
  again" action.
- Inline errors across auth, checkout, resale, and buyback flows are specific and
  non-blocking-toast vs. blocking-banner is applied consistently per the rule
  above.
- No browser-native alert/confirm dialogs remain anywhere in the app.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`.

## Manual test steps

1. Force a rendering error in a test build of a buyer route (temporarily throw in
   a Server Component) — confirm `error.tsx` renders with a working "Try again."
2. Trigger checkout with an invalid/failing payment scenario (test-mode failure
   card) — confirm a specific, actionable inline error with the order reference.
3. Attempt an invalid resale-listing quantity — confirm an inline, specific
   validation error, not a generic message.
4. Search the codebase for `alert(` / `confirm(` — confirm none remain.
