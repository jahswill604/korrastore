# Build Prompt: Feature 10 — My Storage (Portfolio)

## Overview
This is the build prompt for **Feature 10: My Storage**. When approved to proceed, the implementing agent must read ALL files listed below before writing a single line of code.

---

## Files to Read Before Building

### Spec & Rules
- `prompt/10-my-storage.md` — canonical feature spec, decisions, ledger rules, and acceptance criteria
- `AGENTS.md` — architecture & layering rules (Feature 10 section)
- `.agents/rules/build.md` & `.agents/rules/code-comments.md` — coding, comment & documentation rules

### Skills
- `.agents/skills/supabase/SKILL.md` — database queries, RLS scoping (`auth.uid() = user_id`), `holdings_with_current_value` view

### Design System
- `prompts/02-design-system.md` — `Card`, `PriceDisplay`, `GradeBadge`, `EmptyState`, `Badge`, `AppShell`, `NavRail`, `BottomTabBar`

### Implementation Context
- `prompts/implementation/10-my-storage.md` — full implementation plan
- `docs/overview.md` — current system codebase map

---

## Design References

### UI Designs
- **Desktop**: `prompts/ui degine/10-my-storage/desktop-ui.png`
- **Mobile**: `prompts/ui degine/10-my-storage/mobile-ui.png`

### Backend Workflow
- `prompts/backend-wookflow/10-my-storage/workflow.png`

### Brand Reference
- `ui refrence/ChatGPT Image Aug 30, 2026, 11_53_48 AM.png`

---

## Files to Create & Update

| File | Type | Purpose |
|------|------|---------|
| `lib/supabase/queries/holdings.ts` | Server query | `getBuyerHoldings` & `getPortfolioSummary` using `holdings_with_current_value` view |
| `components/my-storage/portfolio-summary.tsx` | Server Component | Portfolio summary header strip with total value, return delta, count |
| `components/my-storage/holding-card.tsx` | Server Component | Individual holding ledger card (thumbnail, grade, qty split, valuation, location) |
| `components/my-storage/holding-actions.tsx` | Client Component | Action buttons: Resell, Request Buyback, Request Delivery (with stubs if routes not built) |
| `app/my-storage/page.tsx` | Server Component | Main My Storage page with auth guard, portfolio summary, and holding grid |

---

## Critical Rules (Do NOT Violate)
1. All holdings queries MUST be strictly scoped to `user_id = auth.uid()`. Never expose another user's holdings.
2. `current_value` MUST NEVER be stored — always compute as `quantity × commodities.current_price` from the `holdings_with_current_value` view.
3. `reserved_quantity` MUST NEVER be stored — always computed from active `resale_listings` + `buyback_requests` at query time.
4. Holdings from different purchases must NEVER be merged, even if same commodity/grade (per AGENTS.md §7).
5. `app/my-storage/page.tsx` MUST be a Server Component. Only `HoldingActions` uses `"use client"`.
6. Unbuilt downstream routes (resale, buyback, delivery) MUST be stubbed with a "Coming soon" toast, NOT broken links.
7. Light mode only — no dark mode tokens, no `.dark` class.
8. After building: add inline comments (file-level + block-level) to every file + update `docs/overview.md`.

---

## Verification Commands
```bash
npm run typecheck
npm run lint
npm run build
npm run test
```
