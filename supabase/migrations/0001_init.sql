-- ==============================================================================
-- Migration: 0001_init.sql — KorraStore Core Database Schema
-- Description: Establishes all custom ENUMs, core relational tables, foreign key
--              constraints (with ON DELETE RESTRICT on financial histories),
--              arbitrary-precision numeric quantity/price columns, and indexes.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ENUMS
-- ------------------------------------------------------------------------------

-- User role classification (standard user vs platform administrator)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Order fulfillment lifecycle states
DO $$ BEGIN
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
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Delivery destination type
DO $$ BEGIN
  CREATE TYPE delivery_type AS ENUM ('storage', 'home_delivery');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Payment processing states (isolated from order status)
DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed', 'abandoned');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Resale listing lifecycle states
DO $$ BEGIN
  CREATE TYPE resale_status AS ENUM ('active', 'sold', 'cancelled', 'expired');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Buyback request lifecycle states
DO $$ BEGIN
  CREATE TYPE buyback_status AS ENUM ('pending', 'approved', 'rejected', 'paid');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Immutable holding movement audit types
DO $$ BEGIN
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
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Notification dispatch channel
DO $$ BEGIN
  CREATE TYPE notification_channel AS ENUM ('email', 'sms', 'in_app');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Notification queue status
DO $$ BEGIN
  CREATE TYPE notification_status AS ENUM ('queued', 'sent', 'failed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ------------------------------------------------------------------------------
-- 2. CORE TABLES
-- ------------------------------------------------------------------------------

-- profiles: Extends auth.users with app-specific metadata and role
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- commodities: Agricultural commodity catalog
CREATE TABLE IF NOT EXISTS commodities (
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

-- commodity_grades: Quality grade specifications per commodity
CREATE TABLE IF NOT EXISTS commodity_grades (
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

-- warehouses: Physical storage facilities and silos
CREATE TABLE IF NOT EXISTS warehouses (
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

-- inventory: Cached warehouse commodity stock balances
CREATE TABLE IF NOT EXISTS inventory (
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

-- inventory_movements: Immutable ledger of record for warehouse physical stock changes
CREATE TABLE IF NOT EXISTS inventory_movements (
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

-- orders: User purchase and delivery orders
CREATE TABLE IF NOT EXISTS orders (
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

-- order_items: Line items associated with orders
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  commodity_id UUID NOT NULL REFERENCES commodities(id) ON DELETE RESTRICT,
  grade_id UUID NOT NULL REFERENCES commodity_grades(id) ON DELETE RESTRICT,
  quantity NUMERIC(18, 4) NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(18, 4) NOT NULL CHECK (unit_price >= 0),
  total_price NUMERIC(18, 4) NOT NULL CHECK (total_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- payments: Financial payment records via Paystack
CREATE TABLE IF NOT EXISTS payments (
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

-- holdings: User-owned commodity assets stored in warehouses
CREATE TABLE IF NOT EXISTS holdings (
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

-- holding_movements: Immutable ledger of record for user holding asset changes
CREATE TABLE IF NOT EXISTS holding_movements (
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

-- receipts: Official digital warehouse receipts (ownership documentation)
CREATE TABLE IF NOT EXISTS receipts (
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

-- resale_listings: Marketplace listings posted by holding owners
CREATE TABLE IF NOT EXISTS resale_listings (
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

-- resale_transactions: Completed marketplace trade records
CREATE TABLE IF NOT EXISTS resale_transactions (
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

-- buyback_requests: Guaranteed buyback liquidations submitted by users
CREATE TABLE IF NOT EXISTS buyback_requests (
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

-- price_history: Historical price trends and audits
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commodity_id UUID NOT NULL REFERENCES commodities(id) ON DELETE RESTRICT,
  grade_id UUID NOT NULL REFERENCES commodity_grades(id) ON DELETE RESTRICT,
  price NUMERIC(18, 4) NOT NULL CHECK (price >= 0),
  change_reason TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- notifications: Transactional and operational notification queue
CREATE TABLE IF NOT EXISTS notifications (
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

-- audit_logs: System security and operational change audit trail
CREATE TABLE IF NOT EXISTS audit_logs (
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

CREATE INDEX IF NOT EXISTS idx_commodity_grades_commodity_id ON commodity_grades(commodity_id);
CREATE INDEX IF NOT EXISTS idx_inventory_warehouse_id ON inventory(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_warehouse ON inventory_movements(warehouse_id, commodity_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_holdings_user_id ON holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_holdings_commodity_grade ON holdings(commodity_id, grade_id);
CREATE INDEX IF NOT EXISTS idx_holding_movements_holding_id ON holding_movements(holding_id);
CREATE INDEX IF NOT EXISTS idx_holding_movements_user_id ON holding_movements(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_holding_id ON receipts(holding_id);
CREATE INDEX IF NOT EXISTS idx_resale_listings_status ON resale_listings(status);
CREATE INDEX IF NOT EXISTS idx_resale_listings_seller_id ON resale_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_resale_transactions_buyer_id ON resale_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_resale_transactions_seller_id ON resale_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_buyback_requests_user_id ON buyback_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_buyback_requests_status ON buyback_requests(status);
CREATE INDEX IF NOT EXISTS idx_price_history_commodity_grade ON price_history(commodity_id, grade_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_status ON notifications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
