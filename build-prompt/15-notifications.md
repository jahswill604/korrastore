# Feature 15: Notifications Center — Build Prompt

## Overview
Implement `/notifications`: an in-app notification center for KorraStore buyers to track order fulfillment events, resale transactions, buyback liquidation progress, and price trend alerts. Backed by the unified `notifications` outbox table (with `channel = 'in_app'`), supporting live unread badge counters, row click read-and-redirect interactions, and a "Mark all as read" capability across desktop and mobile in light mode.

## References & Design Artifacts
- **Prompt Spec**: `prompt/15-notifications.md` & `prompts/15-notifications.md`
- **Desktop UI Design**: `prompts/ui degine/15-notifications/desktop-ui.png`
- **Mobile UI Design**: `prompts/ui degine/15-notifications/mobile-ui.png`
- **Backend Workflow**: `prompts/backend-wookflow/15-notifications/workflow.png`
- **Implementation Spec**: `prompts/implementation/15-notifications.md`
- **Design System & Architecture Rules**: `AGENTS.md` Feature 02 & Feature 15

## Instructions for Agent
Strictly read all referenced files before writing any code. Follow all design tokens (Light mode only, Harvest Wheat `#D8B56A`, Soil `#4A3828`, Deep Grain Green `#21483A`, Paper `#F7F4EA`), RLS security constraints (`auth.uid() = user_id`), inline code comments, and documentation rules.

## Core Implementation Steps
1. **Database Schema & Queries**: `lib/supabase/queries/notifications.ts` — in-app notifications query, indexed unread count, single and bulk mark-as-read mutations.
2. **API Routes**:
   - `app/api/notifications/[id]/read/route.ts` (POST)
   - `app/api/notifications/read-all/route.ts` (POST)
3. **UI Components**:
   - `components/notifications/notification-row.tsx` (interactive row with type icons, unread dot/gold border, click-to-read and router navigation)
   - `components/notifications/mark-all-read-button.tsx` (header action button)
   - `components/notifications/notification-filters.tsx` (URL-driven filter chips)
4. **App Route**: `app/notifications/page.tsx` (authenticated Server Component inside `AppShell` with empty state handling)
5. **Navigation Badge Integration**: Wire live unread counter badge to the notification bell in header and navigation rail/bottom tab bar.
