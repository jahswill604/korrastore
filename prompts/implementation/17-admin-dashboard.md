# Implementation Prompt: Feature 17 — Admin Dashboard

## Goal
Build `/admin`: the central admin landing page and operational control center for KorraStore. Provides key operational metrics at a glance (open orders, pending buybacks, active resale listings, low-inventory alerts, total platform inventory valuation), high-priority "Needs Attention" triage list, and "Recent Activity" audit log feed. Includes the responsive `AdminNavRail` (desktop) and `AdminBottomTabBar` (mobile) admin app shell that every subsequent `/admin/*` page composes with. Light mode only.

---

## Context Files to Read Before Writing Any Code
1. `prompt/17-admin-dashboard.md` & `prompts/17-admin-dashboard.md` — canonical feature spec, decisions, and acceptance criteria
2. `AGENTS.md` — architecture, defense-in-depth admin role enforcement, and Feature 17 rules
3. `.agents/skills/supabase/SKILL.md` — admin queries, service-role client usage, table aggregations
4. `prompts/02-design-system.md` — tokens, `Card`, `Badge`, `Button`, `PriceDisplay`
5. `docs/overview.md` — existing codebase architecture and file breakdown

---

## Design References
- **Desktop UI**: `prompts/ui degine/17-admin-dashboard/desktop-ui.png`
- **Mobile UI**: `prompts/ui degine/17-admin-dashboard/mobile-ui.png`
- **Backend Workflow**: `prompts/backend-wookflow/17-admin-dashboard/workflow.png`
- **Brand Reference**: `ui refrence/ChatGPT Image Aug 30, 2026, 11_53_48 AM.png`

---

## Design Tokens & Palette (Light Mode Only)

| Token | Value | Usage |
|-------|-------|-------|
| Paper | `#F7F4EA` | Page background, card backgrounds, sidebar base |
| Soil | `#4A3828` | Primary text, titles, headings, active nav item text |
| Harvest Wheat | `#D8B56A` | Active nav indicator pill, primary stat highlights, action buttons |
| Husk | `#A88958` | Secondary labels, timestamp formatting, subtle borders |
| Deep Grain Green | `#21483A` | Success badges, verified status, high stock indicators |
| Trust Indigo | `#303B63` | Audit log IDs, external links, navigation icons |
| Border | `#E4DCC8` | Card outlines, table dividers, panel borders |
| Danger | `#B3432E` | Critical low-stock alerts, stuck orders, error states |
| Warning | `#C7862B` | Pending buybacks awaiting review, moderate stock warnings |

---

## Architecture & Security Rules

1. **Triple-Layer Admin Role Enforcement (Defense in Depth)**:
   - **Layer 1 (Middleware)**: `middleware.ts` inspects session and blocks non-admins from `/admin/*`.
   - **Layer 2 (Layout Server Component)**: `app/admin/layout.tsx` strictly queries `getUser()` and checks `profiles.role === 'admin'`. If unauthorized or non-admin, redirects to `/home` (or `/login`).
   - **Layer 3 (Query Layer)**: Service-role aggregate queries in `lib/supabase/queries/admin/*` are strictly isolated from buyer client calls.

2. **Admin App Shell & Navigation Structure**:
   - `AdminNavRail` (Desktop ≥1024px): Permanent left sidebar (~240px wide, denser than buyer navigation, text labels always visible).
     - Links:
       1. 📊 **Dashboard** (`/admin`)
       2. 📦 **Orders** (`/admin/orders`)
       3. 🌾 **Inventory** (`/admin/inventory`)
       4. 🏷️ **Pricing** (`/admin/pricing`)
       5. 🔄 **Resale & Buybacks** (`/admin/resale-buybacks`)
       6. 📈 **Reports** (`/admin/reports`)
       7. 🎧 **Support** (`/admin/support`)
       8. ⚙️ **Settings** (`/admin/settings`)
     - Footer: "Switch to Buyer Store" link (`/home`) + Admin user avatar with email/initials.
   - `AdminBottomTabBar` (Mobile <640px): Sticky bottom bar featuring key actions (Dashboard, Orders, Inventory, Resale, More).
   - `AdminHeader`: Top title strip displaying page breadcrumb, live date/time, and admin profile badge.

3. **Dashboard Data Architecture**:
   - **Operational Stat Tiles (5 Key Metrics)**:
     1. *Open Orders*: Count of orders with `status IN ('pending_payment', 'sourcing', 'in_transit')`.
     2. *Pending Buybacks*: Count of buyback requests with `status = 'pending'`.
     3. *Active Resale Listings*: Count of resale listings with `status = 'active'`.
     4. *Low Stock Alerts*: Count of commodities where total available inventory in `inventory` is below threshold (< 500 kg).
     5. *Total Silo Inventory Value*: Sum of all warehouse inventory multiplied by commodity current price.
   - **Needs Attention Feed**:
     - Urgency-prioritized list highlighting actionable operational events:
       - Critical low-stock commodities with immediate "Restock" or "Edit Price" shortcut links.
       - Stuck/unfulfilled orders requiring fulfillment or verification.
       - Pending buyback requests awaiting review and payout approval.
   - **Recent Activity Feed**:
     - Real-time audit log stream reading latest entries from `audit_logs` table (action type, actor email/ID, affected resource, formatted relative timestamp).

---

## Files to Create & Update

### 1. `lib/supabase/queries/admin/dashboard.ts` (New)
- Admin query helpers using `createServiceRoleClient()`:
  - `getAdminDashboardStats()`: Aggregates counts and financial summaries across `orders`, `buyback_requests`, `resale_listings`, `inventory`, and `commodities`.
  - `getNeedsAttentionItems()`: Fetches actionable items (low stock alerts, pending buybacks, processing orders).
  - `getRecentAuditActivity(limit = 10)`: Fetches latest rows from `audit_logs` with formatted metadata.

### 2. `components/admin/layout/admin-nav-rail.tsx` (New)
- Desktop admin navigation sidebar.
- Highlights active route with Harvest Wheat `#D8B56A` indicator and bold Soil `#4A3828` typography.
- Quick link to switch back to the buyer portal (`/home`).

### 3. `components/admin/layout/admin-bottom-tab-bar.tsx` (New)
- Mobile bottom navigation bar for admin views.

### 4. `components/admin/layout/admin-header.tsx` (New)
- Admin top navigation bar with page title, live clock, status pill, and admin user indicator.

### 5. `components/admin/dashboard/stat-tile.tsx` (New)
- Reusable stat card rendering metric title, numerical value in `IBM Plex Mono`, sub-label/trend indicator, and deep link to the corresponding management section.

### 6. `components/admin/dashboard/needs-attention-list.tsx` (New)
- Interactive list component rendering urgency badges (Danger/Warning), action descriptions, and contextual quick links.

### 7. `components/admin/dashboard/recent-activity-feed.tsx` (New)
- Audit log timeline component with category icons, readable action descriptions, user attribution, and relative timestamps.

### 8. `app/admin/layout.tsx` (New / Update)
- Server Component admin shell with layout-level auth and admin role verification (`getUser()` + `profiles.role === 'admin'`).

### 9. `app/admin/page.tsx` (New / Update)
- Admin Dashboard Server Component fetching all metrics and rendering the responsive dashboard grid.

---

## Quality & Compliance Checklist
- [ ] Strictly light mode design (Harvest Wheat `#D8B56A`, Soil `#4A3828`, Paper `#F7F4EA`, Border `#E4DCC8`).
- [ ] Triple-layer defense-in-depth: unauthorized users hitting `/admin` redirected immediately to `/home` or `/login`.
- [ ] Clean responsive layouts for desktop (≥1024px) and mobile (<640px).
- [ ] Inline code comments on all new files (file-level + block-level).
- [ ] `docs/overview.md` updated with table breakdown of every new file.
- [ ] TypeScript check and build verification passing.
