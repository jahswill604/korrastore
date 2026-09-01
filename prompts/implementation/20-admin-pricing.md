# Implementation Prompt: Feature 20 — Admin Pricing & Valuation

## Goal
Build `/admin/pricing`: the admin-only panel for managing KorraStore commodity pricing (Sale Price and Buyback Price per commodity & grade) with atomic price history tracking (`price_history`), zero direct mutations to `holdings`, dynamic portfolio valuation propagation, live delta previews with safety confirmations, and interactive price trajectory Recharts. Desktop (1440px) + mobile (375px), strict light mode only.

---

## Context Files to Read Before Writing Any Code

1. `prompt/20-admin-pricing.md` & `prompts/20-admin-pricing.md` — canonical spec
2. `AGENTS.md` — Feature 02 (design system), Feature 03 (schema & ledger), Feature 17 (admin nav), Feature 20 (admin pricing rules)
3. `.agents/skills/supabase/SKILL.md` — service-role client, `price_history` writes, `holdings_with_current_value` dynamic valuation
4. `prompts/02-design-system.md` — design tokens, `Card`, `Badge`, `PriceDisplay`, `Modal`
5. `prompts/07-commodity-details.md` — Recharts price history chart patterns
6. `prompts/14-buyback.md` — platform buyback pricing rules
7. `docs/overview.md` — current codebase file map

---

## Design References

- **Desktop UI**: `prompts/ui degine/20-admin-pricing/desktop-ui.png`
- **Mobile UI**: `prompts/ui degine/20-admin-pricing/mobile-ui.png`
- **Backend Workflow**: `prompts/backend-wookflow/20-admin-pricing/workflow.png`
- **Brand Reference**: `ui refrence/ChatGPT Image Aug 30, 2026, 11_53_48 AM.png`

---

## Design Tokens (Light Mode Only)

| Token | Value | Usage |
|---|---|---|
| Paper | `#F7F4EA` | Page bg, card bg, table row base |
| Soil | `#4A3828` | Primary text, table headers |
| Harvest Wheat | `#D8B56A` | Active nav, primary CTAs, Confirm & Propagate button |
| Husk | `#A88958` | Secondary labels, muted details |
| Deep Grain Green | `#21483A` | Positive price delta badge (`+4.2%`), Premium badges |
| Trust Indigo | `#303B63` | Info badges, commodity metadata |
| Border | `#E4DCC8` | Card outlines, table borders |
| Danger | `#B3432E` | Negative price delta badge (`-2.5%`) |
| Warning | `#C7862B` | Alert notifications, confirmation warnings |

---

## Architecture & Data Flow Invariants

1. **Zero Direct Holdings Mutations**:
   - Price updates MUST NEVER update rows in `holdings`.
   - Portfolio valuation in `/my-storage` is computed dynamically at query time via `holdings_with_current_value` view (`quantity * commodities.current_price`).
2. **Atomic Price History Ledger & Pointer Sync**:
   - Every price change inserts an immutable row into `price_history` (commodity_id, grade_id, sale_price, buyback_price, admin_id, change_reason, effective_at).
   - Updates `commodities.current_price` and `commodities.buyback_price` denormalized columns in the same transaction.
   - Inserts an `audit_logs` record (entity_type=`pricing`, action=`PRICE_UPDATE`).
3. **Triple-Layer Admin Authorization**:
   - Next.js Middleware + `app/admin/layout.tsx` Server Component + API route handlers enforce `profiles.role === 'admin'`.
4. **Delta Preview & Confirmation**:
   - Displays real-time delta calculation (percentage and absolute Naira value) for both sale price and buyback price.
   - Includes interactive Recharts historical price trajectory.

---

## Core Implementation Steps

### 1. `lib/supabase/queries/admin/pricing.ts` (New)
Query helpers using service-role client:
- `getAllCommodityPrices()` — retrieves all commodities with current sale prices, buyback prices, grade lists, 30d min/max price points, and last updated timestamp.
- `getCommodityPriceHistory(commodityId, range)` — fetches historical price points from `price_history` ordered chronologically.
- `updateCommodityPrice(params)` — executes atomic transaction:
  1. INSERT into `price_history`
  2. UPDATE `commodities` (`current_price`, `buyback_price`, `updated_at`)
  3. INSERT into `audit_logs`

### 2. API Routes (Admin-Gated)
- `app/api/admin/pricing/route.ts` — POST route to update commodity sale & buyback pricing.
- `app/api/admin/pricing/[commodityId]/history/route.ts` — GET route to retrieve price history for Recharts visualization.

### 3. UI Components

#### Server Components
- `components/admin/pricing/pricing-metrics.tsx` — 4 top metric cards (Total Priced Commodities, Average Spread, Highest 30d Gainer, Last Global Update).
- `components/admin/pricing/pricing-table.tsx` — Responsive data table (desktop) / card list (mobile) showing commodities, grades, current sale/buyback prices, sparklines, and action buttons.

#### Client Components (`"use client"`)
- `components/admin/pricing/update-price-modal.tsx`:
  - Slide-over drawer / modal displaying selected commodity and grade.
  - Interactive inputs: New Sale Price (₦), New Buyback Price (₦), Optional Update Reason.
  - Live embedding of `PriceDeltaPreview` and `AdminPriceHistoryChart`.
  - "Confirm & Propagate" CTA button with loading states.
- `components/admin/pricing/price-delta-preview.tsx`:
  - Live computed delta comparison showing absolute diff (`+₦70/kg`) and percentage (`+5.6%`) with Deep Grain Green (positive) or Danger (negative) badges.
- `components/admin/pricing/admin-price-history-chart.tsx`:
  - Recharts line chart showing price trends with Harvest Wheat (`#D8B56A`) stroke, smooth gradient fill, and customized tooltips.

### 4. Page

#### `app/admin/pricing/page.tsx` (Server Component)
- Verifies admin session (`getUser` + `profiles.role === 'admin'`).
- Fetches pricing data via `getAllCommodityPrices()`.
- Renders `AdminHeader`, `PricingMetrics`, `PricingTable`, and integrates `UpdatePriceModal`.

---

## Quality & Compliance Checklist

- [ ] Strictly light mode (Paper `#F7F4EA`, Soil `#4A3828`, Harvest Wheat `#D8B56A`, Deep Grain Green `#21483A`, Border `#E4DCC8`).
- [ ] Triple-layer admin role verification (middleware + layout + API).
- [ ] Atomic write to `price_history` + `commodities` + `audit_logs`.
- [ ] ZERO writes to `holdings` table during price updates.
- [ ] Dynamic valuation propagation verified on `/home` and `/my-storage`.
- [ ] Responsive design matching desktop table (1440px) and mobile cards/sheet (375px).
- [ ] File-level and block-level inline comments on all new/updated files.
- [ ] `docs/overview.md` updated with line number ranges and component descriptions.
- [ ] TypeScript check and build passing without errors.
