# Feature 07: Commodity Details Version Progress Snapshot

## Overview
This directory contains the code snapshot for **Feature 07: Commodity Details Page (`/commodities/[commodityId]`)**.

## Files Included
- `app/commodities/[commodityId]/page.tsx` — Server Component fetching commodity data, rendering 2-column desktop / stacked mobile views inside `AppShell`.
- `components/commodity/grade-selector.tsx` — Quality grade selection chip control (Grade A, B, C) using Harvest Wheat active styling (`#D8B56A`).
- `components/commodity/price-history-chart.tsx` — Interactive Recharts area chart rendering historical price trends across selectable range tabs (`7d`, `30d`, `90d`, `All`).
- `components/commodity/purchase-panel.tsx` — Purchase panel managing per-grade price recalculations, stock checks, quantity selectors, and "Buy Now" checkout navigation.
- `components/commodity/storage-info.tsx` — Warehouse storage and climate control compliance info card.
- `lib/types.ts` — TypeScript interfaces for `CommodityDetails`, `GradeAvailability`, and `PriceHistoryPoint`.
- `lib/supabase/queries/commodities.ts` — Supabase data query layer with `getCommodityDetails(commodityId)` and seeded/fallback data handlers.
