# Prompt: Admin Dashboard — KorraStore

## Goal

Build `/admin`: the admin landing page — key operational metrics at a glance (open
orders, pending buybacks, active resale listings, low-inventory alerts, recent
audit activity) — plus the admin app shell (nav) that every other `/admin/*` page
composes with. Desktop + mobile, light mode only.

## Skills read

- `.agents/skills/supabase/SKILL.md` — admin-role-gated service-role/aggregation
  queries across orders/inventory/buybacks/resale/audit_logs.
- `02-design-system.md` — tokens/primitives reused for the admin shell (not a
  separate visual language — same Paper/Harvest Wheat/Soil palette, slightly denser
  layout appropriate for an operational tool).
- `04-auth.md` — the role-based redirect that lands admins here after login.
- `AGENTS.md` §13 (admin route list, server-side role enforcement).

## Existing code inspected

- `04-auth.md` — `middleware.ts` already enforces `role = 'admin'` on `/admin/*`;
  this prompt builds the actual pages, trusting that enforcement is in place (but
  re-verifying `getUser()` + role at the page/layout level too, defense in depth).
- `02-design-system.md` — `NavRail`, `BottomTabBar` components to extend for the
  admin route list.

## Decisions / assumptions

- **`AdminNavRail`/`AdminBottomTabBar`** reuse the buyer app's nav primitives
  visually but with the admin route list: Dashboard, Orders, Inventory, Pricing,
  Resale & Buybacks, Reports, Support, Settings.
- **Dashboard is read-only aggregation** — no mutation actions live here; each
  stat/alert links to the relevant full admin page (`18-admin-orders.md`, etc.) for
  action.
- **Low-inventory alert threshold** is a simple fixed default (e.g. flag any
  commodity/grade below a configurable threshold) — the actual threshold value is
  managed in `24-admin-settings.md`; this page just reads and displays it.

## Visual interpretation (light mode only)

### Layout — Desktop (≥1024px)
`AdminNavRail` left (denser than the buyer nav — text labels always visible, no
icon-only collapse). Content area: H1 "Dashboard". Stat tile row (open orders
count, pending buyback requests count, active resale listings count, total
portfolio value across all users — optional if easy to compute). Below: two-column
region — left "Needs attention" list (low-inventory alerts, stuck/exception orders
per `AGENTS.md` §8's reconciliation state, pending buybacks awaiting review), right
"Recent activity" feed (latest `audit_logs` entries, human-readable).

### Layout — Mobile (<640px)
`AdminBottomTabBar`; stat tiles as a horizontally scrollable row; "Needs attention"
and "Recent activity" stack vertically full-width.

## Files likely to change / add

- `app/admin/layout.tsx` — admin shell wrapper (nav + role re-check).
- `app/admin/page.tsx` — Server Component dashboard.
- `components/admin/layout/admin-nav-rail.tsx`, `admin-bottom-tab-bar.tsx`.
- `components/admin/dashboard/stat-tile.tsx`, `needs-attention-list.tsx`,
  `recent-activity-feed.tsx`.
- `lib/supabase/queries/admin/dashboard.ts` — `getAdminDashboardStats()`,
  `getNeedsAttentionItems()`, `getRecentAuditActivity(limit)` — all using the
  service-role client, gated by an explicit role check in the calling
  route/layout, never relying on RLS alone for admin-only aggregate reads.

## Implementation requirements

- `app/admin/layout.tsx` re-verifies `getUser()` + `profiles.role === 'admin'`
  server-side on every request, independent of middleware, per `AGENTS.md` §13's
  "every layer enforces it" rule.
- Dashboard queries use the service-role client (since they aggregate across all
  users' data, which RLS would otherwise block) — but only from this
  admin-role-gated layout/page tree, never exposed to a buyer-reachable route.

## Security requirements

- Non-admins cannot reach `/admin` even with a valid session (verified at
  middleware, layout, and query level — three independent checks).
- Service-role client usage confined to `lib/supabase/queries/admin/*`.

## Acceptance criteria

- `/admin` renders correct live counts/alerts/activity for a seeded admin test
  environment.
- A non-admin session hitting `/admin` is blocked, not shown a broken/empty
  dashboard.
- Layout matches spec at mobile/desktop.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test`
  ("unauthorized admin access" test per `AGENTS.md` §19).

## Manual test steps

1. `npm run dev`; sign in as an admin test account; visit `/admin`.
2. Confirm stat tiles, needs-attention list, and activity feed reflect real seeded
   data.
3. Sign in as a non-admin; attempt `/admin` — confirm it's blocked.
4. Temporarily disable middleware's admin check (dev-only, revert after) and
   confirm the layout-level check still blocks non-admins — verifying
   defense-in-depth, not just middleware.
5. Resize to ~375px and ~1440px — confirm layout matches spec.
