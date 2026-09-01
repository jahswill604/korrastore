# Build Prompt: Feature 09 — Order Tracking

## Overview
This is the build prompt for **Feature 09: Order Tracking**. When approved to proceed, the implementing agent must read ALL files listed below before implementing.

---

## Files to Read Before Building

### Spec & Rules
- `prompt/09-order-tracking.md` — canonical feature spec, lifecycle states, and acceptance criteria
- `AGENTS.md` — architecture & layering rules (Feature 09 section)
- `.agents/rules/build.md` & `.agents/rules/code-comments.md` — coding, comment & documentation rules

### Skills
- `.agents/skills/supabase/SKILL.md` — database queries, RLS scoping (`auth.uid() = user_id`)

### Design System
- `prompts/02-design-system.md` — `Card`, `StatusStepper`, `PriceDisplay`, `Badge`, `GradeBadge`, `EmptyState`, `Pagination`

### Implementation Context
- `prompts/implementation/09-order-tracking.md` — full implementation plan
- `docs/overview.md` — current system codebase map

---

## Design References

### UI Designs
- **Desktop**: `prompts/ui degine/09-order-tracking/desktop-ui.png`
- **Mobile**: `prompts/ui degine/09-order-tracking/mobile-ui.png`

### Backend Workflow
- `prompts/backend-wookflow/09-order-tracking/workflow.png`

### Brand Reference
- `ui refrence/ChatGPT Image Aug 30, 2026, 11_53_48 AM.png`

---

## Files to Create & Update

| File | Type | Purpose |
|------|------|---------|
| `lib/supabase/queries/orders.ts` | Server query | Add `getBuyerOrders` & `getOrderDetail` |
| `components/orders/order-status-filter.tsx` | Client Component | Status tab filter sync with URL params (`?status=`) |
| `components/orders/order-row.tsx` | Server/Client UI | Individual order card item in list view |
| `components/orders/order-summary-card.tsx` | UI Component | Detailed price breakdown, payment status & warehouse info |
| `app/orders/page.tsx` | Server Component | Buyer order history list page with AppShell |
| `app/orders/[orderId]/page.tsx` | Server Component | Order tracking detail page with StatusStepper & links |

---

## Critical Rules (Do NOT Violate)
1. All order queries MUST be strictly filtered by `user_id = auth.uid()`. Never leak another user's order.
2. Server Component pages (`app/orders/page.tsx` & `app/orders/[orderId]/page.tsx`); filter control is the only client boundary.
3. Fulfillment stepper represents physical lifecycle (`pending_payment` → `sourcing` → `in_transit` → `stored`/`delivered`). Payment status is a separate badge.
4. If status is `stored`, link to the corresponding holding in `/my-storage` and receipt in `/receipts/[receiptId]`.
5. Cancelled/failed orders render an informative alert/card instead of a broken stepper.
6. Light mode only — no dark mode tokens.
7. After building: add inline comments (file-level + block-level) to every file + update `docs/overview.md`.

---

## Verification Commands
```bash
npm run typecheck
npm run lint
npm run build
npm run test
```
