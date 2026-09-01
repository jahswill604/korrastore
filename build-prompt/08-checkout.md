# Build Prompt: Feature 08 — Checkout

## Overview
This is the short build prompt for **Feature 08: Checkout**. When told to proceed, the
implementing agent must read ALL files listed below before writing a single line of code.

---

## Files to Read Before Building

### Spec & Rules
- `prompt/08-checkout.md` — canonical feature spec, decisions, acceptance criteria
- `AGENTS.md` — architecture & layering rules (§4, §8, §12, §13)

### Skills
- `.agents/skills/paystack/SKILL.md` — PaymentProvider interface, initialization, kobo, idempotency
- `.agents/skills/supabase/SKILL.md` — DB patterns, RLS, order creation
- `.agents/skills/resend/SKILL.md` — (read for awareness; no email in this feature)

### Design System
- `prompts/02-design-system.md` — Card, Button, QuantitySelector, PriceDisplay, GradeBadge primitives

### Implementation Context
- `prompts/implementation/08-checkout.md` — full implementation plan

### Existing Code Context
- `docs/overview.md` — understand everything already built before touching files

---

## Design References

### UI Designs
- **Desktop**: `prompts/ui degine/08-checkout/desktop-ui.png`
- **Mobile**: `prompts/ui degine/08-checkout/mobile-ui.png`

### Backend Workflow
- `prompts/backend-wookflow/08-checkout/workflow.png`

### Brand Reference
- `ui refrence/ChatGPT Image Aug 30, 2026, 11_53_48 AM.png` (panel #4 — Checkout)

---

## Files to Create

| File | Type | Purpose |
|------|------|---------|
| `app/checkout/page.tsx` | Server Component | Fetch commodity data, auth guard, render form |
| `components/checkout/order-review-form.tsx` | Client Component | Quantity state, price calc, submit to API |
| `lib/domain/payments/provider.ts` | Type/Interface | PaymentProvider interface + types |
| `lib/domain/payments/paystack-adapter.ts` | Server-only | Paystack API calls (init + verify) |
| `lib/supabase/queries/orders.ts` | Server query | createPendingOrder — inserts orders + order_items |
| `app/api/orders/route.ts` | API Route | POST: auth → validate qty → create order → init payment |

---

## Critical Rules (Do NOT Violate)

1. `PAYSTACK_SECRET_KEY` NEVER in client code or browser bundle
2. Quantity MUST be re-validated server-side against live inventory before order creation
3. All money/quantity DB columns use `numeric` — no floats or integers
4. Payment logic goes through `PaymentProvider` interface, never direct Paystack SDK calls
5. `"use client"` only on `order-review-form.tsx` — page.tsx stays a Server Component
6. Use `supabase.auth.getUser()` (not `getSession()`) for auth verification
7. Light mode only — no dark mode tokens, no ThemeToggle
8. After building: add inline comments to every file + update `docs/overview.md`

---

## After Implementation — Checks to Run
```bash
npm run typecheck
npm run lint
npm run build
npm run test
```
