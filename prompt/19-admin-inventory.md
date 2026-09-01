# Prompt: Admin Inventory & Warehouses — KorraStore

## Goal

Build `/admin/inventory`: manage commodities, grades, warehouses, and view/adjust
inventory levels with a full movement ledger. Desktop + mobile, light mode only.

## Skills read

- `.agents/skills/supabase/SKILL.md` — service-role writes, the ledger-only balance
  rule (all inventory adjustments go through `inventory_movements`, never a direct
  `inventory.quantity` update).
- `02-design-system.md` — `Card`, `Badge`, `Modal`, `Pagination`.
- `AGENTS.md` §9 (inventory ledger rules — `ADJUSTMENT` movement type requires a
  reason), §12 (`POST /api/admin/inventory`).

## Existing code inspected

- `03-database-schema.md` — `commodities`, `commodity_grades`, `warehouses`,
  `inventory`, `inventory_movements` schemas.
- `28-inventory-ledger.md` (later infrastructure prompt) — this admin UI is the
  primary consumer of that domain service's write functions; if that prompt hasn't
  landed yet at implementation time, implement the ledger-write function here
  directly and note it should be extracted into the shared domain service once
  `28-inventory-ledger.md` runs.

## Decisions / assumptions

- **Three tabs**: Commodities (add/edit commodity + its grades), Warehouses
  (add/edit warehouse), Inventory (per-commodity/grade/warehouse quantity, with an
  "Adjust" action that requires a reason and always writes an `ADJUSTMENT`
  movement).
- **Commodity/grade edits** (name, description, active status) don't touch
  quantities at all — only the Inventory tab's "Adjust" action changes balances.
- **Movement history** is viewable per inventory line (a "View history" action
  opens a modal listing that line's `inventory_movements`, most recent first).

## Visual interpretation (light mode only)

### Commodities tab — Desktop
Table: commodity name, unit (kg/bag/ton), active toggle, grade count, "Edit"
action. "Add commodity" button top-right opens a modal (name, description, base
unit, active toggle) with a nested grade list (add/edit/deactivate grades inline).

### Warehouses tab — Desktop
Table: warehouse name, location, active toggle, "Edit" action. "Add warehouse"
button opens a modal (name, location, capacity if tracked).

### Inventory tab — Desktop
Table: commodity, grade, warehouse, current quantity, reserved quantity
(computed from active resale/buyback reservations), available quantity, "Adjust"
and "View history" actions.

### Mobile (all tabs)
Tabs as a horizontally scrollable segmented row; tables collapse to stacked
row-cards.

### Adjust modal
Current quantity (read-only), adjustment amount (+/-), reason (required text
field), "Confirm adjustment" button — clearly warns this is logged and auditable.

## Files likely to change / add

- `app/admin/inventory/page.tsx` — tab shell.
- `components/admin/inventory/commodities-tab.tsx`, `warehouses-tab.tsx`,
  `inventory-tab.tsx`, `commodity-form-modal.tsx` (client), `grade-editor.tsx`
  (client), `warehouse-form-modal.tsx` (client), `adjust-inventory-modal.tsx`
  (client), `movement-history-modal.tsx` (client).
- `lib/supabase/queries/admin/inventory.ts` — CRUD for
  commodities/grades/warehouses, `getInventoryLines()`,
  `getMovementHistory(inventoryId)`.
- `lib/domain/ledger/inventory-ledger.ts` — `adjustInventory(inventoryId, delta,
  reason, adminId)` — writes the movement + updates the cached balance atomically
  (extracted fully in `28-inventory-ledger.md` if sequenced later; implemented here
  first if this prompt runs earlier).
- `app/api/admin/inventory/route.ts` — `POST`, admin-role-gated.

## Implementation requirements

- Every quantity change goes through `adjustInventory`, which writes both the
  movement row and the balance update in a single transaction — never update
  `inventory.quantity` directly from a form handler.
- Adjustment reason is required and stored on the movement row.
- `"use client"` scoped to the modals and tab-switch interaction.

## Security requirements

- Admin-role-gated at layout, page, and API route level.
- All writes logged to `audit_logs` in addition to `inventory_movements`.

## Acceptance criteria

- Commodities/grades/warehouses CRUD works correctly.
- Inventory adjustments always produce a corresponding movement row and update the
  cached balance consistently (verify balance matches sum of movements).
- Movement history modal shows accurate, ordered history per inventory line.
- Layout matches spec at mobile/desktop.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test`
  ("inventory/holding balance consistency" test per `AGENTS.md` §19).

## Manual test steps

1. `npm run dev`; sign in as admin; visit `/admin/inventory`.
2. Add a new commodity with two grades; confirm it appears correctly and is
   available on `/home` if marked active.
3. Add a warehouse; confirm it's selectable when adjusting inventory.
4. Adjust an inventory line's quantity with a reason; confirm the balance updates
   and a movement row is recorded with that reason.
5. Open "View history"; confirm all prior movements for that line are listed
   accurately.
6. Resize to ~375px and ~1440px — confirm layout matches spec.
