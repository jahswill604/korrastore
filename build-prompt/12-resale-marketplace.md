# Build Prompt: Feature 12 — Resale Marketplace (KorraStore)

## Visual & Architecture References
- **Desktop UI Design**: `prompts/ui degine/12-resale-marketplace/desktop-ui.png`
- **Mobile UI Design**: `prompts/ui degine/12-resale-marketplace/mobile-ui.png`
- **Backend Workflow Architecture**: `prompts/backend-wookflow/12-resale-marketplace/workflow.png`
- **Feature Prompt Context**: `prompts/12-resale-marketplace.md`
- **Implementation Strategy**: `prompts/implementation/12-resale-marketplace.md`

## Instructions for AI Agent
When building this feature:
1. Strictly read and adhere to all the files and design references listed above.
2. Implement `/resale` with responsive desktop (3-column grid) and mobile (single-column) layouts adhering to the Light Mode design system.
3. Query all resale listings strictly from the `resale_listings_public` view — seller PII must never reach client components or responses.
4. Implement URL-based category filtering and price sorting.
5. Create the direct checkout route `/api/resale/[id]/buy` that atomically verifies/locks the listing with `FOR UPDATE` RPC and initializes Paystack payment.
6. Include comprehensive inline code comments across all files and update `docs/overview.md` with line-by-line breakdowns.
