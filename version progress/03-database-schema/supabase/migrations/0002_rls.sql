-- ==============================================================================
-- Migration: 0002_rls.sql — KorraStore Row Level Security (RLS) Policies
-- Description: Enables RLS on all 18 tables. Implements strict owner-scoped
--              read policies, public catalog access, admin-role inspection,
--              and zero client write policies on immutable financial ledgers.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ENABLE ROW LEVEL SECURITY ACROSS ALL TABLES
-- ------------------------------------------------------------------------------

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE commodities ENABLE ROW LEVEL SECURITY;
ALTER TABLE commodity_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE holding_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE resale_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE resale_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyback_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if the executing user has admin privileges
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ------------------------------------------------------------------------------
-- 2. PROFILES POLICIES
-- ------------------------------------------------------------------------------

-- Users can read their own profile; Admins can read all profiles
CREATE POLICY "Users can read own profile or admin reads all"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

-- Users can update their own personal details (full_name, phone)
-- Note: role cannot be elevated via client update because of trigger/validation rules
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- 3. COMMODITY CATALOG & REFERENCE TABLES
-- ------------------------------------------------------------------------------

-- Anyone (public or authenticated) can view active commodities
CREATE POLICY "Public read active commodities"
  ON commodities FOR SELECT
  USING (active = TRUE OR public.is_admin());

-- Anyone can view commodity grades
CREATE POLICY "Public read commodity grades"
  ON commodity_grades FOR SELECT
  USING (active = TRUE OR public.is_admin());

-- Anyone can view active warehouses
CREATE POLICY "Public read warehouses"
  ON warehouses FOR SELECT
  USING (active = TRUE OR public.is_admin());

-- Anyone can view public warehouse stock availability
CREATE POLICY "Public read inventory stock"
  ON inventory FOR SELECT
  USING (TRUE);

-- Anyone can view price history trends
CREATE POLICY "Public read price history"
  ON price_history FOR SELECT
  USING (TRUE);

-- Admin management policies for catalog tables
CREATE POLICY "Admins can manage commodities"
  ON commodities FOR ALL
  USING (public.is_admin());

CREATE POLICY "Admins can manage commodity_grades"
  ON commodity_grades FOR ALL
  USING (public.is_admin());

CREATE POLICY "Admins can manage warehouses"
  ON warehouses FOR ALL
  USING (public.is_admin());

CREATE POLICY "Admins can manage price_history"
  ON price_history FOR ALL
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 4. ORDERS & PAYMENTS POLICIES (OWNER READ ONLY)
-- ------------------------------------------------------------------------------

-- Users can view their own orders; Admins can view all orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- Users can view order items for their own orders
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

-- Users can view payments for their own orders
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- 5. HOLDINGS & RECEIPTS POLICIES (OWNER READ ONLY)
-- ------------------------------------------------------------------------------

-- Users can view their own stored commodity holdings
CREATE POLICY "Users can view own holdings"
  ON holdings FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- Users can view their own warehouse receipts
CREATE POLICY "Users can view own receipts"
  ON receipts FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- 6. RESALE MARKETPLACE & BUYBACK POLICIES
-- ------------------------------------------------------------------------------

-- Authenticated users can view active resale listings; Sellers and admins can view any status
CREATE POLICY "Users can view active resale listings or own listings"
  ON resale_listings FOR SELECT
  USING (
    status = 'active'
    OR auth.uid() = seller_id
    OR public.is_admin()
  );

-- Buyers and Sellers can view their completed transactions; Admins can view all
CREATE POLICY "Parties can view their resale transactions"
  ON resale_transactions FOR SELECT
  USING (
    auth.uid() = buyer_id
    OR auth.uid() = seller_id
    OR public.is_admin()
  );

-- Users can view their own buyback requests; Admins can view all
CREATE POLICY "Users can view own buyback requests"
  ON buyback_requests FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- 7. NOTIFICATIONS POLICIES
-- ------------------------------------------------------------------------------

-- Users can view and acknowledge their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can update own notification status"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 8. IMMUTABLE LEDGERS & AUDIT LOGS (ADMIN READ ONLY — NO CLIENT WRITES)
-- ------------------------------------------------------------------------------

-- Admins can view inventory movements for audit purposes
CREATE POLICY "Admins can view inventory movements"
  ON inventory_movements FOR SELECT
  USING (public.is_admin());

-- Users can view their own holding ledger movements; Admins can view all
CREATE POLICY "Users can view own holding movements"
  ON holding_movements FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- Admins can inspect audit logs
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (public.is_admin());

-- NOTE ON WRITES:
-- `inventory_movements`, `holding_movements`, `audit_logs`, `orders`, `order_items`,
-- `payments`, `holdings`, `receipts`, `resale_transactions`, and `buyback_requests`
-- intentionally have ZERO client INSERT/UPDATE/DELETE policies.
-- All state transitions and balance mutations must be performed via the
-- Service Role Client ('server-only') through the Ledger Domain Service.
