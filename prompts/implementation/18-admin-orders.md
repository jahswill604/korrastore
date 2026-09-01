# Implementation Prompt: Feature 18 — Admin Orders Management

## Goal
Build `/admin/orders` and `/admin/orders/[orderId]`: the comprehensive operational order management system for KorraStore administrators. Allows admins to inspect all orders across all buyers, filter by fulfillment status (including dedicated Exceptions triage), search by buyer name/email/order-ID, view full order lifecycle details, advance fulfillment states via a strictly validated state machine, resolve reconciliation exception states via the inventory ledger, and record every mutation in `audit_logs`. Desktop table and mobile stacked card views, light mode only.

---

## Context Files to Read Before Writing Any Code
1. `prompt/18-admin-orders.md` & `prompts/18-admin-orders.md` — canonical feature spec, decisions, and acceptance criteria
2. `AGENTS.md` — architecture, ledger invariants, and Feature 18 rules
3. `.agents/skills/supabase/SKILL.md` — admin queries, service-role client usage, audit logging
4. `prompts/02-design-system.md` — tokens, `Card`, `Badge`, `StatusStepper`, `Pagination`, `Modal`
5. `prompts/09-order-tracking.md` — buyer-facing order tracking counterpart
6. `prompts/17-admin-dashboard.md` — admin dashboard and navigation shell integration
7. `docs/overview.md` — codebase architecture and file breakdown

---

## Design References
- **Desktop UI**: `prompts/ui degine/18-admin-orders/desktop-ui.png`
- **Mobile UI**: `prompts/ui degine/18-admin-orders/mobile-ui.png`
- **Backend Workflow**: `prompts/backend-wookflow/18-admin-orders/workflow.png`
- **Brand Reference**: `ui refrence/ChatGPT Image Aug 30, 2026, 11_53_48 AM.png`

---

## Design Tokens & Palette (Light Mode Only)

| Token | Value | Usage |
|---|---|---|
| Paper | `#F7F4EA` | Page background, card backgrounds, table row base |
| Soil | `#4A3828` | Primary text, titles, table headers, buyer names |
| Harvest Wheat | `#D8B56A` | Active filter pills, primary action buttons, focus highlights |
| Husk | `#A88958` | Secondary labels, timestamp formatting, subtle borders |
| Deep Grain Green | `#21483A` | "Stored" / "Delivered" badges, positive status pills |
| Trust Indigo | `#303B63` | "In Transit" badges, Order ID links, buyer emails |
| Border | `#E4DCC8` | Table borders, card outlines, panel dividers |
| Danger | `#B3432E` | "Exception" badge, cancelled status, refund & cancel actions |
| Warning | `#C7862B` | "Pending Payment", "Sourcing" badges, attention notices |

---

## Architecture & Security Rules

1. **Role Enforcement & Authentication**:
   - Layout, page, and API routes strictly gated by `profiles.role === 'admin'` and authenticated Supabase session.
   - Non-admin or unauthenticated access immediately redirects to `/home` or `/login`.

2. **Controlled State Advancement State Machine**:
   - Status updates are validated server-side against an explicit allowed transitions map:
     - `pending_payment` → `cancelled` (or payment webhook transition to `sourcing`)
     - `sourcing` → `in_transit`, `exception`, `cancelled`
     - `in_transit` → `stored`, `delivered`, `exception`, `cancelled`
     - `exception` → requires explicit triage resolution action (`allocate_inventory` or `refund_and_cancel`)
     - `stored` / `delivered` / `cancelled` → terminal states (no forward transitions)
   - Disallow arbitrary or regression transitions (e.g., `stored` → `sourcing` must return 400 Bad Request).

3. **Exception & Reconciliation State Handling**:
   - Orders in `exception` state (e.g. payment confirmed but stock allocation failed) render an `ExceptionResolutionPanel`.
   - Resolution via "Allocate Inventory" interacts with the warehouse inventory ledger to safely allocate units without corrupting stock invariants.
   - Resolution via "Refund & Cancel" marks order as `cancelled` and frees any pending locks.

4. **Immutable Audit Logging**:
   - Every status advance, exception resolution, or manual cancellation writes a row to `audit_logs` capturing:
     - `admin_id`: Acting admin UUID
     - `action`: `admin_order_status_update` or `admin_order_exception_resolved`
     - `entity_type`: `orders`
     - `entity_id`: Order ID
     - `old_state` / `new_state`: Previous status and updated status
     - `metadata`: Reason, timestamp, and notes.

---

## UI Components & Views

### 1. Admin Orders List View (`/admin/orders`)
- **Header & Metric Counters**: Summary pills displaying Total Orders, Active Fulfillment, Exceptions, and Completed.
- **Filter & Search Bar**: Status filter tabs (`All`, `Pending`, `Sourcing`, `In Transit`, `Stored`, `Delivered`, `Exceptions`, `Cancelled`) + buyer name / email / order ID search input + date range picker.
- **Desktop Table (`OrdersTable`)**: Dense tabular display with Order ID, Date, Buyer (name + email), Commodity & Grade, Quantity (kg), Total (₦), Payment Status Badge, Fulfillment Status Badge, and "Manage" action button.
- **Mobile Stacked Cards (`OrdersMobileList`)**: Responsive touch-friendly card list with key order details and fast navigation.
- **Pagination Controls**: URL-driven pagination (`?page=1&limit=10`).

### 2. Admin Order Detail View (`/admin/orders/[orderId]`)
- **Top Header**: Back navigation to `/admin/orders`, order ID title, creation timestamp, and quick status badges.
- **Fulfillment Lifecycle Section**: Visual `StatusStepper` displaying read-only progress from Order Placed → Sourcing → In Transit → Stored / Delivered.
- **Status Advancement Control (`StatusAdvanceControl`)**: Interactive selector displaying current state and dropdown of ONLY valid next states, with optional admin notes field and "Update Status" confirmation button.
- **Exception Resolution Panel (`ExceptionResolutionPanel`)**: Highlighted triage card shown when order is in `exception` state with actionable resolution buttons ("Allocate from Warehouse Silo", "Refund & Cancel").
- **Buyer & Shipping Info Card**: Buyer name, email, phone number, delivery address (if home delivery requested), and account link.
- **Commodity & Pricing Card**: Commodity thumbnail, grade badge, quantity, unit price, subtotal, platform fee, and total paid.
- **Payment & Transaction Details**: Paystack reference, payment method, payment status badge, and transaction timestamps.
- **Order Audit Trail**: Timeline displaying historical status changes, timestamps, and the admin who executed them.

---

## Files to Create & Update

### 1. `lib/supabase/queries/admin/orders.ts` (New)
- Service-role query helpers:
  - `getAllAdminOrders(filters)`: Queries `orders` with joins on `profiles`, `order_items`, `commodities`, `commodity_grades`, and `payments` with pagination, search, and status filters.
  - `getAdminOrderDetail(orderId)`: Retrieves full order tree, buyer profile, item details, payment record, and associated audit logs.
  - `advanceOrderStatus(orderId, nextStatus, adminId, notes)`: Validates transition, updates `orders.status`, and writes to `audit_logs`.
  - `resolveOrderException(orderId, action, adminId, details)`: Executes ledger allocation or cancellation and records audit log.

### 2. `app/api/admin/orders/[id]/status/route.ts` (New)
- `POST` route handler: Admin-role gated, validates allowed state machine transitions, executes status update, and returns updated order.

### 3. `app/api/admin/orders/[id]/exception/route.ts` (New)
- `POST` route handler: Admin-role gated, processes exception triage resolution.

### 4. Components in `components/admin/orders/` (New)
- `orders-table.tsx`: Desktop dense table with status badges and quick view actions.
- `orders-mobile-list.tsx`: Mobile card list representation.
- `order-filter-bar.tsx`: Client component for URL-driven filter tabs and search.
- `status-advance-control.tsx`: Client component dropdown with allowed transitions and submission state.
- `exception-resolution-panel.tsx`: Client component for triage actions on exception orders.
- `order-audit-trail.tsx`: Visual timeline of order status transitions and admin actions.

### 5. Pages in `app/admin/orders/` (New)
- `app/admin/orders/page.tsx`: Server Component for orders list with search and filter support.
- `app/admin/orders/[orderId]/page.tsx`: Server Component for order detail, status controls, and exception triage.

---

## Quality & Compliance Checklist
- [ ] Strictly light mode design (Harvest Wheat `#D8B56A`, Soil `#4A3828`, Paper `#F7F4EA`, Deep Grain Green `#21483A`, Danger `#B3432E`, Warning `#C7862B`).
- [ ] Admin role verification on layout, page, and API routes.
- [ ] Strict server-side state machine validation (no invalid or skipping transitions).
- [ ] Audit log record created on every status transition or exception resolution.
- [ ] Responsive layouts for desktop (≥1024px) and mobile (<640px).
- [ ] Inline code comments on all new files (file-level + block-level).
- [ ] `docs/overview.md` updated with table breakdown of every new file.
- [ ] TypeScript check and build verification passing.
