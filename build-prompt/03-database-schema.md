# Build Prompt: 03-database-schema

## Context & References
- **Feature Name**: `03-database-schema`
- **Desktop UI Design**: `file:///c:/Users/jwezu/OneDrive/Downloads/digitalfarm/korrastore/prompts/ui%20degine/03-database-schema/desktop-ui.png`
- **Mobile UI Design**: `file:///c:/Users/jwezu/OneDrive/Downloads/digitalfarm/korrastore/prompts/ui%20degine/03-database-schema/mobile-ui.png`
- **Backend Workflow Diagram**: `file:///c:/Users/jwezu/OneDrive/Downloads/digitalfarm/korrastore/prompts/backend-wookflow/03-database-schema/workflow.png`
- **Feature Requirements**: [03-database-schema.md](file:///c:/Users/jwezu/OneDrive/Downloads/digitalfarm/korrastore/prompts/03-database-schema.md)
- **Implementation Guide**: [03-database-schema.md](file:///c:/Users/jwezu/OneDrive/Downloads/digitalfarm/korrastore/prompts/implementation/03-database-schema.md)

## Agent Instructions
Read all above referenced files (`prompts/03-database-schema.md`, `prompts/implementation/03-database-schema.md`), inspect the UI designs and backend workflow diagrams, and upon user approval, execute the full database schema, RLS policies, migrations, functions, views, types, and seed data:
1. Create migration `supabase/migrations/0001_init.sql` containing all 16 core tables, custom enums, numeric fields, foreign keys with ON DELETE RESTRICT where financial integrity is required, and performance indexes.
2. Create migration `supabase/migrations/0002_rls.sql` enabling Row Level Security across all tables, defining strict user ownership policies (`auth.uid() = user_id`), catalog read policies, admin full-access policies, and zero client write policies on immutable ledger tables (`inventory_movements`, `holding_movements`, `audit_logs`).
3. Create migration `supabase/migrations/0003_functions.sql` with user signup trigger `handle_new_user()` and concurrency-safe RPC functions `reserve_holding_quantity` and `release_holding_quantity` using `SELECT ... FOR UPDATE` row locks.
4. Create migration `supabase/migrations/0004_views.sql` providing `resale_listings_public` (with anonymized seller ID) and `holdings_with_current_value` (dynamic live valuation joining current commodity prices).
5. Generate consolidated `supabase/schema.sql` and full TypeScript database definitions in `lib/supabase/types.ts`.
6. Create `supabase/seed.sql` with Nigerian commodity catalog (Rice, Garlic, Beans, Melon), grades A/B/C, 2 warehouses (Kano & Ibadan), initial inventory, and price history.
7. Add comprehensive inline file and block comments on every created file and update `docs/overview.md`.
8. Save version snapshot in `version progress/03-database-schema/`.
