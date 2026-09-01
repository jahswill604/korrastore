# Feature Implementation Details: 07-commodity-details

## 1. Goal
Implement `/commodities/[commodityId]` to display full details for a selected agricultural commodity, including grade-based pricing, live stock availability, dynamic price history line chart (Recharts), storage/warehouse compliance info, and seamless navigation into `/checkout`.

## 2. Technical Stack & Dependencies
- **Framework**: Next.js 16 (App Router, Server Components + selective Client Boundaries)
- **Database**: Supabase PostgreSQL (`commodities`, `commodity_grades`, `inventory`, `price_history`)
- **Charting**: `recharts` for rendering interactive price history trend curves
- **Design Tokens**: Harvest Wheat (`#D8B56A`), Soil (`#4A3828`), Paper (`#F7F4EA`), Deep Grain Green (`#21483A`), Border (`#E4DCC8`)

## 3. Component Architecture & Data Flow

### A. Data Layer & Types
- File: `lib/types.ts`
  - `GradeAvailability`: `{ gradeId: string; gradeName: string; gradeCode: 'A' | 'B' | 'C'; unitPrice: number; availableQuantity: number; stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' }`
  - `PriceHistoryPoint`: `{ date: string; price: number; formattedDate: string }`
  - `CommodityDetails`: `{ id: string; name: string; type: string; category: string; description: string; imageUrl: string; basePrice: number; minOrderQuantity: number; unit: string; grades: GradeAvailability[]; priceHistory: PriceHistoryPoint[]; storageInfo: { warehouseName: string; location: string; temperature: string; humidity: string; insuranceStatus: string } }`

### B. Supabase Query Layer
- File: `lib/supabase/queries/commodities.ts`
  - Function: `getCommodityDetails(commodityId: string): Promise<CommodityDetails | null>`
  - Fetches:
    1. Commodity record by ID.
    2. Linked `commodity_grades` sorted by rank/code.
    3. Aggregate stock quantity from `inventory` table grouped by grade.
    4. Historical price data points from `price_history` sorted by `recorded_at ASC`.

### C. Client Components
1. `components/commodity/grade-selector.tsx`
   - Segmented control / chip row (Grade A, Grade B, Grade C).
   - Uses `GradeBadge` styling. Selected grade highlighted with Harvest Wheat background (`#D8B56A`).
2. `components/commodity/purchase-panel.tsx`
   - Sticky card on desktop / floating section on mobile.
   - Holds grade selection state.
   - Updates `PriceDisplay` (IBM Plex Mono, large font) and stock availability text dynamically.
   - Quantity selector preview (`+` / `-`).
   - "Buy Now" CTA button navigating to `/checkout?commodityId=...&gradeId=...`.
   - Disabled state with alert banner if selected grade stock is 0 ("Currently unavailable — check back soon").
3. `components/commodity/price-history-chart.tsx`
   - Recharts `ResponsiveContainer`, `AreaChart` / `LineChart`.
   - Range tabs (`7d`, `30d`, `90d`, `All`).
   - Styled with Harvest Wheat gold stroke (`#D8B56A`), subtle gradient fill, custom tooltip, paper background.
4. `components/commodity/storage-info.tsx`
   - Informational card highlighting warehouse conditions (climate-controlled 18°C, 24/7 insured storage, instant resale eligible).

### D. Server Component Page
- File: `app/commodities/[commodityId]/page.tsx`
  - Fetches data via `getCommodityDetails(commodityId)`.
  - Handles 404 / Not Found gracefully via `notFound()`.
  - Renders 2-column layout on Desktop, stacked column on Mobile, wrapped in `AppShell`.

## 4. Acceptance Criteria
1. Switching grades dynamically updates displayed unit price and stock count.
2. Price history chart displays accurate data from `price_history` table and updates timeframe on tab click.
3. Clicking "Buy Now" passes selected `commodityId` and `gradeId` to `/checkout`.
4. Strict Light Mode token colors applied across all components.
5. Full inline file and block documentation added, with changes recorded in `docs/overview.md`.
