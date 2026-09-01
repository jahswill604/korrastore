# Feature 06: Home / Marketplace Browse Exact UI Redesign Specification

## Overview
Rebuild the buyer marketplace home page (`/` and `/home`) to strictly and perfectly match the visual designs in `desktop-ui.png` and `mobile-ui.png`. Disregard any outdated design specs and implement the exact card layouts, header structure, collapsible desktop sidebar, greeting banner, top market summary ticker, category filter chips, and dual desktop/mobile commodity card designs shown in the images.

---

## 🎨 Visual & Technical Specifications (Strict Visual Replica)

### 1. Typography & Theme Tokens
- **DM Serif Display** (`font-serif-dm`):
  - Used for: Main greetings ("Welcome back, Amara 👋", "Good morning, Amara 👋"), logo text ("KorraStore"), and commodity titles ("DM Serif Display 18px" / "White Seeded Rice 50kg").
- **Inter** (`font-sans-inter`):
  - Used for: Subtitles ("Real commodities. Real ownership."), category filter pills, nav rail items, and button labels.
- **IBM Plex Mono** (`font-mono-plex`):
  - Used for: Commodity prices (`₦68,500 / bag`), stock counts (`1,250 bags available`), and market ticker prices.
- **Color Palette**:
  - Background: Warm off-white / Paper (`#F7F4EA` / `#F5F2EB`).
  - Cards Fill: Pure white (`#FFFFFF`).
  - Text Primary: Dark Soil (`#4A3828`).
  - Accent Gold: Harvest Wheat (`#D8B56A` / `#D4AF37`).
  - Thumbnail Box: Soft warm beige fill (`#F5EFE0` / `#F5EDD6`).
  - Badges / Success: Deep Grain Green (`#21483A` badge background, `#EBF5EE` light green trend background).
  - Negative Trend: Danger Red (`#B3432E` text, `#FDECEA` light red trend background).
  - Card Borders: Soft warm border (`#E4DCC8`).

---

### 2. Top Navigation Header (`AppShell`)
- **Desktop Viewport**:
  - **Left**: KorraStore logo with wheat emoji ("🌾 KorraStore") in `DM Serif Display` font.
  - **Center**: Floating search input bar `[ 🔍 Search commodities... ]` with soft light beige fill (`#EDE8DA`), rounded pill corners (`rounded-2xl`), subtle border (`#E4DCC8`), dark soil placeholder text.
  - **Right**: Outline notification bell icon (`<Bell />`) with gold indicator dot, and circular user profile avatar image.
- **Mobile Viewport**:
  - **Left**: KorraStore logo ("🌾 KorraStore").
  - **Right**: Notification bell icon (`<Bell />`), and user avatar circle.

---

### 3. Collapsible Navigation Rail (`NavRail`)
- **Width**: Collapsible between expanded (240px) and collapsed (72px / icon-only rail).
- **Collapse Toggle**: Toggle button at top/bottom of rail switching between icon-only and expanded width.
- **Active Navigation Item**:
  - Home link has a filled golden-khaki rounded square container (`#D8B56A`) with dark soil home icon!
- **9 Vertical Navigation Items**:
  1. Home (`/` or `/home`) — Active state: filled gold square box (`#D8B56A`).
  2. Store (`/marketplace`)
  3. Storage (`/my-storage`)
  4. Receipts (`/receipts`)
  5. Orders (`/orders`)
  6. Resale (`/resale`)
  7. Swap / Transfer (`/transfer`)
  8. Notifications (`/notifications`)
  9. Profile (`/profile`)

---

### 4. Greeting Banner
- **Desktop**: "Welcome back, Amara 👋" in `DM Serif Display` (bold, ~32px) + "Real commodities. Real ownership." subheadline in dark soil text.
- **Mobile**: "Good morning, Amara 👋" in `DM Serif Display` (bold, ~24px).

---

### 5. Top Market Summary Ticker Cards (`MarketTicker`)
- **Desktop View**: 3 summary cards in a grid:
  - **Card 1 (Rice)**: Rice icon/graphic, Title "Rice", Green trend pill `↑ 2.4%` (`#EBF5EE` bg, `#21483A` text), Price `₦68,500/bag` in IBM Plex Mono, SVG green trend sparkline curve.
  - **Card 2 (Garlic)**: Garlic icon, Title "Garlic", Green trend pill `↑ 1.9%`, Price `₦51,000/bag`, SVG green trend sparkline curve.
  - **Card 3 (Beans)**: Beans icon, Title "Beans", Red trend pill `↓ 0.3%` (`#FDECEA` bg, `#B3432E` text), Price `₦37,500/bag`, SVG red trend sparkline curve.
- **Mobile View**: Horizontally scrollable strip of market pills (Rice `₦68,500`, Garlic `₦51,000`, Beans `₦37,500`, Melon `₦28,000`).

---

### 6. Filter & Sort Control Bar (`FilterBar`)
- **Category Filter Pills**:
  - `[ All ]`: Solid Harvest Wheat gold pill (`#D8B56A`), white bold text.
  - `[ Rice ]`, `[ Garlic ]`, `[ Beans ]`, `[ Melon ]`: Outlined rounded pills with white fill and `#E4DCC8` border.
- **Sort Dropdown**: `[ Sort: Price ∨ ]` white button with dropdown icon on right.
- **URL Parameter Sync**: State stored strictly in `?type=...&sort=...`.

---

### 7. Commodity Cards Redesign (`CommodityCard`)

#### Desktop Card Layout (4-Column Grid × 2 Rows):
- **Card Container**: White background (`#FFFFFF`), `rounded-2xl` corners (16px radius), soft border (`#E4DCC8`), shadow-xs on hover.
- **Top Image Box**:
  - Warm beige/cream fill (`#F5EFE0`), `rounded-xl` corners, height ~170px.
  - Top-Right Badge: Dark green solid pill badge `[ Premium ]` (`#21483A` background, white bold text, text-xs).
  - Center Visual: Clean 3D/vector commodity graphic (Rice stalk with golden grains, Garlic bulb, Brown kidney beans, Cantaloupe melon).
- **Card Text Content**:
  - **Title**: Rendered in `DM Serif Display` font (e.g. `DM Serif Display 18px` / `White Seeded Rice 50kg`).
  - **Subtitle**: Muted `dark Soil` caption text.
  - **Price Tag**: `₦68,500 / bag` in `IBM Plex Mono` font, bold, dark soil color (`#4A3828`).
  - **Monthly Trend**: `+2.4% this month` in green text (`#21483A`), font-semibold, text-xs.
  - **Stock Available**: `1,250 bags available` in muted dark soil text (`#4A3828`), text-xs.
- **Dual CTA Buttons (Row of 2 Buttons)**:
  - **Left Button**: `[ View Details ]` — Outlined pill button, white fill, soft border (`#D4C9A8`), dark soil text, text-xs, font-bold, rounded-full.
  - **Right Button**: `[ Buy Now ]` — Solid Harvest Wheat gold button (`#D8B56A`), dark soil text, text-xs, font-bold, rounded-full.

#### Mobile Card Layout (Single Column List):
- **Card Container**: White background (`#FFFFFF`), `rounded-2xl` corners, soft border (`#E4DCC8`), padding 16px.
- **Top Horizontal Split Section**:
  - **Left Thumbnail Box**: Square warm beige thumbnail box (`#F5EFE0`), ~80px × 80px, `rounded-xl`.
    - **Grade Overlay Tag**: Dark tag `G#` positioned on bottom-right corner of thumbnail box.
  - **Right Details Column**:
    - **Top Row**: Commodity Title in `DM Serif Display` font + `[ Premium ]` dark green badge.
    - **Middle Row**: Price `₦68,500 / bag` in `IBM Plex Mono` font + `+2.4%` green trend badge pill (`#EBF5EE` fill, `#21483A` green text).
    - **Stock Row**: Subtitle `IBM Plex Mono` + `1,250 bags` stock count.
- **Bottom Full-Width Button**:
  - `[ Buy Now ]` — Solid Harvest Wheat gold fill (`#D8B56A`), `rounded-xl`, text-sm, font-bold, dark soil text.

---

### 8. Sticky Mobile Bottom Navigation Bar (`BottomTabBar`)
- Fixed bottom navigation bar with 5 tabs: Home (active gold icon `#D8B56A`), Store, Storage, Orders, Profile.
