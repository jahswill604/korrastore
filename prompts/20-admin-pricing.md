# Feature 20: Admin Pricing — Full Prompt Spec

## Goal
Build `/admin/pricing`: the admin-only panel for managing KorraStore commodity retail (sale) prices and platform buyback prices. Includes full price history tracking, interactive price trajectory charts, atomic price propagation across the catalog and holder portfolios without touching holdings rows, and live delta previews with safety confirmations. Desktop (1440px) + mobile (375px), strict light mode only.

---

## Skills to Read Before Coding

- `.agents/skills/supabase/SKILL.md` — service-role writes, `price_history` ledger writes, `holdings_with_current_value` dynamic valuation propagation.
- `prompts/02-design-system.md` — `Card`, `Badge`, `PriceDisplay`, `Modal`, Recharts integration, all design tokens.
- `AGENTS.md` Feature 03 (pricing & ledger rules), Feature 17 (admin navigation), Feature 20 (admin pricing rules).

---

## Decisions & Architectural Invariants

1. **Dual-Price Management**:
   - **Sale Price**: Retail catalog price buyers pay on `/home` and `/commodities/[id]`.
   - **Buyback Price**: Liquidation price platform pays when users request buyback on `/buyback`.
   - Managed per commodity and per grade.

2. **Atomic Price History Ledger**:
   - Every price change inserts a new record into `price_history`.
   - Concurrently updates `commodities.current_price` and `commodities.buyback_price` in one transaction.
   - Inserts a record into `audit_logs`.

3. **Zero Holdings Mutation**:
   - Price updates NEVER write to `holdings`.
   - Portfolios in `/my-storage` dynamically reflect current valuations via `holdings_with_current_value` (`quantity * commodities.current_price`).

4. **Delta Preview & Confirmation Step**:
   - Displays live percentage and absolute delta for both sale price and buyback price before saving.
   - Shows interactive historical price chart for context.

---

## Files to Create / Modify

- `app/admin/pricing/page.tsx` — Server Component pricing overview & table.
- `components/admin/pricing/pricing-table.tsx` — Server Component data table / mobile cards.
- `components/admin/pricing/update-price-modal.tsx` — Client Component modal/drawer with live inputs.
- `components/admin/pricing/price-delta-preview.tsx` — Client Component displaying calculated deltas.
- `components/admin/pricing/admin-price-history-chart.tsx` — Client Component Recharts visualization.
- `lib/supabase/queries/admin/pricing.ts` — Query & mutation helpers (`getAllCommodityPrices`, `updateCommodityPricing`).
- `app/api/admin/pricing/route.ts` — Admin-gated POST route for atomic price updates.
- `app/api/admin/pricing/[commodityId]/history/route.ts` — Admin-gated GET route for commodity price history.

---

## Security Requirements

- Triple-layer admin guard: middleware + layout + API route.
- Service-role client for DB mutations.
- `audit_logs` record created on every price change.

---

## Acceptance Criteria

1. Price changes immediately reflect across marketplace and portfolio valuations without modifying `holdings`.
2. Every price change creates an immutable `price_history` entry.
3. Live delta preview calculates accurate +/- percentage and value changes.
4. Historical chart accurately visualizes price trajectory over time.
5. Strict light mode design matching desktop (1440px) and mobile (375px).
