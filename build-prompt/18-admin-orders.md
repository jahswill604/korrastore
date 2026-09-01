# Feature 18: Admin Orders Management — Build Prompt

## Overview
Implement `/admin/orders` and `/admin/orders/[orderId]`: the operational order management and fulfillment control system for KorraStore administrators. Enables admins to search, filter, and inspect all customer commodity orders, advance fulfillment stages (`sourcing` → `in_transit` → `stored`/`delivered`) via an enforced state machine, resolve reconciliation exceptions through the warehouse inventory ledger, and record every administrative change in `audit_logs`. Fully responsive with dense desktop tables and mobile stacked cards in light mode.

## References & Design Artifacts
- **Prompt Spec**: `prompt/18-admin-orders.md` & `prompts/18-admin-orders.md`
- **Desktop UI Design**: `prompts/ui degine/18-admin-orders/desktop-ui.png`
- **Mobile UI Design**: `prompts/ui degine/18-admin-orders/mobile-ui.png`
- **Backend Workflow**: `prompts/backend-wookflow/18-admin-orders/workflow.png`
- **Implementation Spec**: `prompts/implementation/18-admin-orders.md`
- **Design System & Architecture Rules**: `AGENTS.md` Feature 02, Feature 09, & Feature 18

## Instructions for Agent
Strictly read all referenced files before writing any code. Follow all design tokens (Light mode only, Harvest Wheat `#D8B56A`, Soil `#4A3828`, Deep Grain Green `#21483A`, Trust Indigo `#303B63`, Paper `#F7F4EA`, Border `#E4DCC8`, Danger `#B3432E`, Warning `#C7862B`), defense-in-depth admin role verification (`getUser()` + `profiles.role === 'admin'`), state machine validation, ledger-safe reconciliation, inline code comments, and documentation rules.

## Core Implementation Steps
1. **Admin Order Queries**: `lib/supabase/queries/admin/orders.ts` — fetch filtered order lists, aggregate metrics, single order detail trees, advance order status, resolve exceptions, and insert audit logs via `createServiceRoleClient()`.
2. **API Route Handlers**:
   - `app/api/admin/orders/[id]/status/route.ts` — validate transition against allowed state map, update status, and write to `audit_logs`.
   - `app/api/admin/orders/[id]/exception/route.ts` — handle exception resolution (allocation via ledger or refund cancellation) with audit logging.
3. **Admin Orders UI Components**:
   - `components/admin/orders/orders-table.tsx` (dense desktop table with status pills and actions).
   - `components/admin/orders/orders-mobile-list.tsx` (mobile responsive stacked card list).
   - `components/admin/orders/order-filter-bar.tsx` (URL-driven filter tabs for statuses including Exceptions, and search input).
   - `components/admin/orders/status-advance-control.tsx` (controlled next-state selector with confirmation modal/trigger).
   - `components/admin/orders/exception-resolution-panel.tsx` (actionable triage box for exception orders).
   - `components/admin/orders/order-audit-trail.tsx` (timeline of status changes and admin actions).
4. **Admin Orders Pages**:
   - `app/admin/orders/page.tsx` (Server Component fetching filtered orders and rendering list layout).
   - `app/admin/orders/[orderId]/page.tsx` (Server Component fetching single order detail, stepper, buyer card, payment summary, status controls, and audit history).
