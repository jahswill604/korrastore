# Implementation Architecture Guide: Feature 06 — Home / Marketplace Browse Exact UI Redesign

## Goal
Implement the exact visual replica of `desktop-ui.png` and `mobile-ui.png` for KorraStore's buyer marketplace dashboard at `/` and `/home`.

## Components Architecture & File Mapping

### 1. `components/layout/nav-rail.tsx` (Collapsible Navigation Sidebar)
- Client Component (`"use client"`).
- State: `isCollapsed` (boolean toggle between 240px expanded and 72px collapsed).
- Includes top logo (visible when expanded) and toggle button.
- 9 Vertical Action Items:
  1. Home (`/` or `/home`) — Active state: filled gold square box (`#D8B56A`) with dark soil icon.
  2. Store (`/marketplace`)
  3. Storage (`/my-storage`)
  4. Receipts (`/receipts`)
  5. Orders (`/orders`)
  6. Resale (`/resale`)
  7. Swap / Transfer (`/transfer`)
  8. Notifications (`/notifications`)
  9. Profile (`/profile`)

### 2. `components/layout/app-shell.tsx` (Top Header Bar & Shell)
- Top Sticky Header (`#F7F4EA` backdrop):
  - Left: KorraStore Logo ("🌾 KorraStore") in DM Serif Display.
  - Center: Search input bar `[ 🔍 Search commodities... ]` with soft beige background `#EDE8DA`, rounded-2xl, and border `#E4DCC8`.
  - Right: Bell notification icon + User profile avatar circle.
- Wraps content in max-w-7xl viewport with `NavRail` on desktop and `BottomTabBar` on mobile.

### 3. `components/marketplace/market-ticker.tsx` (Top Market Trend Summary Cards)
- Desktop View: 3-column summary cards:
  - Rice (`₦68,500/bag`, `↑ 2.4%` green pill, green SVG sparkline graph).
  - Garlic (`₦51,000/bag`, `↑ 1.9%` green pill, green SVG sparkline graph).
  - Beans (`₦37,500/bag`, `↓ 0.3%` red pill, red SVG sparkline graph).
- Mobile View: Horizontally scrollable strip of summary cards (Rice, Garlic, Beans, Melon).

### 4. `components/marketplace/filter-bar.tsx` (Category Filter Chips & Sort Dropdown)
- Category Pills: `All` (solid gold filled pill `#D8B56A`), `Rice`, `Garlic`, `Beans`, `Melon` (outlined rounded pills).
- Sort Dropdown: `Sort: Price ∨` aligned to the right.
- Updates URL query parameters `?type=...&sort=...`.

### 5. `components/marketplace/commodity-card.tsx` (Dual Desktop & Mobile Commodity Cards)
- **Desktop Grid (4 Columns × 2 Rows)**:
  - White container (`#FFFFFF`), `rounded-2xl`, soft border (`#E4DCC8`).
  - Warm beige thumbnail box (`#F5EFE0`) with 3D commodity graphic and top-right `[ Premium ]` dark green badge (`#21483A`).
  - Title in `DM Serif Display` font (`DM Serif Display 18px` / `White Seeded Rice 50kg`).
  - Price in `IBM Plex Mono` (`₦68,500 / bag`).
  - Monthly trend badge (`+2.4% this month`).
  - Available stock (`1,250 bags available`).
  - Dual CTAs: Left `[ View Details ]` outlined button + Right `[ Buy Now ]` gold button (`#D8B56A`).
- **Mobile List (Single Column)**:
  - Horizontal split layout.
  - Left: Square thumbnail box with `G#` grade overlay tag.
  - Right: Title (DM Serif Display) + Premium badge, price (IBM Plex Mono) + green trend pill, stock availability info.
  - Bottom: Full-width `[ Buy Now ]` gold button.

### 6. `app/page.tsx` & `app/home/page.tsx`
- Server Components fetching real Supabase marketplace data via `getMarketplaceCommodities(filters)`.
- Renders session greeting ("Welcome back, Amara 👋" / "Good morning, Amara 👋").
- Displays `MarketTicker`, `FilterBar`, and `CommodityCard` grid inside `AppShell`.
