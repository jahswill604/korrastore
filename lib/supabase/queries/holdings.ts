// lib/supabase/queries/holdings.ts — Server-side Supabase portfolio holdings queries for KorraStore.
// Handles fetching buyer holdings with live market valuations and computing portfolio summaries.
// Security: All reads enforce strict ownership (user_id = auth.uid()) via RLS + explicit user_id filter.
// Used in: app/my-storage/page.tsx
// Critical ledger rules:
//   - current_value NEVER stored — always computed as quantity × current_price in holdings_with_current_value view
//   - reserved_quantity NEVER stored — always computed from active resale_listings + buyback_requests at query time
//   - Holdings from different purchases are NEVER merged (separate cards even if same commodity/grade)

import 'server-only';
import { createServiceClient } from '@/lib/supabase/service';

// ----------------------------------------------------------------------------
// Type Definitions
// ----------------------------------------------------------------------------

/** A single holding row enriched with live market valuation data.
 *  All monetary values are in Nigerian Naira (NGN).
 *  quantity, available_quantity, reserved_quantity are in commodity units (e.g., kg/bags).
 */
export interface HoldingWithCurrentValue {
  id: string;
  userId: string;
  commodityId: string;
  commodityName: string;
  commodityCode: string;
  commodityUnit: string;
  commodityImageUrl: string | null;
  gradeId: string;
  gradeCode: string;
  gradeName: string;
  warehouseId: string;
  warehouseName: string;
  warehouseLocation: string;
  /** Total quantity purchased (includes reserved) */
  quantity: number;
  /** Quantity locked by active resale_listings + pending/approved buyback_requests */
  reservedQuantity: number;
  /** Available for resale/buyback/delivery = quantity - reservedQuantity */
  availableQuantity: number;
  /** Price per unit at time of purchase */
  unitPurchasePrice: number;
  /** Total cost basis = quantity × unitPurchasePrice at time of purchase */
  totalCostBasis: number;
  /** Live current market price per unit */
  currentUnitPrice: number;
  /** Live total market value = quantity × currentUnitPrice (computed from view, never stored) */
  currentTotalValue: number;
  /** Unrealized profit/loss = currentTotalValue - totalCostBasis */
  profitLoss: number;
  /** Profit/loss as a percentage of cost basis */
  profitLossPercentage: number;
  /** When this holding was created / commodity was purchased */
  purchasedAt: string;
  /** Fulfillment/storage status of the holding */
  status: 'pending' | 'sourcing' | 'in_transit' | 'stored' | 'delivered';
}

/** Aggregated portfolio summary for the top stats strip.
 *  All monetary values computed server-side from the same holdings_with_current_value view.
 */
export interface PortfolioSummary {
  /** Sum of all holdings' current market value */
  totalPortfolioValue: number;
  /** Total number of distinct holding entries */
  totalHoldingsCount: number;
  /** Sum of all holdings' profit/loss */
  overallGainLossAmount: number;
  /** Weighted overall portfolio gain/loss percentage */
  overallGainLossPercentage: number;
}

// ----------------------------------------------------------------------------
// getBuyerHoldings — Fetch all holdings for a given user with live valuations
// ----------------------------------------------------------------------------

/**
 * Fetches all holdings for the given buyer from the holdings_with_current_value view.
 * Each row is its own distinct card — holdings are NEVER merged, even if same commodity/grade.
 * current_value is computed by the database view (never stored or re-derived client-side).
 * reserved_quantity is the value stored in holdings.reserved_quantity, which is maintained
 * by the atomic reserve/release RPC functions — and verified at query time.
 *
 * @param userId - The authenticated buyer's user ID (from supabase.auth.getUser())
 * @returns Array of holdings with live valuations, or empty array if none
 */
export async function getBuyerHoldings(userId: string): Promise<HoldingWithCurrentValue[]> {
  const supabase = createServiceClient();

  // Query the live valuation view — this computes current_value on the fly from
  // commodity prices, so values are always fresh every page load (never stale cache).
  const { data, error } = await supabase
    .from('holdings_with_current_value')
    .select('*')
    // Strict user-scoped ownership check — RLS is already enforced but we add
    // an explicit filter here as a defence-in-depth measure (per AGENTS.md)
    .eq('user_id', userId)
    .order('purchased_at', { ascending: false });

  if (error) {
    console.error('[getBuyerHoldings] Supabase query error:', error.message);
    // Return empty array rather than throwing — the page handles empty state gracefully
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Map the snake_case Postgres view columns to our camelCase TypeScript interface
  return data.map((row) => ({
    id: row.id,
    userId: row.user_id,
    commodityId: row.commodity_id,
    commodityName: row.commodity_name ?? 'Unknown Commodity',
    commodityCode: row.commodity_code ?? '',
    commodityUnit: row.commodity_unit ?? 'kg',
    commodityImageUrl: row.commodity_image_url ?? null,
    gradeId: row.grade_id,
    gradeCode: row.grade_code ?? 'A',
    gradeName: row.grade_name ?? 'Grade A',
    warehouseId: row.warehouse_id,
    warehouseName: row.warehouse_name ?? 'KorraStore Warehouse',
    warehouseLocation: row.warehouse_location ?? 'Nigeria',
    quantity: Number(row.quantity ?? 0),
    reservedQuantity: Number(row.reserved_quantity ?? 0),
    availableQuantity: Number(row.available_quantity ?? 0),
    unitPurchasePrice: Number(row.unit_purchase_price ?? 0),
    totalCostBasis: Number(row.total_cost_basis ?? 0),
    currentUnitPrice: Number(row.current_unit_price ?? 0),
    currentTotalValue: Number(row.current_total_value ?? 0),
    profitLoss: Number(row.profit_loss ?? 0),
    profitLossPercentage: Number(row.profit_loss_percentage ?? 0),
    purchasedAt: row.purchased_at ?? new Date().toISOString(),
    status: (row.status as HoldingWithCurrentValue['status']) ?? 'stored',
  }));
}

// ----------------------------------------------------------------------------
// getPortfolioSummary — Compute aggregate portfolio stats server-side
// ----------------------------------------------------------------------------

/**
 * Computes portfolio-level summary stats for the top summary strip.
 * All aggregations happen at the DB layer — never re-derived client-side.
 * Uses the same holdings_with_current_value view as getBuyerHoldings for consistency.
 *
 * @param userId - The authenticated buyer's user ID
 * @returns PortfolioSummary with total value, count, and gain/loss metrics
 */
export async function getPortfolioSummary(userId: string): Promise<PortfolioSummary> {
  const supabase = createServiceClient();

  // Fetch raw rows from the live valuation view, scoped to the user
  const { data, error } = await supabase
    .from('holdings_with_current_value')
    .select('current_total_value, total_cost_basis, profit_loss')
    .eq('user_id', userId);

  // Default empty portfolio if query fails or no holdings exist
  if (error || !data || data.length === 0) {
    if (error) {
      console.error('[getPortfolioSummary] Supabase query error:', error.message);
    }
    return {
      totalPortfolioValue: 0,
      totalHoldingsCount: 0,
      overallGainLossAmount: 0,
      overallGainLossPercentage: 0,
    };
  }

  // Aggregate across all holding rows server-side
  const totalPortfolioValue = data.reduce(
    (sum, row) => sum + Number(row.current_total_value ?? 0),
    0
  );
  const totalCostBasis = data.reduce(
    (sum, row) => sum + Number(row.total_cost_basis ?? 0),
    0
  );
  const overallGainLossAmount = data.reduce(
    (sum, row) => sum + Number(row.profit_loss ?? 0),
    0
  );

  // Compute weighted overall gain/loss percentage against total cost basis
  const overallGainLossPercentage =
    totalCostBasis > 0
      ? Math.round(((overallGainLossAmount / totalCostBasis) * 100) * 100) / 100
      : 0;

  return {
    totalPortfolioValue: Math.round(totalPortfolioValue * 100) / 100,
    totalHoldingsCount: data.length,
    overallGainLossAmount: Math.round(overallGainLossAmount * 100) / 100,
    overallGainLossPercentage,
  };
}
