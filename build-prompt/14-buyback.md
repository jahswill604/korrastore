# Feature 14: Buyback Flow — Build Prompt

## Overview
Implement the guaranteed platform buyback request flow for KorraStore: viewing the current admin-set buyback price, submitting liquidation requests directly to KorraStore with atomic holding quantity locking, and tracking request progression across `/buyback` and `/buyback/[requestId]`.

## References & Design Artifacts
- **Prompt Spec**: `prompt/14-buyback.md`
- **Desktop UI Design**: `prompts/ui degine/14-buyback/desktop-ui.png`
- **Mobile UI Design**: `prompts/ui degine/14-buyback/mobile-ui.png`
- **Backend Workflow**: `prompts/backend-wookflow/14-buyback/workflow.png`
- **Implementation Spec**: `prompts/implementation/14-buyback.md`
- **Design System Rules**: `AGENTS.md` Feature 02 & Feature 14

## Core Implementations
1. `supabase/migrations/0007_add_buyback_price.sql` — schema addition of `buyback_price` on `commodities`
2. `lib/supabase/queries/buyback.ts` — query and mutation layer for buyback requests and atomic holding locking
3. `app/api/buybacks/route.ts` — POST endpoint for submitting buyback liquidation requests
4. `app/api/buybacks/price/route.ts` — GET endpoint for fetching live buyback price
5. `components/buyback/request-modal.tsx` — interactive modal/sheet launched from `/my-storage`
6. `components/buyback/buyback-row.tsx` — request summary card for the list view
7. `components/buyback/buyback-timeline.tsx` — visual lifecycle progression timeline
8. `app/buyback/page.tsx` — buyer buyback requests dashboard
9. `app/buyback/[requestId]/page.tsx` — buyer buyback request detail page
10. `components/my-storage/holding-actions.tsx` — wired up `RequestBuybackModal`
