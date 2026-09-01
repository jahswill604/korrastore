-- ==============================================================================
-- Migration: 0007_add_buyback_price.sql — Add buyback_price to commodities
-- Description: Adds a separate admin-controlled buyback price column to the
--              commodities table. Buyback price is distinct from the retail
--              current_price — in real commodity markets these differ because
--              the platform buys back at a discount. Defaults to 0 so existing
--              rows are not broken; admins must set a real value before enabling
--              buybacks on any commodity.
-- ==============================================================================

-- Add buyback_price column to commodities (arbitrary-precision numeric, per schema rules)
ALTER TABLE commodities
  ADD COLUMN IF NOT EXISTS buyback_price NUMERIC(18, 4) NOT NULL DEFAULT 0
    CHECK (buyback_price >= 0);

-- Index for quick admin price lookups and buyer price fetches
CREATE INDEX IF NOT EXISTS idx_commodities_buyback_price
  ON commodities(id)
  WHERE buyback_price > 0;

-- Comment documenting the column's purpose
COMMENT ON COLUMN commodities.buyback_price IS
  'Admin-set guaranteed buyback price per unit. Separate from current_price (retail/sale). '
  'Set to 0 to disable buyback for this commodity. Read live — never cache on the client.';
