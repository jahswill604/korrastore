-- ==============================================================================
-- KorraStore Consolidated Database Schema
-- Source of Truth: Supabase PostgreSQL Database Definition
-- Generated for: KorraStore Digital Commodity Storage Platform
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ENUMS
-- ------------------------------------------------------------------------------

CREATE TYPE user_role AS ENUM ('user', 'admin');

CREATE TYPE order_status AS ENUM (
  'pending_payment',
  'paid',
  'sourcing',
  'in_transit',
  'stored',
  'delivered',
  'cancelled',
  'failed'
);

CREATE TYPE delivery_type AS ENUM ('storage', 'home_delivery');

CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed', 'abandoned');

CREATE TYPE resale_status AS ENUM ('active', 'sold', 'cancelled', 'expired');

CREATE TYPE buyback_status AS ENUM ('pending', 'approved', 'rejected', 'paid');

CREATE TYPE holding_movement_type AS ENUM (
  'purchase',
  'resale_lock',
  'resale_release',
  'resale_sold',
  'buyback_lock',
  'buyback_release',
  'buyback_sold',
  'delivery_out',
  'transfer_in',
  'transfer_out'
);

CREATE TYPE notification_channel AS ENUM ('email', 'sms', 'in_app');

CREATE TYPE notification_status AS ENUM ('queued', 'sent', 'failed');

-- ------------------------------------------------------------------------------
-- 2. TABLES
-- ------------------------------------------------------------------------------

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE commodities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  unit TEXT NOT NULL DEFAULT 'kg',
  base_price NUMERIC(18, 4) NOT NULL CHECK (base_price >= 0),
  current_price NUMERIC(18, 4) NOT NULL CHECK (current_price >= 0),
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE commodity_grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commodity_id UUID NOT NULL REFERENCES commodities(id) ON DELETE RESTRICT,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_commodity_grade_code UNIQUE (commodity_id, code)
);

CREATE TABLE warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  address TEXT NOT NULL,
  capacity NUMERIC(18, 4) NOT NULL DEFAULT 0 CHECK (capacity >= 0),
  contact_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
  commodity_id UUID NOT NULL REFERENCES commodities(id) ON DELETE RESTRICT,
  grade_id UUID NOT NULL REFERENCES commodity_grades(id) ON DELETE RESTRICT,
  quantity NUMERIC(18, 4) NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  allocated_quantity NUMERIC(18, 4) NOT NULL DEFAULT 0 CHECK (allocated_quantity >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_inventory_warehouse_commodity_grade UNIQUE (warehouse_id, commodity_id, grade_id)
);

CREATE TABLE inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
  commodity_id UUID NOT NULL REFERENCES commodities(id) ON DELETE RESTRICT,
  grade_id UUID NOT NULL REFERENCES commodity_grades(id) ON DELETE RESTRICT,
  movement_type TEXT NOT NULL,
  quantity NUMERIC(18, 4) NOT NULL,
  balance_after NUMERIC(18, 4) NOT NULL CHECK (balance_after >= 0),
  reference_id UUID,
  reference_type TEXT,
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  order_number TEXT NOT NULL UNIQUE,
  status order_status NOT NULL DEFAULT 'pending_payment',
  delivery_type delivery_type NOT NULL DEFAULT 'storage',
  delivery_address JSONB,
  total_amount NUMERIC(18, 4) NOT NULL CHECK (total_amount >= 0),
  subtotal NUMERIC(18, 4) NOT NULL CHECK (subtotal >= 0),
  storage_fee NUMERIC(18, 4) NOT NULL DEFAULT 0 CHECK (storage_fee >= 0),
  delivery_fee NUMERIC(18, 4) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  commodity_id UUID NOT NULL REFERENCES commodities(id) ON DELETE RESTRICT,
  grade_id UUID NOT NULL REFERENCES commodity_grades(id) ON DELETE RESTRICT,
  quantity NUMERIC(18, 4) NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(18, 4) NOT NULL CHECK (unit_price >= 0),
  total_price NUMERIC(18, 4) NOT NULL CHECK (total_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  reference TEXT NOT NULL UNIQUE,
  amount NUMERIC(18, 4) NOT NULL CHECK (amount >= 0),
  status payment_status NOT NULL DEFAULT 'pending',
  channel TEXT,
  paid_at TIMESTAMPTZ,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  commodity_id UUID NOT NULL REFERENCES commodities(id) ON DELETE RESTRICT,
  grade_id UUID NOT NULL REFERENCES commodity_grades(id) ON DELETE RESTRICT,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
  quantity NUMERIC(18, 4) NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  reserved_quantity NUMERIC(18, 4) NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0 AND reserved_quantity <= quantity),
  cost_basis NUMERIC(18, 4) NOT NULL DEFAULT 0 CHECK (cost_basis >= 0),
  unit_purchase_price NUMERIC(18, 4) NOT NULL CHECK (unit_purchase_price >= 0),
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE holding_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  holding_id UUID NOT NULL REFERENCES holdings(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  movement_type holding_movement_type NOT NULL,
  quantity NUMERIC(18, 4) NOT NULL,
  balance_after NUMERIC(18, 4) NOT NULL CHECK (balance_after >= 0),
  reference_id UUID,
  reference_type TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  holding_id UUID NOT NULL REFERENCES holdings(id) ON DELETE RESTRICT,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  receipt_number TEXT NOT NULL UNIQUE,
  document_url TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE resale_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  holding_id UUID NOT NULL REFERENCES holdings(id) ON DELETE RESTRICT,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  commodity_id UUID NOT NULL REFERENCES commodities(id) ON DELETE RESTRICT,
  grade_id UUID NOT NULL REFERENCES commodity_grades(id) ON DELETE RESTRICT,
  quantity NUMERIC(18, 4) NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(18, 4) NOT NULL CHECK (unit_price > 0),
  status resale_status NOT NULL DEFAULT 'active',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE resale_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES resale_listings(id) ON DELETE RESTRICT,
  holding_id UUID NOT NULL REFERENCES holdings(id) ON DELETE RESTRICT,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  quantity NUMERIC(18, 4) NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(18, 4) NOT NULL CHECK (unit_price > 0),
  total_price NUMERIC(18, 4) NOT NULL CHECK (total_price >= 0),
  platform_fee NUMERIC(18, 4) NOT NULL DEFAULT 0 CHECK (platform_fee >= 0),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE buyback_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  holding_id UUID NOT NULL REFERENCES holdings(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  commodity_id UUID NOT NULL REFERENCES commodities(id) ON DELETE RESTRICT,
  grade_id UUID NOT NULL REFERENCES commodity_grades(id) ON DELETE RESTRICT,
  quantity NUMERIC(18, 4) NOT NULL CHECK (quantity > 0),
  offered_price NUMERIC(18, 4) NOT NULL CHECK (offered_price > 0),
  total_amount NUMERIC(18, 4) NOT NULL CHECK (total_amount >= 0),
  status buyback_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commodity_id UUID NOT NULL REFERENCES commodities(id) ON DELETE RESTRICT,
  grade_id UUID NOT NULL REFERENCES commodity_grades(id) ON DELETE RESTRICT,
  price NUMERIC(18, 4) NOT NULL CHECK (price >= 0),
  change_reason TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  channel notification_channel NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  status notification_status NOT NULL DEFAULT 'queued',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. INDEXES
-- ------------------------------------------------------------------------------

CREATE INDEX idx_commodity_grades_commodity_id ON commodity_grades(commodity_id);
CREATE INDEX idx_inventory_warehouse_id ON inventory(warehouse_id);
CREATE INDEX idx_inventory_movements_warehouse ON inventory_movements(warehouse_id, commodity_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_holdings_user_id ON holdings(user_id);
CREATE INDEX idx_holdings_commodity_grade ON holdings(commodity_id, grade_id);
CREATE INDEX idx_holding_movements_holding_id ON holding_movements(holding_id);
CREATE INDEX idx_holding_movements_user_id ON holding_movements(user_id);
CREATE INDEX idx_receipts_user_id ON receipts(user_id);
CREATE INDEX idx_receipts_holding_id ON receipts(holding_id);
CREATE INDEX idx_resale_listings_status ON resale_listings(status);
CREATE INDEX idx_resale_listings_seller_id ON resale_listings(seller_id);
CREATE INDEX idx_resale_transactions_buyer_id ON resale_transactions(buyer_id);
CREATE INDEX idx_resale_transactions_seller_id ON resale_transactions(seller_id);
CREATE INDEX idx_buyback_requests_user_id ON buyback_requests(user_id);
CREATE INDEX idx_buyback_requests_status ON buyback_requests(status);
CREATE INDEX idx_price_history_commodity_grade ON price_history(commodity_id, grade_id, recorded_at DESC);
CREATE INDEX idx_notifications_user_status ON notifications(user_id, status);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- ------------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY
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

-- Profiles Policies
CREATE POLICY "Users can read own profile or admin reads all"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Catalog Policies
CREATE POLICY "Public read active commodities"
  ON commodities FOR SELECT
  USING (active = TRUE OR public.is_admin());

CREATE POLICY "Public read commodity grades"
  ON commodity_grades FOR SELECT
  USING (active = TRUE OR public.is_admin());

CREATE POLICY "Public read warehouses"
  ON warehouses FOR SELECT
  USING (active = TRUE OR public.is_admin());

CREATE POLICY "Public read inventory stock"
  ON inventory FOR SELECT
  USING (TRUE);

CREATE POLICY "Public read price history"
  ON price_history FOR SELECT
  USING (TRUE);

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

-- Orders & Payments Policies
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- Holdings & Receipts Policies
CREATE POLICY "Users can view own holdings"
  ON holdings FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can view own receipts"
  ON receipts FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- Marketplace & Buyback Policies
CREATE POLICY "Users can view active resale listings or own listings"
  ON resale_listings FOR SELECT
  USING (
    status = 'active'
    OR auth.uid() = seller_id
    OR public.is_admin()
  );

CREATE POLICY "Parties can view their resale transactions"
  ON resale_transactions FOR SELECT
  USING (
    auth.uid() = buyer_id
    OR auth.uid() = seller_id
    OR public.is_admin()
  );

CREATE POLICY "Users can view own buyback requests"
  ON buyback_requests FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- Notifications Policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can update own notification status"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ledgers & Audits Policies (Admin select only, zero client writes)
CREATE POLICY "Admins can view inventory movements"
  ON inventory_movements FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Users can view own holding movements"
  ON holding_movements FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 5. FUNCTIONS & TRIGGERS
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone, ''),
    'user',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Concurrency-locking RPC for reserving holding stock
CREATE OR REPLACE FUNCTION public.reserve_holding_quantity(
  p_holding_id UUID,
  p_quantity NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_quantity NUMERIC;
  v_reserved NUMERIC;
  v_available NUMERIC;
BEGIN
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'invalid_reservation_quantity: Quantity must be greater than zero.'
      USING ERRCODE = 'P0002';
  END IF;

  SELECT quantity, reserved_quantity
  INTO v_quantity, v_reserved
  FROM holdings
  WHERE id = p_holding_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'holding_not_found: The specified holding does not exist.'
      USING ERRCODE = 'P0003';
  END IF;

  v_available := v_quantity - v_reserved;

  IF v_available < p_quantity THEN
    RAISE EXCEPTION 'insufficient_available_quantity: Requested % kg, but only % kg available for reservation.',
      p_quantity, v_available
      USING ERRCODE = 'P0001';
  END IF;

  UPDATE holdings
  SET reserved_quantity = reserved_quantity + p_quantity,
      updated_at = NOW()
  WHERE id = p_holding_id;
END;
$$;

-- Concurrency-locking RPC for releasing holding stock
CREATE OR REPLACE FUNCTION public.release_holding_quantity(
  p_holding_id UUID,
  p_quantity NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reserved NUMERIC;
BEGIN
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'invalid_release_quantity: Quantity must be greater than zero.'
      USING ERRCODE = 'P0002';
  END IF;

  SELECT reserved_quantity
  INTO v_reserved
  FROM holdings
  WHERE id = p_holding_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'holding_not_found: The specified holding does not exist.'
      USING ERRCODE = 'P0003';
  END IF;

  IF v_reserved < p_quantity THEN
    RAISE EXCEPTION 'invalid_release_amount: Cannot release % kg because only % kg is currently reserved.',
      p_quantity, v_reserved
      USING ERRCODE = 'P0004';
  END IF;

  UPDATE holdings
  SET reserved_quantity = reserved_quantity - p_quantity,
      updated_at = NOW()
  WHERE id = p_holding_id;
END;
$$;

-- ------------------------------------------------------------------------------
-- 6. VIEWS
-- ------------------------------------------------------------------------------

-- Public marketplace view with seller anonymization
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

-- Live dynamic valuation view for user holdings
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
