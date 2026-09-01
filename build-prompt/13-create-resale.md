# Build Prompt: Feature 13 — Create & Manage Resale Listings (KorraStore)

## Visual & Architecture References
- **Desktop UI Design**: `prompts/ui degine/13-create-resale/desktop-ui.png`
- **Mobile UI Design**: `prompts/ui degine/13-create-resale/mobile-ui.png`
- **Backend Workflow Architecture**: `prompts/backend-wookflow/13-create-resale/workflow.png`
- **Feature Prompt Context**: `prompts/13-create-resale.md`
- **Implementation Strategy**: `prompts/implementation/13-create-resale.md`

## Instructions for AI Agent
When building this feature:
1. Strictly read and adhere to all the files and design references listed above.
2. Implement the seller resale flow (`CreateListingModal`) launching directly from the "Resell" button in `/my-storage` holding cards.
3. Clamp listed quantity to the holding's non-reserved available quantity, allowing asking price entry and duration selection (7, 14, 30 days).
4. Implement `/api/resale` POST endpoint using atomic Supabase reservation locking to prevent over-listing.
5. Build `/resale/my-listings` (Server Component) with URL-driven status tabs (`Active`, `Sold`, `Expired`, `Cancelled`) and listing cards.
6. Provide "Edit price" modal (`/api/resale/[id]/price`) and "Cancel listing" confirmation dialog (`/api/resale/[id]/cancel`), releasing holding reservations immediately on cancellation.
7. Strictly respect Light Mode design tokens (`Harvest Wheat` #D8B56A, `Paper` #F7F4EA, `Soil` #4A3828, `Deep Grain Green` #21483A).
8. Include comprehensive inline code comments across all files and update `docs/overview.md` with line-by-line breakdowns.
