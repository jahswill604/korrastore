// lib/domain/ledger/inventory-ledger.ts — Atomic Inventory Ledger Domain Service for KorraStore.
// Implements the ONLY permitted path for inventory quantity changes: adjustInventory().
// Enforces the ledger invariant: inventory.quantity === SUM(delta) FROM inventory_movements.
// Security: Server-only. Uses service-role client for atomic DB writes.
// Used in: app/api/admin/inventory/adjust/route.ts

import 'server-only';
import { createServiceClient } from '@/lib/supabase/service';
import type { AdjustInventoryResult } from '@/lib/types/admin-inventory';

// ----------------------------------------------------------------------------
// adjustInventory — The ONLY authorised path for changing inventory.quantity
// ----------------------------------------------------------------------------

/**
 * Atomically adjusts an inventory line's quantity.
 *
 * Operations performed in sequence (no native Supabase transaction — we use
 * optimistic ordering: read → movement insert → balance update → audit log):
 *
 *  1. Fetch the current inventory row to get old_quantity and composite key fields.
 *  2. Compute new_quantity = old_quantity + delta.
 *  3. Validate: new_quantity must not go negative.
 *  4. INSERT into inventory_movements (type=ADJUSTMENT, quantity=delta, balance_after=new_quantity, notes=reason, created_by=adminId).
 *  5. UPDATE inventory.quantity = new_quantity.
 *  6. INSERT into audit_logs with action=INVENTORY_ADJUSTMENT.
 *
 * @param inventoryId - The inventory table row UUID.
 * @param delta - Signed quantity change. Positive = stock in, negative = stock out.
 * @param reason - Required non-empty string explaining the adjustment.
 * @param adminId - The authenticated admin's user UUID.
 *
 * @throws Error if inventory row not found, delta would make quantity negative,
 *         reason is empty, or any DB write fails.
 */
export async function adjustInventory(
  inventoryId: string,
  delta: number,
  reason: string,
  adminId: string
): Promise<AdjustInventoryResult> {
  // Input validation — must occur before any DB writes
  if (!reason || reason.trim().length === 0) {
    throw new Error('Adjustment reason is required and cannot be empty.');
  }
  if (delta === 0) {
    throw new Error('Adjustment delta cannot be zero.');
  }

  const db = createServiceClient();

  // Step 1: Fetch the current inventory row (warehouse_id, commodity_id, grade_id needed for movement)
  const { data: invRow, error: fetchError } = await db
    .from('inventory')
    .select('id, warehouse_id, commodity_id, grade_id, quantity')
    .eq('id', inventoryId)
    .single();

  if (fetchError || !invRow) {
    throw new Error(
      `Inventory line not found: ${inventoryId}. ${fetchError?.message ?? ''}`
    );
  }

  const old_quantity = invRow.quantity as number;
  const new_quantity = old_quantity + delta;

  // Step 2: Guard against negative stock
  if (new_quantity < 0) {
    throw new Error(
      `Adjustment would result in negative stock (${old_quantity} + ${delta} = ${new_quantity}). ` +
      `Cannot reduce stock below zero.`
    );
  }

  // Step 3: INSERT inventory_movements row (the immutable ledger entry)
  const { data: movement, error: movementError } = await db
    .from('inventory_movements')
    .insert({
      warehouse_id: invRow.warehouse_id,
      commodity_id: invRow.commodity_id,
      grade_id: invRow.grade_id,
      movement_type: 'ADJUSTMENT',
      quantity: delta,              // signed delta (positive or negative)
      balance_after: new_quantity,  // resulting balance for ledger verification
      reference_type: 'admin_adjustment',
      notes: reason.trim(),
      created_by: adminId,
      created_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (movementError || !movement) {
    throw new Error(
      `Failed to write inventory movement: ${movementError?.message ?? 'unknown error'}`
    );
  }

  // Step 4: UPDATE inventory.quantity to the new value
  const { error: updateError } = await db
    .from('inventory')
    .update({
      quantity: new_quantity,
      updated_at: new Date().toISOString(),
    })
    .eq('id', inventoryId);

  if (updateError) {
    // Critical: movement was written but balance update failed.
    // Log but throw so caller can surface the inconsistency.
    console.error(
      '[adjustInventory] CRITICAL: movement written but inventory balance update failed:',
      updateError.message,
      { inventoryId, movement_id: movement.id, delta, new_quantity }
    );
    throw new Error(
      `Inventory balance update failed after movement insert. ` +
      `Movement ID: ${movement.id}. Manual reconciliation required. ` +
      `Error: ${updateError.message}`
    );
  }

  // Step 5: INSERT audit_logs entry for the admin action
  const { error: auditError } = await db
    .from('audit_logs')
    .insert({
      user_id: adminId,
      action: 'INVENTORY_ADJUSTMENT',
      entity_type: 'inventory',
      entity_id: inventoryId,
      old_data: {
        quantity: old_quantity,
        inventory_id: inventoryId,
        warehouse_id: invRow.warehouse_id,
        commodity_id: invRow.commodity_id,
        grade_id: invRow.grade_id,
      },
      new_data: {
        quantity: new_quantity,
        delta,
        reason: reason.trim(),
        movement_id: movement.id,
      },
      created_at: new Date().toISOString(),
    });

  if (auditError) {
    // Audit failure is non-critical (stock is correct) but must be logged loudly
    console.error('[adjustInventory] audit_log insert failed:', auditError.message, {
      inventoryId,
      adminId,
      delta,
    });
  }

  return {
    inventory_id: inventoryId,
    old_quantity,
    new_quantity,
    delta,
    movement_id: movement.id,
  };
}
