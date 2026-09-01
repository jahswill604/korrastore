# Prompt: Mobile Navigation — KorraStore

## Goal

Finalize the `BottomTabBar` (buyer) and `AdminBottomTabBar` (admin) components
stubbed in `02-design-system.md`/`17-admin-dashboard.md`, including the
notifications unread-count badge, active-route highlighting, and safe-area
handling. Light mode only, mobile-only concern (`<640px`).

## Skills read

- `02-design-system.md` — nav rail/bottom-tab-bar shell, breakpoint rules.
- `15-notifications.md` — unread-count badge source.
- `17-admin-dashboard.md` — admin route list.
- `04-auth.md` — the buyer route list this component's tabs map to.

## Existing code inspected

- `components/layout/bottom-tab-bar.tsx`, `components/admin/layout/admin-bottom-
  tab-bar.tsx` — shells built in their originating prompts; this pass finalizes
  behavior.

## Decisions / assumptions

- **Buyer tabs**: Home, Resale, My Storage, Notifications (with unread badge),
  Profile — five tabs max, chosen as the most-visited destinations; other buyer
  routes (checkout, order detail, buyback, receipts) are reached via navigation
  from these, not given their own tab.
- **Admin tabs**: given the admin route list is longer (8 routes), the bottom tab
  bar shows the 4 most operationally frequent (Dashboard, Orders, Resale &
  Buybacks, Support) plus a "More" tab opening a sheet with the remainder
  (Inventory, Pricing, Reports, Settings) — rather than cramming 8 icons into one
  bar.
- **Safe-area handling**: the bar respects `env(safe-area-inset-bottom)` on
  devices with a home indicator, and any pinned composer/button elsewhere in the
  app (none currently, but noted for future consistency) accounts for the bar's
  height so nothing is obscured.

## Files likely to change / add

- `components/layout/bottom-tab-bar.tsx` (finalize), `components/admin/layout/
  admin-bottom-tab-bar.tsx` (finalize), `components/admin/layout/admin-more-
  sheet.tsx` (client — the "More" tab's sheet).
- Wire the notifications unread-count query from `15-notifications.md` into the
  buyer bar's badge.

## Implementation requirements

- Active-route highlighting uses the current pathname, correctly matching nested
  routes (e.g. `/orders/[orderId]` doesn't highlight a tab that isn't in the tab
  list, and doesn't break if no tab matches).
- Safe-area inset is respected via CSS env(), not a fixed pixel guess.

## Security requirements

None — pure UI.

## Acceptance criteria

- Buyer and admin bottom tab bars render correctly at `<640px`, with accurate
  active-state highlighting and a working unread-notifications badge.
- Admin "More" sheet correctly surfaces the remaining four admin routes.
- No content on any page is obscured by the bar, including on devices with a home
  indicator safe area.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`.

## Manual test steps

1. Resize to ~375px; navigate the buyer app via the bottom tab bar; confirm
   correct active-state highlighting on each tab and nested route.
2. Trigger a new notification; confirm the badge count updates on the
   Notifications tab.
3. As admin at ~375px, confirm the four primary tabs plus "More" sheet correctly
   reach all eight admin routes.
4. Test on a device/emulator with a bottom home-indicator safe area; confirm the
   bar and page content don't overlap it.
