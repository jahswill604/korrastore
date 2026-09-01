// lib/supabase/queries/admin/inventory.ts — Admin Inventory & Warehouse Query Layer for KorraStore.
// Provides all read/write helpers for commodities, commodity_grades, warehouses, inventory lines,
// and movement history. Strictly uses the service-role client to bypass RLS.
// Used in: app/admin/inventory/page.tsx, app/api/admin/inventory/*/route.ts,
//          lib/domain/ledger/inventory-ledger.ts

import 'server-only';
import { createServiceClient } from '@/lib/supabase/service';
import type {
  AdminCommodity,
  AdminCommodityDetail,
  CommodityGrade,
  AdminWarehouse,
  AdminInventoryLine,
  InventoryMovement,
  InventoryStats,
  InventoryLineFilters,
  UpsertCommodityPayload,
  UpsertGradePayload,
  UpsertWarehousePayload,
} from '@/lib/types/admin-inventory';

// ----------------------------------------------------------------------------
// Commodity Queries
// ----------------------------------------------------------------------------

/**
 * Fetches all commodities with grade counts.
 * Used in: Commodities tab table, inventory filter dropdown.
 */
export async function getCommodities(): Promise<AdminCommodity[]> {
  const db = createServiceClient();

  const { data, error } = await db
    .from('commodities')
    .select(`
      id, code, name, description, unit, base_price, current_price,
      image_url, active, created_at, updated_at,
      commodity_grades(count)
    `)
    .order('name', { ascending: true });

  if (error) {
    console.error('[getCommodities] error:', error.message);
    return [];
  }

  // Map the nested grade count from the join
  return (data || []).map((row) => {
    const rawRow = row as unknown as Record<string, unknown>;
    const gradesArray = rawRow.commodity_grades as Array<{ count?: number }> | undefined;
    return {
      ...row,
      grade_count: gradesArray?.[0]?.count ?? 0,
      commodity_grades: undefined,
    } as unknown as AdminCommodity;
  });
}

/**
 * Fetches a single commodity with its full grade list.
 * Used in: CommodityFormModal (edit mode).
 */
export async function getCommodityDetail(id: string): Promise<AdminCommodityDetail | null> {
  const db = createServiceClient();

  const { data, error } = await db
    .from('commodities')
    .select(`
      id, code, name, description, unit, base_price, current_price,
      image_url, active, created_at, updated_at,
      commodity_grades(id, commodity_id, code, name, description, active, created_at, updated_at)
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('[getCommodityDetail] error:', error?.message);
    return null;
  }

  return {
    ...data,
    grade_count: (data.commodity_grades as CommodityGrade[])?.length ?? 0,
    grades: (data.commodity_grades as CommodityGrade[]) || [],
    commodity_grades: undefined,
  } as AdminCommodityDetail;
}

/**
 * Creates or updates a commodity record.
 * - If payload.id is present → UPDATE.
 * - If absent → INSERT.
 * Returns the saved commodity row.
 */
export async function upsertCommodity(payload: UpsertCommodityPayload): Promise<AdminCommodity | null> {
  const db = createServiceClient();

  const { data, error } = await db
    .from('commodities')
    .upsert({
      ...payload,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
    .select('id, code, name, description, unit, base_price, current_price, image_url, active, created_at, updated_at')
    .single();

  if (error || !data) {
    console.error('[upsertCommodity] error:', error?.message);
    return null;
  }

  return { ...data, grade_count: 0 };
}

/**
 * Toggles a commodity's active status (soft deactivate/activate).
 */
export async function toggleCommodityActive(id: string, active: boolean): Promise<boolean> {
  const db = createServiceClient();
  const { error } = await db
    .from('commodities')
    .update({ active, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('[toggleCommodityActive] error:', error.message);
    return false;
  }
  return true;
}

// ----------------------------------------------------------------------------
// Grade Queries
// ----------------------------------------------------------------------------

/**
 * Creates or updates a commodity grade.
 * - If payload.id is present → UPDATE.
 * - If absent → INSERT.
 */
export async function upsertGrade(payload: UpsertGradePayload): Promise<CommodityGrade | null> {
  const db = createServiceClient();

  const { data, error } = await db
    .from('commodity_grades')
    .upsert({
      ...payload,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
    .select('id, commodity_id, code, name, description, active, created_at, updated_at')
    .single();

  if (error || !data) {
    console.error('[upsertGrade] error:', error?.message);
    return null;
  }

  return data as CommodityGrade;
}

/**
 * Soft-deactivates a grade by ID.
 */
export async function deactivateGrade(id: string): Promise<boolean> {
  const db = createServiceClient();
  const { error } = await db
    .from('commodity_grades')
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('[deactivateGrade] error:', error.message);
    return false;
  }
  return true;
}

// ----------------------------------------------------------------------------
// Warehouse Queries
// ----------------------------------------------------------------------------

/**
 * Fetches all warehouses ordered by name.
 * Used in: Warehouses tab, inventory filter dropdown.
 */
export async function getWarehouses(): Promise<AdminWarehouse[]> {
  const db = createServiceClient();

  const { data, error } = await db
    .from('warehouses')
    .select('id, code, name, location, address, capacity, active, created_at, updated_at')
    .order('name', { ascending: true });

  if (error) {
    console.error('[getWarehouses] error:', error.message);
    return [];
  }

  return (data || []) as AdminWarehouse[];
}

/**
 * Creates or updates a warehouse.
 */
export async function upsertWarehouse(payload: UpsertWarehousePayload): Promise<AdminWarehouse | null> {
  const db = createServiceClient();

  const { data, error } = await db
    .from('warehouses')
    .upsert({
      ...payload,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })
    .select('id, code, name, location, address, capacity, active, created_at, updated_at')
    .single();

  if (error || !data) {
    console.error('[upsertWarehouse] error:', error?.message);
    return null;
  }

  return data as AdminWarehouse;
}

/**
 * Toggles a warehouse's active status.
 */
export async function toggleWarehouseActive(id: string, active: boolean): Promise<boolean> {
  const db = createServiceClient();
  const { error } = await db
    .from('warehouses')
    .update({ active, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('[toggleWarehouseActive] error:', error.message);
    return false;
  }
  return true;
}

// ----------------------------------------------------------------------------
// Inventory Line Queries
// ----------------------------------------------------------------------------

/**
 * Fetches all inventory lines joined with commodity, grade, and warehouse data.
 * Computes reserved_quantity at query time from active resale_listings and
 * pending/approved buyback_requests — never stored on the inventory table.
 * Computes available_quantity = quantity - allocated_quantity - reserved_quantity.
 *
 * Used in: Inventory Balances tab table.
 */
export async function getInventoryLines(
  filters: InventoryLineFilters = {}
): Promise<AdminInventoryLine[]> {
  const db = createServiceClient();

  // Build the base query joining commodity, grade, warehouse info
  let query = db
    .from('inventory')
    .select(`
      id, commodity_id, grade_id, warehouse_id, quantity, allocated_quantity, updated_at,
      commodities(name, unit),
      commodity_grades(name, code),
      warehouses(name, location)
    `)
    .order('updated_at', { ascending: false });

  // Apply optional filters
  if (filters.commodity_id) query = query.eq('commodity_id', filters.commodity_id);
  if (filters.warehouse_id) query = query.eq('warehouse_id', filters.warehouse_id);
  if (filters.grade_id) query = query.eq('grade_id', filters.grade_id);

  const { data: inventoryRows, error: inventoryError } = await query;
  if (inventoryError) {
    console.error('[getInventoryLines] inventory error:', inventoryError.message);
    return [];
  }

  if (!inventoryRows || inventoryRows.length === 0) return [];

  // For each inventory line, compute reserved_quantity from active listings + pending buybacks.
  // We do this with parallel Promise.all for efficiency, scoped by commodity_id + grade_id.
  const lines = await Promise.all(
    (inventoryRows as unknown as Array<Record<string, unknown>>).map(async (row) => {
      const commodityId = String(row.commodity_id);
      const gradeId = String(row.grade_id);
      const quantity = Number(row.quantity) || 0;
      const allocatedQuantity = Number(row.allocated_quantity) || 0;

      // Compute reserved from resale_listings
      const { data: resaleData } = await db
        .from('resale_listings')
        .select('quantity')
        .eq('commodity_id', commodityId)
        .eq('grade_id', gradeId)
        .eq('status', 'active');

      const resaleReserved = (resaleData || []).reduce(
        (sum: number, r: { quantity?: number | null }) => sum + (r.quantity || 0),
        0
      );

      // Compute reserved from buyback_requests
      const { data: buybackData } = await db
        .from('buyback_requests')
        .select('quantity')
        .eq('commodity_id', commodityId)
        .eq('grade_id', gradeId)
        .in('status', ['pending', 'approved']);

      const buybackReserved = (buybackData || []).reduce(
        (sum: number, r: { quantity?: number | null }) => sum + (r.quantity || 0),
        0
      );

      const reserved_quantity = resaleReserved + buybackReserved;
      const available_quantity = Math.max(
        0,
        quantity - allocatedQuantity - reserved_quantity
      );

      const commodityObj = row.commodities as { name?: string; unit?: string } | undefined;
      const gradeObj = row.commodity_grades as { name?: string; code?: string } | undefined;
      const warehouseObj = row.warehouses as { name?: string; location?: string } | undefined;

      return {
        id: String(row.id),
        commodity_id: commodityId,
        commodity_name: commodityObj?.name ?? 'Unknown',
        commodity_unit: commodityObj?.unit ?? 'kg',
        grade_id: gradeId,
        grade_name: gradeObj?.name ?? 'Unknown',
        grade_code: gradeObj?.code ?? '',
        warehouse_id: String(row.warehouse_id),
        warehouse_name: warehouseObj?.name ?? 'Unknown',
        warehouse_location: warehouseObj?.location ?? '',
        quantity,
        allocated_quantity: allocatedQuantity,
        reserved_quantity,
        available_quantity,
        updated_at: String(row.updated_at),
      } as AdminInventoryLine;
    })
  );

  return lines;
}

// ----------------------------------------------------------------------------
// Inventory Stats
// ----------------------------------------------------------------------------

/**
 * Computes the four stat card values shown at the top of the inventory page.
 * - total_quantity_kg: sum of all inventory.quantity rows.
 * - silo_capacity_pct: total quantity as % of sum of all warehouse capacities.
 * - active_commodities: count of active=true commodities.
 * - active_warehouses: count of active=true warehouses.
 */
export async function getInventoryStats(): Promise<InventoryStats> {
  const db = createServiceClient();

  const [{ data: invData }, { count: activeCommodities }, { count: activeWarehouses }, { data: warehouseData }] =
    await Promise.all([
      db.from('inventory').select('quantity'),
      db.from('commodities').select('*', { count: 'exact', head: true }).eq('active', true),
      db.from('warehouses').select('*', { count: 'exact', head: true }).eq('active', true),
      db.from('warehouses').select('capacity').eq('active', true),
    ]);

  const total_quantity_kg = (invData || []).reduce(
    (sum: number, r: { quantity?: number | null }) => sum + (r.quantity || 0),
    0
  );
  const total_capacity = (warehouseData || []).reduce(
    (sum: number, r: { capacity?: number | null }) => sum + (r.capacity || 0),
    0
  );
  const silo_capacity_pct =
    total_capacity > 0 ? Math.round((total_quantity_kg / total_capacity) * 100) : 0;

  return {
    total_quantity_kg,
    silo_capacity_pct,
    active_commodities: activeCommodities ?? 0,
    active_warehouses: activeWarehouses ?? 0,
  };
}

// ----------------------------------------------------------------------------
// Movement History Query
// ----------------------------------------------------------------------------

/**
 * Fetches the full movement history for a specific inventory line.
 * Looks up the inventory row first to get warehouse_id + commodity_id + grade_id,
 * then queries inventory_movements for all matching rows ordered most-recent first.
 *
 * Used in: MovementHistoryModal.
 */
export async function getMovementHistory(inventoryId: string): Promise<InventoryMovement[]> {
  const db = createServiceClient();

  // First fetch the inventory row to get its composite key fields
  const { data: invRow, error: invError } = await db
    .from('inventory')
    .select('warehouse_id, commodity_id, grade_id')
    .eq('id', inventoryId)
    .single();

  if (invError || !invRow) {
    console.error('[getMovementHistory] inventory row error:', invError?.message);
    return [];
  }

  // Fetch movements matching this inventory line's composite key
  const { data, error } = await db
    .from('inventory_movements')
    .select(
      'id, warehouse_id, commodity_id, grade_id, movement_type, quantity, balance_after, reference_id, reference_type, notes, created_by, created_at'
    )
    .eq('warehouse_id', invRow.warehouse_id)
    .eq('commodity_id', invRow.commodity_id)
    .eq('grade_id', invRow.grade_id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[getMovementHistory] movements error:', error.message);
    return [];
  }

  return (data || []).map((row) => ({
    ...row,
    inventory_id: inventoryId,
  })) as unknown as InventoryMovement[];
}
