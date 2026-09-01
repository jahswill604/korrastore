# Implementation Directives: 03-database-schema — KorraStore

## Target Architecture & Core Principles
- **Schema Source of Truth**: KorraStore PostgreSQL schema managed via Supabase migrations.
- **Precision & Data Safety**: All quantity, unit price, total price, and financial amounts are `numeric` (arbitrary-precision decimal).
- **Ledger of Record**:
  - `inventory_movements` and `holding_movements` are immutable append-only ledger tables.
  - Balances in `holdings.quantity` and `inventory.quantity` are cached states strictly verifiable from movement history.
  - Zero client-role write access (`insert`, `update`, `delete`) on movement ledgers and `audit_logs` (Service Role only).
- **Dynamic Valuation**: `holdings.current_value` is never stored; computed live via `holdings_with_current_value` view.
- **Seller Privacy**: Public marketplace reads query `resale_listings_public` view (seller_id masked to `KorraStore Seller #XXXX`).

---

## File Structure & Migrations to Implement

### 1. `supabase/migrations/0001_init.sql`
Defines enums, tables, constraints, and indexes:
- **Enums**:
  - `user_role`: `user`, `admin`
  - `order_status`: `pending_payment`, `paid`, `sourcing`, `in_transit`, `stored`, `delivered`, `cancelled`, `failed`
  - `delivery_type`: `storage`, `home_delivery`
  - `payment_status`: `pending`, `success`, `failed`, `abandoned`
  - `resale_status`: `active`, `sold`, `cancelled`, `expired`
  - `buyback_status`: `pending`, `approved`, `rejected`, `paid`
  - `holding_movement_type`: `purchase`, `resale_lock`, `resale_release`, `resale_sold`, `buyback_lock`, `buyback_release`, `buyback_sold`, `delivery_out`, `transfer_in`, `transfer_out`
  - `notification_channel`: `email`, `sms`, `in_app`
  - `notification_status`: `queued`, `sent`, `failed`
- **Tables (16 Core Tables)**:
  - `profiles` (id UUID PK references auth.users on delete cascade, full_name, phone, role user_role default 'user', created_at, updated_at)
  - `commodities` (id UUID PK, code, name, description, unit default 'kg', base_price numeric, current_price numeric, image_url, active boolean default true, created_at, updated_at)
  - `commodity_grades` (id UUID PK, commodity_id UUID FK references commodities on delete restrict, code, name, description, active boolean default true, created_at, updated_at)
  - `warehouses` (id UUID PK, code, name, location, address, capacity numeric, contact_info, active boolean default true, created_at, updated_at)
  - `inventory` (id UUID PK, warehouse_id UUID FK references warehouses, commodity_id UUID FK references commodities, grade_id UUID FK references commodity_grades, quantity numeric default 0, allocated_quantity numeric default 0, created_at, updated_at, UNIQUE(warehouse_id, commodity_id, grade_id))
  - `inventory_movements` (id UUID PK, warehouse_id UUID FK, commodity_id UUID FK, grade_id UUID FK, movement_type text, quantity numeric, reference_id UUID, reference_type text, notes text, created_by UUID, created_at)
  - `orders` (id UUID PK, user_id UUID FK references profiles on delete restrict, order_number text UNIQUE, status order_status default 'pending_payment', delivery_type delivery_type default 'storage', delivery_address jsonb, total_amount numeric, subtotal numeric, storage_fee numeric default 0, delivery_fee numeric default 0, created_at, updated_at)
  - `order_items` (id UUID PK, order_id UUID FK references orders on delete cascade, commodity_id UUID FK references commodities, grade_id UUID FK references commodity_grades, quantity numeric, unit_price numeric, total_price numeric, created_at)
  - `payments` (id UUID PK, order_id UUID FK references orders on delete restrict, user_id UUID FK references profiles on delete restrict, reference text UNIQUE, amount numeric, status payment_status default 'pending', channel text, paid_at timestamptz, raw_payload jsonb, created_at)
  - `holdings` (id UUID PK, user_id UUID FK references profiles on delete restrict, commodity_id UUID FK references commodities on delete restrict, grade_id UUID FK references commodity_grades on delete restrict, warehouse_id UUID FK references warehouses on delete restrict, quantity numeric default 0, reserved_quantity numeric default 0, cost_basis numeric default 0, unit_purchase_price numeric, purchased_at timestamptz default now(), updated_at timestamptz default now())
  - `holding_movements` (id UUID PK, holding_id UUID FK references holdings on delete restrict, user_id UUID FK references profiles on delete restrict, movement_type holding_movement_type, quantity numeric, balance_after numeric, reference_id UUID, reference_type text, notes text, created_at timestamptz default now())
  - `receipts` (id UUID PK, holding_id UUID FK references holdings on delete restrict, order_id UUID FK references orders on delete restrict, user_id UUID FK references profiles on delete restrict, receipt_number text UNIQUE, document_url text, metadata jsonb, issued_at timestamptz default now(), created_at timestamptz default now())
  - `resale_listings` (id UUID PK, holding_id UUID FK references holdings on delete restrict, seller_id UUID FK references profiles on delete restrict, commodity_id UUID FK references commodities on delete restrict, grade_id UUID FK references commodity_grades on delete restrict, quantity numeric, unit_price numeric, status resale_status default 'active', expires_at timestamptz, created_at, updated_at)
  - `resale_transactions` (id UUID PK, listing_id UUID FK references resale_listings on delete restrict, holding_id UUID FK references holdings on delete restrict, seller_id UUID FK references profiles on delete restrict, buyer_id UUID FK references profiles on delete restrict, quantity numeric, unit_price numeric, total_price numeric, platform_fee numeric, completed_at timestamptz default now(), created_at timestamptz default now())
  - `buyback_requests` (id UUID PK, holding_id UUID FK references holdings on delete restrict, user_id UUID FK references profiles on delete restrict, commodity_id UUID FK references commodities on delete restrict, grade_id UUID FK references commodity_grades on delete restrict, quantity numeric, offered_price numeric, total_amount numeric, status buyback_status default 'pending', admin_notes text, requested_at timestamptz default now(), processed_at timestamptz, created_at, updated_at)
  - `price_history` (id UUID PK, commodity_id UUID FK references commodities on delete restrict, grade_id UUID FK references commodity_grades on delete restrict, price numeric, change_reason text, recorded_at timestamptz default now())
  - `notifications` (id UUID PK, user_id UUID FK references profiles on delete cascade, channel notification_channel, title text, body text, status notification_status default 'queued', payload jsonb, sent_at timestamptz, created_at timestamptz default now())
  - `audit_logs` (id UUID PK, user_id UUID, action text, entity_type text, entity_id UUID, old_data jsonb, new_data jsonb, ip_address text, created_at timestamptz default now())
- **Indexes**:
  - `idx_orders_user_id`, `idx_orders_status`
  - `idx_holdings_user_id`, `idx_holdings_commodity_grade`
  - `idx_resale_listings_status`, `idx_buyback_requests_status`
  - `idx_inventory_movements_warehouse`, `idx_holding_movements_holding`

### 2. `supabase/migrations/0002_rls.sql`
- Enable RLS on every table: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`
- Public read policies for catalog tables: `commodities`, `commodity_grades`, `warehouses`, `price_history`.
- Owner-only access (`auth.uid() = user_id`) for: `profiles`, `orders`, `order_items`, `payments`, `holdings`, `receipts`, `buyback_requests`, `notifications`.
- Service-Role Only Writes (NO client INSERT/UPDATE/DELETE policies) for: `inventory_movements`, `holding_movements`, `audit_logs`.
- Admin bypass / full manage policies checking `EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')`.

### 3. `supabase/migrations/0003_functions.sql`
- `handle_new_user()` trigger: Automatically creates a `profiles` row when a user signs up via Supabase Auth (`role = 'user'`).
- `reserve_holding_quantity(p_holding_id UUID, p_quantity NUMERIC)`:
  - Uses `SELECT ... FOR UPDATE` row lock on `holdings`.
  - Validates `(quantity - reserved_quantity) >= p_quantity`.
  - Updates `reserved_quantity = reserved_quantity + p_quantity`.
  - Raises explicit exception `P0001: Insufficient available quantity in holding` on failure.
- `release_holding_quantity(p_holding_id UUID, p_quantity NUMERIC)`:
  - Uses `SELECT ... FOR UPDATE` row lock on `holdings`.
  - Validates `reserved_quantity >= p_quantity`.
  - Updates `reserved_quantity = reserved_quantity - p_quantity`.

### 4. `supabase/migrations/0004_views.sql`
- `resale_listings_public`:
  - Surfaces active resale listings without exposing raw `seller_id`.
  - Derived seller label: `'KorraStore Seller #' || right(seller_id::text, 4)`.
- `holdings_with_current_value`:
  - Joins `holdings` with `commodities` to compute live `current_unit_price`, `current_total_value`, `profit_loss`, and `profit_loss_percentage`.

### 5. `supabase/schema.sql` & `lib/supabase/types.ts`
- Consolidated PostgreSQL schema and comprehensive TypeScript database definitions matching all tables, views, enums, and functions.

### 6. `supabase/seed.sql`
- 4 Core Nigerian agricultural commodities:
  - White Rice (kg)
  - Raw Garlic (kg)
  - Brown Beans (kg)
  - Egusi Melon Seed (kg)
- 3 Grades per commodity (Grade A Premium, Grade B Standard, Grade C Commercial).
- 2 Warehouses: Kano Central Warehouse & Ibadan Agri-Depot.
- Starting `price_history` rows and initial warehouse stock allocations.

---

## Verification & Documentation Standards
- Typecheck against `lib/supabase/types.ts`.
- File-level and block-level inline comments on all SQL migrations, seeds, and TypeScript files.
- Update `docs/overview.md` with complete table-by-table and file-by-file documentation.
- Create snapshot in `version progress/03-database-schema/`.
