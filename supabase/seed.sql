-- ==============================================================================
-- KorraStore Development & Testing Seed Data
-- Description: Seeds the core Nigerian agricultural commodity catalog, grades,
--              warehouses, initial inventory stock, and historical benchmark prices.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. WAREHOUSES
-- ------------------------------------------------------------------------------

INSERT INTO warehouses (id, code, name, location, address, capacity, contact_info, active)
VALUES
  (
    '00000000-0000-0000-0001-000000000001',
    'WH-KNO-01',
    'Kano Central Grain Silo',
    'Kano State, Nigeria',
    'Plot 14 Bompai Industrial Area, Kano',
    500000.0000,
    '{"manager": "Ibrahim Danbatta", "phone": "+2348030000001", "email": "kano-silo@korrastore.ng"}'::jsonb,
    TRUE
  ),
  (
    '00000000-0000-0000-0001-000000000002',
    'WH-IBD-01',
    'Ibadan Agri-Depot',
    'Oyo State, Nigeria',
    'KM 12 Lagos-Ibadan Expressway, Toll Gate, Ibadan',
    350000.0000,
    '{"manager": "Oluwaseun Adeleke", "phone": "+2348030000002", "email": "ibadan-depot@korrastore.ng"}'::jsonb,
    TRUE
  )
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  capacity = EXCLUDED.capacity,
  contact_info = EXCLUDED.contact_info;

-- ------------------------------------------------------------------------------
-- 2. COMMODITIES
-- ------------------------------------------------------------------------------

INSERT INTO commodities (id, code, name, description, unit, base_price, current_price, image_url, active)
VALUES
  (
    '00000000-0000-0000-0002-000000000001',
    'RICE-WHT',
    'Premium Nigerian White Rice',
    'High-grade parboiled long-grain white rice harvested from northern agrarian cooperatives.',
    'kg',
    1250.0000,
    1450.0000,
    '/commodities/rice.jpg',
    TRUE
  ),
  (
    '00000000-0000-0000-0002-000000000002',
    'GARLIC-RAW',
    'Raw Dried Garlic Bulbs',
    'Sun-cured pungent garlic bulbs with optimal moisture content for multi-month cold silo storage.',
    'kg',
    2800.0000,
    3200.0000,
    '/commodities/garlic.jpg',
    TRUE
  ),
  (
    '00000000-0000-0000-0002-000000000003',
    'BEANS-BRN',
    'Premium Brown Beans (Oloyin)',
    'Sweet honey brown beans carefully destoned, fumigated, and stored in hermetic grain bags.',
    'kg',
    1600.0000,
    1850.0000,
    '/commodities/beans.jpg',
    TRUE
  ),
  (
    '00000000-0000-0000-0002-000000000004',
    'MELON-EGU',
    'Shelled Egusi Melon Seed',
    'Machine-cleaned, high-oil-content white melon seeds packed for export and long-term storage.',
    'kg',
    3400.0000,
    3950.0000,
    '/commodities/egusi.jpg',
    TRUE
  )
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  base_price = EXCLUDED.base_price,
  current_price = EXCLUDED.current_price;

-- ------------------------------------------------------------------------------
-- 3. COMMODITY GRADES
-- ------------------------------------------------------------------------------

INSERT INTO commodity_grades (id, commodity_id, code, name, description, active)
VALUES
  -- Rice Grades
  ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0002-000000000001', 'GRADE-A', 'Grade A (Export / Single-Origin)', 'Zero stones, 98% unbroken whole grain, moisture < 12%', TRUE),
  ('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0002-000000000001', 'GRADE-B', 'Grade B (Standard Commercial)', 'Sorted long-grain with < 5% broken grain', TRUE),
  ('00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0002-000000000001', 'GRADE-C', 'Grade C (Milling / Local)', 'Standard market quality, ideal for bulk processing', TRUE),

  -- Garlic Grades
  ('00000000-0000-0000-0003-000000000004', '00000000-0000-0000-0002-000000000002', 'GRADE-A', 'Grade A (Large Jumbo Bulbs)', 'Diameter > 55mm, fully cured, tight cloves', TRUE),
  ('00000000-0000-0000-0003-000000000005', '00000000-0000-0000-0002-000000000002', 'GRADE-B', 'Grade B (Medium Table Bulbs)', 'Diameter 40–54mm, clean and dry', TRUE),
  ('00000000-0000-0000-0003-000000000006', '00000000-0000-0000-0002-000000000002', 'GRADE-C', 'Grade C (Processing Garlic)', 'Mixed bulb size for industrial oil / spice extraction', TRUE),

  -- Beans Grades
  ('00000000-0000-0000-0003-000000000007', '00000000-0000-0000-0002-000000000003', 'GRADE-A', 'Grade A (Hand-Picked Oloyin)', 'Hermetically sealed, zero weevil damage, uniform color', TRUE),
  ('00000000-0000-0000-0003-000000000008', '00000000-0000-0000-0002-000000000003', 'GRADE-B', 'Grade B (Standard Brown Beans)', 'Cleaned and sorted standard brown beans', TRUE),
  ('00000000-0000-0000-0003-000000000009', '00000000-0000-0000-0002-000000000003', 'GRADE-C', 'Grade C (Market Grade)', 'Commercial stock for local wholesale distribution', TRUE),

  -- Egusi Grades
  ('00000000-0000-0000-0003-000000000010', '00000000-0000-0000-0002-000000000004', 'GRADE-A', 'Grade A (First-Class Hand-Shelled)', 'Bright white, 100% whole kernel, oil content > 50%', TRUE),
  ('00000000-0000-0000-0003-000000000011', '00000000-0000-0000-0002-000000000004', 'GRADE-B', 'Grade B (Machine-Peeled Standard)', 'Standard market grade, cleaned and sifted', TRUE),
  ('00000000-0000-0000-0003-000000000012', '00000000-0000-0000-0002-000000000004', 'GRADE-C', 'Grade C (Oil Extraction Grade)', 'Mixed kernel grade for commercial oil pressing', TRUE)
ON CONFLICT (commodity_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- ------------------------------------------------------------------------------
-- 4. STARTING PRICE HISTORY
-- ------------------------------------------------------------------------------

INSERT INTO price_history (commodity_id, grade_id, price, change_reason, recorded_at)
VALUES
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0003-000000000001', 1250.0000, 'Initial season launch benchmark', NOW() - INTERVAL '30 days'),
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0003-000000000001', 1380.0000, 'Mid-season market rally', NOW() - INTERVAL '15 days'),
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0003-000000000001', 1450.0000, 'Current spot price evaluation', NOW()),

  ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0003-000000000004', 2800.0000, 'Initial harvest intake pricing', NOW() - INTERVAL '30 days'),
  ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0003-000000000004', 3200.0000, 'Current spot price evaluation', NOW()),

  ('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0003-000000000007', 1600.0000, 'Season baseline price', NOW() - INTERVAL '30 days'),
  ('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0003-000000000007', 1850.0000, 'Current spot price evaluation', NOW()),

  ('00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0003-000000000010', 3400.0000, 'Opening benchmark', NOW() - INTERVAL '30 days'),
  ('00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0003-000000000010', 3950.0000, 'Current spot price evaluation', NOW());

-- ------------------------------------------------------------------------------
-- 5. INITIAL WAREHOUSE INVENTORY
-- ------------------------------------------------------------------------------

INSERT INTO inventory (warehouse_id, commodity_id, grade_id, quantity, allocated_quantity)
VALUES
  -- Kano Warehouse Stock
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0003-000000000001', 50000.0000, 0.0000),
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0003-000000000004', 25000.0000, 0.0000),
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0003-000000000007', 30000.0000, 0.0000),

  -- Ibadan Warehouse Stock
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0003-000000000001', 35000.0000, 0.0000),
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0003-000000000010', 15000.0000, 0.0000)
ON CONFLICT (warehouse_id, commodity_id, grade_id) DO UPDATE SET
  quantity = EXCLUDED.quantity;
