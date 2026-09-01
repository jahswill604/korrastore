// lib/types/admin-inventory.ts — TypeScript type definitions for Feature 19: Admin Inventory & Warehouses.
// Covers commodities, grades, warehouses, inventory lines, movement history, and form payloads.
// Used in: lib/supabase/queries/admin/inventory.ts, lib/domain/ledger/inventory-ledger.ts,
//          components/admin/inventory/*, app/api/admin/inventory/*/route.ts

// ----------------------------------------------------------------------------
// Commodity Types
// ----------------------------------------------------------------------------

/** Represents a commodity with its grade count, for admin list views */
export interface AdminCommodity {
  id: string;
  code: string;
  name: string;
  description: string | null;
  unit: string;              // kg | bag | ton
  base_price: number;
  current_price: number;
  image_url: string | null;
  active: boolean;
  grade_count: number;
  created_at: string;
  updated_at: string;
}

/** A single commodity grade row */
export interface CommodityGrade {
  id: string;
  commodity_id: string;
  code: string;
  name: string;
  description: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

/** Commodity with its full grade list, for form/edit views */
export interface AdminCommodityDetail extends AdminCommodity {
  grades: CommodityGrade[];
}

/** Payload for creating or updating a commodity */
export interface UpsertCommodityPayload {
  id?: string;              // present = update, absent = create
  code: string;
  name: string;
  description?: string | null;
  unit: string;
  base_price: number;
  current_price: number;
  active?: boolean;
}

/** Payload for creating or updating a commodity grade */
export interface UpsertGradePayload {
  id?: string;              // present = update, absent = create
  commodity_id: string;
  code: string;
  name: string;
  description?: string | null;
  active?: boolean;
}

// ----------------------------------------------------------------------------
// Warehouse Types
// ----------------------------------------------------------------------------

/** Full warehouse row for admin views */
export interface AdminWarehouse {
  id: string;
  code: string;
  name: string;
  location: string;
  address: string;
  capacity: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

/** Payload for creating or updating a warehouse */
export interface UpsertWarehousePayload {
  id?: string;              // present = update, absent = create
  code: string;
  name: string;
  location: string;
  address: string;
  capacity?: number;
  active?: boolean;
}

// ----------------------------------------------------------------------------
// Inventory Line Types
// ----------------------------------------------------------------------------

/** A single inventory line enriched with commodity, grade, warehouse, and computed reserved_quantity */
export interface AdminInventoryLine {
  id: string;
  commodity_id: string;
  commodity_name: string;
  commodity_unit: string;
  grade_id: string;
  grade_name: string;
  grade_code: string;
  warehouse_id: string;
  warehouse_name: string;
  warehouse_location: string;
  quantity: number;           // physical stock (cached balance)
  allocated_quantity: number; // platform-allocated (order fulfillment)
  reserved_quantity: number;  // computed: active resale + pending/approved buybacks
  available_quantity: number; // computed: quantity - allocated_quantity - reserved_quantity
  updated_at: string;
}

/** Filters for the inventory lines query */
export interface InventoryLineFilters {
  commodity_id?: string;
  warehouse_id?: string;
  grade_id?: string;
}

// ----------------------------------------------------------------------------
// Inventory Adjustment Types
// ----------------------------------------------------------------------------

/** Payload sent to POST /api/admin/inventory/adjust */
export interface AdjustInventoryPayload {
  inventory_id: string;
  delta: number;            // signed: positive = stock in, negative = stock out
  reason: string;           // required, non-empty
}

/** Result returned from adjustInventory() domain function */
export interface AdjustInventoryResult {
  inventory_id: string;
  old_quantity: number;
  new_quantity: number;
  delta: number;
  movement_id: string;
}

// ----------------------------------------------------------------------------
// Movement History Types
// ----------------------------------------------------------------------------

/** A single inventory movement row enriched for display */
export interface InventoryMovement {
  id: string;
  inventory_id: string;     // derived: warehouse_id + commodity_id + grade_id
  warehouse_id: string;
  commodity_id: string;
  grade_id: string;
  movement_type: string;    // ADJUSTMENT | INBOUND | OUTBOUND | ALLOCATED | RELEASED
  quantity: number;         // signed delta
  balance_after: number;
  reference_id: string | null;
  reference_type: string | null;
  notes: string | null;     // the required adjustment reason
  created_by: string | null;
  created_at: string;
}

// ----------------------------------------------------------------------------
// Stat Card Types
// ----------------------------------------------------------------------------

/** Aggregated stat values for the inventory page header cards */
export interface InventoryStats {
  total_quantity_kg: number;       // sum of all active inventory quantity
  silo_capacity_pct: number;       // percentage of total capacity used
  active_commodities: number;
  active_warehouses: number;
}
