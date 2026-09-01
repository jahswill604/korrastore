-- ==============================================================================
-- Migration: 0003_functions.sql — Database Functions, Triggers & Concurrency RPCs
-- Description: Creates automatic user signup profile provision trigger,
--              automated timestamp triggers, and concurrency-safe locking
--              RPCs for holding asset reservation and release.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TIMESTAMP AUTO-UPDATE TRIGGER FUNCTION
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

-- Apply updated_at triggers across mutable tables
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'profiles',
    'commodities',
    'commodity_grades',
    'warehouses',
    'inventory',
    'orders',
    'holdings',
    'resale_listings',
    'buyback_requests'
  ]
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS trg_update_updated_at ON %I;
      CREATE TRIGGER trg_update_updated_at
      BEFORE UPDATE ON %I
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    ', tbl, tbl);
  END LOOP;
END;
$$;

-- ------------------------------------------------------------------------------
-- 2. AUTH SIGNUP PROFILE PROVISION TRIGGER
-- ------------------------------------------------------------------------------

-- Trigger function executed when a new user record is inserted into auth.users
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

-- Trigger binding to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 3. CONCURRENCY-SAFE HOLDING RESERVATION RPC
-- ------------------------------------------------------------------------------

-- Atomically reserves a given quantity of stored commodity holding.
-- Employs row-level locking (SELECT ... FOR UPDATE) to eliminate race conditions
-- and prevent double-selling across marketplace and buyback operations.
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

  -- Acquire exclusive row-level lock on the specific holding record
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

  -- Apply reservation
  UPDATE holdings
  SET reserved_quantity = reserved_quantity + p_quantity,
      updated_at = NOW()
  WHERE id = p_holding_id;
END;
$$;

-- ------------------------------------------------------------------------------
-- 4. CONCURRENCY-SAFE HOLDING RELEASE RPC
-- ------------------------------------------------------------------------------

-- Atomically releases a previously reserved quantity on a holding (e.g. when a
-- resale listing is cancelled or expires, or a buyback request is rejected).
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

  -- Acquire exclusive row lock
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

  -- Deduct reserved quantity
  UPDATE holdings
  SET reserved_quantity = reserved_quantity - p_quantity,
      updated_at = NOW()
  WHERE id = p_holding_id;
END;
$$;
