-- ==============================================================================
-- Migration: 0004_views.sql — Public Marketplace & Dynamic Valuation Views
-- Description: Creates secure buyer-facing views with seller anonymization,
--              and dynamic holdings valuation views that compute live market
--              worth, cost basis, and unrealized profit/loss.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PUBLIC RESALE MARKETPLACE VIEW (SELLER IDENTITY SANITIZED)
-- ------------------------------------------------------------------------------

-- Provides clean public browsing of active secondary marketplace listings.
-- Strictly conceals the underlying seller_id and user profile associations,
-- rendering an anonymized badge: 'KorraStore Seller #XXXX'.
CREATE OR REPLACE VIEW public.resale_listings_public AS
SELECT
  rl.id,
  rl.holding_id,
  rl.commodity_id,
  c.name AS commodity_name,
  c.code AS commodity_code,
  c.unit AS commodity_unit,
  c.image_url AS commodity_image_url,
  rl.grade_id,
  cg.code AS grade_code,
  cg.name AS grade_name,
  h.warehouse_id,
  w.name AS warehouse_name,
  w.location AS warehouse_location,
  rl.quantity,
  rl.unit_price,
  (rl.quantity * rl.unit_price) AS total_listing_price,
  c.current_price AS benchmark_market_price,
  ROUND(((rl.unit_price - c.current_price) / NULLIF(c.current_price, 0)) * 100, 2) AS price_delta_percentage,
  'KorraStore Seller #' || RIGHT(rl.seller_id::TEXT, 4) AS seller_display_name,
  rl.status,
  rl.expires_at,
  rl.created_at
FROM resale_listings rl
JOIN commodities c ON rl.commodity_id = c.id
JOIN commodity_grades cg ON rl.grade_id = cg.id
JOIN holdings h ON rl.holding_id = h.id
JOIN warehouses w ON h.warehouse_id = w.id
WHERE rl.status = 'active'
  AND (rl.expires_at IS NULL OR rl.expires_at > NOW());

-- ------------------------------------------------------------------------------
-- 2. DYNAMIC HOLDINGS LIVE VALUATION VIEW
-- ------------------------------------------------------------------------------

-- Dynamically computes current portfolio valuation and profit/loss metrics
-- by joining user holdings with live commodity prices.
-- Avoids storing static/stale valuation columns directly in holdings.
CREATE OR REPLACE VIEW public.holdings_with_current_value AS
SELECT
  h.id,
  h.user_id,
  h.commodity_id,
  c.name AS commodity_name,
  c.code AS commodity_code,
  c.unit AS commodity_unit,
  c.image_url AS commodity_image_url,
  h.grade_id,
  cg.code AS grade_code,
  cg.name AS grade_name,
  h.warehouse_id,
  w.name AS warehouse_name,
  w.location AS warehouse_location,
  h.quantity,
  h.reserved_quantity,
  (h.quantity - h.reserved_quantity) AS available_quantity,
  h.unit_purchase_price,
  h.cost_basis AS total_cost_basis,
  c.current_price AS current_unit_price,
  ROUND(h.quantity * c.current_price, 4) AS current_total_value,
  ROUND((h.quantity * c.current_price) - h.cost_basis, 4) AS profit_loss,
  CASE
    WHEN h.cost_basis > 0 THEN
      ROUND((((h.quantity * c.current_price) - h.cost_basis) / h.cost_basis) * 100, 2)
    ELSE 0
  END AS profit_loss_percentage,
  h.purchased_at,
  h.updated_at
FROM holdings h
JOIN commodities c ON h.commodity_id = c.id
JOIN commodity_grades cg ON h.grade_id = cg.id
JOIN warehouses w ON h.warehouse_id = w.id;
