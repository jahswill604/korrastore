// lib/types/admin-pricing.ts — Type definitions for KorraStore Admin Pricing & Valuation system.
// Defines interfaces for commodity price listings, historical price points, metric cards,
// update payloads, and price delta calculations.
// Used across: app/admin/pricing/page.tsx, components/admin/pricing/*, lib/supabase/queries/admin/pricing.ts,
//              and app/api/admin/pricing/* route handlers.

// ----------------------------------------------------------------------------
// Core Commodity Pricing Representation
// ----------------------------------------------------------------------------

/**
 * Grade summary associated with a commodity.
 */
export interface AdminPricingGrade {
  id: string;
  name: string;
  code: string;
  active: boolean;
}

/**
 * Commodity item with live pricing, buyback valuation, 30-day trajectory, and grade info.
 */
export interface AdminPricingCommodity {
  id: string;
  code: string;
  name: string;
  description: string | null;
  unit: string;
  base_price: number;
  current_price: number; // Sale price (retail marketplace)
  buyback_price: number; // Direct platform liquidation price
  active: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  sparkline: number[];
  gain_loss_30d_pct: number;
  grades: AdminPricingGrade[];
}

// ----------------------------------------------------------------------------
// Price History
// ----------------------------------------------------------------------------

/**
 * Single historical recorded price point for charting and ledger tracking.
 */
export interface PriceHistoryPoint {
  id: string;
  commodity_id: string;
  grade_id?: string | null;
  price: number;
  change_reason: string | null;
  recorded_at: string;
  formatted_date?: string;
}

// ----------------------------------------------------------------------------
// Dashboard Metrics
// ----------------------------------------------------------------------------

/**
 * Top-level pricing operational metrics.
 */
export interface PricingMetricsData {
  total_priced_commodities: number;
  avg_spread_pct: number;
  highest_gainer: {
    commodity_name: string;
    gain_pct: number;
  } | null;
  last_global_update: string;
}

// ----------------------------------------------------------------------------
// Mutation Payloads
// ----------------------------------------------------------------------------

/**
 * Payload sent to update a commodity's pricing atomically.
 */
export interface UpdatePricingPayload {
  commodity_id: string;
  grade_id?: string | null;
  new_sale_price: number;
  new_buyback_price: number;
  change_reason?: string | null;
}

/**
 * Result returned after an atomic price update.
 */
export interface UpdatePricingResult {
  success: boolean;
  commodity_id: string;
  new_sale_price: number;
  new_buyback_price: number;
  updated_at: string;
}

/**
 * Computed delta calculation between old and new prices.
 */
export interface PriceDeltaCalculation {
  sale_diff: number;
  sale_pct: number;
  buyback_diff: number;
  buyback_pct: number;
  spread_pct: number;
}
