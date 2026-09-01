# Implementation Prompt: Feature 08 — Checkout

## Goal
Build `/checkout`: quantity selection, order review, and Paystack payment initialization
for a chosen commodity + grade. Creates a `pending_payment` order. Desktop + mobile,
light mode only. Stops at "payment initialized, redirected to Paystack" — webhook
confirmation is Feature 26 (`26-paystack-webhook.md`).

---

## Context Files to Read Before Writing Any Code

1. `prompt/08-checkout.md` — canonical spec
2. `AGENTS.md` — architecture rules (§4 auth, §8 purchase pipeline, §12 API methods, §13 session auth)
3. `.agents/skills/paystack/SKILL.md` — PaymentProvider interface, initialization, kobo conversion
4. `.agents/skills/supabase/SKILL.md` — order/order_items creation patterns, RLS
5. `prompts/02-design-system.md` — Card, QuantitySelector, PriceDisplay, Button, GradeBadge
6. `docs/overview.md` — existing code context

---

## Design References
- Desktop UI: `prompts/ui degine/08-checkout/desktop-ui.png`
- Mobile UI: `prompts/ui degine/08-checkout/mobile-ui.png`
- Backend Workflow: `prompts/backend-wookflow/08-checkout/workflow.png`
- Brand Reference: `ui refrence/ChatGPT Image Aug 30, 2026, 11_53_48 AM.png` (panel #4)

---

## Design System (Light Mode Only)

| Token | Value | Usage |
|-------|-------|-------|
| Paper | `#F7F4EA` | Page background |
| Soil | `#4A3828` | Primary text |
| Harvest Wheat | `#D8B56A` | CTA button, total price color |
| Husk | `#A88958` | Muted text, platform fee |
| Deep Grain Green | `#21483A` | GradeBadge bg |
| Border | `#E4DCC8` | Card borders, dividers |
| White | `#FFFFFF` | Card fill |

Fonts: DM Serif Display (headings), Inter (body/labels), IBM Plex Mono (prices/numbers)

---

## Files to Create

### `app/checkout/page.tsx`
- Server Component (no `"use client"`)
- Reads `commodityId` and `gradeId` from `searchParams`
- Auth guard: `supabase.auth.getUser()` — redirect to `/login?redirect=/checkout` if unauthenticated
- Calls `getCommodityForCheckout(commodityId, gradeId)` — returns name, grade, unit price, available qty
- Renders `AppShell` + `<OrderReviewForm>` with server-fetched props

### `components/checkout/order-review-form.tsx`
- `"use client"` component
- Props: `commodityId`, `gradeId`, `commodityName`, `gradeName`, `unitPrice`, `availableQty`, `thumbnailUrl`
- State: `quantity` (clamped 1–availableQty), `isLoading`, `error`
- Renders:
  - Commodity row: thumbnail + name + GradeBadge
  - QuantitySelector: − / number / + with bag/ton unit toggle
  - Price breakdown rows: unit price, quantity, subtotal, platform fee (1%), Total (Harvest Wheat color)
  - Storage info card (beige bg, warehouse icon)
  - Full-width "Pay ₦{total} with Paystack" Button (loading spinner during submit)
  - Error banner with "Try again" on failure
- Submit: `POST /api/orders` → receive `{ authorizationUrl }` → `window.location.href = url`
- Mobile: sticky bottom bar with CTA button above safe area

### `lib/domain/payments/provider.ts`
- TypeScript interface `PaymentProvider`:
  - `initialize(order: OrderForPayment): Promise<PaymentInitResult>`
  - `verify(reference: string): Promise<PaymentVerifyResult>`
- Export types: `OrderForPayment`, `PaymentInitResult`, `PaymentVerifyResult`

### `lib/domain/payments/paystack-adapter.ts`
- Implements `PaymentProvider` — server-only, never imported by client code
- `initialize`: POST `https://api.paystack.co/transaction/initialize`
  - `amount`: kobo (multiply naira × 100, Math.round)
  - `email`: buyer email
  - `reference`: order ID
  - `currency`: NGN
  - Auth: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
- Returns `{ authorizationUrl, reference }`
- `verify`: GET `https://api.paystack.co/transaction/verify/{reference}` (used in Feature 26)

### `lib/supabase/queries/orders.ts`
- `createPendingOrder(userId, commodityId, gradeId, quantity, unitPrice)`:
  - INSERT into `orders` (`user_id`, `status: 'pending_payment'`, `total_price`)
  - INSERT into `order_items` (`order_id`, `commodity_id`, `grade_id`, `quantity`, `unit_price`)
  - All money columns use `numeric` — no floats
  - Returns created order with ID

### `app/api/orders/route.ts`
- `export async function POST(request: Request)`
- Server-only; uses service-role client for DB writes
- Steps:
  1. `supabase.auth.getUser()` → 401 if unauthenticated
  2. Parse body: `{ commodityId, gradeId, quantity }`
  3. Re-fetch live inventory `SELECT ... FOR UPDATE` (row lock)
  4. If `quantity > available` → 422 `{ error: "Quantity exceeds available stock" }`
  5. `createPendingOrder(...)` → order row
  6. `paystackAdapter.initialize(order)` → `{ authorizationUrl }`
  7. Return 200 `{ authorizationUrl }`
  8. On Paystack failure → 502 `{ error: "Payment initialization failed. Please try again." }`

---

## Security Rules
- `PAYSTACK_SECRET_KEY` NEVER in client-accessible code or bundle
- `SUPABASE_SERVICE_ROLE_KEY` NEVER in client components
- Order always scoped to authenticated `auth.uid()`
- Quantity always re-validated server-side

---

## Layout Spec

### Desktop (>=1024px)
- Full AppShell: header + collapsed NavRail (72px)
- Content: centered, max-width 640px
- H1 "Review your order" (DM Serif Display) with back arrow ←
- Order card → CTA button → security note stacked

### Mobile (<640px)
- Simple top nav: back arrow left, "Checkout" title center
- Scrollable: order card + storage info card
- Sticky bottom bar: CTA button + security note

---

## Loading & Error States

| State | Behaviour |
|-------|-----------|
| Submitting | Button spinner + disabled; page non-interactive |
| qty > available | Inline error below QuantitySelector |
| Paystack fail | Red error banner with "Try again" |
| Missing params | Server redirect to `/home` |
| Unauthenticated | Redirect to `/login?redirect=/checkout` |

---

## Acceptance Criteria
- Creates `pending_payment` order + `order_items` in Supabase
- Redirects to Paystack hosted page
- Server rejects qty > available with clear message
- Failed init shows retry-capable error banner
- Secret key never in client bundle
- Desktop/mobile layouts match spec

---

## Checks to Run
```bash
npm run typecheck
npm run lint
npm run build
npm run test
```

Tests must cover: qty > available rejected server-side, unauthenticated returns 401.

---

## Post-Implementation
- Add inline comments (file-level + block-level) to every file created
- Update `docs/overview.md` with all new/changed files, line ranges, block descriptions
