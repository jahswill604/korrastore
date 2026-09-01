# Implementation Prompt: Feature 19 — Admin Inventory & Warehouses

## Goal
Build `/admin/inventory` for KorraStore administrators. Three tabs:
1. Inventory Balances — view per-commodity/grade/warehouse stock + Adjust + View History.
2. Commodities & Grades — CRUD for commodities and their nested grades.
3. Warehouses — CRUD for warehouse silo locations.

All stock adjustments are ledger-safe: every quantity change goes through `adjustInventory()`
which atomically inserts an `inventory_movements` row AND updates `inventory.quantity` in
one DB transaction. Reason is required. Direct quantity updates are forbidden.

---

## Context Files to Read Before Writing Any Code

1. `prompt/19-admin-inventory.md` & `prompts/19-admin-inventory.md` — canonical spec
2. `AGENTS.md` — Feature 03 (schema), Feature 17 (admin nav), Feature 19 (ledger rules)
3. `.agents/skills/supabase/SKILL.md` — service-role client, ledger patterns
4. `prompts/02-design-system.md` — design tokens, Card, Badge, Modal, GradeBadge
5. `prompts/17-admin-dashboard.md` — admin shell and nav integration
6. `docs/overview.md` — current codebase file map

---

## Design References

- **Desktop UI**: `prompts/ui degine/19-admin-inventory/desktop-ui.png`
- **Mobile UI**: `prompts/ui degine/19-admin-inventory/mobile-ui.png`
- **Backend Workflow**: `prompts/backend-wookflow/19-admin-inventory/workflow.png`
- **Brand Reference**: `ui refrence/ChatGPT Image Aug 30, 2026, 11_53_48 AM.png`

---

## Design Tokens (Light Mode Only)

| Token | Value | Usage |
|---|---|---|
| Paper | `#F7F4EA` | Page bg, card bg, table row base |
| Soil | `#4A3828` | Primary text, table headers |
| Harvest Wheat | `#D8B56A` | Active tabs, primary CTAs, Adjust button |
| Husk | `#A88958` | Secondary labels, hover states |
| Deep Grain Green | `#21483A` | Premium badges, Available > 0 quantity |
| Trust Indigo | `#303B63` | Warehouse links, info badges |
| Border | `#E4DCC8` | Card outlines, table borders |
| Danger | `#B3432E` | Available = 0 alert, deactivate actions |
| Warning | `#C7862B` | Low stock indicators |

---

## Architecture & Security

1. Triple admin guard: Next.js middleware + `app/admin/layout.tsx` Server Component + every API route.
2. All writes via `createServiceRoleClient()` — never anon/browser client for mutations.
3. `adjustInventory()` domain function is the only allowed path for quantity changes.
4. Every adjustment also inserts into `audit_logs` (entity_type=`inventory`, action=`ADJUSTMENT`).

---

## Core Implementation Steps

### 1. `lib/supabase/queries/admin/inventory.ts` (New)
Query helpers using service-role client:
- `getCommodities()` — all commodities with grade counts.
- `getCommodityDetail(id)` — commodity + nested grades array.
- `upsertCommodity(data)` — INSERT or UPDATE commodities (name, description, unit, prices, active).
- `upsertGrade(data)` — INSERT or UPDATE commodity_grades.
- `getWarehouses()` — all warehouses.
- `upsertWarehouse(data)` — INSERT or UPDATE warehouses.
- `getInventoryLines(filters)` — JOIN commodities + grades + warehouses + compute reserved_quantity from resale_listings + buyback_requests subqueries.
- `getMovementHistory(inventoryId)` — all inventory_movements for line, ORDER BY created_at DESC.

### 2. `lib/domain/ledger/inventory-ledger.ts` (New or Extend)
```typescript
// adjustInventory: atomic ledger-safe stock adjustment
// Inserts inventory_movements row + updates inventory.quantity in one transaction.
// Also inserts audit_logs entry.
export async function adjustInventory(
  inventoryId: string,
  delta: number,           // signed — positive = add, negative = remove
  reason: string,          // required, non-empty
  adminId: string
): Promise<{ newQuantity: number }>
```
If `28-inventory-ledger.md` has already landed this function, extend/reuse it rather than duplicate.

### 3. API Routes (all admin-gated)
- `app/api/admin/inventory/commodities/route.ts` — GET list, POST upsert.
- `app/api/admin/inventory/commodities/[id]/route.ts` — PUT update, PATCH (toggle active).
- `app/api/admin/inventory/warehouses/route.ts` — GET list, POST upsert.
- `app/api/admin/inventory/warehouses/[id]/route.ts` — PUT update.
- `app/api/admin/inventory/adjust/route.ts` — POST, validates reason non-empty, calls `adjustInventory`.
- `app/api/admin/inventory/[inventoryId]/movements/route.ts` — GET history.

### 4. UI Components

#### Server Components (no interactivity)
- `components/admin/inventory/inventory-tab.tsx` — dense table with stat cards.
- `components/admin/inventory/commodities-tab.tsx` — commodity table.
- `components/admin/inventory/warehouses-tab.tsx` — warehouse table.

#### Client Components ("use client")
- `components/admin/inventory/adjust-inventory-modal.tsx`:
  - Props: inventoryLine (id, commodity, grade, warehouse, current_quantity).
  - Fields: current qty (read-only), delta stepper (+/-), reason textarea (required).
  - Audit warning: "This action is logged and auditable. Stock adjustments cannot be undone."
  - On submit: POST /api/admin/inventory/adjust.
- `components/admin/inventory/movement-history-modal.tsx`:
  - Fetches GET /api/admin/inventory/[inventoryId]/movements.
  - Renders timeline: type badge | signed delta (IBM Plex Mono, green/red) | reason | admin | timestamp.
- `components/admin/inventory/commodity-form-modal.tsx`:
  - Add/Edit commodity fields + nested `GradeEditor`.
  - On submit: POST/PUT /api/admin/inventory/commodities.
- `components/admin/inventory/grade-editor.tsx`:
  - Inline list of grades with add/edit/deactivate per grade.
  - Each grade: name input, description, active toggle.
- `components/admin/inventory/warehouse-form-modal.tsx`:
  - Fields: name, location, capacity (optional numeric), active toggle.

### 5. Page

#### `app/admin/inventory/page.tsx` (Server Component)
- Verifies admin session (getUser + profiles.role check).
- Reads `?tab=inventory|commodities|warehouses` from searchParams.
- Renders 4 stat cards (Total kg, Silo Capacity %, Active Commodities, Warehouses count).
- Renders tab navigation + active tab content (lazy load via Server Component delegation).

---

## Quality & Compliance Checklist

- [ ] Strictly light mode (all tokens as specified above).
- [ ] Triple admin role verification (middleware + layout + API).
- [ ] Every quantity change goes through `adjustInventory()` — no direct `inventory.quantity` UPDATE.
- [ ] Adjustment reason is required and stored on inventory_movements.
- [ ] Audit log written for every adjustment.
- [ ] `inventory.quantity` matches SUM(delta) from inventory_movements (test assertion).
- [ ] Responsive: desktop table + mobile stacked cards.
- [ ] Inline file-level + block-level comments on ALL new files.
- [ ] `docs/overview.md` updated with every new file and block breakdown.
- [ ] TypeScript check and build passing.
