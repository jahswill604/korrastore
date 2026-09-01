# Detailed Build Prompt: Feature 07 — Commodity Details Page

## Image References & Context Documents
- **Desktop UI Image Reference**: [desktop-ui.png](file:///c:/Users/jwezu/OneDrive/Downloads/digitalfarm/korrastore/prompts/ui%20degine/07-commodity-details/desktop-ui.png)
- **Mobile UI Image Reference**: [mobile-ui.png](file:///c:/Users/jwezu/OneDrive/Downloads/digitalfarm/korrastore/prompts/ui%20degine/07-commodity-details/mobile-ui.png)
- **Backend Workflow Diagram**: [workflow.png](file:///c:/Users/jwezu/OneDrive/Downloads/digitalfarm/korrastore/prompts/backend-wookflow/07-commodity-details/workflow.png)
- **Specification Document**: [07-commodity-details.md](file:///c:/Users/jwezu/OneDrive/Downloads/digitalfarm/korrastore/prompts/07-commodity-details.md)
- **Implementation Architecture**: [07-commodity-details.md](file:///c:/Users/jwezu/OneDrive/Downloads/digitalfarm/korrastore/prompts/implementation/07-commodity-details.md)

## Strict AI Agent Directives
Read all of the above prompt files and inspect `desktop-ui.png`, `mobile-ui.png`, and `workflow.png` carefully. Implement Feature 07 (`/commodities/[commodityId]`) strictly matching the visual reference images and architectural rules without deviation:

1. **Route & Page Layout**:
   - `app/commodities/[commodityId]/page.tsx` — Server Component fetching commodity data via `getCommodityDetails(commodityId)`.
   - Desktop (≥1024px): 2-column layout (~60% hero photo + title + description + storage info; ~40% sticky purchase panel) + full-width price history chart below.
   - Mobile (<640px): Stacked layout with sticky bottom CTA bar above navigation rail.

2. **Interactive Purchase Panel & Grade Selector**:
   - Segmented grade selector (`Grade A`, `Grade B`, `Grade C`) styled with `GradeBadge`. Selected grade highlighted in Harvest Wheat gold (`#D8B56A`).
   - Dynamic unit price display (`PriceDisplay`, `numeric-lg`) and live stock quantity for the selected grade.
   - "Buy Now" CTA button navigating to `/checkout?commodityId=...&gradeId=...`.
   - If stock is 0 for the selected grade, disable "Buy Now" button and display "Currently unavailable — check back soon" banner.

3. **Price History Chart Component**:
   - Interactive Recharts curve styled with KorraStore design tokens (Harvest Wheat `#D8B56A` line, paper background `#F7F4EA`, grid `#E4DCC8`).
   - Range tabs (`7d`, `30d`, `90d`, `All`) filtering date range in memory.

4. **Storage & Warehouse Info Block**:
   - Descriptive card detailing warehouse standards (climate-controlled, 24/7 insured, instant resale eligible).

5. **Design Tokens & Typography**:
   - Strictly Light Mode tokens (`Harvest Wheat` #D8B56A, `Paper` #F7F4EA, `Soil` #4A3828, `Deep Grain Green` #21483A).
   - Fonts: `DM Serif Display` for headings, `Inter` for UI text, `IBM Plex Mono` for prices.

6. **Documentation Requirements**:
   - Inline file and block comments in all created/modified files.
   - Record comprehensive line-by-line documentation in `docs/overview.md`.
