# Build Prompt: Feature 11 — Receipt Detail (KorraStore)

## Visual & Architecture References
- **Desktop UI Design**: `prompts/ui degine/11-receipt-detail/desktop-ui.png`
- **Mobile UI Design**: `prompts/ui degine/11-receipt-detail/mobile-ui.png`
- **Backend Workflow Architecture**: `prompts/backend-wookflow/11-receipt-detail/workflow.png`
- **Feature Prompt Context**: `prompts/11-receipt-detail.md`
- **Implementation Strategy**: `prompts/implementation/11-receipt-detail.md`

## Instructions for AI Agent
When building this feature:
1. Strictly read and adhere to all the files and design references listed above.
2. Implement `/receipts/[receiptId]` with full desktop and mobile responsive layout following the Light Mode design system.
3. Ensure server-side data fetching verifies user session and data ownership (`auth.uid() = user_id`).
4. Re-calculate live current valuation from commodity prices using the database view queries.
5. Provide a secure route for receipt PDF/image download using signed URLs from Supabase Storage.
6. Include comprehensive inline code comments across all files and update `docs/overview.md` with line-by-line breakdowns.
