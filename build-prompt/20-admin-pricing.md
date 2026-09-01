# Feature 20: Admin Pricing — Build Prompt

## Overview
Implement `/admin/pricing`: the admin-only panel for managing KorraStore commodity pricing (Sale Price and Buyback Price per commodity & grade). Every price change atomically inserts an immutable `price_history` row, updates denormalized `commodities` price pointers, and writes an `audit_logs` record. Price propagation is purely dynamic at read time via `holdings_with_current_value` with ZERO mutations to `holdings`. Features live delta previews with safety confirmations, Recharts price history visualization, and full responsive desktop/mobile layouts in strict light mode.

---

## References & Design Artifacts
- **Prompt Spec**: `prompt/20-admin-pricing.md` & `prompts/20-admin-pricing.md`
- **Desktop UI Design**: `prompts/ui degine/20-admin-pricing/desktop-ui.png`
- **Mobile UI Design**: `prompts/ui degine/20-admin-pricing/mobile-ui.png`
- **Backend Workflow**: `prompts/backend-wookflow/20-admin-pricing/workflow.png`
- **Implementation Spec**: `prompts/implementation/20-admin-pricing.md`
- **Design System & Architecture Rules**: `AGENTS.md` Feature 02, Feature 03, Feature 17, Feature 20

---

## Instructions for Agent
Strictly read ALL referenced files above before writing any code. Follow all design tokens (Light mode only: Harvest Wheat `#D8B56A`, Soil `#4A3828`, Deep Grain Green `#21483A`, Paper `#F7F4EA`, Border `#E4DCC8`, Danger `#B3432E`, Warning `#C7862B`). Enforce triple-layer admin role verification. NEVER update `holdings` directly on price changes. Add inline comments (file-level + block-level) to every new file. Update `docs/overview.md` after implementation.

---

## Core Implementation Steps

1. **Query Layer**: `lib/supabase/queries/admin/pricing.ts` — `getAllCommodityPrices()`, `getCommodityPriceHistory()`, `updateCommodityPrice()`.
2. **API Routes** (all admin-gated):
   - `app/api/admin/pricing/route.ts` — POST atomic update.
   - `app/api/admin/pricing/[commodityId]/history/route.ts` — GET history.
3. **Server Components**:
   - `app/admin/pricing/page.tsx` — Server Component page shell.
   - `components/admin/pricing/pricing-metrics.tsx` — 4 stat cards.
   - `components/admin/pricing/pricing-table.tsx` — Desktop table and mobile stacked cards.
4. **Client Components**:
   - `components/admin/pricing/update-price-modal.tsx` — Edit drawer/modal.
   - `components/admin/pricing/price-delta-preview.tsx` — Live percentage & value diff badge.
   - `components/admin/pricing/admin-price-history-chart.tsx` — Recharts line chart.
