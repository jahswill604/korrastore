# Implementation Prompt: Feature 10 — My Storage (Portfolio)

## Goal
Build `/my-storage`: the buyer's commodity portfolio page showing all held commodities with live valuations, available/reserved quantity split, and entry points to Resell, Request Buyback, and Request Delivery. Desktop + mobile, light mode only.

---

## Context Files to Read Before Writing Any Code
1. `prompt/10-my-storage.md` — canonical feature spec, decisions, and acceptance criteria
2. `AGENTS.md` — architecture, ledger rules, and Feature 10 my-storage rules
3. `.agents/skills/supabase/SKILL.md` — DB queries, RLS scoping (`auth.uid() = user_id`), `holdings_with_current_value` view
4. `prompts/02-design-system.md` — `Card`, `PriceDisplay`, `GradeBadge`, `EmptyState`, `Badge`
5. `docs/overview.md` — existing codebase architecture and file maps

---

## Design References
- **Desktop UI**: `prompts/ui degine/10-my-storage/desktop-ui.png`
- **Mobile UI**: `prompts/ui degine/10-my-storage/mobile-ui.png`
- **Backend Workflow**: `prompts/backend-wookflow/10-my-storage/workflow.png`
- **Brand Reference**: `ui refrence/ChatGPT Image Aug 30, 2026, 11_53_48 AM.png`

---

## Design Tokens & Palette (Light Mode Only)

| Token | Value | Usage |
|-------|-------|-------|
| Paper | `#F7F4EA` | Page background, card backgrounds |
| Soil | `#4A3828` | Primary text, titles, headings |
| Harvest Wheat | `#D8B56A` | Active nav rail pill, primary actions, gain indicator border |
| Husk | `#A88958` | Secondary labels, muted timestamps, Buyback button |
| Deep Grain Green | `#21483A` | Positive gain value badge, 'Stored' status badge |
| Trust Indigo | `#303B63` | Delivery button, informational links |
| Border | `#E4DCC8` | Card outlines, divider lines |
| Danger | `#B3432E` | Loss indicator badge |

---

## Files to Create & Update

### 1. `lib/supabase/queries/holdings.ts` (New)
- Add `getBuyerHoldings(userId: string)`:
  - Queries `holdings_with_current_value` view joined with `commodities`, `commodity_grades`, `warehouses`
  - Scoped strictly to `user_id = userId` (RLS-enforced and query-enforced)
  - For each holding, computes `reserved_quantity` from active `resale_listings` (status `active`) + `buyback_requests` (status `pending` or `approved`) against that holding
  - Returns: holding id, commodity name, commodity image, grade label, total_quantity, reserved_quantity, available_quantity, purchase_unit_price, current_unit_price, current_value, gain_loss_amount, gain_loss_pct, warehouse name, holding status, created_at
- Add `getPortfolioSummary(userId: string)`:
  - Returns: total_portfolio_value (sum of all holdings' current value), total_holdings_count, overall_gain_loss_amount, overall_gain_loss_pct

### 2. `components/my-storage/portfolio-summary.tsx` (New — Server Component)
- Renders the top summary strip / hero card
- Desktop: wide banner card with 3 stat columns: Total Portfolio Value (PriceDisplay numeric-lg), Return delta badge (green/red), Stored Commodities count, + sparkline (v1 optional)
- Mobile: horizontal scrollable stat row — compact chips for each stat
- Props: `summary: PortfolioSummary`

### 3. `components/my-storage/holding-card.tsx` (New — Server Component)
- Card sections: thumbnail + name + GradeBadge / quantity row / valuation row + gain pill / location badge / HoldingActions footer
- Props: `holding: HoldingWithCurrentValue`

### 4. `components/my-storage/holding-actions.tsx` (New — Client Component)
- "use client" — action buttons: Resell, Request Buyback, Request Delivery
- Routes: /resale/create?holdingId, /buyback/request?holdingId, /delivery/request?holdingId
- Stubbed with "Coming soon" toast for unbuilt routes
- Disabled when available_quantity === 0
- Props: `holdingId: string`, `availableQuantity: number`

### 5. `app/my-storage/page.tsx` (New — Server Component)
- Auth via `supabase.auth.getUser()` → redirect unauthenticated to `/login?redirect=/my-storage`
- Parallel fetch: `getPortfolioSummary(user.id)` + `getBuyerHoldings(user.id)`
- AppShell with active My Storage nav rail
- EmptyState if no holdings
- 3-col grid (desktop) / 1-col stack (mobile) of HoldingCard

---

## Ledger Architecture Rules (CRITICAL — Per AGENTS.md)
1. Never merge holdings across different purchases — each row is its own card
2. Never store `current_value` — always compute as `quantity × commodities.current_price`
3. Never write `reserved_quantity` to holdings — always compute from active listings/requests
4. All reads strictly scoped to `auth.uid()` via RLS + query filter
5. `SUPABASE_SERVICE_ROLE_KEY` is prohibited in client components

---

## Security & Architecture Rules
1. Page is a Server Component — no `"use client"` at page level
2. Only `HoldingActions` is a Client Component
3. Session verified via `supabase.auth.getUser()` before any data fetch
4. Light mode only — no dark mode tokens

---

## Verification & Checks
```bash
npm run typecheck
npm run lint
npm run build
npm run test
```
