# Implementation Directives: 02-design-system — KorraStore

## Target Architecture & Design Tokens
- **Theme**: Strictly Light Mode Only (Paper & Soil aesthetic). No dark mode.
- `app/globals.css`:
  - Define CSS custom properties for color palette:
    - `--harvest-wheat`: `#D8B56A`
    - `--husk`: `#A88958`
    - `--soil`: `#4A3828`
    - `--deep-grain-green`: `#21483A`
    - `--trust-indigo`: `#303B63`
    - `--paper`: `#F7F4EA`
    - `--border`: `#E4DCC8`
    - `--danger`: `#B3432E`
    - `--warning`: `#C7862B`
  - Utility font classes: `.font-serif-display`, `.font-sans-inter`, `.font-mono-plex`.
  - Paper ledger perforated edges (`.receipt-ticket-edge`, `.receipt-perforated-border`).
- `app/layout.tsx`:
  - Load Google Fonts via `next/font/google`: `DM_Serif_Display`, `Inter`, `IBM_Plex_Mono`.
  - Pass font CSS variables to `<html>` / `<body>`. Set default background to `--paper` and text to `--soil`.
- `lib/utils.ts`:
  - Export `cn(...inputs: ClassValue[])` helper using `clsx` and `tailwind-merge`.

## UI Primitives to Implement (`components/ui/`)
- `button.tsx`: Variants (`primary`, `secondary`, `outline`, `ghost`, `destructive`), sizes (`sm`, `md`, `lg`), disabled & loading states.
- `card.tsx`: Base Paper fill, border, warm shadow (`shadow-sm`), radius (`radius-md`).
- `ledger-receipt.tsx`: Signature commodity ticket primitive with perforated visual edges, dashed section dividers, commodity name, grade badge, quantity, purchase value, current value.
- `price-display.tsx`: IBM Plex Mono formatted price display with currency indicator and up/down value delta (Deep Grain Green / Danger).
- `grade-badge.tsx`: Grade A/B/C badge chips with distinct harmonic colors.
- `quantity-selector.tsx`: Increment/decrement quantity selector with mono input.
- `status-stepper.tsx`: Order & buyback progress stepper component.
- `avatar.tsx`, `badge.tsx`, `tabs.tsx`, `modal.tsx`, `toast.tsx`, `skeleton.tsx`, `empty-state.tsx`, `pagination.tsx`.

## Navigation & Layout Components (`components/layout/`)
- `nav-rail.tsx`: Desktop vertical sidebar navigation rail (240px wide).
- `bottom-tab-bar.tsx`: Mobile bottom navigation tab bar (visible on screens `<640px`).
- `app-shell.tsx`: Shared app shell wrapper coordinating NavRail and BottomTabBar.

## Design System Showcase Route (`app/design-system/page.tsx`)
- Renders comprehensive UI showcase:
  - Color swatches with hex values & usage tags.
  - Typography scale preview (DM Serif Display, Inter, IBM Plex Mono).
  - Button states, Card variants, Ledger Receipt card, Price Display, Grade Badges, Status Stepper, Tabs, Modal, Toast, Skeleton, and App Shell layout preview.

## Code Documentation Standards
- Inline file-level header comment on every file created.
- Block-level comments for imports, props interfaces, helper functions, and JSX blocks.
- Update `docs/overview.md` with line-by-line breakdown for every file added or modified.
