# Feature 17: Admin Dashboard — Build Prompt

## Overview
Implement `/admin`: the central admin landing page, operational metrics overview, needs-attention triage feed, recent audit activity timeline, and persistent admin application shell (`AdminNavRail` and `AdminBottomTabBar`) for KorraStore. Provides real-time operational monitoring across orders, inventory, buyback requests, and resale listings with triple-layer defense-in-depth role protection across desktop and mobile in light mode.

## References & Design Artifacts
- **Prompt Spec**: `prompt/17-admin-dashboard.md` & `prompts/17-admin-dashboard.md`
- **Desktop UI Design**: `prompts/ui degine/17-admin-dashboard/desktop-ui.png`
- **Mobile UI Design**: `prompts/ui degine/17-admin-dashboard/mobile-ui.png`
- **Backend Workflow**: `prompts/backend-wookflow/17-admin-dashboard/workflow.png`
- **Implementation Spec**: `prompts/implementation/17-admin-dashboard.md`
- **Design System & Architecture Rules**: `AGENTS.md` Feature 02 & Feature 17

## Instructions for Agent
Strictly read all referenced files before writing any code. Follow all design tokens (Light mode only, Harvest Wheat `#D8B56A`, Soil `#4A3828`, Deep Grain Green `#21483A`, Paper `#F7F4EA`, Border `#E4DCC8`, Danger `#B3432E`, Warning `#C7862B`), defense-in-depth admin role verification (`getUser()` + `profiles.role === 'admin'`), inline code comments, and documentation rules.

## Core Implementation Steps
1. **Admin Query Layer**: `lib/supabase/queries/admin/dashboard.ts` — aggregate operational metrics, triage items, and recent audit logs using `createServiceRoleClient()`.
2. **Admin Layout & Navigation Shell**:
   - `components/admin/layout/admin-nav-rail.tsx` (desktop persistent sidebar with 8 admin sections and buyer switch link).
   - `components/admin/layout/admin-bottom-tab-bar.tsx` (mobile bottom navigation bar).
   - `components/admin/layout/admin-header.tsx` (top bar with breadcrumbs and live status).
   - `app/admin/layout.tsx` (Server Component layout enforcing server-side admin role check and rendering the admin shell).
3. **Dashboard Components**:
   - `components/admin/dashboard/stat-tile.tsx` (metric card with `IBM Plex Mono` values and deep links).
   - `components/admin/dashboard/needs-attention-list.tsx` (urgency-coded triage cards with action shortcuts).
   - `components/admin/dashboard/recent-activity-feed.tsx` (audit log activity timeline).
4. **Dashboard Page**: `app/admin/page.tsx` (Server Component fetching live aggregate metrics and rendering responsive desktop/mobile layouts).
