# Feature 19: Admin Inventory & Warehouses — Build Prompt

## Overview
Implement `/admin/inventory`: the admin-only panel for managing KorraStore commodities,
commodity grades, warehouses, and inventory balances. Three tabs — Inventory Balances,
Commodities & Grades, Warehouses. All stock quantity changes are ledger-safe via
`adjustInventory()`, which atomically writes an `inventory_movements` row + updates
`inventory.quantity` in one transaction. Reason is required. Desktop table + mobile
stacked card layouts, strict light mode only.

## References & Design Artifacts
- **Prompt Spec**: `prompt/19-admin-inventory.md` & `prompts/19-admin-inventory.md`
- **Desktop UI Design**: `prompts/ui degine/19-admin-inventory/desktop-ui.png`
- **Mobile UI Design**: `prompts/ui degine/19-admin-inventory/mobile-ui.png`
- **Backend Workflow**: `prompts/backend-wookflow/19-admin-inventory/workflow.png`
- **Implementation Spec**: `prompts/implementation/19-admin-inventory.md`
- **Design System & Architecture Rules**: `AGENTS.md` Feature 02, Feature 03, Feature 17, Feature 19

## Instructions for Agent
Strictly read ALL referenced files above before writing any code. Follow all design tokens
(Light mode only: Harvest Wheat `#D8B56A`, Soil `#4A3828`, Deep Grain Green `#21483A`,
Paper `#F7F4EA`, Border `#E4DCC8`, Danger `#B3432E`, Warning `#C7862B`).
Enforce triple-layer admin role verification. NEVER update `inventory.quantity` directly —
always use `adjustInventory()`. Add inline comments (file-level + block-level) to every
new file. Update `docs/overview.md` after implementation.

## Core Implementation Steps

1. **Query Layer**: `lib/supabase/queries/admin/inventory.ts` — getCommodities,
   getCommodityDetail, upsertCommodity, upsertGrade, getWarehouses, upsertWarehouse,
   getInventoryLines (with computed reserved_quantity), getMovementHistory.

2. **Domain Service**: `lib/domain/ledger/inventory-ledger.ts` — `adjustInventory()`
   atomic function: INSERT inventory_movements + UPDATE inventory.quantity + INSERT
   audit_logs, all in one DB transaction.

3. **API Routes** (all admin-gated):
   - `app/api/admin/inventory/commodities/route.ts` — GET, POST.
   - `app/api/admin/inventory/commodities/[id]/route.ts` — PUT, PATCH.
   - `app/api/admin/inventory/warehouses/route.ts` — GET, POST.
   - `app/api/admin/inventory/warehouses/[id]/route.ts` — PUT.
   - `app/api/admin/inventory/adjust/route.ts` — POST (ledger write).
   - `app/api/admin/inventory/[inventoryId]/movements/route.ts` — GET.

4. **Server Components**: `app/admin/inventory/page.tsx` (tab shell + stat cards),
   `components/admin/inventory/inventory-tab.tsx`, `commodities-tab.tsx`, `warehouses-tab.tsx`.

5. **Client Components**: `adjust-inventory-modal.tsx`, `movement-history-modal.tsx`,
   `commodity-form-modal.tsx`, `grade-editor.tsx`, `warehouse-form-modal.tsx`.
