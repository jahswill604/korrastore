# Feature 17: Admin Dashboard — Version Progress Archive

## Overview
This directory contains the complete codebase and UI component snapshot for **Feature 17: Admin Dashboard** of KorraStore.

## Key Capabilities
- **Triple-Layer Admin Defense in Depth**:
  - Middleware / Edge Proxy protection
  - Layout Server Component role verification (`getCurrentUser()` + `profiles.role === 'admin'`)
  - Elevated service-role queries isolated to administrative domains
- **Admin App Shell**:
  - Desktop 240px persistent `AdminNavRail` with 8 operational modules and buyer store link
  - Mobile sticky `AdminBottomTabBar` with 5 essential actions
  - `AdminHeader` with live silos synchronized status indicator and time counter
- **Operational Metrics**:
  - 5 Key KPI cards with `IBM Plex Mono` counters: Open Orders, Pending Buybacks, Resale Listings, Low Stock Alerts, and Total Silo Physical Assets Valuation.
- **Triage & Audit Streams**:
  - `NeedsAttentionList`: Urgency-prioritized queue for immediate administrative action.
  - `RecentActivityFeed`: Live stream of events from `audit_logs`.

## File Manifest
- `app/admin/layout.tsx`: Layout-level server component role validator and administrative shell.
- `app/admin/page.tsx`: Central dashboard page aggregating live operational statistics and feeds.
- `components/admin/layout/admin-nav-rail.tsx`: Persistent desktop admin navigation sidebar.
- `components/admin/layout/admin-bottom-tab-bar.tsx`: Mobile admin navigation bar.
- `components/admin/layout/admin-header.tsx`: Top header with live status pill.
- `components/admin/dashboard/stat-tile.tsx`: Reusable metric card.
- `components/admin/dashboard/needs-attention-list.tsx`: Triage panel.
- `components/admin/dashboard/recent-activity-feed.tsx`: Audit log stream.
