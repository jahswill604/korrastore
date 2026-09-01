<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Feature 01: Project Foundation (KorraStore)

## Architecture & Layering Rules
- **Framework**: Next.js 16 (App Router) + TypeScript.
- **Supabase Clients**:
  - `lib/supabase/client.ts`: Browser anon key client.
  - `lib/supabase/server.ts`: Server cookie-bound client via `@supabase/ssr`.
  - `lib/supabase/service.ts`: Service-role client guarded by `import "server-only"`.
- **Environment Scaffolding**: `.env.example` must contain safe placeholders for `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`, `RESEND_API_KEY`, `TERMII_API_KEY`.
- **Testing & Tooling**: `package.json` scripts must include `dev`, `build`, `start`, `lint`, `typecheck`, `test`.
- **Documentation**: All new/updated code must include inline file & block comments and be recorded in `docs/overview.md`.

# Feature 02: Design System (KorraStore)

## Design System & Token Rules
- **Theme**: Strictly Light Mode Only. No dark mode, no `.dark` CSS class, no `ThemeToggle` component, no per-theme token block.
- **Color Tokens**:
  - `Harvest Wheat` (`#D8B56A`): Primary accent, CTAs, active states, focus rings.
  - `Husk` (`#A88958`): Secondary accent, muted highlights, hover states.
  - `Soil` (`#4A3828`): Primary text, high-emphasis content.
  - `Deep Grain Green` (`#21483A`): Success, positive value change, "stored" status.
  - `Trust Indigo` (`#303B63`): Links, informational badges, secondary CTAs.
  - `Paper` (`#F7F4EA`): Page background, card fill base.
  - `Border` (`#E4DCC8`): Card & divider borders.
  - `Danger` (`#B3432E`), `Warning` (`#C7862B`).
- **Typography Tokens**:
  - Display / Hero: `DM Serif Display`
  - UI / Body: `Inter`
  - Numbers / Prices: `IBM Plex Mono`
- **Core Primitives**: `Button`, `Card`, `LedgerReceipt`, `PriceDisplay`, `GradeBadge`, `QuantitySelector`, `StatusStepper`, `Avatar`, `Badge`, `Tabs`, `Modal`, `Toast`, `Skeleton`, `EmptyState`, `Pagination`, `NavRail`, `BottomTabBar`, `AppShell`.
- **Showcase Route**: `/design-system` page displaying all primitives and swatches.

# Feature 03: Database Schema & RLS (KorraStore)

## Database Schema & Ledger Architecture Rules
- **Tables (16 Core Tables)**:
  - Identity & Access: `profiles`
  - Catalog & Warehouses: `commodities`, `commodity_grades`, `warehouses`, `inventory`, `inventory_movements`
  - Orders & Payments: `orders`, `order_items`, `payments`
  - Holdings & Ledger: `holdings`, `holding_movements`, `receipts`
  - Resale Marketplace: `resale_listings`, `resale_transactions`
  - Buyback & Pricing: `buyback_requests`, `price_history`
  - System: `notifications`, `audit_logs`
- **Data Integrity & Ledger Rules**:
  - All commodity quantity, unit price, total price, and fee columns MUST use `numeric` (arbitrary-precision decimal), never `integer` or `float`/`real`.
  - Holdings are never permanently 1:1 with orders (can split on resale or partial delivery).
  - `holdings.current_value` is NOT stored; computed dynamically (`quantity * commodities.current_price`).
  - `inventory_movements` and `holding_movements` are immutable append-only ledgers of record.
  - Client role (`anon`/`authenticated`) has ZERO write access (`insert`/`update`/`delete`) to ledger tables (`inventory_movements`, `holding_movements`, `audit_logs`) — Service Role only.
- **Row Level Security (RLS)**:
  - RLS enabled on all tables without exception.
  - Strict ownership policies (`auth.uid() = user_id`) for financial and personal data (`orders`, `holdings`, `payments`, `receipts`, `buyback_requests`, `notifications`).
  - Public views (`resale_listings_public`, `holdings_with_current_value`) sanitize seller identification and compute live valuations safely.
- **Concurrency & Locking**:
  - Atomic RPC functions with `FOR UPDATE` row-level locks for reserving/releasing holding quantities to prevent double-spending or race conditions.

# Feature 04: Auth Pages & Role-Based Routing (KorraStore)

## Authentication & Routing Rules
- **One Login, Two Experiences**:
  - Unified authentication interface at `/login` and `/signup`.
  - After login, the server queries `profiles.role` for the authenticated `user_id`.
  - If `role = 'admin'` → redirect to `/admin`.
  - If `role = 'user'` → redirect to `/home` (or validated `redirect` query parameter; disallowed admin paths are redirected to `/home`).
- **Session Verification**:
  - Middleware and Server Components MUST use `supabase.auth.getUser()` to re-verify session authenticity against Supabase Auth servers (never trust raw unverified `getSession()`).
- **Route Protection**:
  - Protected Buyer routes (`/home`, `/commodities/*`, `/checkout`, `/orders/*`, `/my-storage`, `/receipts/*`, `/resale/*`, `/buyback/*`, `/notifications`, `/profile`): Session required; redirects unauthenticated visitors to `/login?redirect=<path>`.
  - Protected Admin routes (`/admin`, `/admin/*`): Session + `profiles.role = 'admin'` required; non-admins receive redirect to `/home` or 403.
  - Public routes: `/`, `/login`, `/signup`, `/verify-phone`.
- **Client Auth State**:
  - No global `<AuthProvider>` context.
  - Server components fetch state on demand.
  - Client components needing live auth state use `useUser()` hook backed by `supabase.auth.onAuthStateChange`.
- **Security Guardrails**:
  - `SUPABASE_SERVICE_ROLE_KEY` is strictly prohibited in client components and public route handlers.
  - Logout clears session cookies and calls `supabase.auth.signOut()` server-side.
- **Verification Policy**:
  - Account verification is sent strictly to the user's registered email address.
  - Phone number verification (SMS OTP) is disabled for now; signups route to an email confirmation prompt.
- **Duplicate Email Prevention**:
  - When a user attempts to register with an email address that already exists in the system (`profiles` or Supabase Auth), signup MUST return an explicit error banner stating: "An account with this email address already exists. Please log in instead or use a different email."
  - The system MUST NOT trigger new verification emails or proceed to OTP verification for already registered emails.


# Feature 06: Home / Marketplace Browse (KorraStore)

## Marketplace & Commodity Browsing Rules
- **Entry Point**: `/home` (and `/`) is the primary buyer dashboard and commodity marketplace matching `desktop-ui.png` and `mobile-ui.png`.
- **Server-Side Data Fetching**: `app/home/page.tsx` & `app/page.tsx` MUST be Server Components fetching commodity catalog, prices, and stock via Supabase server client `getMarketplaceCommodities(filters)`.
- **Header & Navigation Layout**:
  - `AppShell` renders top header with KorraStore logo ("🌾 KorraStore"), floating rounded search bar ("Search commodities..."), notification bell, and user avatar.
  - `NavRail`: Collapsible desktop sidebar with toggle button (expanded 240px / collapsed 72px icon rail) featuring 9 vertical action items with filled gold active indicator (`#D8B56A`).
  - `BottomTabBar`: Sticky mobile bottom navigation bar with 5 key tabs.
- **Market Ticker**: Top trend summary cards (3-column grid on desktop with mini SVG sparkline graphs for Rice, Garlic, Beans; horizontal scrollable strip on mobile).
- **URL-Based Filter & Sort State**: Filter by commodity type (`All`, `Rice`, `Garlic`, `Beans`, `Melon`) and sort dropdown (`Sort: Price ∨`) strictly driven by URL search parameters (`?type=...&sort=...`).
- **Commodity Cards**:
  - Desktop: 4-column grid layout with light beige thumbnail `#F5EFE0`, `[ Premium ]` dark green badge, DM Serif title, IBM Plex Mono price, monthly trend badge, stock availability, and dual action buttons (`View Details` + `Buy Now`).
  - Mobile: Horizontal list layout with grade tag overlay on image, title + Premium badge, price + trend pill, stock availability, and full-width `Buy Now` gold button.
- **Light Mode & Design Tokens**: Strictly follow Light Mode tokens (`Harvest Wheat` #D8B56A, `Paper` #F7F4EA, `Soil` #4A3828, `Deep Grain Green` #21483A).
- **No Client Calculations**: Prices and inventory MUST come strictly from `commodities` and `inventory` tables, never computed or mocked client-side.


# Feature 07: Commodity Details (KorraStore)

## Commodity Details Rules
- **Route**: `/commodities/[commodityId]`.
- **Server-Side Data Fetching**: `app/commodities/[commodityId]/page.tsx` MUST be a Server Component fetching single commodity details, per-grade prices and availability, and `price_history` via `getCommodityDetails(commodityId)`.
- **Interactive Purchase Panel & Grade Selection**:
  - Segmented grade selector (`Grade A`, `Grade B`, `Grade C`) using `GradeBadge` styling updates current price (`PriceDisplay`, `numeric-lg`) and available stock in real-time.
  - "Buy Now" button routes to `/checkout?commodityId=...&gradeId=...`.
  - If selected grade stock is 0, render disabled button + "Currently unavailable — check back soon" notice.
- **Price History Chart**:
  - Interactive Recharts line chart showing price trends with range selector (`7d`, `30d`, `90d`, `All`).
  - Line color: `Harvest Wheat` (`#D8B56A`), area fill background, grid `#E4DCC8`, styled within a `Card`.
- **Storage & Fulfillment Info**:
  - Static descriptive block detailing storage standards ("Stored in climate-controlled KorraStore warehouses; request delivery anytime from My Storage").
- **Layouts**:
  - Desktop (≥1024px): 2-column layout (~60% hero photo + title + description + storage info; ~40% sticky purchase panel) + full-width price history chart below.
  - Mobile (<640px): Stacked layout with sticky bottom CTA bar above navigation rail.
# Feature 08: Checkout (KorraStore)

## Checkout & Payment Initialization Rules
- **Route**: `/checkout` (protected buyer route; session required via `supabase.auth.getUser()`).
- **Server Component Layering**:
  - `app/checkout/page.tsx` is a Server Component reading `commodityId` and `gradeId` (plus optional `qty`) from search parameters.
  - Re-fetches commodity, grade, and live available inventory from Supabase (`getCheckoutCommodity`) to prevent stale/tampered pricing from client.
- **Client Form & Interactions**:
  - `components/checkout/order-review-form.tsx` is the client boundary handling quantity stepper (clamped between 1 and live stock), unit mode toggle (retail/bulk), and reactive price breakdown.
  - Price Breakdown: Unit price, Quantity, Subtotal, Platform fee (1% capped at ₦5,000), and Total highlighted in `Harvest Wheat` (`#D8B56A`).
- **Security & Payment Abstraction**:
  - `PAYSTACK_SECRET_KEY` is strictly server-only, never referenced in client code.
  - Domain payment integration abstracted via `PaymentProvider` interface (`lib/domain/payments/provider.ts`) and implemented by `PaystackAdapter` (`lib/domain/payments/paystack-adapter.ts`).
  - Amounts converted to integer kobo (`amountKobo = Math.round(total * 100)`) for Paystack API transactions.
- **Order Pipeline**:
  - Submitting checkout posts to `/api/orders` which re-validates available inventory server-side.
  - Inserts `orders` row with status `pending_payment` and `order_items` record with arbitrary-precision `numeric` prices/quantities.
  - Order ID is used as Paystack reference for deterministic webhook matching in Feature 26.
  - Returns `authorizationUrl` to redirect buyer to Paystack's hosted checkout page.

# Feature 09: Order Tracking (KorraStore)

## Order Tracking & Fulfillment Rules
- **Routes**:
  - `/orders`: Buyer's order history list (Server Component) with URL-driven status filter tabs (`All`, `In Progress`, `Stored`, `Delivered`, `Cancelled`).
  - `/orders/[orderId]`: Order tracking and detail view (Server Component) showing fulfillment lifecycle progression and pricing summary.
- **Server-Side Data Fetching & Security**:
  - All queries strictly verified with `auth.uid() = user_id`. If `orderId` does not match the authenticated user's ID, return 404 (do not leak existence).
  - Data fetched via `getBuyerOrders(userId, filters)` and `getOrderDetail(userId, orderId)` in `lib/supabase/queries/orders.ts`.
- **Fulfillment vs Payment Status Separation**:
  - `StatusStepper` reflects physical commodity fulfillment stages only: `Order Placed` (`pending_payment`) → `Sourcing Verified` (`sourcing`) → `In Transit` (`in_transit`) → `Stored in Korra Silo` (`stored`) / `Delivered` (`delivered`).
  - Payment status from `payments` table (`paid`, `pending`, `failed`) is rendered as an independent status `Badge`, never merged into the fulfillment stepper.
- **Terminal & Edge States**:
  - Cancelled or payment-failed orders render a contextual alert card (`Order Cancelled` / `Payment Failed`) with actionable guidance, bypassing the stepper.
  - Empty orders list renders `EmptyState` guiding the buyer back to `/home`.
- **Holdings & Receipt Linkage**:
  - When order status reaches `stored`, the detail view dynamically exposes links to the corresponding holding in `/my-storage` and warehouse receipt in `/receipts/[receiptId]`.
- **Navigation Integration**:
  - `AppShell` with active `Orders` nav rail pill (`#D8B56A`) on desktop and active `Orders` bottom tab on mobile.
- **Design Tokens**:
  - Strictly light mode tokens (`Harvest Wheat` #D8B56A, `Paper` #F7F4EA, `Soil` #4A3828, `Deep Grain Green` #21483A).

# Feature 10: My Storage / Portfolio (KorraStore)

## My Storage & Holdings Portfolio Rules
- **Route**: `/my-storage` (protected buyer route; session required via `supabase.auth.getUser()`).
- **Server-Side Data Fetching**:
  - `app/my-storage/page.tsx` MUST be a Server Component.
  - Data fetched via `getBuyerHoldings(userId)` and `getPortfolioSummary(userId)` in `lib/supabase/queries/holdings.ts`.
  - Both functions query from the `holdings_with_current_value` view — never from raw `holdings` alone.
- **Ledger & Valuation Rules**:
  - Each `holdings` row is rendered as its own card — NEVER merge holdings across different purchases even if same commodity/grade (holdings may have different purchase prices/dates).
  - `current_value` is NEVER stored. It is always computed as `quantity × commodities.current_price` at read time from the shared `holdings_with_current_value` view.
  - `reserved_quantity` is NEVER stored. It is always computed from active `resale_listings` (status `active`) + `buyback_requests` (status `pending` or `approved`) at query time.
- **Quantity Display**:
  - Holdings cards MUST display `available_quantity` and `reserved_quantity` separately ("X kg available / Y kg reserved").
  - If reserved_quantity is 0, show only "X kg available".
  - Action buttons MUST be disabled if `available_quantity === 0`.
- **Portfolio Summary**:
  - Top-level summary strip showing: Total Portfolio Value, overall gain/loss delta, and total holdings count.
  - Computed server-side — never re-derived client-side.
- **Action Buttons**:
  - "Resell" → `/resale/create?holdingId=[id]` (stub with "Coming soon" toast if route not built).
  - "Request Buyback" → `/buyback/request?holdingId=[id]` (stub with "Coming soon" toast if route not built).
  - "Request Delivery" → `/delivery/request?holdingId=[id]` (stub for v1).
- **Component Architecture**:
  - `components/my-storage/portfolio-summary.tsx`: Server Component — top portfolio stats strip.
  - `components/my-storage/holding-card.tsx`: Server Component — individual ledger-style holding card.
  - `components/my-storage/holding-actions.tsx`: Client Component (`"use client"`) — action button row with routing and toast dispatch.
- **Empty State**: `EmptyState` with message "Nothing in storage yet — make your first purchase" linking to `/home`.
- **Navigation Integration**:
  - `AppShell` with active `My Storage` nav rail pill (`#D8B56A`) on desktop and active `Storage` bottom tab on mobile.
- **Design Tokens**:
  - Strictly light mode tokens (`Harvest Wheat` #D8B56A, `Paper` #F7F4EA, `Soil` #4A3828, `Deep Grain Green` #21483A). No dark mode.

# Feature 11: Receipt Detail (KorraStore)

## Receipt Detail & Ownership Verification Rules
- **Route**: `/receipts/[receiptId]` (protected buyer route; session required via `supabase.auth.getUser()`).
- **Server-Side Data Fetching**:
  - `app/receipts/[receiptId]/page.tsx` MUST be a Server Component fetching receipt details, underlying holding/order information, and live commodity valuation via `getReceiptDetail(userId, receiptId)`.
- **Security & Authorization**:
  - All receipt queries MUST verify ownership (`auth.uid() = user_id`). If the receipt does not belong to the user or does not exist, return 404 (not found).
- **Physical Ledger Ticket Presentation**:
  - Renders the signature full-size `LedgerReceipt` component with perforated top edge, dark green ribbon header, commodity metadata, `GradeBadge`, purchase value, live current market valuation, unrealized gain/loss percentage badge, warehouse location, and receipt identifier.
- **Dynamic Live Valuation**:
  - Current market valuation MUST be computed live from the current commodity price and holding quantity — never frozen or stored statically.
- **Download Action**:
  - "Download Receipt" action generates a short-lived (60s) signed URL via Supabase Storage (`/api/receipts/[receiptId]/download`) or browser print/export fallback for record-keeping.
- **Not-Yet-Generated State**:
  - If an order has not yet generated a receipt, display a clean placeholder notice rather than a broken layout.
- **Design Tokens**:
  - Strictly light mode tokens (`Harvest Wheat` #D8B56A, `Paper` #F7F4EA, `Soil` #4A3828, `Deep Grain Green` #21483A).

# Feature 12: Resale Marketplace (KorraStore)

## Resale Marketplace & Peer-to-Peer Browsing Rules
- **Route**: `/resale` (buyer-facing peer-to-peer commodity marketplace).
- **Server-Side Data Fetching**:
  - `app/resale/page.tsx` MUST be a Server Component.
  - Data fetched via `getActiveResaleListings(filters)` in `lib/supabase/queries/resale.ts`.
  - All queries strictly read from the `resale_listings_public` view — NEVER from the base `resale_listings` table directly in buyer-facing views to guarantee seller anonymity.
- **Seller Anonymity & Data Isolation**:
  - Seller identity (name, email, phone number, user ID) is strictly stripped and never exposed in client bundles or public API responses.
  - Render an anonymized seller badge/label (e.g., "KorraStore Seller #4821" or short hash identifier).
- **Listing Cards & Marketplace Layout**:
  - Desktop: 3-column grid of listing cards featuring commodity name, `GradeBadge`, available quantity in kg, asking unit price, total price (`PriceDisplay`), anonymized seller label, listing date, and "Buy Listing" button.
  - Mobile: Horizontally scrollable filter tabs + single-column stacked listing cards with responsive layout.
- **Concurrency & Purchase Integrity**:
  - Direct purchase flow initiates a checkout order referencing the resale listing.
  - Listing reservation locks must be verified atomically via database RPC functions (`FOR UPDATE` row lock) to prevent simultaneous double-purchasing by competing buyers.
- **Filter & Sort State**:
  - URL-driven search parameters (`?type=...&sort=...`) matching `/home` marketplace paradigms.
- **Empty & Loading States**:
  - Render `EmptyState` when no listings match active filter criteria.
- **Design Tokens**:
  - Strictly light mode tokens (`Harvest Wheat` #D8B56A, `Paper` #F7F4EA, `Soil` #4A3828, `Deep Grain Green` #21483A, `Border` #E4DCC8, `Paper` #F7F4EA). No dark mode.

# Feature 13: Create & Manage Resale Listings (KorraStore)

## Resale Creation & Listing Management Rules
- **Seller-Side Entry Points**:
  - Resale creation modal (`CreateListingModal`) launched from the "Resell" button on holding cards in `/my-storage`.
  - Seller dashboard at `/resale/my-listings` (Server Component) to manage active, sold, expired, and cancelled listings.
- **Reservation & Ledger Architecture**:
  - Resale creation MUST atomically reserve quantity on the seller's holding (`available_quantity = holding.quantity - holding.reserved_quantity`).
  - Attempting to list more than the non-reserved available quantity is strictly rejected.
  - Creation reserves quantity via database RPC function in the same transaction as inserting into `resale_listings`.
  - Cancelling a listing (`/api/resale/[id]/cancel`) MUST atomically release the exact reserved quantity back to the holding and set status to `cancelled`.
  - Price editing (`/api/resale/[id]/price`) allows updating `unit_price` in-place while status is `active` without modifying holding reservation.
  - Quantity modifications require cancelling and re-creating the listing to preserve reservation invariants.
- **Expiration & Lifecycle**:
  - Listing creation supports duration options (7, 14, 30 days; default 30 days) setting `expires_at`.
- **My Listings Dashboard**:
  - Desktop: Max-width ~900px, URL-driven status `Tabs` (`Active`, `Sold`, `Expired`, `Cancelled`), listing rows (`Card`) displaying commodity title, `GradeBadge`, listed quantity, unit asking price, live status `Badge`, date listed, and action triggers ("Edit Price", "Cancel Listing").
  - Mobile: Horizontally scrollable status filter tabs with full-width responsive listing cards.
- **Authorization & Security**:
  - A user can only list, price-edit, or cancel listings belonging to their own holdings and user ID (`auth.uid() = user_id`).
- **Design Tokens**:
  - Strictly light mode tokens (`Harvest Wheat` #D8B56A, `Paper` #F7F4EA, `Soil` #4A3828, `Deep Grain Green` #21483A, `Border` #E4DCC8, `Paper` #F7F4EA). No dark mode.

# Feature 14: Buyback Flow (KorraStore)

## Buyback Request & Liquidation Rules
- **Direct Platform Liquidation**:
  - Buyback is user → KorraStore directly, completely separate from peer-to-peer resale.
  - Entry points: "Request Buyback" action button on holding cards in `/my-storage` launches `RequestBuybackModal`.
  - Dashboard route: `/buyback` (Server Component) with URL-driven status filter tabs (`All`, `Pending`, `Approved`, `Paid`, `Declined`).
  - Detail route: `/buyback/[requestId]` (Server Component) with vertical status progression timeline.
- **Pricing & Valuation Architecture**:
  - `commodities.buyback_price` is an admin-controlled price column, distinct from the retail `current_price`.
  - Never cached or mocked on client; fetched live at time of request.
- **Reservation & Concurrency Locking**:
  - Submitting a buyback request atomically reserves holding quantity via `reserve_holding_quantity` RPC.
  - Attempting to liquidate more than `available_quantity` is strictly rejected.
  - Inserts `holding_movements` record with type `buyback_lock`.
- **Status Lifecycle & Timeline**:
  - `Submitted` → `Under Review / Approved / Declined` → `Paid` (Payout Settled).
  - Admin rejection unlocks reserved holding quantity via `release_holding_quantity` RPC with type `buyback_release`.
  - Approval and payment settlement are admin-only operations (Feature 21).
- **Authorization & Security**:
  - A user can only submit buyback requests against their own holdings (`auth.uid() = user_id`).
  - Request detail queries verify user ownership (return 404 on mismatch to avoid leaking IDs).
- **Design Tokens**:
  - Strictly light mode tokens (`Harvest Wheat` #D8B56A, `Paper` #F7F4EA, `Soil` #4A3828, `Deep Grain Green` #21483A, `Border` #E4DCC8). No dark mode.

# Feature 15: Notifications Center (KorraStore)

## Notifications Center & Outbox Rules
- **Route**: `/notifications` (protected buyer route; session required via `supabase.auth.getUser()`).
- **Unified Notification Outbox**:
  - In-app notifications are backed by the same `notifications` outbox table used for email/SMS delivery.
  - The `channel` column supports `'in_app'` alongside `'email'` and `'sms'`.
  - Notifications are generated automatically by domain lifecycle events: order status changes, resale purchases/sales, buyback status updates, and price alert movements.
- **Server-Side Data Fetching**:
  - `app/notifications/page.tsx` MUST be a Server Component fetching user notifications via `getInAppNotifications(userId, filters)`.
  - All queries strictly scoped to `auth.uid() = user_id`.
  - Filter state (`All`, `Unread`, `Orders`, `Resale`, `Buyback`, `Pricing`) is URL-driven.
- **Unread State & Header Badge**:
  - Unread count is queried using an efficient indexed count query (`getUnreadCount(userId)`).
  - Unread count badge is rendered in the global navigation (`NavRail`, `BottomTabBar`, header bell).
  - Unread notification rows display a distinctive Harvest Wheat left border accent and status indicator dot.
- **Interactive Actions & Navigation**:
  - Clicking an in-app notification navigates to the target resource (`/orders/[id]`, `/resale/my-listings`, `/buyback/[id]`, `/commodities/[id]`) and marks the notification as read via `POST /api/notifications/[id]/read`.
  - "Mark all as read" button calls `POST /api/notifications/read-all` to clear all unread statuses for the authenticated user.
- **Security & Authorization**:
  - Users can strictly only view, mark as read, or interact with notifications belonging to their own `user_id`.
- **Design Tokens**:
  - Strictly light mode tokens (`Harvest Wheat` #D8B56A, `Paper` #F7F4EA, `Soil` #4A3828, `Deep Grain Green` #21483A, `Border` #E4DCC8, `Paper` #F7F4EA). No dark mode.

# Feature 16: Profile & Account Settings (KorraStore)

## Profile & Account Management Rules
- **Route**: `/profile` (protected buyer route; session required via `supabase.auth.getUser()`).
- **Scope & Model**:
  - Identity and account management only: full name, avatar placeholder/initials, email address, phone number, and security/account termination actions.
  - No subscription billing, payment plans, or saved credit cards (KorraStore is commodity-direct, not a SaaS product).
- **Server-Side Data Fetching**:
  - `app/profile/page.tsx` MUST be a Server Component fetching the authenticated user's profile from `profiles` table via `getProfile(userId)`.
  - Scoped strictly to `auth.uid() = user_id`.
- **Form Sections & Client Boundaries**:
  - Profile Section: Display name, initials avatar, role badge (`user` / `admin`), member since timestamp. Updates written directly to `profiles` scoped to `auth.uid()`.
  - Contact Section: Email address and phone number changes MUST trigger Supabase Auth's verified change flows (`supabase.auth.updateUser({ email })` or `supabase.auth.updateUser({ phone })`), never direct silent database overwrites.
  - Security & Account Section: Password update trigger, active session logout, and destructive account deletion.
- **Account Deletion Safety & Financial Invariants**:
  - Account deletion is a protected destructive flow requiring explicit two-step confirmation (typing "DELETE").
  - Server-side guard strictly blocks account deletion (`POST /api/account/delete`) if the user has:
    1. Active non-zero holdings in storage (`quantity > 0`).
    2. Open unfulfilled orders (`status IN ('pending_payment', 'sourcing', 'in_transit')`).
    3. Active peer-to-peer resale listings (`status = 'active'`).
    4. Pending or approved buyback requests awaiting payout (`status IN ('pending', 'approved')`).
  - If financial holdings or active trades exist, return a descriptive error explaining why deletion cannot proceed until liquidated or delivered.
  - If clear, administrative deletion deletes the auth user, records an audit log entry in `audit_logs`, and signs out the session.
- **Design Tokens**:
  - Strictly light mode tokens (`Harvest Wheat` #D8B56A, `Paper` #F7F4EA, `Soil` #4A3828, `Deep Grain Green` #21483A, `Border` #E4DCC8, `Paper` #F7F4EA, `Danger` #B3432E). No dark mode.

# Feature 17: Admin Dashboard (KorraStore)

## Admin Dashboard & Navigation Rules
- **Route**: `/admin` (admin-only landing & operational control dashboard).
- **Triple-Layer Role Enforcement (Defense in Depth)**:
  - Middleware: Enforces `profiles.role = 'admin'` for all `/admin/*` routes.
  - Layout Server Component: `app/admin/layout.tsx` re-verifies session authenticity (`supabase.auth.getUser()`) and database role (`profiles.role === 'admin'`). Non-admins or unauthenticated sessions are immediately redirected to `/home` or `/login`.
  - Query Layer: Service-role aggregations in `lib/supabase/queries/admin/*` are strictly isolated from client-accessible endpoints.
- **Admin App Shell**:
  - `AdminNavRail` (Desktop ≥1024px): Permanent left sidebar (~240px wide, denser than buyer navigation, text labels always visible). Features links to: Dashboard, Orders, Inventory, Pricing, Resale & Buybacks, Reports, Support, Settings, plus a bottom quick switch link to buyer store (`/home`).
  - `AdminBottomTabBar` (Mobile <640px): Sticky bottom bar for quick admin navigation on small screens.
  - `AdminHeader`: Top title bar showing page context, live time, status indicator, and admin profile badge.
- **Operational Metrics**:
  - Stat tiles for: Open Orders, Pending Buybacks, Active Resale Listings, Low-Inventory Alerts, and Total Platform Commodity Value.
  - Read-only live aggregation — clicking any stat navigates to the dedicated management page.
- **Needs Attention & Audit Feeds**:
  - "Needs Attention" panel surfaces priority operational alerts (critical low stock, pending buybacks, processing orders) with direct action links.
  - "Recent Activity" feed streams latest operations from `audit_logs`.
- **Design Tokens**:
  - Strictly light mode tokens (`Harvest Wheat` #D8B56A, `Paper` #F7F4EA, `Soil` #4A3828, `Deep Grain Green` #21483A, `Border` #E4DCC8, `Paper` #F7F4EA, `Danger` #B3432E, `Warning` #C7862B). No dark mode.

# Feature 18: Admin Orders (KorraStore)

## Admin Order Management & Fulfillment Rules
- **Routes**:
  - `/admin/orders`: Admin all-orders list with URL-driven status tabs (`All`, `Pending Payment`, `Sourcing`, `In Transit`, `Stored`, `Delivered`, `Exceptions`, `Cancelled`), buyer/order-ID search, and dense tabular layout.
  - `/admin/orders/[orderId]`: Admin order detail view with status advancement control, fulfillment stepper, buyer information, payment record, and exception reconciliation triage panel.
- **Strict Role & Route Protection**:
  - Layout, page, and API routes strictly gated by `profiles.role === 'admin'` and authenticated Supabase session.
- **Controlled Status Advancement**:
  - Status updates are NOT free-form text. They are strictly validated server-side against an explicit allowed transitions state machine:
    - `pending_payment` → `cancelled` (or webhook-driven to `sourcing`)
    - `sourcing` → `in_transit`, `exception`, `cancelled`
    - `in_transit` → `stored`, `delivered`, `exception`, `cancelled`
    - `exception` → requires explicit reconciliation action (ledger allocation or refund & cancel)
    - `stored` / `delivered` / `cancelled` → terminal states (no forward transitions)
- **Exception & Reconciliation State**:
  - Orders where payment succeeded but physical inventory could not be allocated are flagged with an `exception` badge.
  - Detail view renders an `ExceptionResolutionPanel` requiring explicit admin resolution ("Allocate from Warehouse" via Ledger RPC or "Refund & Cancel").
  - Ledger invariants must be preserved: never mutate `orders` or `inventory` directly without corresponding ledger entries.
- **Immutable Audit Logging**:
  - Every status transition or exception resolution MUST record an entry in `audit_logs` within the same transaction/operation containing: admin ID, order ID, old status, new status, timestamp, and action metadata.
- **Design Tokens**:
  - Strictly light mode tokens (`Harvest Wheat` #D8B56A, `Paper` #F7F4EA, `Soil` #4A3828, `Deep Grain Green` #21483A, `Trust Indigo` #303B63, `Border` #E4DCC8, `Paper` #F7F4EA, `Danger` #B3432E, `Warning` #C7862B). No dark mode.

# Feature 19: Admin Inventory & Warehouses (KorraStore)

## Admin Inventory Management Rules
- **Route**: `/admin/inventory` (admin-only; triple-layer role enforcement: middleware + layout + API).
- **Three-Tab Structure**:
  - `Inventory Balances`: Per-commodity/grade/warehouse inventory lines with physical stock, computed reserved quantity, and available stock. Actions: "Adjust Stock" + "View Ledger History".
  - `Commodities & Grades`: CRUD for commodities (name, description, unit, prices, active toggle) and their nested grades. Does NOT touch inventory quantities.
  - `Warehouses`: CRUD for warehouse locations (name, location, capacity, active toggle).
- **Ledger-Only Quantity Rule (Non-Negotiable)**:
  - Every inventory quantity change MUST go through `adjustInventory(inventoryId, delta, reason, adminId)` in `lib/domain/ledger/inventory-ledger.ts`.
  - This function atomically: (1) INSERTs an `inventory_movements` row (`type=ADJUSTMENT`, signed delta, required reason, admin_id), (2) UPDATEs `inventory.quantity`, and (3) INSERTs an `audit_logs` row — all in a single DB transaction.
  - Direct `UPDATE inventory SET quantity = ?` from any route handler or form is strictly forbidden.
  - Adjustment `reason` is required (non-empty string) and stored on the movement row.
- **Reserved Quantity Computation**:
  - `reserved_quantity` is NEVER stored on the `inventory` table.
  - It is always computed at query time as: `SUM(quantity) FROM resale_listings WHERE status='active'` + `SUM(quantity) FROM buyback_requests WHERE status IN ('pending','approved')` for the given inventory line.
- **Movement History**:
  - Each inventory line has a "View Ledger History" action opening `MovementHistoryModal`.
  - Displays all `inventory_movements` for that line, most-recent first: type badge, signed delta (IBM Plex Mono, green/red), reason, admin ID, timestamp.
- **Data Integrity Invariant**:
  - `inventory.quantity` MUST always equal `SUM(delta) FROM inventory_movements WHERE inventory_id = ?`.
  - Automated tests (`npm run test`) verify this balance consistency assertion.
- **Security**:
  - All mutations use `createServiceRoleClient()`. Zero client/anon-role writes.
  - Every adjustment inserts into `audit_logs` in addition to `inventory_movements`.
- **Design Tokens**:
  - Strictly light mode tokens (`Harvest Wheat` #D8B56A, `Paper` #F7F4EA, `Soil` #4A3828, `Deep Grain Green` #21483A, `Border` #E4DCC8, `Danger` #B3432E, `Warning` #C7862B). No dark mode.

# Feature 20: Admin Pricing (KorraStore)

## Admin Pricing & Valuation Propagation Rules
- **Route**: `/admin/pricing` (admin-only; triple-layer role enforcement: middleware + layout + API).
- **Pricing Scope & Invariants**:
  - Admin controls both **Sale Price** (retail marketplace price) and **Buyback Price** (direct platform liquidation price) per commodity (and per grade if grade pricing is configured).
  - Price updates MUST NEVER directly mutate `holdings` rows. Valuation propagation is strictly dynamic, computed at read time from the `holdings_with_current_value` view (`quantity * commodities.current_price`).
- **Atomic Price History Ledger & Pointer Sync**:
  - Every price change MUST insert a new row into `price_history` (commodity_id, grade_id, sale_price, buyback_price, admin_id, change_reason, effective_at).
  - In the same atomic database transaction, update the denormalized pointer columns (`commodities.current_price`, `commodities.buyback_price`, `commodities.updated_at`) so catalog reads remain O(1) while maintaining a complete, immutable audit trail of price changes.
- **Delta Preview & Confirmation Safeguards**:
  - Price updates impact every commodity holder's portfolio valuation platform-wide.
  - The UI MUST require a confirmation step displaying:
    - Absolute and percentage delta for Sale Price (e.g., `+₦50/kg (+4.2%)` in Deep Grain Green or `-₦30/kg (-2.5%)` in Danger).
    - Absolute and percentage delta for Buyback Price.
    - Contextual price history chart showing historical trajectory before committing.
- **Audit Logging**:
  - Every price change MUST insert a record into `audit_logs` (entity_type=`pricing`, action=`PRICE_UPDATE`, admin_id, old_values, new_values, metadata).
- **Layout & Responsiveness**:
  - Desktop (≥1024px): Table of commodities showing Name, Grade, Current Sale Price, Current Buyback Price, Last Updated timestamp, and "Update Price" action button. Selecting a commodity opens a dedicated update drawer/modal with delta preview, live inputs, and interactive Recharts price history chart.
  - Mobile (<640px): Stacked commodity cards with quick-action update trigger opening a full-screen sheet with the same delta preview and condensed price history chart.
- **Security & Authorization**:
  - All mutations use `createServiceRoleClient()`. Client/anon role has zero write access to pricing or `price_history`.
- **Design Tokens**:
  - Strictly light mode tokens (`Harvest Wheat` #D8B56A, `Paper` #F7F4EA, `Soil` #4A3828, `Deep Grain Green` #21483A, `Border` #E4DCC8, `Paper` #F7F4EA, `Danger` #B3432E, `Warning` #C7862B). No dark mode.

