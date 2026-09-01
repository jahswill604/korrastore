# Prompt: Admin Reports & Analytics — KorraStore

## Goal

Build `/admin/reports`: platform-wide operational analytics — sales volume,
revenue, inventory turnover, resale activity, buyback volume, and portfolio value
across all users — using Recharts. Desktop + mobile, light mode only. Read-only
aggregation.

## Skills read

- `.agents/skills/supabase/SKILL.md` — cross-table aggregation queries, service-
  role admin reads.
- `02-design-system.md` — chart primitives, `Card`, `Tabs` (time-range selector).
- `AGENTS.md` §6 (Recharts).

## Existing code inspected

- `17-admin-dashboard.md` — this page is the full drill-down version of the
  dashboard's summary stat tiles.

## Decisions / assumptions

- **Time-range selector** (7d / 30d / 90d / All) drives every chart on the page,
  consistent with the buyer-facing analytics pattern used elsewhere in comparable
  apps.
- **Report sections:** Sales (orders count + revenue over time, by commodity),
  Inventory (turnover — quantity sold vs. quantity added over time, per
  commodity), Resale activity (listings created vs. sold over time), Buyback
  volume (requests + approved payout total over time), Portfolio (total value held
  across all users over time, as a platform-health indicator).
- **Export** is out of scope for v1 unless requested (no CSV/PDF export button) —
  keep this to on-screen charts/tables.

## Visual interpretation (light mode only)

### Layout — Desktop (≥1024px)
Time-range `Tabs` at top. Grid of report `Card`s (2 columns): each with a chart
(line for time-series, bar for per-commodity breakdowns) styled with KorraStore's
token colors, a short summary stat above the chart (e.g. total revenue in the
period), and a one-line description of what the chart shows.

### Layout — Mobile (<640px)
Time-range as a segmented control; report cards stack single-column full-width,
charts remain legible (avoid over-cramming multiple series on small screens — use
tabs within a card if a chart has more than 2–3 series on mobile).

## Files likely to change / add

- `app/admin/reports/page.tsx`.
- `components/admin/reports/time-range-tabs.tsx` (client), `report-card.tsx`,
  `sales-chart.tsx` (client), `inventory-turnover-chart.tsx` (client),
  `resale-activity-chart.tsx` (client), `buyback-volume-chart.tsx` (client),
  `portfolio-value-chart.tsx` (client).
- `lib/supabase/queries/admin/reports.ts` — one aggregation function per report
  section, aggregating in SQL/Postgres functions where reasonable rather than
  pulling raw rows and reducing in JS for large ranges.

## Implementation requirements

- Aggregation queries run server-side (service-role, admin-gated); charts are the
  only client components.
- Chart data always reflects real underlying rows — never mocked or estimated.

## Security requirements

- Admin-role-gated at layout, page, and API/query level.

## Acceptance criteria

- Every report section reflects real seeded data across the selected time range.
- Time-range selector correctly updates all charts.
- Layout matches spec at mobile/desktop.

## Checks to run

- `npm run typecheck`, `npm run lint`, `npm run build`.

## Manual test steps

1. `npm run dev`; sign in as admin with a reasonable amount of seeded order/
   resale/buyback history; visit `/admin/reports`.
2. Confirm each report section renders data matching what's actually in the
   database for the selected range.
3. Change the time range; confirm all charts update.
4. Resize to ~375px and ~1440px — confirm layout matches spec.
