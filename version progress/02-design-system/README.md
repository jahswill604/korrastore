# Version Progress — 02-design-system

## Overview
This folder contains the complete, self-contained snapshot of **Version 02: Design System** (`02-design-system`).

- **Version Name**: `02-design-system`
- **Feature**: Full light-mode design token system, Google Fonts integration (DM Serif Display, Inter, IBM Plex Mono), 15 core UI primitives, 3 layout shell components, and `/design-system` showcase route.

## Design Decisions
- **Light Mode Only** — No `.dark` class, no theme toggle, no dark-mode token block. Permanent product decision.
- **Aesthetic** — "Modern agricultural marketplace + trusted paper ledger." Tactile, warm, restrained.
- **Signature Primitive** — `LedgerReceipt` component styled as a physical warehouse ticket with perforated top band, dashed divider, DM Serif Display commodity name, and IBM Plex Mono price values.
- **Typography Rule** — All prices and quantities use IBM Plex Mono exclusively, everywhere.

## Color Tokens (Design Baseline)
| Token | Hex | Role |
|-------|-----|------|
| Harvest Wheat | `#D8B56A` | Primary CTAs, active states |
| Husk | `#A88958` | Secondary accent, hover |
| Soil | `#4A3828` | Primary text |
| Deep Grain Green | `#21483A` | Success, stored, positive delta |
| Trust Indigo | `#303B63` | Links, informational |
| Paper | `#F7F4EA` | Page background |
| Border | `#E4DCC8` | Dividers & borders |
| Danger | `#B3432E` | Errors, cancelled |
| Warning | `#C7862B` | Pending, in-transit |

## Included Files
### Configuration & Global Styles
- `app/globals.css` — Token block, font utilities, warm shadows, receipt border utilities
- `app/layout.tsx` — Google Fonts loading (3 typefaces), Paper/Soil root styles

### Utility
- `lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)

### Core Primitives (`components/ui/`)
- `button.tsx` — 5 variants, 3 sizes, loading state
- `card.tsx` — Paper surface with density presets + sub-components
- `ledger-receipt.tsx` — **Signature** physical ticket motif
- `price-display.tsx` — IBM Plex Mono with delta indicator
- `grade-badge.tsx` — A/B/C grade chips
- `quantity-selector.tsx` — Increment/decrement with unit label
- `status-stepper.tsx` — Order lifecycle step progression
- `avatar.tsx` — User profile with initials fallback
- `badge.tsx` — Semantic status pill (stored/pending/cancelled/info)
- `tabs.tsx` — Harvest Wheat active tab switching
- `modal.tsx` — Backdrop blur overlay dialog
- `toast.tsx` — Success/error/warning/info toasts
- `skeleton.tsx` — Warm loading placeholder
- `empty-state.tsx` — Zero-data placeholder with CTA
- `pagination.tsx` — Page navigation controls

### Layout Shell (`components/layout/`)
- `nav-rail.tsx` — Desktop 240px vertical sidebar
- `bottom-tab-bar.tsx` — Mobile fixed bottom navigation
- `app-shell.tsx` — Shared layout wrapper

### Showcase Route
- `app/design-system/page.tsx` — Full `/design-system` showcase

### Dependencies Added
- `clsx` v2.1.1
- `tailwind-merge` v3.0.2

## Checks Passed
- ✅ `npm run typecheck` — 0 TypeScript errors
- ✅ `npm run lint` — 0 errors, 0 warnings
- ✅ `npm run build` — Static build succeeded, `/design-system` route generated

## How to View
1. Ensure `npm run dev` is running
2. Open `http://localhost:3000/design-system`
3. Resize to 375px, 768px, 1280px to verify responsive nav rail ↔ bottom tab bar transition
