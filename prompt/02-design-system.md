# Prompt: Design System — KorraStore

## Goal

Establish the design-token foundation and reusable UI primitives for KorraStore —
**light mode only, no dark mode** — so every later page prompt builds on the same
tokens instead of reinventing colors/spacing/type per page. Includes a
`/design-system` showcase page (desktop + mobile) to validate tokens before feature
pages consume them. Display-only; no app data, no pipeline logic.

## Skills read

- `AGENTS.md` §5 (architecture — UI displays data only), §6 (tech stack: Tailwind +
  shadcn/ui, Recharts), §20 (color palette, typography, signature receipt element),
  §21 (standards, server/client boundaries).
- No feature skill (`supabase`/`paystack`/`resend`/`termii`) applies yet — pure UI
  tokens and primitives.

## Existing code inspected

- `01-project-foundation.md`'s output — fresh Next.js project, no tokens, no
  `components/` yet.
- Confirm installed Tailwind major version (`@theme` in CSS for v4 vs
  `tailwind.config.ts` for v3) before writing tokens.

## Decisions / assumptions

- **Light mode only.** No `next-themes`, no `.dark` class, no `ThemeToggle`
  component, no dark-mode token block anywhere. This is a deliberate product
  decision (a paper-ledger aesthetic doesn't need a dark variant) — do not add one
  even as a "future-proofing" stub.
- **Aesthetic direction:** "modern agricultural marketplace + trusted warehouse
  ledger" — restrained, tactile, not a generic fintech dashboard. The signature
  visual motif is the digital commodity receipt: a physical-looking ledger ticket.
- **cn() helper + hand-rolled primitives** — `clsx` + `tailwind-merge`, not a full
  shadcn CLI scaffold, matching the project's stated lightweight approach.

## Token values

### Color (light mode only)
```
Harvest Wheat     #D8B56A   — primary accent / CTAs / active states / focus rings
Husk              #A88958   — secondary accent, muted highlights, hover states
Soil              #4A3828   — primary text, high-emphasis content
Deep Grain Green  #21483A   — success / positive value change / "stored" status
Trust Indigo      #303B63   — links, informational badges, secondary CTAs
Paper             #F7F4EA   — page background, card fill base
```
- `text-primary` = Soil, `text-secondary` = a lighter tint of Soil (~`#6B5A48`),
  `text-tertiary` = `#8C7C68` for captions/metadata.
- `border` = `#E4DCC8` (a tint between Paper and Husk).
- `danger` = `#B3432E` (used sparingly — cancelled orders, rejected buybacks,
  validation errors), `warning` = `#C7862B` (pending states).
- Semantic mapping: **positive value / stored / approved / paid** → Deep Grain
  Green. **pending / sourcing / in transit** → Harvest Wheat / Husk. **cancelled /
  failed / rejected** → danger.

### Typography
- Display: **DM Serif Display** — restrained use for major commodity/price moments
  (hero headline, commodity name on the details page, the receipt's commodity line).
- UI/body: **Inter** — everything else (nav, forms, body copy, buttons).
- Numbers/prices: **IBM Plex Mono** — every price, quantity, and percentage value in
  the app uses this face, always, so numeric information reads consistently
  wherever it appears (marketplace cards, portfolio, receipts, admin tables).

Type scale: H1 32/700/1.2 (DM Serif Display), H2 24/600/1.3, H3 20/600/1.3, H4
16/600/1.4 (Inter, all headings below H1 use Inter — DM Serif Display is reserved
for true hero/receipt moments, not every heading), body-lg 16/400/1.6, body-md
14/400/1.6, body-sm 13/400/1.5, caption 11/500/1.4 uppercase tracked (section
eyebrows, metadata labels), numeric-lg 20/500/1.2 (IBM Plex Mono, prices/quantities
in emphasis position), numeric-md 15/500/1.4 (IBM Plex Mono, inline table/card
numbers).

### Radius
`sm` 6px, `md` 10px, `lg` 16px, `full` 9999px. Cards/panels default to `md`/`lg`;
badges/chips to `sm`/`full`.

### Shadow
`sm` `0 1px 2px rgba(74,56,40,.08)`, `md` `0 6px 20px rgba(74,56,40,.10)`,
`lg` `0 12px 32px rgba(74,56,40,.14)` — shadows are warm-toned (tinted from Soil),
not neutral gray, to match the paper/ledger aesthetic.

### Spacing & grid
Tailwind's 4px base. Container max-width 1200px desktop; reading-heavy surfaces
(commodity details body copy) max-width 720px. Sidebar nav rail width 240px desktop
/ collapses to a bottom tab bar below `md`.

### Breakpoints
mobile `<640px` (bottom tab bar, single column), tablet `640–1024px` (2-column
where relevant, icon-rail sidebar), desktop `≥1024px` (full sidebar rail +
multi-column layouts).

## Core primitives to build

- `Button` — variants: primary (solid Harvest Wheat, Soil text), secondary
  (outline/paper), ghost, text, destructive (danger); sizes sm/md/lg; disabled +
  loading states.
- `Card` — base surface every page composes with (Paper fill, `border`, `shadow-sm`,
  `radius-md`); props for padding density.
- `LedgerReceipt` — the signature primitive: a physical-looking ticket component
  (perforated-edge visual treatment via CSS, dashed divider between sections)
  showing commodity, quantity, grade, purchase value, current value, ownership
  status. Built here as a reusable shell; `41-receipt-card.md` and
  `11-receipt-detail.md` compose it with real data.
- `PriceDisplay` — renders a numeric value in IBM Plex Mono with currency formatting
  and an optional up/down delta indicator (Deep Grain Green for positive, danger for
  negative). Built in full in `38-price-display.md`; stub the shape here.
- `GradeBadge` — A/B/C grade chip with distinct but harmonious colors per grade
  (does not reuse status-semantic colors, to avoid confusion with order/buyback
  status). Full spec in `39-grading-badge.md`; stub here.
- `QuantitySelector` — full spec in `37-quantity-selector.md`; stub the shape here.
- `Avatar`, `Badge`/`Pill` (status labels: order status, buyback status, resale
  status — reuses the semantic color mapping above).
- `Tabs`, `Modal`/`Dialog`, `Toast`, `Skeleton`, `EmptyState`, `Pagination`.
- `NavRail` (desktop sidebar) + `BottomTabBar` (mobile) — shared app shell nav for
  the buyer app; a separate `AdminNavRail` variant is introduced in
  `17-admin-dashboard.md` reusing these same tokens.
- `StatusStepper` — full spec in `40-order-status-stepper.md`; stub the shape here.

## Files likely to change / add

- `app/globals.css` — full token set (per the project's actual Tailwind version),
  type utility classes. Single token block — no dark-mode block.
- `app/layout.tsx` — fonts (DM Serif Display, Inter, IBM Plex Mono via
  `next/font/google`), metadata.
- `lib/utils.ts` — `cn()`.
- `components/ui/button.tsx`, `card.tsx`, `avatar.tsx`, `badge.tsx`, `tabs.tsx`,
  `modal.tsx`, `toast.tsx`, `skeleton.tsx`, `empty-state.tsx`, `pagination.tsx`,
  `ledger-receipt.tsx`, `price-display.tsx`, `grade-badge.tsx`,
  `quantity-selector.tsx`, `status-stepper.tsx`.
- `components/layout/nav-rail.tsx`, `bottom-tab-bar.tsx`, `app-shell.tsx`.
- `app/design-system/page.tsx` — showcase: palette swatches, type scale, buttons,
  card, ledger receipt, price display (positive/negative delta), grade badges,
  status stepper, nav rail + bottom tab bar preview.
- `package.json` — add `clsx`, `tailwind-merge`.

## Implementation requirements

- Server Components by default; `"use client"` only for interactive primitives
  (tabs, modal, toast).
- Every color/spacing/radius/type value comes from a CSS token — no hardcoded hex in
  feature components.
- No dark mode anywhere — no `.dark` class, no theme toggle, no per-theme token
  block.
- Nav rail/bottom-tab-bar and all primitives render correctly at mobile, tablet, and
  desktop breakpoints with no horizontal overflow.

## Security requirements

None — pure UI, no secrets, no network, no pipeline state.

## Acceptance criteria

- `/design-system` renders every section with crisp, high-contrast typography
  against the Paper background.
- All primitives exist, are typed, and are visually consistent at mobile/tablet/
  desktop widths.
- `LedgerReceipt` reads clearly as a distinct "physical ticket" element, not just
  another card.
- Nav rail (desktop) and bottom tab bar (mobile) render from the same route list.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`.

## Manual test steps

1. `npm run dev`; open `/design-system`.
2. Resize to ~375px, ~768px, ~1280px; confirm nav rail becomes a bottom tab bar
   below `md` and no primitive overflows horizontally.
3. Confirm price display renders IBM Plex Mono with correct positive/negative
   delta coloring.
4. Confirm the ledger receipt component visually reads as a distinct "ticket"
   element.
5. Confirm buttons show all variants/sizes/disabled/loading states correctly.
