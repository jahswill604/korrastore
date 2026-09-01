# Prompt: Desktop Navigation — KorraStore

## Goal

Finalize the `NavRail` (buyer) and `AdminNavRail` (admin) components stubbed in
`02-design-system.md`/`17-admin-dashboard.md`, including the tablet icon-only
collapse behavior flagged in `35-responsive-behavior.md`, active-route
highlighting, and the notifications badge. Light mode only, tablet/desktop concern
(`≥640px`).

## Skills read

- `02-design-system.md` — nav rail shell, breakpoint rules.
- `35-responsive-behavior.md` — tablet icon-only rail decision.
- `15-notifications.md` — unread-count badge source.
- `17-admin-dashboard.md` — admin route list.

## Existing code inspected

- `components/layout/nav-rail.tsx`, `components/admin/layout/admin-nav-rail.tsx`
  — shells built in their originating prompts; this pass finalizes behavior across
  both tablet and desktop widths.

## Decisions / assumptions

- **Buyer rail (desktop, ≥1024px)**: full labels + icons for Home, Resale, My
  Storage, Buyback, Notifications (badge), Profile — KorraStore wordmark at top,
  logout action at bottom.
- **Buyer rail (tablet, 640–1024px)**: icon-only, same route list, with a tooltip
  on hover showing the label (desktop-only interaction; on tablet touch, a brief
  label reveal on tap is acceptable if hover isn't available).
- **Admin rail (desktop)**: full labels for all eight admin routes (Dashboard,
  Orders, Inventory, Pricing, Resale & Buybacks — may show as two entries or one
  depending on whether `21-admin-resale-buyback.md`'s two pages warrant separate
  nav items, Reports, Support, Settings) — unlike the mobile bottom-tab-bar's
  "More" collapse, the desktop rail has room to show all of them directly.
- **Admin rail (tablet)**: icon-only, same route list.

## Files likely to change / add

- `components/layout/nav-rail.tsx` (finalize, including tablet icon-only variant),
  `components/admin/layout/admin-nav-rail.tsx` (finalize, including tablet
  icon-only variant).
- Wire the notifications unread-count query into the buyer rail's badge.

## Implementation requirements

- Icon-only tablet variant remains fully operable (all routes reachable) even
  without hover tooltips on touch-only tablets.
- Active-route highlighting matches the same logic used in
  `47-mobile-navigation.md`'s bottom tab bars, shared via a common
  `isRouteActive(pathname, route)` helper rather than duplicated logic.

## Security requirements

None — pure UI. (The admin rail's mere presence/absence is not a security
boundary — access control is enforced server-side per `AGENTS.md` §13 regardless
of what nav is rendered.)

## Acceptance criteria

- Buyer and admin nav rails render correctly at both tablet (icon-only) and
  desktop (full label) widths, with accurate active-state highlighting and a
  working unread-notifications badge.
- All routes remain reachable at tablet width without requiring hover.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`.

## Manual test steps

1. Resize to ~768px; confirm both buyer and admin rails collapse to icon-only and
   remain fully navigable via tap/click.
2. Resize to ~1440px; confirm full labels appear and active-state highlighting is
   accurate across nested routes.
3. Trigger a new notification; confirm the badge appears correctly on both tablet
   and desktop rail variants.
4. Confirm the `isRouteActive` helper is shared (not duplicated) between this
   component and the bottom tab bars from `47-mobile-navigation.md`.
