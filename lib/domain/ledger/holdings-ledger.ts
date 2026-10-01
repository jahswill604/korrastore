// lib/domain/ledger/holdings-ledger.ts — Atomic Holdings Ledger Domain Service for KorraStore.
// Implements the ONLY permitted path for turning a paid order into buyer ownership:
// allocatePurchaseToHolding(). Mirrors the invariants in inventory-ledger.ts —
// every quantity change is backed by an immutable movement row.
// Security: Server-only. Uses service-role client for atomic DB writes.
// Used in: app/api/webhooks/paystack/route.ts (Feature 26 — purchase-to-ownership pipeline)

import 'server-only';
import { createServiceClient } from '@/lib/supabase/service';

export interface AllocatePurchaseParams {
  orderId: string;
  userId: string;
  commodityId: string;
  gradeId: string;
  warehouseId: string;
  quantity: number; // units being purchased
  unitPrice: number; // naira, price paid per unit
}

export interface AllocatePurchaseResult {
  holdingId: string;
  inventoryMovementId: string;
  holdingMovementId: string;
  newHoldingQuantity: number;
}

/**
 * Allocates a paid order from platform inventory to the buyer's holding and records both ledger movements.
 *
 * Balance updates and movement records are written sequentially without a native database transaction; a failure after a balance update may require manual reconciliation.
 *
 * @param params - The order, buyer, inventory dimensions, quantity, and unit purchase price.
 * @returns The affected holding ID, movement IDs, and resulting holding quantity.
 * @throws Error if the quantity is invalid, inventory is unavailable or insufficient, or any balance or movement write fails.
 */
export async function allocatePurchaseToHolding(
  params: AllocatePurchaseParams
): Promise<AllocatePurchaseResult> {
  const { orderId, userId, commodityId, gradeId, warehouseId, quantity, unitPrice } = params;

  if (quantity <= 0) {
    throw new Error('allocatePurchaseToHolding: quantity must be positive.');
  }

  const db = createServiceClient();

  // -------------------------------------------------------------------
  // Step 1: Find the inventory line stock is being sold from.
  // -------------------------------------------------------------------
  const { data: invRow, error: invFetchError } = await db
    .from('inventory')
    .select('id, quantity, allocated_quantity')
    .eq('warehouse_id', warehouseId)
    .eq('commodity_id', commodityId)
    .eq('grade_id', gradeId)
    .single();

  if (invFetchError || !invRow) {
    throw new Error(
      `allocatePurchaseToHolding: no inventory row for warehouse=${warehouseId} ` +
      `commodity=${commodityId} grade=${gradeId}. ${invFetchError?.message ?? ''}`
    );
  }

  const oldQuantity = Number(invRow.quantity);
  const newQuantity = oldQuantity - quantity;

  if (newQuantity < 0) {
    throw new Error(
      `allocatePurchaseToHolding: insufficient stock (have ${oldQuantity}, need ${quantity}) ` +
      `for order ${orderId}.`
    );
  }

  // -------------------------------------------------------------------
  // Step 2: Decrement platform inventory.
  // -------------------------------------------------------------------
  const { error: invUpdateError } = await db
    .from('inventory')
    .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
    .eq('id', invRow.id);

  if (invUpdateError) {
    throw new Error(
      `allocatePurchaseToHolding: failed to decrement inventory for order ${orderId}: ` +
      invUpdateError.message
    );
  }

  // -------------------------------------------------------------------
  // Step 3: Immutable inventory movement record.
  // -------------------------------------------------------------------
  const { data: invMovement, error: invMovementError } = await db
    .from('inventory_movements')
    .insert({
      warehouse_id: warehouseId,
      commodity_id: commodityId,
      grade_id: gradeId,
      movement_type: 'SALE',
      quantity: -quantity,
      balance_after: newQuantity,
      reference_type: 'order',
      reference_id: orderId,
      notes: `Purchase allocation for order ${orderId}`,
      created_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (invMovementError || !invMovement) {
    // Critical: stock already decremented but the ledger row failed to write.
    console.error(
      '[allocatePurchaseToHolding] CRITICAL: inventory decremented but movement insert failed:',
      invMovementError?.message,
      { orderId, warehouseId, commodityId, gradeId, quantity }
    );
    throw new Error(
      `Inventory movement insert failed after balance update for order ${orderId}. ` +
      `Manual reconciliation required.`
    );
  }

  // -------------------------------------------------------------------
  // Step 4: Upsert the buyer's holding (weighted-average cost basis).
  // -------------------------------------------------------------------
  const { data: existingHolding } = await db
    .from('holdings')
    .select('id, quantity, cost_basis')
    .eq('user_id', userId)
    .eq('commodity_id', commodityId)
    .eq('grade_id', gradeId)
    .eq('warehouse_id', warehouseId)
    .maybeSingle();

  let holdingId: string;
  let newHoldingQuantity: number;

  const purchaseCost = quantity * unitPrice;

  if (existingHolding) {
    const priorQuantity = Number(existingHolding.quantity);
    const priorCostBasis = Number(existingHolding.cost_basis);
    newHoldingQuantity = priorQuantity + quantity;
    const newCostBasis = priorCostBasis + purchaseCost;
    const newAvgUnitPrice = newHoldingQuantity > 0 ? newCostBasis / newHoldingQuantity : unitPrice;

    const { error: holdingUpdateError } = await db
      .from('holdings')
      .update({
        quantity: newHoldingQuantity,
        cost_basis: newCostBasis,
        unit_purchase_price: newAvgUnitPrice,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingHolding.id);

    if (holdingUpdateError) {
      throw new Error(
        `allocatePurchaseToHolding: failed to update holding for order ${orderId}: ` +
        holdingUpdateError.message
      );
    }
    holdingId = existingHolding.id;
  } else {
    const { data: newHolding, error: holdingInsertError } = await db
      .from('holdings')
      .insert({
        user_id: userId,
        commodity_id: commodityId,
        grade_id: gradeId,
        warehouse_id: warehouseId,
        quantity,
        cost_basis: purchaseCost,
        unit_purchase_price: unitPrice,
      })
      .select('id')
      .single();

    if (holdingInsertError || !newHolding) {
      throw new Error(
        `allocatePurchaseToHolding: failed to create holding for order ${orderId}: ` +
        (holdingInsertError?.message ?? 'unknown error')
      );
    }
    holdingId = newHolding.id;
    newHoldingQuantity = quantity;
  }

  // -------------------------------------------------------------------
  // Step 5: Immutable holding movement record.
  // -------------------------------------------------------------------
  const { data: holdingMovement, error: holdingMovementError } = await db
    .from('holding_movements')
    .insert({
      holding_id: holdingId,
      user_id: userId,
      movement_type: 'purchase',
      quantity,
      balance_after: newHoldingQuantity,
      reference_id: orderId,
      reference_type: 'order',
      notes: `Purchase completed via order ${orderId}`,
      created_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (holdingMovementError || !holdingMovement) {
    // Critical: holding balance already updated but ledger row failed to write.
    console.error(
      '[allocatePurchaseToHolding] CRITICAL: holding updated but movement insert failed:',
      holdingMovementError?.message,
      { orderId, holdingId, quantity }
    );
    throw new Error(
      `Holding movement insert failed after balance update for order ${orderId}. ` +
      `Manual reconciliation required.`
    );
  }

  return {
    holdingId,
    inventoryMovementId: invMovement.id,
    holdingMovementId: holdingMovement.id,
    newHoldingQuantity,
  };
}
