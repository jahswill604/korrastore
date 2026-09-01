# Implementation Prompt: Feature 09 — Order Tracking

## Goal
Build `/orders` (order history list) and `/orders/[orderId]` (order tracking & detail): buyer-facing order history and per-order fulfillment progress (sourcing → in transit → stored/delivered) per `AGENTS.md` §7. Desktop + mobile, light mode only.

---

## Context Files to Read Before Writing Any Code
1. `prompt/09-order-tracking.md` — canonical feature spec, decisions, and acceptance criteria
2. `AGENTS.md` — architecture, ledger rules, and Feature 09 order tracking rules
3. `.agents/skills/supabase/SKILL.md` — DB queries, RLS scoping (`auth.uid() = user_id`)
4. `prompts/02-design-system.md` — `Card`, `StatusStepper`, `PriceDisplay`, `Badge`, `GradeBadge`, `EmptyState`, `Pagination`
5. `docs/overview.md` — existing codebase architecture and file maps

---

## Design References
- **Desktop UI**: `prompts/ui degine/09-order-tracking/desktop-ui.png`
- **Mobile UI**: `prompts/ui degine/09-order-tracking/mobile-ui.png`
- **Backend Workflow**: `prompts/backend-wookflow/09-order-tracking/workflow.png`
- **Brand Reference**: `ui refrence/ChatGPT Image Aug 30, 2026, 11_53_48 AM.png`

---

## Design Tokens & Palette (Light Mode Only)

| Token | Value | Usage |
|-------|-------|-------|
| Paper | `#F7F4EA` | Page background, card backgrounds |
| Soil | `#4A3828` | Primary text, titles, headings |
| Harvest Wheat | `#D8B56A` | Active tab indicator, active stepper step, primary highlights |
| Husk | `#A88958` | Secondary labels, muted timestamps |
| Deep Grain Green | `#21483A` | Completed stepper steps, 'PAID' / 'Stored' badges |
| Trust Indigo | `#303B63` | Receipt / Holding navigation links |
| Border | `#E4DCC8` | Divider lines, card outlines |
| White | `#FFFFFF` | Card interior fills |

---

## Files to Create & Update

### 1. `lib/supabase/queries/orders.ts` (Update)
- Add `getBuyerOrders(userId: string, filters?: { status?: string; page?: number; limit?: number })`:
  - Queries `orders` table joined with `order_items`, `commodities`, `commodity_grades`, and `payments`
  - Scoped strictly to `user_id = userId`
  - Returns paginated list of orders with formatted date, commodity info, total price, and fulfillment status
- Add `getOrderDetail(userId: string, orderId: string)`:
  - Fetches specific order row where `id = orderId` AND `user_id = userId`
  - Includes related items, commodity name, grade, warehouse details, payment record, holding record (if stored), and receipt (if available)
  - Returns `null` if not found or if user does not own the order (triggers 404)

### 2. `components/orders/order-status-filter.tsx` (New Client Component)
- `"use client"` component for filtering order history list
- Tabs: `All`, `In Progress` (`pending_payment`, `sourcing`, `in_transit`), `Stored` (`stored`), `Delivered` (`delivered`), `Cancelled` (`cancelled`, `failed`)
- Syncs state with URL search parameter `?status=...` using Next.js `useRouter` and `useSearchParams`

### 3. `components/orders/order-row.tsx` (New Component)
- Renders an order card in the list view
- Displays: Commodity image/thumbnail, commodity title, `GradeBadge`, quantity (e.g. `50 Bags`), `PriceDisplay` formatted total, creation date, status `Badge`, and "View Details" arrow button
- Links directly to `/orders/[orderId]`

### 4. `components/orders/order-summary-card.tsx` (New Component)
- Detailed summary card on `/orders/[orderId]`
- Breakdown: Commodity line item, Grade badge, Quantity, Unit Price, Subtotal, 1% Platform Fee, Total Price in `PriceDisplay`
- Payment status badge (`PAID`, `PENDING`, `FAILED`) separate from fulfillment stepper
- Warehouse storage information and links to `/my-storage` & `/receipts/[receiptId]` when status is `stored`

### 5. `app/orders/page.tsx` (New Server Component)
- Route: `/orders`
- Auth verification via `supabase.auth.getUser()` (redirects unauthenticated to `/login?redirect=/orders`)
- Fetches buyer orders list via `getBuyerOrders(user.id, { status, page })`
- Renders `AppShell` with active `orders` navigation rail item
- If 0 orders exist, renders `EmptyState` prompting buyer to browse marketplace (`/home`)

### 6. `app/orders/[orderId]/page.tsx` (New Server Component)
- Route: `/orders/[orderId]`
- Auth verification via `supabase.auth.getUser()`
- Fetches order details via `getOrderDetail(user.id, orderId)`
- Calls `notFound()` if order does not exist or does not belong to buyer
- Renders `StatusStepper` (Order Placed → Sourcing → In Transit → Stored / Delivered)
- Handles terminal non-stepper states (`cancelled` or `payment_failed`) cleanly with contextual alert card

---

## Security & Architecture Rules
1. **RLS & Ownership**: All order queries MUST be strictly filtered by `user_id = auth.uid()`. Never allow viewing another user's order.
2. **Server-Side Data Fetching**: Pages MUST be Server Components (`app/orders/page.tsx` & `app/orders/[orderId]/page.tsx`). Only `OrderStatusFilter` is a Client Component.
3. **Status Separation**: Fulfillment status (`orders.status`) is visualized in the `StatusStepper`, while payment status (`payments.status`) is rendered as a standalone badge.
4. **Light Mode Only**: Strictly follow KorraStore tokens (`Harvest Wheat`, `Paper`, `Soil`, `Deep Grain Green`). No dark mode.

---

## Verification & Checks
```bash
npm run typecheck
npm run lint
npm run build
npm run test
```
