# Feature 19: Admin Inventory & Warehouses — Full Prompt Spec

## Goal
Build `/admin/inventory`: the admin panel for managing commodities, commodity grades,
warehouses, and viewing/adjusting inventory balances. All quantity changes flow through
the ledger (`inventory_movements`) — never a direct `inventory.quantity` update.
Desktop (1440px) + mobile (375px), strict light mode only.

---

## Skills to Read Before Coding

- `.agents/skills/supabase/SKILL.md` — service-role writes, ledger-only balance rule
  (adjustments > `inventory_movements`, never direct `inventory.quantity` write).
- `prompts/02-design-system.md` — `Card`, `Badge`, `Modal`, `Pagination`, `GradeBadge`,
  all design tokens.
- `AGENTS.md` Feature 03 (inventory ledger tables), Feature 17 (admin shell/nav),
  Feature 19 (inventory ledger rules — ADJUSTMENT movement type requires a reason).

---

## Decisions & Assumptions

1. **Three-tab structure**:
   - Inventory Balances: per-commodity/grade/warehouse row, physical/reserved/available qty, Adjust + View History.
   - Commodities & Grades: CRUD for commodities and nested grades (no qty fields).
   - Warehouses: CRUD for warehouse locations.

2. **Inventory Adjustment Rule** (non-negotiable):
   - Every stock quantity change MUST go through `adjustInventory(inventoryId, delta, reason, adminId)`.
   - Atomically writes inventory_movements row + updates inventory.quantity in one transaction.
   - reason is required (non-empty string).

3. **Reserved Quantity**: computed at query time from resale_listings + buyback_requests. Never stored.

4. **Movement History Modal**: all inventory_movements for a line, most-recent first.

---

## Files to Create

- `app/admin/inventory/page.tsx` — Server Component tab shell.
- `components/admin/inventory/inventory-tab.tsx` — Server Component.
- `components/admin/inventory/commodities-tab.tsx` — Server Component.
- `components/admin/inventory/warehouses-tab.tsx` — Server Component.
- `components/admin/inventory/adjust-inventory-modal.tsx` — Client Component.
- `components/admin/inventory/movement-history-modal.tsx` — Client Component.
- `components/admin/inventory/commodity-form-modal.tsx` — Client Component.
- `components/admin/inventory/grade-editor.tsx` — Client Component.
- `components/admin/inventory/warehouse-form-modal.tsx` — Client Component.
- `lib/supabase/queries/admin/inventory.ts` — CRUD query helpers.
- `lib/domain/ledger/inventory-ledger.ts` — `adjustInventory` atomic function.
- `app/api/admin/inventory/commodities/route.ts`
- `app/api/admin/inventory/warehouses/route.ts`
- `app/api/admin/inventory/adjust/route.ts`
- `app/api/admin/inventory/[inventoryId]/movements/route.ts`

---

## Security Requirements

- Triple-layer admin guard: middleware + layout + API routes.
- Service-role client for all writes.
- All adjustments write to audit_logs in addition to inventory_movements.

---

## Acceptance Criteria

1. CRUD for commodities/grades/warehouses works correctly.
2. Inventory adjustments always produce a movement row + consistent cached balance.
3. inventory.quantity matches SUM(delta) FROM inventory_movements at all times.
4. Movement history shows accurate ordered history per line.
5. Layout matches spec at 375px and 1440px.
