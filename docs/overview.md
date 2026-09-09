# KorraStore Code Overview & Documentation

This document provides a line-by-line and block-by-block breakdown of all files created or modified across KorraStore features.

---

## `AGENTS.md`
**Purpose**: System instructions, architecture standards, and feature guidelines for AI agents and developers.
**Used in**: Project root / AI context window.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L9 | Agent rules header | Mandatory Next.js breaking changes notification block. |
| L11–L23 | Feature 01 directives | Layering, Supabase client factories, environment variable standards, and verification scripts for Project Foundation. |

---

## `.env.example`
**Purpose**: Canonical template of required environment variables for local development and deployment environments.
**Used in**: Environment configuration template.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L4 | Header comment | Purpose and copying instructions for `.env.example`. |
| L6–L16 | Supabase Config | Placeholders for `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`. |
| L18–L24 | Paystack Config | Placeholders for `PAYSTACK_SECRET_KEY` and `PAYSTACK_PUBLIC_KEY`. |
| L26–L31 | Messaging Config | Placeholders for `RESEND_API_KEY` and `TERMII_API_KEY`. |

---

## `lib/types.ts`
**Purpose**: Shared domain TypeScript definitions and interface contracts across KorraStore.
**Used in**: Server Components, Client Components, Server Actions, and Domain Services.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L4 | File comment | Module description and usage guidelines. |
| L6–L8 | UserRole | Type definition for user roles (`'user' | 'admin'`). |
| L10–L16 | ApiResponse | Generic API response wrapper interface for Server Actions and endpoints. |
| L18–L23 | SystemStatus | Status interface for foundation infrastructure reporting. |

---

## `lib/supabase/client.ts`
**Purpose**: Browser Supabase client factory for public and client-side RLS queries.
**Used in**: Client Components (`"use client"`).

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File header | Safety and security guidelines for browser Supabase client. |
| L8 | Imports | Imports `createBrowserClient` from `@supabase/ssr`. |
| L10–L16 | `createClient()` | Factory function initializing and returning the browser client instance. |

---

## `lib/supabase/server.ts`
**Purpose**: Server Supabase client factory bound to Next.js session cookies via `@supabase/ssr`.
**Used in**: Server Components, Route Handlers, and Server Actions.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File header | Usage and security rules for cookie-bound server client. |
| L8–L9 | Imports | Imports `createServerClient` from `@supabase/ssr` and `cookies` from `next/headers`. |
| L11–L32 | `createClient()` | Async factory function binding Supabase auth session to request cookies. |

---

## `lib/supabase/service.ts`
**Purpose**: Administrative Service-Role Supabase client factory for domain services.
**Used in**: `lib/domain/` (Ledger, Payments, Valuation, Notifications).

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L5 | File header | Security rule: Marked with `import "server-only";`. Bypasses RLS. |
| L7–L8 | Imports | Imports `'server-only'` boundary and `createClient` from `@supabase/supabase-js`. |
| L10–L20 | `createServiceClient()` | Factory function creating service-role client with session persistence disabled. |

---

## `package.json`
**Purpose**: Package manifest, scripts, and dependencies for KorraStore.
**Used in**: Project root / npm runtime.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L4 | Metadata | Project name, version, and visibility settings. |
| L5–L12 | Scripts | Scripts for `dev`, `build`, `start`, `lint`, `typecheck`, and `test`. |
| L13-[#] | Dependencies | Next.js, React, Supabase SDKs (`@supabase/supabase-js`, `@supabase/ssr`, `server-only`), and Vitest. |

---

## `vitest.config.ts`
**Purpose**: Vitest test runner configuration for KorraStore automated unit tests.
**Used in**: `npm run test`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L4 | File header | Purpose and usage comments for Vitest test suite config. |
| L5–L6 | Imports | Imports `defineConfig` from `vitest/config` and `path` module. |
| L8–L18 | Configuration | Sets `passWithNoTests: true`, `environment: 'node'`, and path alias `@/*`. |

---

## `app/layout.tsx`
**Purpose**: Root HTML shell layout component for Next.js App Router.
**Used in**: Next.js root layout shell (`app/`).

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L4 | File header | Purpose and component location commentary. |
| L6 border | Font Config | Imports and instantiates Inter font and IBM Plex Mono font variables. |
| L21–L28 | Metadata | Configures KorraStore page title, description, and favicon. |
| L30–L43 | RootLayout | Component function rendering top-level `<html>` shell with font variables. |

---

## `app/page.tsx`
**Purpose**: Foundation landing placeholder view rendering platform status grid.
**Used in**: Public root route (`/`).

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L5 | File header | Route purpose and placeholder usage note. |
| L8–L34 | SYSTEM_STATUSES | Array of infrastructure readiness indicators and status badges. |
| L36–L95 | Home Component | Renders brand header, hero banner, status grid, and footer notice. |

---

# Feature 02: Design System

## `app/globals.css`
**Purpose**: Global CSS design token definitions and base light-mode styles for KorraStore.
**Used in**: `app/layout.tsx` (globally imported).

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L10 | File comment | Purpose and usage commentary. |
| L12 | Tailwind import | Imports Tailwind CSS v4 base. |
| L14–L27 | `:root` token block | Defines all color, font, spacing CSS custom properties (Harvest Wheat, Husk, Soil, Paper, etc.). |
| L29–L46 | `@theme` block | Binds CSS variables to Tailwind v4 color and font token names. |
| L48–L60 | `body` base styles | Applies Paper background, Soil text, Inter font, antialiasing. |
| L62–L75 | Font utility classes | `.font-serif-display`, `.font-sans-inter`, `.font-mono-plex` classes. |
| L77–L85 | Warm shadow utilities | `.shadow-soil-sm/md/lg` — warm Soil-tinted shadows instead of neutral gray. |
| L87–L96 | Receipt utilities | `.receipt-dashed-divider` and `.receipt-perforated-edge` CSS for ledger ticket motif. |

---

## `app/layout.tsx`
**Purpose**: Root HTML shell with Google Fonts (DM Serif Display, Inter, IBM Plex Mono) and light-mode body.
**Used in**: Next.js root layout (`app/`).

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L4 | File comment | Purpose and font loading description. |
| L6–L7 | Imports | `next/font/google` fonts and globals.css import. |
| L9–L15 | `dmSerifDisplay` | DM Serif Display font config with CSS variable `--font-serif-display`. |
| L17–L23 | `inter` | Inter font config with CSS variable `--font-sans-inter`. |
| L25–L31 | `ibmPlexMono` | IBM Plex Mono font config with CSS variable `--font-mono-plex`. |
| L33–L42 | `metadata` | SEO metadata (title, description, favicon). |
| L44–L57 | `RootLayout` | Root component injecting font CSS vars and Paper/Soil base styles. |

---

## `lib/utils.ts`
**Purpose**: Shared class merging utility via clsx + tailwind-merge.
**Used in**: All `components/ui/*` and `components/layout/*` primitives.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L3 | File comment | Utility function description and usage. |
| L5–L6 | Imports | `clsx` and `tailwind-merge` imports. |
| L8–L16 | `cn()` | Merges Tailwind class strings, resolving conflicting utilities. |

---

## `components/ui/button.tsx`
**Purpose**: Core Button primitive with 5 variants (primary/secondary/outline/ghost/destructive), 3 sizes, loading state.
**Used in**: All interactive forms, CTAs, modal footers, marketplace cards.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L4 | File comment | Component description and usage. |
| L8–L11 | `ButtonProps` interface | Extends HTML button with `variant`, `size`, `isLoading`. |
| L15–L28 | `baseStyles` | Universal shared button classes (font, focus ring, transition). |
| L30–L40 | `variants` map | Per-variant Tailwind class strings using CSS token variables. |
| L42–L47 | `sizes` map | sm/md/lg height, padding, and gap sizes. |
| L49–L74 | Component JSX | Renders button with optional spinner SVG during loading state. |

---

## `components/ui/card.tsx`
**Purpose**: Base Paper surface card container with warm shadow, border, and padding density options.
**Used in**: Portfolio, marketplace cards, receipt wrappers, design-system showcase.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L4 | File comment | Purpose and usage. |
| L8–L10 | `CardProps` interface | Extends HTML div with `padding` density preset. |
| L13–L40 | `Card` | Main container with Paper fill, border, shadow, rounded radius. |
| L42–L65 | Sub-components | `CardHeader`, `CardTitle`, `CardContent`, `CardFooter` layout helpers. |

---

## `components/ui/ledger-receipt.tsx`
**Purpose**: Signature physical commodity warehouse receipt ticket with perforated header, dashed dividers, valuation display.
**Used in**: Portfolio page, order detail, receipt modal, design-system showcase.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L4 | File comment | Signature motif description. |
| L9–L31 | `LedgerReceiptProps` | Interface with optional commodity, grade, valuation props (all with fallback defaults). |
| L34–L154 | Component JSX | Deep Grain Green header band, commodity name (DM Serif), quantity/grade row, dashed divider, price rows, footer microprint. |

---

## `components/ui/price-display.tsx`
**Purpose**: IBM Plex Mono price renderer with currency formatting and optional positive/negative delta badge.
**Used in**: Marketplace cards, portfolio valuation, checkout, admin tables.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L4 | File comment | Purpose and token rules. |
| L8–L14 | `PriceDisplayProps` | Interface for amount, currency, size, delta, and isPositiveDelta. |
| L17–L62 | Component | Renders formatted price + delta badge in Deep Grain Green or Danger color. |

---

## `components/ui/grade-badge.tsx`
**Purpose**: Commodity quality grade A/B/C badge chip with distinct colors per grade.
**Used in**: Marketplace cards, ledger receipts, commodity details.

| Lines | Block | Description |
|-------|-------|-------------|
| L8–L10 | `CommodityGrade` type | Union type for grade values (A, B, C, Premium, Export). |
| L13–L52 | `GradeBadge` | Resolves badge color (Green=A, Wheat=B, Husk=C) and renders labeled chip. |

---

## `components/ui/quantity-selector.tsx`
**Purpose**: Client-interactive metric quantity selector with decrement/increment controls and mono input.
**Used in**: Checkout flow, resale listing, buyback request.

| Lines | Block | Description |
|-------|-------|-------------|
| L1 | `"use client"` | Required for state-based quantity interactions. |
| L9–L18 | `QuantitySelectorProps` | Value, min, max, step, unit, onChange. |
| L21–L82 | Component | Stateful quantity control with Paper background, Harvest Wheat hover, and mono-plex input. |

---

## `components/ui/status-stepper.tsx`
**Purpose**: Visual step progress indicator for order lifecycle, sourcing transit, and silo storage verification.
**Used in**: Order detail, buyback tracker, receipt timeline.

| Lines | Block | Description |
|-------|-------|-------------|
| L8–L13 | `StepItem` | Interface for step id, label, description. |
| L15–L21 | `StatusStepperProps` | Optional steps array and currentStepIndex with defaults. |
| L23–L92 | Component | Horizontal desktop stepper (vertical mobile fallback) with completed/active/pending circle states. |

---

## `components/ui/avatar.tsx`
**Purpose**: User initials or image avatar with Harvest Wheat background fallback.
**Used in**: Navigation bar, profile settings, buyer/admin header.

| Lines | Block | Description |
|-------|-------|-------------|
| L8–L12 | `AvatarProps` | src, alt, fallbackText, size props. |
| L15–L50 | Component | Rounded circle with next/image for optimized loading, fallback to initials. |

---

## `components/ui/badge.tsx`
**Purpose**: Semantic status badge pills mapping to stored/pending/cancelled/info/outline states.
**Used in**: Order lists, buyback status labels, inventory tags.

| Lines | Block | Description |
|-------|-------|-------------|
| L8–L10 | `BadgeProps` | Extends span with `variant` for status semantics. |
| L13–L40 | Component | Color variant map using CSS token variables; renders pill-shaped chip. |

---

## `components/ui/tabs.tsx`
**Purpose**: Client interactive tab switching component with Harvest Wheat active indicator.
**Used in**: Marketplace filters, portfolio holdings/transactions toggle, showcase page.

| Lines | Block | Description |
|-------|-------|-------------|
| L1 | `"use client"` | Required for state-based tab interaction. |
| L8–L10 | `TabsContext` | Shared context carrying `activeTab` and `setActiveTab`. |
| L13–L24 | `Tabs` | Root container with state + context provider + optional `onValueChange` callback. |
| L26–L36 | `TabsList` | Paper-toned header container for tab triggers. |
| L38–L57 | `TabsTrigger` | Clickable Harvest Wheat active button per tab. |
| L59–L68 | `TabsContent` | Conditionally renders content panel only when its value matches active tab. |

---

## `components/ui/modal.tsx`
**Purpose**: Accessible overlay dialog with backdrop blur, close button, title, description, and content area.
**Used in**: Checkout confirmation, receipt detail, resale submission form.

| Lines | Block | Description |
|-------|-------|-------------|
| L1 | `"use client"` | Required for open/close and keyboard event handling. |
| L8–L14 | `ModalProps` | isOpen, onClose, title, description, children, className. |
| L17–L73 | Component | Escape key handler, body scroll lock, warm backdrop, Harvest Wheat bordered dialog box. |

---

## `components/ui/toast.tsx`
**Purpose**: Notification toast with success/error/warning/info variants in semantic design token colors.
**Used in**: Transaction feedback, form submit results, error alerts.

| Lines | Block | Description |
|-------|-------|-------------|
| L1 | `"use client"` | Required for dismiss interaction. |
| L8–L13 | `ToastProps` | type, title, message, onDismiss. |
| L16–L55 | Component | Icon + title + message + dismiss button with color-coded backgrounds. |

---

## `components/ui/skeleton.tsx`
**Purpose**: Animated loading placeholder blocks in warm Paper/Border palette tones.
**Used in**: Async data loading states for cards, receipts, portfolio items.

| Lines | Block | Description |
|-------|-------|-------------|
| L6–L14 | Component | Animated pulse div with warm Border color background. |

---

## `components/ui/empty-state.tsx`
**Purpose**: Centered empty data placeholder with icon, title, description, and optional CTA button.
**Used in**: Empty portfolio, no receipts, zero order history.

| Lines | Block | Description |
|-------|-------|-------------|
| L8–L15 | `EmptyStateProps` | icon, title, description, actionLabel, onAction. |
| L18–L53 | Component | Circular icon container, DM Serif Display title, description text, and optional Button. |

---

## `components/ui/pagination.tsx`
**Purpose**: Page navigation component with current/total page display and previous/next controls.
**Used in**: Marketplace catalog, order history, admin ledger table.

| Lines | Block | Description |
|-------|-------|-------------|
| L8–L12 | `PaginationProps` | currentPage, totalPages, onPageChange. |
| L15–L50 | Component | Flexbox layout with mono-plex page counter and Paper-toned nav buttons. |

---

## `components/layout/nav-rail.tsx`
**Purpose**: Desktop vertical sidebar navigation rail (240px), collapsing on tablet/mobile.
**Used in**: `AppShell`, all buyer application pages.

| Lines | Block | Description |
|-------|-------|-------------|
| L1 | `"use client"` | Required for `usePathname` active link detection. |
| L10–L17 | `NAV_ITEMS` | Shared route definitions (Marketplace, Ledger, Portfolio, Resale, Design System). |
| L20–L62 | `NavRail` | KorraStore logo, active-link-highlighted nav links, version status footer. |

---

## `components/layout/bottom-tab-bar.tsx`
**Purpose**: Fixed mobile bottom tab navigation bar, visible on viewports < 768px.
**Used in**: `AppShell`, mobile layout view.

| Lines | Block | Description |
|-------|-------|-------------|
| L1 | `"use client"` | Required for `usePathname` active state. |
| L11–L41 | `BottomTabBar` | 5-item fixed bottom bar reusing `NAV_ITEMS` from nav-rail; active item in Deep Grain Green. |

---

## `components/layout/app-shell.tsx`
**Purpose**: Shared application shell wrapping children with NavRail + BottomTabBar layout.
**Used in**: All buyer-facing feature route pages.

| Lines | Block | Description |
|-------|-------|-------------|
| L7–L11 | `AppShellProps` | children and className props. |
| L14–L28 | `AppShell` | Flexbox layout coordinating NavRail, main content area, and BottomTabBar. |

---

## `app/design-system/page.tsx`
**Purpose**: Showcase route rendering all design tokens, typography scale, and every UI primitive for visual validation.
**Used in**: `/design-system` route.

| Lines | Block | Description |
|-------|-------|-------------|
| L1 | `"use client"` | Required for modal, pagination, and quantity selector state. |
| L8–L23 | Imports | All UI primitive and layout component imports. |
| L25–L36 | `COLOR_SWATCHES` | Array of 10 color token metadata objects for swatch grid. |
| L38–L54 | Component state | `isModalOpen`, `currentPage`, `quantity` interactive state. |
| L56–L88 | Section 1 | Color palette swatch grid with hex labels and usage roles. |
| L90–L122 | Section 2 | Typography scale preview (DM Serif Display, Inter, IBM Plex Mono). |
| L124–L151 | Section 3 | Signature `LedgerReceipt` physical ticket primitive showcase. |
| L153–L181 | Section 4 | Button variants (primary/secondary/outline/ghost/destructive) and sizes/states. |
| L183–L246 | Section 5 | PriceDisplay, GradeBadges, StatusBadges, QuantitySelector, Avatar, Modal trigger. |
| L248–L260 | Section 6 | `StatusStepper` with 4-step order lifecycle. |
| L262–L306 | Section 7 | Tabs with Toast notifications and Skeleton loading state previews. |
| L308–L323 | Section 8 | `EmptyState` placeholder and `Pagination` navigation controls. |
| L326–L357 | Modal instance | Confirmation dialog with commodity summary and action buttons. |

---

# Feature 03: Database Schema & RLS

## `supabase/migrations/0001_init.sql`
**Purpose**: Core PostgreSQL relational schema defining custom ENUMs, 16 core tables, foreign keys with financial deletion restrictions, numeric columns, and performance indexes.
**Used in**: Database migration runner (`supabase db push`).

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | Migration header | Summary of initial schema and constraints. |
| L8–L77 | Enums | Defines custom enum types: `user_role`, `order_status`, `delivery_type`, `payment_status`, `resale_status`, `buyback_status`, `holding_movement_type`, `notification_channel`, `notification_status`. |
| L79–L248 | Core Tables | Creates 18 tables: `profiles`, `commodities`, `commodity_grades`, `warehouses`, `inventory`, `inventory_movements`, `orders`, `order_items`, `payments`, `holdings`, `holding_movements`, `receipts`, `resale_listings`, `resale_transactions`, `buyback_requests`, `price_history`, `notifications`, `audit_logs`. |
| L250–L275 | Indexes | Creates performance indexes on foreign keys, user query targets, and status columns. |

---

## `supabase/migrations/0002_rls.sql`
**Purpose**: Row Level Security policies establishing owner-isolated reads, public catalog inspection, admin inspection, and zero client write policies on financial movement ledgers.
**Used in**: Database security enforcement.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | Migration header | RLS architecture description. |
| L8–L39 | RLS Enablement & `is_admin()` | Enables RLS across all 18 tables and creates the `public.is_admin()` security definer function. |
| L41–L54 | `profiles` policies | Owner read/update policy (excluding role elevation) and admin read-all. |
| L56–L96 | Catalog policies | Public read policies for commodities, grades, warehouses, inventory stock, and price history; admin management policies. |
| L98–L122 | Orders & Payments | Owner `SELECT` policies for orders, order items, and payments. |
| L124–L134 | Holdings & Receipts | Owner `SELECT` policies for holdings and warehouse receipts. |
| L136–L160 | Marketplace & Buyback | Public active resale listing visibility, party-scoped transaction visibility, owner buyback requests. |
| L162–L174 | Notifications | User-scoped notification reads and status updates. |
| L176–L199 | Ledgers & Audit Logs | Admin-only read policies for `inventory_movements` and `audit_logs`; user read for `holding_movements`. ZERO client write policies. |

---

## `supabase/migrations/0003_functions.sql`
**Purpose**: Postgres functions and triggers for automatic user onboarding profile creation and concurrency-locking reservation RPCs (`SELECT ... FOR UPDATE`).
**Used in**: Supabase Auth triggers and server-side RPC operations.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | Migration header | Function and RPC overview. |
| L8–L41 | `update_updated_at_column()` | Trigger function and loop applying automatic `updated_at` timestamps across all mutable tables. |
| L43–L68 | `handle_new_user()` | Trigger function on `auth.users` insertion to automatically provision `public.profiles` with `role = 'user'`. |
| L70–L116 | `reserve_holding_quantity()` | Concurrency-safe holding quantity reservation function using `SELECT ... FOR UPDATE` row locks. |
| L118–L160 | `release_holding_quantity()` | Concurrency-safe holding quantity release function for cancelled or rejected listings. |

---

## `supabase/migrations/0004_views.sql`
**Purpose**: Buyer-safe marketplace views with seller identity obfuscation, and live holdings valuation views computing market worth and profit/loss.
**Used in**: Marketplace catalog browsing and portfolio valuation screens.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | Migration header | Views overview. |
| L8–L40 | `resale_listings_public` | View joining active resale listings, commodities, grades, and warehouses with anonymized `'KorraStore Seller #XXXX'` display. |
| L42–L73 | `holdings_with_current_value` | Dynamic view calculating `current_unit_price`, `current_total_value`, `profit_loss`, and `profit_loss_percentage` from live commodity market prices. |

---

## `supabase/schema.sql`
**Purpose**: Consolidated source-of-truth PostgreSQL database definition combining all tables, types, policies, functions, triggers, and views.
**Used in**: Database sync, local development, and documentation reference.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File header | Source-of-truth declaration. |
| L8–L39 | Enums | Consolidated enum definitions. |
| L41–L200 | Tables | 18 table definitions with primary keys, foreign keys, and constraints. |
| L202–L227 | Indexes | Comprehensive index declarations. |
| L229–L345 | RLS Policies | Full Row Level Security policy block. |
| L347–L455 | Functions & Triggers | `update_updated_at_column`, `handle_new_user`, `reserve_holding_quantity`, `release_holding_quantity`. |
| L457–L520 | Views | `resale_listings_public` and `holdings_with_current_value`. |

---

## `supabase/seed.sql`
**Purpose**: Development seed script populating Nigerian commodity catalog (Rice, Garlic, Beans, Melon), grades A/B/C, 2 storage warehouses (Kano & Ibadan), initial inventory stock, and benchmark price history.
**Used in**: Local/dev database seeding (`supabase db reset` or direct execution).

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L5 | File header | Seed data purpose. |
| L7–L31 | Warehouses | Seeds Kano Central Grain Silo and Ibadan Agri-Depot with capacities and contact information. |
| L33–L78 | Commodities | Seeds White Rice, Raw Garlic, Brown Beans, and Egusi Melon with base and current prices in NGN. |
| L80–L109 | Commodity Grades | Seeds Grades A, B, and C with quality specifications for each commodity. |
| L111–L131 | Price History | Seeds historical market benchmark price entries for each commodity. |
| L133–L150 | Inventory Stock | Seeds starting warehouse inventory allocations. |

---

## `lib/supabase/types.ts`
**Purpose**: Full TypeScript database types defining Row, Insert, and Update interfaces for all tables, views, functions, and enums.
**Used in**: Type-safe database queries across the entire application.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L4 | File comment | Type module description. |
| L6–L38 | Enums & Json | Primitive Json and domain Enum types (`UserRole`, `OrderStatus`, `DeliveryType`, etc.). |
| L40–L430 | Database Interface | Complete `Database['public']` interface with `Tables`, `Views`, `Functions`, and `Enums`. |
| L432–L440 | Helper Types | Exported generic helpers `Tables<T>`, `TablesInsert<T>`, `TablesUpdate<T>`, `Views<T>`. |

---

---

## `components/ui/input.tsx`
**Purpose**: Accessible, styled form input primitive with label, error display, prefix, and suffix slots.
**Used in**: Auth forms (`/login`, `/signup`, `/verify-phone`), checkout, search, and profile settings.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L4 | File comment | Input primitive purpose and usage description. |
| L6–L7 | Imports | React and `cn` utility. |
| L9–L24 | `InputProps` | TypeScript interface extending HTML input props with label, error, helperText, prefixElement, and suffixElement. |
| L26–L118 | `Input` component | ForwardRef input component with accessible ARIA tags, custom slot elements, error alerts, and design tokens. |

---

## `components/auth/background-texture.tsx`
**Purpose**: Vintage ledger paper background container rendering full-bleed Paper backdrop and subtle CSS lattice grid.
**Used in**: `app/login/page.tsx`, `app/signup/page.tsx`, `app/verify-phone/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L4 | File comment | Background texture wrapper purpose. |
| L6–L7 | Imports | React and `cn` utility. |
| L9–L13 | `BackgroundTextureProps` | Interface for wrapper props. |
| L15–L44 | `BackgroundTexture` | Component rendering warm Paper backdrop, CSS radial dot grid, centered glow, and responsive container. |

---

## `components/auth/auth-card.tsx`
**Purpose**: Branded ledger card container with DM Serif Display wordmark, double-border framing, tab switcher, and status alerts.
**Used in**: `app/login/page.tsx`, `app/signup/page.tsx`, `app/verify-phone/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L4 | File comment | Auth card purpose and component overview. |
| L6–L8 | Imports | React, Link, and `cn`. |
| L10–L25 | `AuthCardProps` | Component props for title, subtitle, activeTab, error, successMessage, and children. |
| L27–L125 | `AuthCard` | Component rendering double border frame, logo, tab switcher (Sign In / Sign Up), alerts, children form, and footer links. |

---

## `components/auth/login-form.tsx`
**Purpose**: Client-side form for email & password authentication with loading spinners, inline errors, and role-based redirects.
**Used in**: `app/login/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L4 | File comment | Login form component overview. |
| L6 | Client directive | `"use client"`. |
| L8–L12 | Imports | React, Next.js navigation hooks, Supabase browser client, and UI primitives (`Input`, `Button`). |
| L14–L180 | `LoginForm` | Client component handling input states, show/hide password toggle, Supabase `signInWithPassword`, profile role query, and role-based redirect. |

---

## `components/auth/signup-form.tsx`
**Purpose**: Client-side registration form capturing full name, email, Nigerian phone (+234), and password. Detects registered emails and surfaces explicit error banner ("An account with this email address already exists. Please log in instead or use a different email.") instead of duplicate verification triggers.
**Used in**: `app/signup/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L4 | File comment | Signup form component overview. |
| L6 | Client directive | `"use client"`. |
| L8–L12 | Imports | React, Next.js navigation hooks, Supabase browser client, `Input`, and `Button`. |
| L14–L102 | `SignupForm` | Component managing inputs, validation, phone formatting (+234), Supabase `signUp` execution, duplicate email validation, and error banner display. |
| L103–L250 | JSX render | Render form fields, red error banner box for duplicate email or validation failures, and submit button. |

---

## `components/auth/otp-form.tsx`
**Purpose**: Information card indicating phone OTP verification is disabled and account verification is sent strictly via email.
**Used in**: `app/verify-phone/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L4 | File comment | Purpose and disabled phone verification state description. |
| L6 | Client directive | `"use client"`. |
| L8–L10 | Imports | React, Link, `Button`. |
| L12–L35 | `OtpForm` | Renders email verification active banner and CTA button returning to sign in. |

---


## `lib/auth/get-current-user.ts`
**Purpose**: Server-side authentication and role evaluator querying `getUser()` and the `profiles` table.
**Used in**: Server Components, Server Actions, Route Handlers.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L5 | File comment | Server auth evaluator description and security rules. |
| L7–L8 | Imports | Server Supabase client factory and `UserRole` type. |
| L10–L24 | `CurrentUser` | Interface describing verified user id, email, phone, role, fullName, and isAdmin flag. |
| L26–L60 | `getCurrentUser()` | Async server helper fetching and verifying session against Supabase Auth servers and reading `profiles.role`. |

---

## `lib/hooks/use-user.ts`
**Purpose**: Client-side React hook subscribing to Supabase `onAuthStateChange` for live auth state across client components.
**Used in**: Client components needing user state without heavy context providers.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L4 | File comment | Client auth state hook overview. |
| L6 | Client directive | `"use client"`. |
| L8–L11 | Imports | React, Supabase types, client factory, and `UserRole`. |
| L13–L35 | Interfaces | `ProfileData` and `UseUserResult` interface contracts. |
| L37–L135 | `useUser()` | Hook maintaining user and profile state, handling auth subscriptions, and providing `signOut()` and `refresh()`. |

---

## `app/login/page.tsx`
**Purpose**: Public login route wrapping `AuthCard` and `LoginForm` with automatic redirect for authenticated users.
**Used in**: `/login` route.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L4 | File comment | Login page route overview. |
| L6–L11 | Imports | React, Metadata, redirect, `getCurrentUser`, and auth components. |
| L13–L16 | Metadata | SEO metadata for login page. |
| L23–L48 | `LoginPage` | Server component verifying session and rendering login card. |

---

## `app/signup/page.tsx`
**Purpose**: Public signup route wrapping `AuthCard` and `SignupForm`.
**Used in**: `/signup` route.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L4 | File comment | Signup page route overview. |
| L6–L11 | Imports | React, Metadata, redirect, `getCurrentUser`, and auth components. |
| L13–L16 | Metadata | SEO metadata for signup page. |
| L19–L42 | `SignupPage` | Server component rendering signup interface. |

---

## `app/verify-phone/page.tsx`
**Purpose**: Public phone OTP verification screen wrapping `AuthCard` and `OtpForm`.
**Used in**: `/verify-phone` route.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L4 | File comment | Verify phone page route overview. |
| L6–L9 | Imports | React, Metadata, and auth components. |
| L11–L14 | Metadata | SEO metadata for phone verification page. |
| L17–L30 | `VerifyPhonePage` | Server component rendering OTP form inside background wrapper. |

---

## `app/auth/callback/route.ts`
**Purpose**: Supabase auth code exchange callback route handler.
**Used in**: Next.js App Router route `/auth/callback`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L4 | File comment | Auth callback route handler overview. |
| L6–L7 | Imports | NextRequest, NextResponse, and server Supabase client. |
| L9–L40 | `GET` handler | Exchanges auth code for session cookies and executes role-based redirection. |

---

## `app/api/auth/logout/route.ts`
**Purpose**: Server-side logout endpoint revoking session and clearing cookies.
**Used in**: Next.js App Router route `/api/auth/logout`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L4 | File comment | Logout endpoint overview. |
| L6–L7 | Imports | NextRequest, NextResponse, and server Supabase client. |
| L9–L27 | `POST` handler | Calls `supabase.auth.signOut()` and redirects to `/login`. |

---

## `middleware.ts`
**Purpose**: Edge runtime request middleware refreshing session cookies and enforcing "One Login, Two Experiences" role protection.
**Used in**: Edge runtime request pipeline.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L5 | File comment | Middleware role and security overview. |
| L7–L8 | Imports | NextRequest, NextResponse, and `createServerClient`. |
| L10–L24 | Route Arrays | `PROTECTED_BUYER_ROUTES` and `PUBLIC_AUTH_ROUTES` definitions. |
| L26–L102 | `middleware()` | Session cookie refresh and role verification using `getUser()`. Enforces hard admin barrier and buyer auth guards. |
| L104–L114 | `config` | Next.js matcher configuration excluding static and image assets. |

---

## `__tests__/auth-routing.test.ts`
**Purpose**: Vitest unit test suite validating role-based routing, unauthenticated redirects, and admin route barriers.
**Used in**: `npm run test`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L4 | File comment | Test suite overview. |
| L6 | Imports | Vitest `describe`, `it`, `expect`. |
| L8–L55 | `evaluateRouteAccess()` | Route evaluation simulator mirroring middleware logic for test assertions. |
| L57–L135 | Tests | Test cases for "One Login, Two Experiences", Admin barriers, and Buyer route protections. |

---

## `prompts/04-auth.md`
**Purpose**: Feature 04 requirements specification defining authentication flows, role-based routing, visual design, and acceptance criteria.
**Used in**: Feature requirements reference.

---

## `prompts/implementation/04-auth.md`
**Purpose**: Detailed technical implementation guide for Feature 04 authentication and route guards.
**Used in**: Feature implementation architecture reference.

---

## `build-prompt/04-auth.md`
**Purpose**: Short build prompt linking visual mockups, backend workflows, and implementation directives.
**Used in**: AI pair programmer build workflow.

---

# Feature 06: Home / Marketplace Browse

## `lib/types.ts`
**Purpose**: Central TypeScript domain definitions, exported types, and MarketplaceCommodity interface.
**Used in**: Server Components, Client Components, Server Actions, and Domain Services.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L5 | File comment | Module purpose and usage instructions. |
| L7–L14 | `ApiResponse` | Standardized API response contract. |
| L16–L21 | `SystemStatus` | Infrastructure status descriptor. |
| L24–L37 | `MarketplaceCommodity` | Added MarketplaceCommodity interface for marketplace browse view (ID, code, name, description, unit, base_price, current_price, image_url, total_available_quantity, available_grades, warehouse_count). |

---

## `lib/supabase/queries/commodities.ts`
**Purpose**: Server-side Supabase data query module fetching active commodities, inventory aggregation, grade mappings, and sort/filter logic.
**Used in**: `app/home/page.tsx` (Marketplace Browse Page).

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File header | Query module purpose, security rules, and component usage comments. |
| L8–L11 | `CommodityFilterOptions` | Interface for `type` and `sort` filter options. |
| L14–L65 | `DEFAULT_COMMODITIES` | Fallback catalog array of verified Nigerian commodities (Rice, Garlic, Beans, Melon) for unseeded dev databases. |
| L71–L140 | `getMarketplaceCommodities()` | Async server query joining `commodities`, `inventory`, and `commodity_grades` under RLS rules with category filtering and price/stock sorting. |

---

## `components/marketplace/filter-bar.tsx`
**Purpose**: Interactive Client Component rendering category filter chips and sort dropdown selector.
**Used in**: `app/home/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L5 | File header | Purpose, client-directive declaration, and URL search param state strategy. |
| L7 | Client directive | `"use client"`. |
| L15–L33 | Constants | `CATEGORIES` chip definitions and `SORT_OPTIONS` array. |
| L38–L98 | `FilterBar` | Component handling chip clicks and sort selection, updating URL parameters via Next.js `useRouter` and `useSearchParams`. |

---

## `components/marketplace/commodity-card.tsx`
**Purpose**: Product card component rendering commodity photo preview, title, price display ("from ₦X/kg"), stock quantity, grade badges, and detail CTA button.
**Used in**: `app/home/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L5 | File header | Component description, design tokens, and layout guidelines. |
| L7–L13 | Imports | React, Link, Image, MarketplaceCommodity, UI primitives (`PriceDisplay`, `GradeBadge`, `Button`, `Card`). |
| L15–L21 | `CommodityCardProps` | Interface for card props. |
| L27–L125 | `CommodityCard` | Card component rendering image container with fallback emoji, header, starting price, stock/warehouse metrics, grade chips, and purchase CTA button. |

---

## `components/marketplace/commodity-skeleton.tsx`
**Purpose**: Skeleton loader placeholders matching the exact card grid structure during asynchronous data fetches.
**Used in**: `app/home/loading.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L5 | File header | Purpose and loading state guidelines. |
| L12–L45 | `CommodityCardSkeleton` | Individual skeleton card item. |
| L50–L58 | `CommoditySkeletonGrid` | 4-item responsive skeleton grid component. |

---

## `app/home/page.tsx`
**Purpose**: Primary Server Component page for the buyer marketplace dashboard at `/home`.
**Used in**: Protected buyer route `/home`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File header | Route purpose, server component declaration, and session verification rules. |
| L8–L21 | PageProps | Server component searchParams promise interface. |
| L25–L85 | `HomePage` | Server Component re-verifying session via `getUser()`, resolving URL searchParams, querying catalog via `getMarketplaceCommodities()`, and rendering inside `AppShell`. |

---

## `app/home/loading.tsx`
**Purpose**: Next.js App Router loading fallback boundary rendering skeleton shapes during server render.
**Used in**: Protected buyer route `/home`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L5 | File header | Loading boundary purpose. |
| L10–L30 | `HomeLoading` | Renders header skeleton, filter bar skeleton, and 4-item card skeleton grid inside `AppShell`. |

---

## `__tests__/marketplace-browse.test.ts`
**Purpose**: Vitest unit test suite verifying commodity catalog filtering, price low/high sorting, stock sorting, and data structure rules.
**Used in**: `npm run test`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L4 | File header | Purpose and test guidelines. |
| L8–L30 | `filterAndSortCommodities()` | In-memory simulator function mirroring server query filter and sort logic. |
| L32–L73 | `MOCK_CATALOG` | Seed mock catalog items for test execution. |
| L75–L120 | Test suite | Unit tests asserting default listings, category filtering (rice, garlic), price low→high sort, price high→low sort, and stock sort. |

---

## `prompts/06-home-browse.md`
**Purpose**: Feature 06 specification prompt defining marketplace browse goals, layout specs, and acceptance criteria.
**Used in**: Feature reference documentation.

---

## `prompts/implementation/06-home-browse.md`
**Purpose**: Technical implementation guide for Feature 06 marketplace catalog and components.
**Used in**: Feature architecture reference.

---

## `build-prompt/06-home-browse.md`
**Purpose**: Short build prompt linking visual UI mockups, backend workflow diagram, and agent instructions.
**Used in**: AI pair programmer build workflow.

---

## `supabase/migrations/0006_custom_otp.sql`
**Purpose**: Database migration adding `auth_otp_codes` table and `email_verified_at` profile column for server-side custom OTP verification.
**Used in**: Database schema / Supabase migration execution.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L8 | Migration Header | Purpose and description of custom OTP schema objects. |
| L11–L20 | `auth_otp_codes` Table | Creates table storing email, 6-digit OTP code, 10-minute expiry timestamp, used_at flag, and created_at timestamp. |
| L22 | Index | Creates `idx_auth_otp_codes_email` for fast lookups during verification. |
| L25 | RLS | Enables RLS on `auth_otp_codes` with no client policies so only service-role can access. |
| L31–L32 | Profile Column | Adds `email_verified_at TIMESTAMPTZ` to `profiles` table. |

---

## `app/api/auth/send-otp/route.ts`
**Purpose**: POST API endpoint generating a 6-digit numeric OTP code, storing it in `auth_otp_codes`, and delivering a branded HTML email via Resend SDK.
**Used in**: Signup flow and resend trigger (`components/auth/signup-form.tsx`, `components/auth/email-otp-form.tsx`).

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L8 | File Header | Endpoint purpose, security rules, and dependencies. |
| L11–L13 | `POST()` | Main route handler accepting `{ email, name }`. |
| L16–L21 | Input Validation | Validates email string presence and format. |
| L25–L31 | Code Invalidation | Marks any existing unused codes for the email as used to prevent replay. |
| L34–L37 | Code Generation | Generates cryptographically secure 6-digit OTP string using `crypto.getRandomValues`. |
| L40–L56 | DB Insertion | Inserts new OTP record with 10-minute TTL into `auth_otp_codes` using service-role client. |
| L59–L72 | Email Delivery | Calls `sendVerificationOtpEmail()` to deliver HTML email via Resend SDK. |
| L74–L77 | Response | Returns JSON `{ success: true, message: "..." }`. |

---

## `app/api/auth/verify-otp/route.ts`
**Purpose**: POST API endpoint validating 6-digit numeric OTP codes against `auth_otp_codes` table and setting `email_verified_at` on the profile.
**Used in**: Email OTP verification form (`components/auth/email-otp-form.tsx`).

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L7 | File Header | Endpoint purpose, security rules, and single-use enforcement logic. |
| L10–L12 | `POST()` | Main route handler accepting `{ email, code }`. |
| L15–L21 | Input Validation | Validates email presence and 6-digit numeric code format. |
| L26–L38 | Lookup | Queries `auth_otp_codes` for the latest unused code matching normalized email. |
| L40–L46 | Expiry Check | Verifies `expires_at` is in the future. |
| L48–L56 | Code Match | Performs constant-time string comparison of expected vs submitted code. |
| L58–L62 | Single-Use Update | Marks the matching code as used (`used_at = NOW()`). |
| L64–L74 | Profile Update | Sets `email_verified_at = NOW()` on the user's `profiles` record. |
| L76–L89 | Destination Resolution | Queries role & `onboarding_completed` to return appropriate redirect path (`/onboarding`, `/home`, or `/admin`). |

---

## `app/api/auth/signup/route.ts`
**Purpose**: Unified Signup API endpoint handling pre-checks for existing users, user account creation, OTP generation, and email dispatch. Returns HTTP 400 error on duplicate emails.
**Used in**: `components/auth/signup-form.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L5 | File Header | Endpoint purpose, security rules, and duplicate email prevention logic. |
| L14–L23 | `POST()` | Main route handler accepting `{ email, password, fullName, phone }`. |
| L24–L38 | Input Validation | Validates email format and minimum password length requirement. |
| L40–L67 | Duplicate Email Pre-Check | Queries existing profiles/auth users; returns HTTP 400 with explicit error if email is already registered. |
| L68–L90 | User Account Creation | Calls `supabase.auth.signUp()` and handles empty identities array response for duplicate signups. |
| L91–L112 | Profile Upsert | Ensures user record exists in `profiles` table with role and metadata. |
| L113–L130 | OTP Generation & Storage | Generates 6-digit OTP code and inserts into `auth_otp_codes` with 10-minute expiry. |
| L131–L140 | Resend Email Dispatch | Dispatches EXACTLY ONE email via Resend SDK containing the 6-digit numeric OTP code. |

---

## `app/onboarding/page.tsx`
**Purpose**: Server Component entry point for the first-run `/onboarding` route. Validates session authenticity and renders the geometric Paper background and logo bar with `StepCarousel`.
**Used in**: Next.js App Router route `/onboarding`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L13 | File Header | Component purpose, SEO metadata, and security guardrail imports. |
| L15–L19 | Metadata | Defines title and description for SEO and browser tabs. |
| L21–L36 | `OnboardingPage()` | Server component route handler; re-verifies session with `supabase.auth.getUser()`. |
| L38–L110 | Background & Shell | Renders Paper background (#F7F4EA) with golden grid pattern, concentric circle arcs, and brand header. |
| L112–L115 | StepCarousel | Renders interactive carousel client component. |

---

## `components/onboarding/step-carousel.tsx`
**Purpose**: Client component managing the 3-step skippable onboarding flow, slide transitions, vector illustrations, dot indicators, and completion state server actions.
**Used in**: `app/onboarding/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L10 | File Header | Component description, design specs, layout breakdown, and navigation logic. |
| L12–L45 | `StoredSeal` | Pure SVG component rendering the circular green "STORED OFFICIAL SEAL" stamp. |
| L47–L110 | `CommodityTile` | Custom tile component with gold outer frame, cream photo container, price badge, and STORED stamp. |
| L112–L125 | `Step1Visual` | 2×2 grid of commodity tiles (Rice, Garlic, Beans, Melon) for Step 1 illustration. |
| L127–L240 | `Step2Visual` | Curled digital ledger receipt card showing Rice holding valuation, +6.6% green growth, and SVG sparkline chart. |
| L242–L300 | `Step3Visual` | Dual exit-path cards (Resell on Marketplace vs Request Buyback) with custom icons and tags. |
| L302–L335 | `STEPS` Config | Array defining step data: visuals, serif headlines, body text, and step accent colors. |
| L337–L400 | `PillButton` & `DotNav` | Custom pill button primitive and animated step dot navigation row. |
| L932–L947 | `StepCarousel()` | Main client carousel component handling step state transitions, keyboard/click navigation, Step 3 dark background button text visibility fix (`isDarkAccent` check), and `completeOnboarding()` server action call with full page redirect to `/home`. |

---

## `app/page.tsx`
**Purpose**: Primary Server Component for the KorraStore buyer marketplace dashboard (served at `/`).
**Used in**: Primary root route `/`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File Header | Component purpose, server component declaration, and root path mapping. |
| L8–L21 | PageProps | Interface for searchParams promise (`type`, `sort`). |
| L25–L110 | `RootPage` | Server Component re-verifying session via `getUser()`, resolving profile full_name, querying catalog via `getMarketplaceCommodities()`, and rendering `AppShell`, `MarketTicker`, `FilterBar`, and `CommodityCard` grid. |

---

## `app/home/page.tsx`
**Purpose**: Legacy `/home` route redirect component for backward compatibility.
**Used in**: Legacy route `/home`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L4 | File Header | Legacy route purpose and redirect target. |
| L6–L10 | `LegacyHomePage` | Server component exec---

## `components/marketplace/market-ticker.tsx`
**Purpose**: Live Market Ticker component displaying horizontal scrolling cards with live prices, percentage trend badges, and SVG sparkline charts strictly matching `desktop-ui.png` and `mobile-ui.png`.
**Used in**: `app/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File Header | Component description and usage location. |
| L8–L10 | `MarketTickerProps` | Interface contract accepting array of marketplace commodities. |
| L13–L21 | `getTypeKey()` | Utility function classifying commodities into rice, garlic, beans, or melon. |
| L24–L41 | `MiniSparkline()` | Pure SVG component rendering mini green/red price trend sparkline graphs. |
| L47–L105 | `MarketTicker()` | Main ticker component rendering rounded white cards with price in IBM Plex Mono, trend badges, and sparkline charts. |

---

## `components/marketplace/commodity-card.tsx`
**Purpose**: Redesigned commodity card strictly matching `desktop-ui.png` (4-column grid with warm beige thumbnail, grade badge, DM Serif Display title, IBM Plex Mono price, +2.4% trend, and View Details / Buy Now buttons) and `mobile-ui.png` (horizontal split row with square thumbnail and full-width Buy Now button).
**Used in**: `app/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L7 | File Header | Component purpose and dual viewport layout breakdown. |
| L9-[End] | `CommodityCard` | Dual desktop/mobile layout card component with grade badges, live pricing, trend indicators, stock levels, and interactive CTA buttons. |

---

## `components/marketplace/filter-bar.tsx`
**Purpose**: Filter & Sort Control Bar rendering category chips (All, Rice, Garlic, Beans, Melon) with Harvest Wheat fill and sort selector matching `desktop-ui.png` and `mobile-ui.png`.
**Used in**: `app/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File Header | Component description and URL search parameter sync logic. |
| L20–L35 | `CATEGORIES` & `SORT_OPTIONS` | Category chip configurations and sort options. |
| L40–L105 | `FilterBar()` | Interactive component managing `/?type=...&sort=...` search parameters. |
and onboarding redirects across all incoming HTTP requests.
**Used in**: Next.js Edge Runtime request pipeline.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L5 | File Header | Middleware file description, purpose, and delegated proxy relationship. |
| L7–L8 | Imports | Imports `NextRequest` from `next/server` and `proxy` handler from `./proxy`. |
| L10–L16 | `middleware()` | Edge middleware handler function executing `proxy(request)`. |
| L18–L20 | `config` | Re-exports Next.js route matcher configuration pattern from `./proxy`. |

---

# UI Redesign & Mockup Alignment Updates (Feature 06)

## `app/globals.css`
**Purpose**: Added `.font-serif-dm` selector alias to ensure DM Serif Display applies seamlessly across all UI components using `font-serif-dm` or `font-serif-display`.
**Used in**: `app/layout.tsx` (globally imported).

| Lines | Block | Description |
|-------|-------|-------------|
| L62–L65 | `.font-serif-display, .font-serif-dm` | Configures font-family `var(--font-serif-display)` for both font utility class aliases. |

---

## `components/marketplace/commodity-card.tsx`
**Purpose**: Updated CommodityCard component to strictly follow `desktop-ui.png` and `mobile-ui.png`. Removed stray annotation labels ("dark Soil", "IBM Plex Mono"), updated typography to DM Serif Display and IBM Plex Mono, added realistic 3D SVG graphics for Rice, Garlic, Beans, and Melon, and styled desktop dual buttons and mobile split card layout.
**Used in**: `app/page.tsx` & `app/home/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L26–L90 | `CommodityGraphic()` | Enhanced 3D-styled SVG illustration vectors for Rice, Garlic, Beans, and Melon with warm organic glow. |
| L92–L96 | `FULL_TITLES` | Full title mapping ("Royal Stallion Rice Grade A", "Kano White Garlic Grade A", etc.). |
| L105–L185 | Desktop Layout | White card (`rounded-[20px]`), warm beige thumbnail, dark green `[ Premium ]` badge, DM Serif title, IBM Plex Mono price, monthly trend text, stock count, and dual CTA buttons (`View Details` + `Buy Now`). |
| L187–L240 | Mobile Layout | White split card, square thumbnail with `G#` dark badge overlay, right details column (title, `Premium` green badge, IBM Plex Mono price, trend pill, stock availability), and full-width gold `Buy Now` button. |

---

## `components/layout/nav-rail.tsx`
**Purpose**: Refined desktop NavRail sidebar styling with fluid cubic-bezier easing (`cubic-bezier(0.16, 1, 0.3, 1)`), fixed icon anchors (`w-6 h-6 shrink-0`) to eliminate horizontal layout jumps, 180-degree smooth toggle button rotation, and zero duplicate logo artifacts when collapsed (delegating primary brand logo strictly to the top header bar in `AppShell`).
**Used in**: `AppShell` layout wrapper.

| Lines | Block | Description |
|-------|-------|-------------|
| L147–L235 | `NavRail()` | Renders 20px (80px) / 64px (256px) collapsible sidebar with spring-physics width transitions, sleek toggle header, and zero duplicate logo overlap. |

---

## `components/layout/bottom-tab-bar.tsx`
**Purpose**: Updated mobile BottomTabBar to render the exact 5 mobile tabs from `mobile-ui.png` (Home, Store, Storage, Orders, Profile).
**Used in**: `AppShell` mobile layout view.

| Lines | Block | Description |
|-------|-------|-------------|
| L13–L19 | `MOBILE_TABS` | Array selecting the exact 5 mobile navigation items (Home, Store, Storage, Orders, Profile). |
| L21–L45 | `BottomTabBar()` | Fixed bottom tab bar rendering gold active tab icon and label. |

---

## `components/layout/app-shell.tsx`
**Purpose**: Polished top header layout with DM Serif Display logo and rounded-full pill search bar matching `desktop-ui.png` and `mobile-ui.png`.
**Used in**: All buyer feature pages.

| Lines | Block | Description |
|-------|-------|-------------|
| L43–L96 | Top Header | Sticky top bar with logo, floating rounded-full search input, notification bell, and user avatar. |

---

## `components/marketplace/market-ticker.tsx`
**Purpose**: Polished MarketTicker 3-card desktop grid and mobile scrollable ticker strip with IBM Plex Mono pricing and live trend pills.
**Used in**: `app/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L123–L205 | `MarketTicker()` | Desktop 3-column grid (Rice, Garlic, Beans) with sparklines and mobile horizontal scroll strip. |

---

## `components/marketplace/filter-bar.tsx`
**Purpose**: Updated filter chips to use Harvest Wheat fill (`#D8B56A`) with dark soil text (`#4A3828`) for active state and rounded-full sort selector pill.
**Used in**: `app/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L58–L102 | `FilterBar()` | Filter chips (`All`, `Rice`, `Garlic`, `Beans`, `Melon`) and `Sort: Price ∨` dropdown. |

---

# Feature 07: Commodity Details

## `lib/types.ts`
**Purpose**: Central domain TypeScript interfaces updated with `GradeAvailability`, `PriceHistoryPoint`, and `CommodityDetails`.
**Used in**: Server Components, Client Components, Server Actions, and Supabase Queries.

| Lines | Block | Description |
|-------|-------|-------------|
| L40–L48 | `GradeAvailability` | Interface tracking grade code (A/B/C), unit price, stock count, and availability status. |
| L51–L55 | `PriceHistoryPoint` | Interface storing timestamp, price numeric value, and formatted date label. |
| L58–L77 | `CommodityDetails` | Interface aggregating commodity metadata, per-grade prices/stock, price history array, and warehouse storage conditions. |

---

## `lib/supabase/queries/commodities.ts`
**Purpose**: Added `getCommodityDetails(commodityId)` server function fetching commodity records, per-grade prices/inventory, and historical price points under Supabase RLS.
**Used in**: `app/commodities/[commodityId]/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L210–L237 | `generateMockPriceHistory()` | Helper generating 30-day realistic price fluctuation curves. |
| L240–L415 | `getCommodityDetails()` | Async function querying `commodities`, `commodity_grades`, `inventory`, and `price_history` with complete fallback catalog support for seeded & unseeded environments. |

---

## `components/commodity/grade-selector.tsx`
**Purpose**: Quality grade selection chip control (Grade A, Grade B, Grade C) using GradeBadge styling and Harvest Wheat gold active state (`#D8B56A`).
**Used in**: `components/commodity/purchase-panel.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File header | Component purpose and design token notes. |
| L18–L44 | `GradeSelector` | Client component rendering horizontally scrollable grade selector chips with active gold highlight and out-of-stock badge. |

---

## `components/commodity/storage-info.tsx`
**Purpose**: Warehouse storage and climate compliance info card detailing 18°C temperature, 12% moisture control, 100% insurance, and instant resale eligibility.
**Used in**: `app/commodities/[commodityId]/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L5 | File header | Component description. |
| L14–L70 | `StorageInfo` | Component rendering warehouse standards header and 4-item status grid with icons. |

---

## `components/commodity/price-history-chart.tsx`
**Purpose**: Interactive Recharts area line chart rendering historical price trends with range selector tabs (`7d`, `30d`, `90d`, `All`), Harvest Wheat gold stroke (`#D8B56A`), gradient fill, and custom tooltips.
**Used in**: `app/commodities/[commodityId]/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L7 | File header | Component purpose and design specs. |
| L20–L40 | State & Hooks | `range` filter state ("30d"), mounted check for SSR hydration. |
| L42–L65 | Data Calculations | Memoized filtering by range and dynamic min/max domain calculation for Y-axis. |
| L67–L170 | `PriceHistoryChart` | Main chart component rendering header with percentage trend badge, range selector tabs, and ResponsiveContainer Recharts area chart. |

---

## `components/commodity/purchase-panel.tsx`
**Purpose**: Interactive Purchase Panel managing per-grade price recalculations, stock checks, quantity selectors, and "Buy Now" CTA navigation to `/checkout`. Renders sticky card on desktop and inline panel + sticky bottom CTA bar on mobile.
**Used in**: `app/commodities/[commodityId]/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File header | Component description and responsive layout rules. |
| L19–L45 | State & Handlers | `selectedGrade` state, quantity state, availability checks, and `handleBuyNow` navigation. |
| L47–L150 | Desktop Card JSX | Sticky purchase card with GradeSelector, PriceDisplay, live inventory count, quantity +/- controls, total estimate, and gold Buy Now button. |
| L152–L170 | Mobile CTA Bar | Fixed bottom CTA bar pinned above mobile navigation tabs with full-width Buy Now button. |

---

## `app/commodities/[commodityId]/page.tsx`
**Purpose**: Single Commodity Details Server Component page fetching commodity details, rendering AppShell, 2-column desktop layout (~60% hero photo + title + description + storage info; ~40% sticky purchase panel), and full-width price history chart.
**Used in**: App Router route `/commodities/[commodityId]`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File header | Route purpose and layout rules matching `desktop-ui.png` and `mobile-ui.png`. |
| L19–L32 | `CommodityDetailsPage` | Server component resolving route params and fetching data via `getCommodityDetails(commodityId)`. |
| L34 border | NotFound Guard | Triggers `notFound()` if commodity record is not found. |
| L40–L125 | Page JSX | Renders breadcrumbs, hero photo box in warm beige `#F5EFE0`, title, `[ Premium Grade ]` badge, description, `StorageInfo`, sticky `PurchasePanel`, and `PriceHistoryChart`. |

---

# Feature 08: Checkout

## `lib/domain/payments/provider.ts`
**Purpose**: Defines the domain PaymentProvider interface and shared payment type contracts (`OrderForPayment`, `PaymentInitResult`, `PaymentVerifyResult`). Ensures order and ledger logic remain swappable and decouple from third-party payment SDKs.
**Used in**: `lib/domain/payments/paystack-adapter.ts`, `app/api/orders/route.ts`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L5 | File header | Interface purpose, abstraction boundary, and usage across domain layers. |
| L10–L23 | `OrderForPayment` | Interface carrying `orderId`, `buyerEmail`, integer `amountKobo`, `currency: 'NGN'`, commodity name, and grade name. |
| L29–L36 | `PaymentInitResult` | Interface carrying `authorizationUrl`, `paystackReference`, and `accessCode`. |
| L42–L53 | `PaymentVerifyResult` | Interface carrying `success`, `reference`, `amountKobo`, `status`, and `customerEmail`. |
| L60–L72 | `PaymentProvider` | Core interface defining `initialize(order)` and `verify(reference)`. |

---

## `lib/domain/payments/paystack-adapter.ts`
**Purpose**: Concrete server-only implementation of the `PaymentProvider` interface using Paystack Transaction Initialize and Verify REST APIs with `PAYSTACK_SECRET_KEY`.
**Used in**: `app/api/orders/route.ts` (and Feature 26 Paystack Webhook handler).

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File header & security | Guarded by `import 'server-only'`. Secret key usage rules. |
| L18–L33 | Constants & `getAuthHeader()` | Paystack base URL and runtime `PAYSTACK_SECRET_KEY` validation helper. |
| L39–L98 | `PaystackAdapter.initialize()` | Posts order details to `https://api.paystack.co/transaction/initialize` with integer kobo amounts and returns `authorizationUrl`. |
| L107–L148 | `PaystackAdapter.verify()` | Queries `https://api.paystack.co/transaction/verify/{ref}` with `no-store` cache for secure server-side re-verification. |
| L153 | `paystackAdapter` | Exported singleton instance for shared usage across route handlers. |

---

## `lib/supabase/queries/orders.ts`
**Purpose**: Server-only Supabase queries for order creation (`createPendingOrder`) and checkout data retrieval (`getCheckoutCommodity`) using service-role client with live `quantity` - `allocated_quantity` inventory calculation and fallback catalog support.
**Used in**: `app/api/orders/route.ts`, `app/checkout/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L8 | File header | Query module purpose, numeric decimal precision enforcement, and service client usage. |
| L14–L20 | `CreatePendingOrderParams` | Input parameter contract for order creation. |
| L26–L32 | `PendingOrderResult` | Output contract containing `orderId`, `userId`, `totalPrice`, and `paystackReference`. |
| L46–L112 | `createPendingOrder()` | Creates `orders` record (`pending_payment`) and child `order_items` record with arbitrary-precision `numeric` values. |
| L119–L227 | `getCheckoutCommodity()` | Server function fetching commodity, grade details, and live available inventory (`quantity - allocated_quantity`) with complete fallback support. |

---

## `app/api/orders/route.ts`
**Purpose**: POST API endpoint verifying buyer authentication, re-validating live warehouse inventory (`quantity - allocated_quantity`), creating a pending order, and initializing a Paystack transaction.
**Used in**: `components/checkout/order-review-form.tsx` (checkout submit action).

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L12 | File header & imports | Route purpose, security rules, and module dependencies. |
| L19–L32 | Auth check | Validates buyer session via `supabase.auth.getUser()`, returning HTTP 401 if unauthenticated. |
| L39–L61 | Request parsing & validation | Validates presence and types of `commodityId`, `gradeId`, and positive `quantity`. |
| L68–L95 | Live inventory validation | Queries live stock (`quantity - allocated_quantity`) for the grade and calculates unit price. |
| L97–L118 | Stock limit check | Rejects orders where requested quantity exceeds available stock with HTTP 422. |
| L135–L150 | Pending order creation | Calls `createPendingOrder()` to insert database records. |
| L157–L183 | Paystack initialization | Invokes `paystackAdapter.initialize()` with kobo conversion and returns `authorizationUrl`. |
| L188–L195 | Response | Returns JSON payload `{ authorizationUrl, orderId }` with HTTP 200. |


---

## `components/checkout/order-review-form.tsx`
**Purpose**: Client Component form rendering interactive quantity stepper, retail/bulk unit toggle, dynamic price breakdown, storage notice, loading state, error banner, and Paystack CTA.
**Used in**: `app/checkout/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L10 | File header | Client directive `"use client"` and component overview. |
| L15–L16 | Constants | `PLATFORM_FEE_RATE` (1%) and `PLATFORM_FEE_CAP` (₦5,000). |
| L22–L33 | `OrderReviewFormProps` | Interface for pre-fetched server props. |
| L39–L52 | Helpers | `formatNaira()` and `getUnitLabel()`. |
| L57–L68 | `GradeBadge` | Module-level badge component with `#21483A` green pill styling. |
| L73–L90 | `Thumbnail` | Module-level commodity image with fallback emoji icon. |
| L93–L165 | `OrderReviewForm` & state | Quantity state, price calculations, and `handleSubmit` executing `fetch('/api/orders')` and browser redirect. |
| L172–L389 | Order card JSX | Commodity header, quantity stepper controls, retail/bulk pills, price breakdown table, and storage badge. |
| L392–L417 | Error banner | Retryable error banner surfaced upon validation or gateway failure. |
| L424–L467 | Desktop CTA | Full-width Harvest Wheat gold button with loading spinner and security notice. |
| L473–L510 | Mobile CTA Bar | Fixed bottom sticky CTA bar positioned above mobile navigation safe area. |

---

## `app/checkout/page.tsx`
**Purpose**: Server Component page at `/checkout` verifying buyer session, resolving search parameters, fetching commodity details, and rendering `AppShell` with `OrderReviewForm`.
**Used in**: Next.js App Router route `/checkout`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L14 | File header & imports | Route description, metadata, and dependencies. |
| L18–L32 | Metadata & PageProps | SEO tags and searchParams Promise type. |
| L44–L55 | Auth Guard | Server session verification with `supabase.auth.getUser()`, redirecting to `/login?redirect=/checkout` if needed. |
| L61–L70 | Params validation | Resolves `commodityId`, `gradeId`, and initial `qty`, redirecting to `/home` if parameters are missing. |
| L77–L83 | Data fetching | Fetches commodity and live stock via `getCheckoutCommodity()`, triggering `notFound()` if unavailable. |
| L85–L171 | Page JSX | Desktop H1 header, mobile header bar, and `OrderReviewForm` wrapped inside `AppShell`. |

---

## `__tests__/checkout.test.ts`
**Purpose**: Vitest unit test suite validating server-side quantity validation, authentication barriers, price calculations, platform fee capping, and kobo conversions.
**Used in**: `npm run test`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File header | Test suite purpose and acceptance criteria coverage. |
| L16–L62 | Simulation helpers | `calculatePlatformFee()`, `calculateTotal()`, `validateQuantity()`, `simulateAuthCheck()`. |
| L67–L110 | Quantity tests | Tests valid quantity, exact match, excess rejection, zero/negative rejection, NaN/Infinity checks, and zero stock check. |
| L112–L124 | Auth tests | Tests unauthenticated 401 rejection and authenticated 200 pass. |
| L126–L165 | Pricing tests | Tests subtotal calculation, 1% fee calculation, ₦5,000 cap, and kobo integer rounding. |
| L167–L178 | Formatting tests | Tests Naira currency display formatting. |

---

## `lib/supabase/queries/orders.ts`
**Purpose**: Server-side query module for order creation, buyer order history queries, and order detail fetching with RLS ownership enforcement.
**Used in**: `app/api/orders/route.ts`, `app/orders/page.tsx`, `app/orders/[orderId]/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L9 | File header & imports | Server-only boundary and service-role client imports. |
| L11–L65 | Type Definitions | `OrderFulfillmentStatus`, `PaymentStatusType`, `CreatePendingOrderParams`, `BuyerOrderSummary`, `BuyerOrderDetail`. |
| L67–L125 | `createPendingOrder()` | Atomically inserts `orders` row with `pending_payment` status and related `order_items` records. |
| L127–L220 | `getCheckoutCommodity()` | Fetches single commodity and grade availability with fallback for checkout review. |
| L222–L295 | `getBuyerOrders()` | Fetches order history list for authenticated user with status filtering. |
| L297–L385 | `getOrderDetail()` | Fetches detailed order tracking info, warehouse location, payments, holding & receipt links with strict `user_id` check. |

---

## `components/orders/order-status-filter.tsx`
**Purpose**: Client component rendering status filter tabs (`All`, `In Progress`, `Stored in Silo`, `Delivered`, `Cancelled`) synchronized with URL search params.
**Used in**: `app/orders/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L13 | File header & imports | Client boundary, Next.js router & search params imports. |
| L15–L27 | `ORDER_FILTER_TABS` | Array of tab configurations mapping UI labels to query parameter values. |
| L33–L68 | `OrderStatusFilter` & handlers | `handleSelectTab()` using `startTransition` to update URL params and reset pagination. |
| L70–L98 | Component JSX | Horizontally scrollable tab buttons with active Harvest Wheat gold styling. |

---

## `components/orders/order-row.tsx`
**Purpose**: Card component for an individual order item in the buyer's order history list.
**Used in**: `app/orders/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L12 | File header & imports | Image, Card, GradeBadge, PriceDisplay, Badge, and link imports. |
| L14–L49 | `getFulfillmentBadgeConfig()` | Helper mapping order fulfillment status to badge labels and token color classes. |
| L56–L135 | `OrderRow` Component | Renders commodity thumbnail, title, grade badge, quantity, formatted total in `PriceDisplay`, and "View details" link. |

---

## `components/orders/order-summary-card.tsx`
**Purpose**: Detailed financial and warehouse fulfillment breakdown card for the order detail page.
**Used in**: `app/orders/[orderId]/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L14 | File header & imports | UI primitives, types, and utility imports. |
| L20–L62 | Commodity breakdown | Card showing commodity image, grade badge, unit size, quantity, and unit price. |
| L64–L110 | Payment summary | Financial breakdown card showing subtotal, 1% platform fee, total price, and standalone payment status badge. |
| L112–L126 | Warehouse silo card | Warehouse location and hermetic storage quality guarantee notice. |
| L128–L153 | Action buttons & alerts | Direct links to `/my-storage` & `/receipts/[receiptId]` when stored, or cancel guidance alert card. |

---

## `app/orders/page.tsx`
**Purpose**: Server Component page at `/orders` listing all buyer orders with status filtering, wrapped in `AppShell`.
**Used in**: Next.js App Router route `/orders`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L18 | File header & metadata | Route description, SEO metadata, and component props. |
| L27–L38 | Auth verification | Cookie-bound `supabase.auth.getUser()`, redirecting unauthenticated visitors to `/login?redirect=/orders`. |
| L40–L48 | Data fetching | Resolves status search param and queries `getBuyerOrders(user.id, { status })`. |
| L50–L95 | Page JSX | Header, `OrderStatusFilter`, empty state handling, and mapped `OrderRow` cards inside `AppShell`. |

---

## `app/orders/[orderId]/page.tsx`
**Purpose**: Server Component page at `/orders/[orderId]` displaying the real-time fulfillment `StatusStepper`, payment badge, and order summary.
**Used in**: Next.js App Router route `/orders/[orderId]`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L20 | File header & imports | Route metadata generator and Server Component imports. |
| L28–L62 | Stepper definition & helpers | `FULFILLMENT_STEPS` array and `getStepIndex()` status-to-step index calculator. |
| L64–L84 | Auth guard & ownership check | `supabase.auth.getUser()`, fetching `getOrderDetail()`, and triggering `notFound()` on unauthorized access. |
| L86–L150 | Page JSX | Back navigation, order header with status badge, `StatusStepper` card, and `OrderSummaryCard`. |

---

## `__tests__/order-tracking.test.ts`
**Purpose**: Vitest unit test suite validating fulfillment status stepper progression, security ownership scoping, filter matching, and badge configuration.
**Used in**: `npm run test`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L7 | File header | Test suite purpose and acceptance criteria coverage. |
| L9–L47 | Test helpers | `calculateStepIndex()`, `validateOrderAccess()`, `matchesFilter()`. |
| L49–L69 | Stepper progression tests | Tests mapping of `pending_payment`, `sourcing`, `in_transit`, `stored`, `delivered` to step indices. |
| L71–L82 | Security tests | Tests authorized owner access (200) and cross-user rejection (404). |
| L84–L109 | Filter matching tests | Tests filter matching for `all`, `in_progress`, `stored`, and `cancelled`. |
| L111–L122 | Badge config tests | Tests badge label mapping for all fulfillment status values. |

---

# Feature 10: My Storage / Portfolio

## `lib/supabase/queries/holdings.ts`
**Purpose**: Server-side Supabase holdings query module fetching live portfolio valuations from the `holdings_with_current_value` view, computing portfolio summary stats, and enforcing strict user-scoped ownership.
**Used in**: `app/my-storage/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L10 | File header | Module purpose, security rules, ledger constraints (never store current_value or reserved_quantity), and component usage. |
| L12 | `import 'server-only'` | Server-side guard — prevents client-side import of service role client. |
| L13 | Service client import | Imports `createServiceClient` from `@/lib/supabase/service`. |
| L17–L50 | `HoldingWithCurrentValue` | TypeScript interface for a fully-enriched holding row from `holdings_with_current_value` view — includes live market valuation fields. |
| L53–L61 | `PortfolioSummary` | TypeScript interface for aggregated portfolio stats computed server-side. |
| L65–L105 | `getBuyerHoldings()` | Async function querying `holdings_with_current_value` view scoped to `user_id`, with snake_case → camelCase mapping and default fallback values. |
| L108–L165 | `getPortfolioSummary()` | Async function aggregating totalPortfolioValue, holdingsCount, and gain/loss metrics from the view rows server-side — never re-derived client-side. |

---

## `components/my-storage/portfolio-summary.tsx`
**Purpose**: Server Component rendering the top portfolio stats strip with total market value (IBM Plex Mono), gain/loss delta badge (Deep Grain Green or Danger), and holdings count.
**Used in**: `app/my-storage/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L8 | File header | Component purpose, layout rules for desktop/mobile, and usage location. |
| L12–L16 | `PortfolioSummaryProps` | Interface accepting a `PortfolioSummary` object fetched server-side. |
| L21–L28 | `formatNaira()` | Formats numbers as Nigerian Naira with `Intl.NumberFormat`. |
| L31–L38 | `getGainLossSign()` | Returns `positive`, `negative`, or `neutral` based on gain/loss amount. |
| L44–L101 | Desktop banner | 3-column grid card with Paper background, dividers, and Harvest Wheat accent bar. |
| L104–L148 | Mobile strip | Horizontally scrollable compact stat chip row visible on `< md` screens. |

---

## `components/my-storage/holding-actions.tsx`
**Purpose**: Client Component (`"use client"`) providing Resell, Request Buyback, and Request Delivery action buttons. Downstream routes stubbed with "Coming soon" toast messages until Features 13/14 are built.
**Used in**: `components/my-storage/holding-card.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L7 | File header | Client boundary, stub strategy, and usage location. |
| L12–L20 | `HoldingActionsProps` | Interface for holdingId, availableQuantity, and commodityName. |
| L24–L29 | `MiniToast` | Ephemeral toast state interface for "Coming soon" notifications. |
| L35–L55 | Component & helpers | Disabled state computation and `showComingSoonToast` helper with 3s auto-dismiss. |
| L57–L87 | Action handlers | `handleResell`, `handleBuyback`, `handleDelivery` — stub to toast with TODO router comments for future routes. |
| L89–L110 | Toast overlay | Floating "Coming soon" notification with fade-in animation. |
| L113–L165 | Button row | Resell (Deep Grain Green), Buyback (Husk), Delivery (Trust Indigo). All disabled when `availableQuantity === 0`. |

---

## `components/my-storage/holding-card.tsx`
**Purpose**: Server Component rendering a single ledger-style holding card. Each card is one distinct `holdings` row — never merged across purchases.
**Used in**: `app/my-storage/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L10 | File header | Critical ledger constraints (no merging, no stored current_value), layout, and usage. |
| L14–L18 | `HoldingCardProps` | Interface for `HoldingWithCurrentValue`. |
| L23–L67 | Utility functions | `formatNaira`, `getGradeStyle`, `getCommodityEmoji`, `formatDate`. |
| L73–L115 | Card header | Thumbnail, DM Serif Display commodity name, grade badge chip, purchase date. |
| L118–L155 | Quantity row | Available/reserved split display with proportion progress bar. |
| L158–L198 | Valuation row | Purchase vs current price, total market value, gain/loss delta badge. |
| L201–L213 | Location badge | Pin icon + warehouse name + location. |
| L215–L221 | `HoldingActions` | Client action footer with holdingId and availableQuantity. |

---

## `app/my-storage/page.tsx`
**Purpose**: Server Component page at `/my-storage` — auth-guarded buyer portfolio with parallel data fetching and responsive holdings grid.
**Used in**: Next.js App Router route `/my-storage`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L14 | File header | Architecture rules, route description, and data fetch strategy. |
| L17–L22 | Metadata | SEO title and description. |
| L27–L67 | `StorageEmptyState` | Inline server sub-component with silo icon, DM Serif heading, and Browse Marketplace CTA. |
| L71–L90 | Auth guard | `supabase.auth.getUser()` session verification with redirect to `/login?redirect=/my-storage`. |
| L93–L97 | Parallel data fetch | `Promise.all([getPortfolioSummary, getBuyerHoldings])` for optimal SSR performance. |
| L100–L120 | Page header | DM Serif Display title, subtitle, and "Prices update on each page load" hint. |
| L122–L130 | PortfolioSummaryStrip | Conditionally rendered only when holdings exist. |
| L133–L155 | Holdings grid | Responsive 3/2/1 column grid of `HoldingCard` components — each holding is its own distinct card. |
| L157–L160 | Empty state | `StorageEmptyState` rendered when no holdings exist. |

---

# Feature 11: Receipt Detail

## `lib/supabase/queries/receipts.ts`
**Purpose**: Server-side Supabase queries for fetching structured receipt records, calculating live dynamic commodity valuations, and generating short-lived signed URLs from Supabase Storage.
**Used in**: `app/receipts/[receiptId]/page.tsx`, `app/receipts/page.tsx`, `app/api/receipts/[receiptId]/download/route.ts`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L9 | File comment | Query module description, security constraints (`auth.uid() = user_id`), and usage locations. |
| L14–L57 | `ReceiptDetail` | Interface defining full structured receipt fields (ID, receiptNumber, orderId, holdingId, commodity metadata, purchase value, live valuation, profitLoss, status, documentUrl). |
| L63–L125 | `DEMO_RECEIPTS` | In-memory fallback receipt records for development mode and demo preview testing. |
| L131–L257 | `getReceiptDetail()` | Async query resolving receipt record, joining `holdings_with_current_value` or `order_items` for real-time market valuation calculation. |
| L263–L290 | `getUserReceipts()` | Async query fetching all certified warehouse receipts belonging to the authenticated buyer. |
| L296–L330 | `getReceiptSignedDownloadUrl()` | Generates a 60-second cryptographically signed download URL from Supabase Storage private bucket `receipts`. |

---

## `components/receipts/receipt-view.tsx`
**Purpose**: Full-size physical warehouse ledger ticket component rendering perforated edges, dark green header band, commodity metadata, grade badge, purchase price, live market valuation, and location verification.
**Used in**: `app/receipts/[receiptId]/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L7 | File comment | Component description, design tokens, and usage location. |
| L11–L14 | `ReceiptViewProps` | Component interface receiving a `ReceiptDetail` record. |
| L19–L40 | Perforated Header | Dark green ribbon (`#21483A`) with gold receipt number and status badge pill. |
| L42–L65 | Commodity Header | DM Serif Display commodity name, uppercase ticket subtitle, and location tag. |
| L67–L85 | Quantity & Grade | 2-column Paper box with IBM Plex Mono stored quantity and `GradeBadge`. |
| L87–L115 | Purchase Breakdown | Purchase date, unit purchase price, and total cost basis in NGN. |
| L117–L155 | Live Valuation | Real-time market valuation in large IBM Plex Mono with positive/negative profit delta pill badge. |
| L157–L185 | Verification Metadata | Ownership status, warehouse name, receipt serial ID, and issue timestamp. |
| L187–L195 | Footer Microprint | Verifiable physical silo and on-chain ledger microprint band. |

---

## `components/receipts/receipt-actions.tsx`
**Purpose**: Client Component (`"use client"`) rendering "View in My Storage" link button and "Download Receipt" action button with loading spinners and print fallback.
**Used in**: `app/receipts/[receiptId]/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File comment | Client directive and interactive button description. |
| L10–L16 | `ReceiptActionsProps` | Interface for receiptId, holdingId, and receiptNumber. |
| L21–L56 | `handleDownload()` | Async handler requesting signed download URL from `/api/receipts/[receiptId]/download` and triggering browser download or print dialog fallback. |
| L58–L102 | Component JSX | Responsive 2-button row with Harvest Wheat accent styling and loading spinners. |

---

## `components/receipts/receipt-not-generated.tsx`
**Purpose**: Clean pending/empty state placeholder for orders that exist but have not yet been stored in a physical silo.
**Used in**: `app/receipts/[receiptId]/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File comment | Component purpose and pending state guidelines. |
| L10–L13 | `ReceiptNotGeneratedProps` | Component props for optional orderId. |
| L15–L46 | Component JSX | Centered Paper card with hourglass icon, DM Serif heading, explanatory copy, and Track Order CTA. |

---

## `app/api/receipts/[receiptId]/download/route.ts`
**Purpose**: Secure API Route Handler generating short-lived signed URLs from Supabase Storage or returning printable HTML receipt data.
**Used in**: `GET /api/receipts/[receiptId]/download`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L5 | File comment | API route description and security verification requirements. |
| L10–L30 | Auth & Validation | Verifies user session with Supabase Auth and validates receipt ownership. |
| L32–L90 | Signed URL & Fallback | Calls `getReceiptSignedDownloadUrl()` and returns signed URL JSON or printable HTML document. |

---

## `app/receipts/[receiptId]/page.tsx`
**Purpose**: Server Component page at `/receipts/[receiptId]` rendering the full digital warehouse receipt ticket, breadcrumb trail, and action controls.
**Used in**: Protected route `/receipts/[receiptId]`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L9 | File comment | Route overview, Server Component architecture, and session guard rules. |
| L18–L23 | Metadata | Dynamic SEO metadata for warehouse receipt page. |
| L32–L50 | Auth & Data Fetching | Verifies user session and calls `getReceiptDetail(userId, receiptId)` server-side. |
| L52–L105 | Page Layout | Renders `AppShell`, breadcrumbs (`Orders / #ID / Receipt`), `ReceiptView`, and `ReceiptActions`. |

---

## `app/receipts/page.tsx`
**Purpose**: Server Component page at `/receipts` rendering an overview catalog of all certified receipts belonging to the authenticated buyer.
**Used in**: Protected route `/receipts`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L8 | File comment | Page purpose, SSR data loading, and layout overview. |
| L18–L23 | Metadata | SEO metadata for receipts index. |
| L30–L46 | Auth & Data Fetching | Queries `getUserReceipts(userId)` server-side. |
| L48–L135 | Page Grid | Renders `AppShell`, page header, responsive 2-column receipt card grid, and `EmptyState`. |

---

# Feature 12: Resale Marketplace (Browse & Buy)

## `lib/supabase/queries/resale.ts`
**Purpose**: Server-side query module fetching sanitized peer-to-peer resale listings from the `resale_listings_public` view.
**Used in**: `app/resale/page.tsx`, `app/api/resale/[id]/buy/route.ts`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L5 | File comment | Query module description, anonymization enforcement, and route usage. |
| L6–L8 | Imports | Server-only guard and Supabase service client constructor. |
| L17–L48 | Type Definitions | `PublicResaleListing` and `ResaleFilterOptions` interfaces. |
| L54–L186 | `FALLBACK_RESALE_LISTINGS` | Realistic mock fallback array of active verified listings for local dev/seed demonstration. |
| L197–L275 | `getActiveResaleListings()` | Server query reading from `resale_listings_public` with category filtering and price/recency sorting. |
| L284–L341 | `getResaleListingById()` | Server query fetching a single sanitized listing by ID. |
| L347–L368 | `filterFallbackListings()` | Pure helper function filtering/sorting fallback arrays. |

---

## `components/resale/resale-header.tsx`
**Purpose**: Page banner displaying DM Serif title, subtitle, and peer-to-peer security assurance badges.
**Used in**: `app/resale/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L4 | File comment | Component description and usage. |
| L6–L37 | `ResaleHeader` | Header block with "Resale Marketplace" headline, description, and trust badges (Silo Verified, Escrow Protected, Instant Title Transfer). |

---

## `components/resale/resale-filter-bar.tsx`
**Purpose**: Client Component (`"use client"`) managing commodity category selection chips and price sort dropdown via URL search params.
**Used in**: `app/resale/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L5 | File comment | Client directive and URL search param state strategy. |
| L7 | Client directive | `"use client"`. |
| L14–L26 | Constants | `CATEGORIES` chips (All, Rice, Garlic, Beans, Melon) and `SORT_OPTIONS` dropdown entries. |
| L32–L84 | `ResaleFilterBar` | Component handling chip selections and sort changes using `useRouter` and `useSearchParams`. |

---

## `components/resale/resale-card.tsx`
**Purpose**: Client Component (`"use client"`) rendering individual listing cards with commodity emoji visual, `GradeBadge`, price breakdown matrix, anonymized seller tag, and interactive "Buy Listing" Paystack checkout trigger.
**Used in**: `components/resale/resale-grid.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File comment | Card component description and Paystack checkout handler overview. |
| L8 | Client directive | `"use client"`. |
| L17–L19 | `ResaleCardProps` | Component prop interface accepting `PublicResaleListing`. |
| L25–L33 | `getCommodityIcon()` | Visual fallback emoji resolver. |
| L39–L175 | `ResaleCard` | Listing card with image thumbnail, `GradeBadge`, price delta pill, `PriceDisplay` values, anonymized seller tag, and async "Buy Listing" button. |

---

## `components/resale/resale-grid.tsx`
**Purpose**: Responsive grid container displaying 3 columns on desktop and 1 column on mobile, with active listing count indicator.
**Used in**: `app/resale/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L4 | File comment | Component description and grid layout. |
| L12–L14 | `ResaleGridProps` | Prop interface for listings array. |
| L20–L38 | `ResaleGrid` | Renders listing count header pill and responsive grid mapping over `ResaleCard`. |

---

## `components/resale/resale-empty-state.tsx`
**Purpose**: Empty state container rendered when no resale listings match active filters, providing clear filter reset actions.
**Used in**: `app/resale/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L5 | File comment | Component description and empty state guidelines. |
| L13–L46 | `ResaleEmptyState` | Centered Paper container with grain icon, DM Serif heading, explanatory copy, and "Reset All Filters" CTA. |

---

## `app/api/resale/[id]/buy/route.ts`
**Purpose**: Secure API Route Handler authenticating buyer, atomically reserving the resale listing, creating a pending order, and initializing Paystack checkout.
**Used in**: `POST /api/resale/[id]/buy`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File comment | Endpoint description, concurrency locking, and Paystack integration. |
| L18–L128 | `POST()` | Route handler: checks buyer session, validates active listing, executes atomic reservation lock, creates order, and returns Paystack `authorizationUrl`. |

---

## `app/resale/page.tsx`
**Purpose**: Server Component page at `/resale` rendering the peer-to-peer secondary commodity marketplace.
**Used in**: Protected route `/resale`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L7 | File comment | Server Component overview, URL-driven filtering, and layout structure. |
| L17–L22 | Metadata | SEO metadata for Resale Marketplace. |
| L34–L62 | `ResalePage()` | Server Component resolving searchParams, fetching active listings via `getActiveResaleListings`, and rendering `AppShell`, `ResaleHeader`, `ResaleFilterBar`, and `ResaleGrid` / `ResaleEmptyState`. |

---

# Feature 13: Create & Manage Resale Listings

## `lib/supabase/queries/resale.ts`
**Purpose**: Server-side query and mutation module handling active marketplace browse, seller-side listing queries, atomic holding reservation upon creation, inline price updating, and safe listing cancellation with reservation release.
**Used in**: `app/resale/page.tsx`, `app/resale/my-listings/page.tsx`, `app/api/resale/*`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File header | Module purpose, anonymity rules, seller management capabilities, and usage locations. |
| L10–L49 | Type Definitions | `PublicResaleListing`, `SellerResaleListing`, `ResaleFilterOptions`, and `CreateResaleListingParams`. |
| L54–L200 | `FALLBACK_RESALE_LISTINGS` & In-memory storage | Fallback catalog for development mode and demo preview testing. |
| L205–L279 | `getActiveResaleListings()` | Server query reading sanitized listings from `resale_listings_public` view with filtering and sorting. |
| L284–L337 | `getResaleListingById()` | Server query fetching a single sanitized listing by ID. |
| L341–L420 | `getMyResaleListings()` | Server query fetching seller's own listings joined with commodity, grade, and warehouse metadata. |
| L425–L520 | `createResaleListing()` | Mutation function validating available quantity, calling `reserve_holding_quantity` RPC, inserting listing, and recording audit movement. |
| L525–L578 | `updateListingPrice()` | Mutation function updating `unit_price` on active listing owned by authenticated user. |
| L583–L665 | `cancelResaleListing()` | Mutation function releasing reserved holding quantity via `release_holding_quantity` RPC and setting status to `cancelled`. |

---

## `app/api/resale/route.ts`
**Purpose**: Authenticated API endpoint creating a resale listing from an owned holding with atomic quantity reservation.
**Used in**: `POST /api/resale`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L7 | File header | API route description and authentication rules. |
| L11–L80 | `POST()` | Route handler: validates user session, checks inputs, calls `createResaleListing()`, and returns new listing ID. |

---

## `app/api/resale/[id]/cancel/route.ts`
**Purpose**: Authenticated API endpoint cancelling an active listing and immediately releasing the holding's reserved quantity.
**Used in**: `POST /api/resale/[id]/cancel`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L7 | File header | API route description and security verification. |
| L11–L56 | `POST()` | Route handler: verifies seller session, calls `cancelResaleListing()`, and returns confirmation. |

---

## `app/api/resale/[id]/price/route.ts`
**Purpose**: Authenticated API endpoint updating the asking unit price on an active listing.
**Used in**: `PATCH /api/resale/[id]/price`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L7 | File header | API route description and ownership checks. |
| L11–L60 | `PATCH()` | Route handler: validates user session, validates positive price, and calls `updateListingPrice()`. |

---

## `components/resale/create-listing-modal.tsx`
**Purpose**: Client Component (`"use client"`) rendering the listing creation modal/sheet launched from holding cards in `/my-storage`.
**Used in**: `components/my-storage/holding-actions.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L8 | File header | Client directive, modal purpose, and parameter descriptions. |
| L15–L33 | `CreateListingHoldingInfo` & Props | Interface defining holding input properties and callbacks. |
| L40–L120 | State & Handlers | Manages clamped quantity stepper, unit price input, duration selector (7/14/30 days), and async submission. |
| L122–L285 | Component JSX | Dialog container, header, commodity chip, quantity stepper, asking price input, duration pills, financial summary breakdown, error banner, and submit CTA. |

---

## `components/resale/edit-price-modal.tsx`
**Purpose**: Client Component (`"use client"`) allowing sellers to adjust unit price on active listings with live gross total recalculation.
**Used in**: `components/resale/my-listing-row.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L7 | File header | Component description and live recalculation rules. |
| L15–L30 | Props & Interface | Interface for listing metadata and callbacks. |
| L35–L80 | State & Handlers | Price input state, validation, and async PATCH handler to `/api/resale/[id]/price`. |
| L82–L190 | Component JSX | Modal overlay, commodity info, price input with Naira prefix, financial summary, and action buttons. |

---

## `components/resale/cancel-listing-dialog.tsx`
**Purpose**: Client Component (`"use client"`) providing explicit confirmation before cancelling a listing, explaining that holding quantity is restored immediately.
**Used in**: `components/resale/my-listing-row.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L7 | File header | Dialog description and storage restoration notice. |
| L14–L27 | Props & Interface | Dialog props interface. |
| L32–L65 | Handler | Async POST handler calling `/api/resale/[id]/cancel`. |
| L67–L135 | Component JSX | Warning icon, description copy, storage restoration badge, and destructive confirmation buttons. |

---

## `components/resale/my-listing-row.tsx`
**Purpose**: Client Component (`"use client"`) rendering individual seller listing cards with status badge (`Active`, `Sold`, `Expired`, `Cancelled`), metrics, and action triggers.
**Used in**: `app/resale/my-listings/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L7 | File header | Component description and modal trigger connections. |
| L15–L21 | `MyListingRowProps` | Prop interface for `SellerResaleListing`. |
| L25–L85 | Helpers | `formatNaira`, `formatDate`, `getCommodityEmoji`, and `getStatusBadge` styling. |
| L90–L240 | Component JSX | Card layout with thumbnail, title, grade badge, status pill, warehouse location, quantity, asking price, and "Edit Price" / "Cancel Listing" buttons. |

---

## `components/resale/my-listings-tabs.tsx`
**Purpose**: Client Component (`"use client"`) rendering URL-driven filter tabs (`All`, `Active`, `Sold`, `Expired`, `Cancelled`).
**Used in**: `app/resale/my-listings/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File header | Component description and URL state strategy. |
| L12–L24 | `TABS` | Array of tab definitions (all, active, sold, expired, cancelled). |
| L28–L62 | Component JSX | Horizontally scrollable row of styled pill tab buttons using `useRouter` and `useSearchParams`. |

---

## `components/resale/my-listings-header.tsx`
**Purpose**: Server Component rendering breadcrumb navigation, DM Serif title, subtitle, and "+ List from Storage" button.
**Used in**: `app/resale/my-listings/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File header | Component description and navigation links. |
| L10–L44 | Component JSX | Breadcrumbs (`Resale Marketplace / My Listings`), page title, and action link to `/my-storage`. |

---

## `app/resale/my-listings/page.tsx`
**Purpose**: Server Component page at `/resale/my-listings` managing seller listings with authentication, status filtering, and empty states.
**Used in**: Protected route `/resale/my-listings`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L7 | File header | Route overview, SSR data loading, and auth guards. |
| L17–L22 | Metadata | SEO metadata for My Resale Listings. |
| L30–L102 | `MyListingsPage()` | Server Component: verifies user session, resolves URL status filter, calls `getMyResaleListings()`, and renders `AppShell`, `MyListingsHeader`, `MyListingsTabs`, and `MyListingRow` list. |

---

## `supabase/migrations/0007_add_buyback_price.sql`
**Purpose**: Migration adding the `buyback_price` column to the `commodities` table.
**Used in**: Supabase Database Migrations.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L8 | Header comment | Migration metadata, schema rules, and rationale for distinct buyback vs retail pricing. |
| L10–L13 | Column Addition | `ALTER TABLE commodities ADD COLUMN buyback_price NUMERIC(18,4) NOT NULL DEFAULT 0 CHECK (buyback_price >= 0)`. |
| L15–L18 | Index Definition | Partial index `idx_commodities_buyback_price` on active buyback commodities. |
| L20–L24 | Table Comment | Database documentation comment explaining admin control and live reading requirements. |

---

## `lib/supabase/queries/buyback.ts`
**Purpose**: Supabase query and transaction layer for buyback listing, retrieval, live price fetching, and atomic request submissions.
**Used in**: `app/buyback/page.tsx`, `app/buyback/[requestId]/page.tsx`, `app/api/buybacks/route.ts`, `app/api/buybacks/price/route.ts`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L10 | File header | Module description, security rules, and usage contexts. |
| L12–L45 | Type Definitions | `BuybackStatus`, `BuybackRequest`, `BuybackRequestRow` interfaces. |
| L47–L110 | `FALLBACK_BUYBACK_REQUESTS` | Mock fallback catalog for local development and offline resilience. |
| L112–L170 | `getBuyerBuybackRequests()` | Fetches and flattens all buyback requests for a given user with optional status filter. |
| L172–L240 | `getBuybackRequestDetail()` | Fetches single buyback request detail strictly enforcing `user_id` ownership. |
| L242–L280 | `getLiveBuybackPrice()` | Fetches real-time admin buyback price for a commodity. |
| L282–L410 | `submitBuybackRequest()` | Executes atomic holding reservation (`reserve_holding_quantity`), inserts `buyback_requests` record, and writes `holding_movements` audit log. |

---

## `app/api/buybacks/route.ts`
**Purpose**: Authenticated API route handling buyback submission with session verification and atomic holding reservation.
**Used in**: `components/buyback/request-modal.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L9 | File header | Endpoint purpose and security invariants. |
| L11–L65 | `POST(req)` | Authenticates buyer via `supabase.auth.getUser()`, validates request payload (`holdingId`, `quantity`), executes `submitBuybackRequest()`, and returns result. |

---

## `app/api/buybacks/price/route.ts`
**Purpose**: Route handler for fetching the live, un-cached buyback price for a commodity.
**Used in**: `components/buyback/request-modal.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L8 | File header | Module description and live price fetching directives. |
| L10–L40 | `GET(req)` | Reads `commodityId` search param, queries `getLiveBuybackPrice()`, and returns live price JSON. |

---

## `components/buyback/buyback-timeline.tsx`
**Purpose**: Server Component rendering the vertical status progression timeline for a buyback request.
**Used in**: `app/buyback/[requestId]/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L8 | File header | Component description and status timeline states. |
| L10–L25 | Props Interface | `BuybackTimelineProps` interface definitions. |
| L27–L190 | `BuybackTimeline()` | Renders 3-step timeline (Submitted → Under Review/Approved/Declined → Paid) with date formatting, color-coded indicators, and admin note callout banner. |

---

## `components/buyback/buyback-row.tsx`
**Purpose**: Component rendering an individual buyback request card/row in the list view.
**Used in**: `app/buyback/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L8 | File header | Component description and field layout strategy. |
| L10–L60 | `renderStatusBadge()` | Maps `BuybackStatus` to design tokens (`Harvest Wheat`, `Husk`, `Deep Grain Green`, `Danger`). |
| L62–L155 | `BuybackRow()` | Responsive layout: table-grid on desktop (≥640px) and stacked card on mobile (<640px) with commodity title, GradeBadge, quantity, price, and "View" button. |

---

## `components/buyback/request-modal.tsx`
**Purpose**: Client Component (`"use client"`) rendering the buyback request modal / bottom sheet from `/my-storage`.
**Used in**: `components/my-storage/holding-actions.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L8 | File header | Modal overview, interactive quantity stepper, and live calculation. |
| L10–L35 | Props & Types | `RequestBuybackHoldingInfo` and `RequestModalProps` interfaces. |
| L37–L100 | State & Handlers | Quantity stepper clamped between 1 and available quantity, live buyback price fetch, and async form submission to `POST /api/buybacks`. |
| L102–L250 | Component JSX | Centered modal (desktop) / bottom sheet (mobile) with commodity info, GradeBadge, current buyback price strip, stepper, estimated payout box, review timeline notice, and submit CTA button. |

---

## `app/buyback/page.tsx`
**Purpose**: Server Component page at `/buyback` listing all buyback liquidation requests with status filter tabs.
**Used in**: Protected route `/buyback`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L8 | File header | Page overview, SSR data loading, and URL filtering. |
| L10–L25 | Metadata & Types | SEO metadata and `BuybackPageProps`. |
| L27–L38 | `STATUS_TABS` | URL-driven tab configuration (All, Pending, Approved, Paid, Declined). |
| L40–L125 | `BuybackPage()` | Authenticates buyer, fetches requests via `getBuyerBuybackRequests()`, and renders header, status tabs, `BuybackRow` list, or `EmptyState`. |

---

## `app/buyback/[requestId]/page.tsx`
**Purpose**: Server Component detail page tracking a specific buyback request's breakdown and timeline.
**Used in**: Protected route `/buyback/[requestId]`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L8 | File header | Detail page overview, ownership enforcement, and layout. |
| L10–L25 | Metadata & Types | SEO metadata and page params. |
| L27–L180 | `BuybackDetailPage()` | Authenticates buyer, queries `getBuybackRequestDetail()` (404 on mismatch), renders commodity card, financial breakdown card, and `BuybackTimeline`. |

---

## `components/my-storage/holding-actions.tsx`
**Purpose**: Client Component on holding cards updated to launch `RequestBuybackModal`.
**Used in**: `components/my-storage/holding-card.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L8 | File header | Description updated to reflect buyback modal integration. |
| L10–L35 | Props Interface | Added `commodityId` and `gradeId` properties. |
| L45–L110 | State & Handlers | Added `isBuybackModalOpen` state; updated `handleBuyback()` to open `RequestBuybackModal`. |
---

# Feature 15: Notifications Center

## `supabase/migrations/0008_notifications_in_app.sql`
**Purpose**: Migration adding `is_read`, `read_at`, and `type` columns and performance indices to `notifications` table for first-class in-app notification center.
**Used in**: Supabase Database Migrations.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | Migration header | Migration metadata and overview. |
| L8–L12 | Schema alterations | Adds `is_read BOOLEAN NOT NULL DEFAULT FALSE`, `read_at TIMESTAMPTZ`, and `type TEXT NOT NULL DEFAULT 'general'` to `notifications`. |
| L14–L22 | Performance indices | Creates partial index `idx_notifications_in_app_unread` and `idx_notifications_in_app_created` on `(user_id, is_read)` where `channel = 'in_app'`. |
| L24–L27 | Column comments | Database documentation comments for `is_read`, `read_at`, and `type`. |

---

## `lib/supabase/queries/notifications.ts`
**Purpose**: Supabase query and mutation module handling in-app notifications feed fetching, indexed unread counts, single/bulk mark-as-read updates, and domain helper insertion.
**Used in**: `app/notifications/page.tsx`, `app/api/notifications/*`, `components/layout/app-shell.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L9 | File header | Query module description, security constraints (`auth.uid() = user_id`), and usage contexts. |
| L11–L30 | Type Definitions | `NotificationType` and `InAppNotification` interfaces. |
| L32–L65 | `deriveNotificationLink()` | Pure helper deriving target deep links (`/orders/[id]`, `/resale/my-listings`, `/buyback/[id]`, `/commodities/[id]`) from notification metadata payload. |
| L67–L118 | `DEMO_NOTIFICATIONS` | Mock fallback notifications array for development mode and demo preview testing. |
| L120–L185 | `getInAppNotifications()` | Server query fetching chronologically ordered in-app notifications with category filter support (`all`, `unread`, `orders`, `resale`, `buyback`, `pricing`). |
| L187–L215 | `getUnreadNotificationsCount()` | Fast indexed count query retrieving total unread in-app notifications for nav badge. |
| L220–L250 | `markNotificationAsRead()` | Server mutation updating `is_read = true` and `read_at = NOW()` for a single owned notification. |
| L252–L280 | `markAllNotificationsAsRead()` | Server mutation marking all unread in-app notifications for the user as read. |
| L282–L320 | `createInAppNotification()` | Helper mutation allowing domain services to dispatch in-app notifications. |

---

## `app/api/notifications/[id]/read/route.ts`
**Purpose**: Authenticated API endpoint marking a single in-app notification as read.
**Used in**: `POST /api/notifications/[id]/read`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L8 | File header | Endpoint description, route parameters, and ownership rules. |
| L10–L45 | `POST(req, { params })` | Authenticates user via `supabase.auth.getUser()`, calls `markNotificationAsRead(userId, id)`, and returns success JSON. |

---

## `app/api/notifications/read-all/route.ts`
**Purpose**: Authenticated API endpoint marking all unread in-app notifications for the current buyer as read.
**Used in**: `POST /api/notifications/read-all`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L8 | File header | Endpoint description and authentication rules. |
| L10–L40 | `POST(req)` | Authenticates user via `supabase.auth.getUser()`, calls `markAllNotificationsAsRead(userId)`, and returns success JSON. |

---

## `components/notifications/notification-row.tsx`
**Purpose**: Client Component (`"use client"`) rendering an individual notification card with category-specific icon, unread Harvest Wheat left border and status dot, relative timestamp, and click-to-read deep link navigation.
**Used in**: `app/notifications/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L8 | File header | Component description and interaction overview. |
| L10–L18 | Props & Types | `NotificationRowProps` interface. |
| L20–L37 | `formatRelativeTime()` | Helper computing relative timestamps ("Just now", "10m ago", "Yesterday"). |
| L39–L95 | `getNotificationIcon()` | Icon resolver rendering Silo green for orders, Gold tag for resale, Indigo tick for buyback, and Trend green for price alerts. |
| L97–L180 | `NotificationRow` | Interactive card with gold border/dot unread styling, category icon, title, description snippet, relative timestamp, and chevron navigation arrow. |

---

## `components/notifications/mark-all-read-button.tsx`
**Purpose**: Client Component (`"use client"`) providing header action button to mark all notifications as read across desktop and mobile.
**Used in**: `app/notifications/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L8 | File header | Component description and variant options. |
| L10–L18 | Props & Types | `MarkAllReadButtonProps` interface. |
| L20–L70 | `MarkAllReadButton` | Interactive button calling `POST /api/notifications/read-all` with loading state and router refresh. |

---

## `components/notifications/notification-filters.tsx`
**Purpose**: Client Component (`"use client"`) rendering URL-driven filter pills (`All`, `Unread`, `Orders`, `Resale`, `Buyback`, `Pricing`) with unread count badge.
**Used in**: `app/notifications/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L8 | File header | Component description and URL search params strategy. |
| L10–L25 | `FILTERS` | Array of category filter definitions. |
| L27–L75 | `NotificationFilters` | Horizontally scrollable filter pills using `useRouter` and `useSearchParams`. |

---

## `app/notifications/page.tsx`
**Purpose**: Server Component page at `/notifications` rendering the buyer's in-app notification center inside `AppShell`.
**Used in**: Protected route `/notifications`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L10 | File header | Page overview, SSR data loading, and layout structure. |
| L12–L25 | Metadata & Props | Dynamic SEO metadata and `NotificationsPageProps`. |
| L27–L95 | `NotificationsPage()` | Server Component: authenticates buyer, fetches notifications feed and unread count in parallel, and renders `AppShell`, header with unread badge, `MarkAllReadButton`, `NotificationFilters`, and `NotificationRow` list or `EmptyState`. |

---

# Feature 16: Profile & Account Settings

## `lib/supabase/queries/profile.ts`
**Purpose**: Server-side query module providing user profile retrieval, full name updates, onboarding status flags, and financial invariants checking for guarded account deletion.
**Used in**: `app/profile/page.tsx`, `app/api/profile/route.ts`, `app/api/account/delete/route.ts`, `middleware.ts`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L7 | File header | Module purpose, RLS security scoping (`auth.uid() = id`), and usage contexts. |
| L9–L24 | Type Definitions | `Profile` entity interface and `AccountDeletionCheckResult` interface. |
| L26–L47 | `getProfile(userId)` | Server query reading full profile record from `profiles` table. |
| L49–L73 | `updateProfile(userId, updates)` | Server mutation updating `full_name` and `updated_at` scoped to `auth.uid()`. |
| L75–L138 | `checkAccountDeletionEligibility(userId)` | Server guard checking 4 financial invariants: stored commodity holdings (`quantity > 0`), in-progress orders (`pending_payment`, `sourcing`, `in_transit`), active resale listings (`active`), and pending/approved buyback requests (`pending`, `approved`). Returns detailed blocking reasons if any exist. |
| L140–L180 | Onboarding & Role helpers | `markOnboardingComplete()`, `getOnboardingStatus()`, and `getUserRole()` utilities. |

---

## `app/api/profile/route.ts`
**Purpose**: Authenticated API endpoint handling user profile display name updates.
**Used in**: `POST /api/profile`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File header | Route overview, session security requirements, and caller locations. |
| L11–L58 | `POST(req)` | Authenticates session via `supabase.auth.getUser()`, validates `full_name` input, executes `updateProfile()`, and returns updated profile JSON. |

---

## `app/api/account/delete/route.ts`
**Purpose**: Authenticated API endpoint executing destructive user account deletion protected by financial invariant guards.
**Used in**: `POST /api/account/delete`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L9 | File header | Route overview, financial ledger invariant rules, audit trail logging, and session termination. |
| L14–L80 | `POST(req)` | Verifies user session, validates typed `"DELETE"` confirmation string, verifies financial invariants via `checkAccountDeletionEligibility()`, inserts `audit_logs` record, permanently deletes auth user via Supabase admin service client, and revokes session. |

---

## `components/profile/section-nav.tsx`
**Purpose**: Client Component (`"use client"`) providing responsive section tab navigation (Personal Profile, Contact Details, Security & Password, Account Actions) on desktop (vertical card) and mobile (horizontal scrollable pills).
**Used in**: `components/profile/profile-view.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File header | Component description and responsive viewport behaviors. |
| L12–L65 | `PROFILE_SECTIONS` | Array of section navigation items with custom SVG icons and descriptions. |
| L71–L140 | `SectionNav` | Component rendering scrollable pill buttons on mobile and styled vertical left sidebar with active gold indicator on desktop. |

---

## `components/profile/profile-form.tsx`
**Purpose**: Client Component (`"use client"`) managing personal identity information, initials avatar with `Verified Buyer` badge, membership role, joined timestamp, and full name updating with toast feedback.
**Used in**: `components/profile/profile-view.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File header | Component description and form interaction overview. |
| L14–L22 | `ProfileFormProps` | Interface for profile initial data. |
| L26–L60 | State & Hooks | Manages `fullName`, `isSaving`, computed initials, formatted member since string, and auto-dismissing toast alerts. |
| L62–L95 | `handleSubmit()` | Form submission handler calling `POST /api/profile` and surfacing toast notifications. |
| L97–L185 | Component JSX | Renders toast banners, section header, avatar card with verification badge, name input, and "Save Changes" button. |

---

## `components/profile/contact-form.tsx`
**Purpose**: Client Component (`"use client"`) displaying verified email address and phone number with dialog modals triggering Supabase Auth verified verification confirmation flows.
**Used in**: `components/profile/profile-view.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File header | Component description and Supabase Auth verification flow requirements. |
| L15–L20 | `ContactFormProps` | Interface for email and phone initial values. |
| L24–L50 | State management | Manages email/phone states, dialog visibility (`isEmailModalOpen`, `isPhoneModalOpen`), and alert banners. |
| L52–L115 | Update Handlers | `handleUpdateEmail()` calling `supabase.auth.updateUser({ email })` and `handleUpdatePhone()` calling `supabase.auth.updateUser({ phone })`. |
| L117–L245 | Component JSX | Contact credential cards, status badges (`Verified`, `Optional`), security policy notice, and interactive email/phone update `Modal` dialogs. |

---

## `components/profile/account-section.tsx`
**Purpose**: Client Component (`"use client"`) providing password updating, active session logout, and guarded account deletion modal requiring two-step typed confirmation (`"DELETE"`) with financial invariant error reporting.
**Used in**: `components/profile/profile-view.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File header | Component description and two-step deletion safeguards. |
| L14–L18 | `AccountSectionProps` | Prop interface for user ID and email. |
| L22–L50 | State management | Manages password modal state, deletion modal state, typed confirmation input, loading states, and error reasons array. |
| L52–L80 | `handleUpdatePassword()` | Updates user password via `supabase.auth.updateUser({ password })`. |
| L82–L100 | `handleLogout()` | Clears user session via `supabase.auth.signOut()` and redirects to `/login`. |
| L102–L140 | `handleDeleteAccount()` | Validates `"DELETE"` input, submits to `POST /api/account/delete`, handles blocking reasons list, or redirects to `/login?message=account_deleted`. |
| L142–L320 | Component JSX | Security card (Password & Sign Out), Danger Zone card with invariant requirements, password modal, and two-step guarded account deletion modal. |

---

## `components/profile/profile-view.tsx`
**Purpose**: Client Component (`"use client"`) orchestrating section switching and 2-column responsive layout for Profile, Contact, Security, and Account sections.
**Used in**: `app/profile/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File header | Master container description and responsive layout structure. |
| L15–L21 | `ProfileViewProps` | Prop interface passing initial user and profile records. |
| L25–L85 | `ProfileView` | Renders page headline, responsive 2-column grid with `SectionNav` on left and selected active section component on right. |

---

## `app/profile/page.tsx`
**Purpose**: Server Component page at `/profile` authenticating buyer session, fetching profile metadata via `getProfile()`, and rendering `ProfileView` inside `AppShell`.
**Used in**: Protected route `/profile`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File header | Route overview, SSR data loading, and layout integration. |
| L13–L17 | Metadata | Dynamic SEO metadata for Profile & Account Settings. |
| L20–L50 | `ProfilePage()` | Server Component: authenticates user via `supabase.auth.getUser()`, fetches profile record, and renders `AppShell` with active `Profile` navigation and `ProfileView`. |

---

## `lib/supabase/queries/admin/dashboard.ts`
**Purpose**: Administrative service-role queries aggregating operational KPIs, needs-attention triage alerts, and recent audit activity logs across KorraStore.
**Used in**: `app/admin/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File header | Security guard note, elevated service client usage, and feature summary. |
| L14–L49 | Interfaces | `AdminDashboardStats`, `NeedsAttentionItem`, `AdminActivityItem`. |
| L55–L69 | `formatRelativeTime()` | Helper converting ISO timestamps into concise relative strings ("5m ago", "2h ago"). |
| L74–L165 | `getAdminDashboardStats()` | Parallel aggregation across `orders`, `buyback_requests`, `resale_listings`, `inventory`, and `commodities`. Calculates total storage weight and physical asset valuation with graceful fallbacks. |
| L170–L255 | `getNeedsAttentionItems()` | Queries pending buyback liquidation requests, processing orders, and critical stock deficits to prioritize action items. |
| L260–L355 | `getRecentAuditActivity()` | Queries latest entries from `audit_logs`, formats action types, assigns category icons, and attributes actor details. |

---

## `components/admin/layout/admin-nav-rail.tsx`
**Purpose**: Client Component (`"use client"`) rendering the persistent 240px wide desktop navigation sidebar with 8 admin operations sections, active gold indicators, and buyer store switcher.
**Used in**: `app/admin/layout.tsx` (Desktop viewports ≥ 1024px).

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L5 | File header | Component overview and responsive viewport targeting. |
| L14–L19 | `AdminNavItem` | TypeScript interface for admin navigation links. |
| L25–L105 | `ADMIN_NAV_ITEMS` | Definition of 8 admin routes (Dashboard, Orders, Inventory, Pricing, Resale & Buybacks, Reports, Support, Settings) with bespoke SVG icons. |
| L118–L200 | `AdminNavRail` | Renders branding header with "Operations Hub" subtitle, navigation list with active Harvest Wheat (`#D8B56A`) pills, buyer portal switch link, and admin profile card. |

---

## `components/admin/layout/admin-bottom-tab-bar.tsx`
**Purpose**: Client Component (`"use client"`) rendering the fixed bottom navigation bar for mobile devices (< 1024px) with 5 key admin destinations.
**Used in**: `app/admin/layout.tsx` (Mobile viewports).

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L5 | File header | Component overview and mobile navigation setup. |
| L14–L65 | `MOBILE_ADMIN_TABS` | Definition of 5 core mobile tabs (Dashboard, Orders, Inventory, Resale, Settings). |
| L71–L110 | `AdminBottomTabBar` | Sticky bottom bar with backdrop blur, active Harvest Wheat indicators, and route labels. |

---

## `components/admin/layout/admin-header.tsx`
**Purpose**: Client Component (`"use client"`) rendering the top administration header with live breadcrumbs, synchronized silos health status pill, and real-time clock.
**Used in**: `app/admin/layout.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L5 | File header | Component overview and layout role. |
| L18–L38 | Time state | `useEffect` updating live West Africa Time (WAT) clock string every second. |
| L40–L95 | Component JSX | Renders mobile brand title, breadcrumbs, green pulse "Silos Live & Synchronized" badge, live clock, buyer store link, and admin initials avatar. |

---

## `components/admin/dashboard/stat-tile.tsx`
**Purpose**: Presentation component rendering an operational metric card with IBM Plex Mono typography, category icon, trend badge, and optional deep link.
**Used in**: `app/admin/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L5 | File header | Metric card overview and design token alignment. |
| L14–L24 | `StatTileProps` | Interface for metric title, value, subtext, badge variant, icon, and href. |
| L30–L88 | `StatTile` | Renders light Paper card, icon container, big `font-mono` value, status badge, subtext, and link arrow. |

---

## `components/admin/dashboard/needs-attention-list.tsx`
**Purpose**: Operational triage panel rendering urgency-prioritized action items (critical low stock, pending buyback liquidations, stuck order shipments) with direct jump links.
**Used in**: `app/admin/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L5 | File header | Triage panel overview and action queue role. |
| L19–L28 | Empty State | Renders empty state card when all operations are healthy. |
| L30–L95 | Component JSX | Renders panel header with red indicator pulse, severity badges (`urgent`, `warning`, `info`), item description, and gold action buttons ("Restock Silo", "Review Payout", "Verify Delivery"). |

---

## `components/admin/dashboard/recent-activity-feed.tsx`
**Purpose**: Activity stream component rendering a connected vertical timeline of recent operations from `audit_logs`.
**Used in**: `app/admin/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L5 | File header | Audit log stream overview. |
| L20–L40 | `getCategoryIcon()` | Maps activity categories (`order`, `inventory`, `buyback`, `resale`, `pricing`, `system`) to custom emoji badges and background styles. |
| L46–L115 | `RecentActivityFeed` | Renders header with audit stream badge, connected timeline with vertical guide lines, action titles, relative timestamps, and actor attribution. |

---

## `app/admin/layout.tsx`
**Purpose**: Server Component layout for `/admin/*` enforcing Layer 2 server-side role verification (`getCurrentUser()` + `profiles.role === 'admin'`) and rendering the admin navigation shell.
**Used in**: All `/admin/*` routes.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File header | Security guard note, triple-layer defense in depth, and layout wrapper overview. |
| L14–L17 | Metadata | Admin portal SEO metadata. |
| L23–L55 | `AdminLayout` | Re-verifies user session with Supabase Auth servers. Redirects unauthenticated users to `/login?redirect=/admin` and non-admins to `/`. Renders `AdminNavRail`, `AdminHeader`, and `AdminBottomTabBar`. |

---

## `app/admin/page.tsx`
**Purpose**: Server Component landing page at `/admin` rendering the operational control center with 5 key metric tiles, needs-attention triage panel, operational matrix shortcuts, and recent audit activity feed.
**Used in**: Protected admin route `/admin`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L5 | File header | Dashboard overview and SSR data loading. |
| L18–L25 | Data Fetching | Parallel fetch of `getAdminDashboardStats()`, `getNeedsAttentionItems()`, and `getRecentAuditActivity(8)`. |
| L28–L60 | Page Header | Hero banner with "Operational Overview" title, "Live Feed" badge, and quick action buttons ("Manage Silos", "Update Pricing"). |
| L64–L140 | Stat Tiles Grid | 5-column metric grid for Open Orders, Pending Buybacks, Resale Listings, Low Stock Alerts, and Silo Physical Valuation. |
| L144–L185 | Main Grid | 2-column layout on desktop: Left (`NeedsAttentionList` + Quick Links matrix), Right (`RecentActivityFeed`). |

---

# Feature 18: Admin Orders

## `lib/supabase/queries/admin/orders.ts`
**Purpose**: Admin orders query helpers, finite state machine definitions, status mutations, exception resolution, and audit log insertions.
**Used in**: `app/admin/orders/page.tsx`, `app/admin/orders/[orderId]/page.tsx`, `app/api/admin/orders/[id]/status/route.ts`, `app/api/admin/orders/[id]/exception/route.ts`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L5 | File header | Overview of admin orders query module and service-role security. |
| L9–L70 | Type Definitions | `AdminOrderFilters`, `AdminOrderMetrics`, `AdminOrderItem`, `AdminOrderListItem`, `AdminOrderDetail`. |
| L74–L93 | `ALLOWED_STATUS_TRANSITIONS` | Controlled state machine mapping valid forward transitions for `pending_payment`, `sourcing`, `in_transit`, `stored`, `delivered`, `cancelled`. |
| L108–L230 | `getAllAdminOrders()` | Fetches total and per-status metrics, joins `profiles`, `order_items`, `commodities`, `commodity_grades`, and `payments` with search and pagination. |
| L236–L345 | `getAdminOrderDetail()` | Fetches complete order tree with buyer details, payment reference, and chronological `audit_logs` history. |
| L351–L435 | `advanceOrderStatus()` | Validates target status against state machine, updates order status, creates holding on `stored`, writes to `audit_logs`, and enqueues buyer notification. |
| L441–L498 | `resolveOrderException()` | Clears exception flag and advances order via ledger allocation or executes refund cancellation with immutable audit log. |

---

## `app/api/admin/orders/[id]/status/route.ts`
**Purpose**: Admin-gated API route handler for controlled status transitions with server-side state machine validation.
**Used in**: `components/admin/orders/status-advance-control.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L5 | File header | API route purpose and security rules. |
| L9–L58 | `POST` handler | Verifies user session and admin role, parses target status and notes, calls `advanceOrderStatus()`, and returns JSON response. |

---

## `app/api/admin/orders/[id]/exception/route.ts`
**Purpose**: Admin-gated API route handler for resolving order reconciliation exception states.
**Used in**: `components/admin/orders/exception-resolution-panel.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L5 | File header | API route purpose and resolution actions. |
| L9–L55 | `POST` handler | Verifies admin role, parses action (`allocate_inventory` or `refund_and_cancel`), calls `resolveOrderException()`, and returns JSON response. |

---

## `components/admin/orders/order-filter-bar.tsx`
**Purpose**: Interactive client filter bar with search input and status tabs (`All`, `Pending`, `Sourcing`, `In Transit`, `Stored`, `Delivered`, `Exceptions`, `Cancelled`) driven by URL search params.
**Used in**: `app/admin/orders/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File header | Component overview and client-directive. |
| L23–L48 | Search & Filter Logic | Debounces search input (400ms) and updates URL search parameters via `useRouter`. |
| L50–L165 | Component JSX | Renders search bar, export button, and horizontal status filter tabs with count badges. |

---

## `components/admin/orders/orders-table.tsx`
**Purpose**: Desktop dense tabular view of customer commodity orders with complete fulfillment and payment status badges.
**Used in**: `app/admin/orders/page.tsx` (Desktop viewports ≥ 1024px).

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L5 | File header | Desktop table overview and design token alignment. |
| L17–L30 | Empty State | Renders empty state card when no orders match active filters. |
| L45–L98 | `renderFulfillmentBadge()` | Renders custom status badges for `stored`, `delivered`, `in_transit`, `sourcing`, `pending_payment`, `cancelled`, and `exception`. |
| L100–L205 | Table JSX | Renders table headers, order rows with links, buyer info, commodity, quantity, formatted total price (IBM Plex Mono), payment badge, fulfillment badge, date, and Manage button. |

---

## `components/admin/orders/orders-mobile-list.tsx`
**Purpose**: Mobile stacked card list rendering order metadata, price, status badges, exception warnings, and management action buttons.
**Used in**: `app/admin/orders/page.tsx` (Mobile viewports < 1024px).

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L5 | File header | Mobile card list overview and responsive layout role. |
| L28–L135 | Component JSX | Renders stacked cards with order ID, payment/fulfillment status badges, buyer info, commodity, quantity, total price, exception notice banner, and action buttons. |

---

## `components/admin/orders/status-advance-control.tsx`
**Purpose**: Interactive status advancement control allowing admins to advance fulfillment stages based on strict state machine transitions with optional audit notes.
**Used in**: `app/admin/orders/[orderId]/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L5 | File header | Controlled status advancement overview. |
| L28–L68 | Form Handler | Posts status update to `/api/admin/orders/[id]/status`, displays loading spinner, handles error/success messages, and triggers router refresh. |
| L70–L175 | Component JSX | Renders current status pill, dropdown of only valid next statuses, description preview, admin note textarea, and submit button. |

---

## `components/admin/orders/exception-resolution-panel.tsx`
**Purpose**: Triage panel rendered when an order is in an exception state, allowing administrators to allocate inventory via ledger or issue refund cancellations.
**Used in**: `app/admin/orders/[orderId]/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L5 | File header | Exception resolution component overview. |
| L23–L60 | Resolution Handler | Posts to `/api/admin/orders/[id]/exception` with chosen action (`allocate_inventory` or `refund_and_cancel`). |
| L62–L155 | Component JSX | Renders warning icon, exception reason, note input field, and dual action buttons ("Allocate via Warehouse Ledger" & "Refund & Cancel Order"). |

---

## `components/admin/orders/order-audit-trail.tsx`
**Purpose**: Chronological timeline displaying administrative status changes, timestamps, and actor attribution from `audit_logs`.
**Used in**: `app/admin/orders/[orderId]/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L5 | File header | Audit trail timeline overview. |
| L27–L55 | Helpers | Timestamp and action label formatters. |
| L57–L118 | Timeline JSX | Renders vertical connecting line, dot indicators, action badge, status change arrow (`→ in transit`), actor email, and audit notes. |

---

## `components/admin/orders/admin-orders-pagination.tsx`
**Purpose**: URL-driven pagination wrapper component for Admin Orders list.
**Used in**: `app/admin/orders/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L5 | File header | Pagination wrapper overview. |
| L18–L35 | Component JSX | Handles page change events and pushes new `page` search parameter to router. |

---

## `app/admin/orders/page.tsx`
**Purpose**: Server Component page for the admin orders list at `/admin/orders` fetching live filtered orders and rendering desktop table and mobile cards.
**Used in**: Protected admin route `/admin/orders`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L5 | File header | Admin orders page overview. |
| L22–L32 | Data Fetching | Extracts URL search params and calls `getAllAdminOrders()`. |
| L34–L90 | Page JSX | Renders page title, total count badge, `OrderFilterBar`, `OrdersTable` (desktop), `OrdersMobileList` (mobile), and `AdminOrdersPagination`. |

---

## `app/admin/orders/[orderId]/page.tsx`
**Purpose**: Server Component page for `/admin/orders/[orderId]` displaying order details, fulfillment status stepper, controlled status advancement, buyer info, payment summary, and audit trail.
**Used in**: Protected admin route `/admin/orders/[orderId]`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L5 | File header | Admin order detail page overview. |
| L25–L55 | Data Fetching & Stepper Setup | Calls `getAdminOrderDetail(orderId)`, handles 404 via `notFound()`, and computes `fulfillmentSteps` and `currentStepIndex`. |
| L69–L115 | Header & Stepper | Renders breadcrumbs, order header with status pills, buyer portal jump link, and `StatusStepper`. |
| L117–L125 | Exception Panel | Conditionally renders `ExceptionResolutionPanel` if `isException === true`. |
| L127–L235 | Main Grid | Renders 2-column layout: Left (Commodity breakdown, Buyer info card, Payment transaction record), Right (`StatusAdvanceControl` and `OrderAuditTrail`). |

---

# Feature 19: Admin Inventory & Warehouses Management

## `lib/types/admin-inventory.ts`
**Purpose**: TypeScript definitions for commodities, quality grades, warehouse storage hubs, inventory lines with computed reservations, stock adjustment payloads, and ledger movement records.
**Used in**: `lib/supabase/queries/admin/inventory.ts`, `lib/domain/ledger/inventory-ledger.ts`, `components/admin/inventory/*`, `app/api/admin/inventory/*/route.ts`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L5 | File header | TypeScript types overview for Feature 19. |
| L10–L58 | Commodity Types | `AdminCommodity`, `CommodityGrade`, `AdminCommodityDetail`, `UpsertCommodityPayload`, and `UpsertGradePayload` interfaces. |
| L62–L83 | Warehouse Types | `AdminWarehouse` and `UpsertWarehousePayload` interfaces. |
| L87–L114 | Inventory Line Types | `AdminInventoryLine` (with computed `reserved_quantity` and `available_quantity`) and `InventoryLineFilters` interfaces. |
| L118–L136 | Adjustment Types | `AdjustInventoryPayload` and `AdjustInventoryResult` interfaces. |
| L140–L158 | Movement History Types | `InventoryMovement` interface representing immutable ledger rows. |
| L162–L171 | Stat Card Types | `InventoryStats` interface for aggregated operational metrics. |

---

## `lib/supabase/queries/admin/inventory.ts`
**Purpose**: Service-role query and mutation module handling commodity CRUD, warehouse CRUD, live inventory line calculations (with dynamically computed reserved stock from active resale and pending buybacks), aggregated stat calculations, and movement ledger retrieval.
**Used in**: `app/admin/inventory/page.tsx`, `app/api/admin/inventory/*/route.ts`, `lib/domain/ledger/inventory-ledger.ts`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L8 | File header | Service-role elevated access overview and usage locations. |
| L20–L120 | Commodity Queries | `getCommodities()`, `getCommodityDetail()`, `upsertCommodity()`, and `toggleCommodityActive()`. |
| L124–L165 | Grade Queries | `upsertGrade()` and `deactivateGrade()`. |
| L169–L240 | Warehouse Queries | `getWarehouses()`, `upsertWarehouse()`, and `toggleWarehouseActive()`. |
| L244–L340 | `getInventoryLines()` | Query joining `inventory`, `commodities`, `commodity_grades`, and `warehouses`, computing `reserved_quantity` from active resale and pending buybacks, and calculating `available_quantity`. |
| L344–L380 | `getInventoryStats()` | Parallel aggregation calculating total stored weight, silo capacity percentage, and active entity counts. |
| L384–L425 | `getMovementHistory()` | Queries `inventory_movements` for a specific inventory line ordered most-recent first. |

---

## `lib/domain/ledger/inventory-ledger.ts`
**Purpose**: The authoritative domain service enforcing the ledger-only balance invariant for inventory quantities. Atomically inserts `inventory_movements` records, updates `inventory.quantity`, and records `audit_logs` entries.
**Used in**: `app/api/admin/inventory/adjust/route.ts`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L8 | File header | Ledger domain service description and invariant rules. |
| L15–L135 | `adjustInventory()` | Validates non-empty reason, fetches current stock, guards against negative balances, inserts `inventory_movements` row with signed delta and balance after, updates `inventory.quantity`, and inserts `audit_logs` entry. |

---

## `app/api/admin/inventory/commodities/route.ts`
**Purpose**: Admin-role gated API route for listing and creating commodities.
**Used in**: `GET /api/admin/inventory/commodities`, `POST /api/admin/inventory/commodities`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L7 | File header | API route description and security verification. |
| L13–L32 | `requireAdmin()` | Layer 3 admin role authentication guard helper. |
| L34–L41 | `GET()` | Returns all commodities with grade counts. |
| L43–L72 | `POST()` | Validates payload fields and upserts commodity. |

---

## `app/api/admin/inventory/commodities/[id]/route.ts`
**Purpose**: Admin-role gated API route for updating commodities, toggling active status, and managing grades.
**Used in**: `PUT /api/admin/inventory/commodities/[id]`, `PATCH /api/admin/inventory/commodities/[id]`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L7 | File header | Route overview and handlers summary. |
| L13–L23 | `requireAdmin()` | Admin role guard helper. |
| L25–L44 | `PUT()` | Full commodity update handler. |
| L46–L86 | `PATCH()` | Handles active status toggles, grade upserts, and grade deactivations. |

---

## `app/api/admin/inventory/warehouses/route.ts`
**Purpose**: Admin-role gated API route for listing and registering warehouse silos.
**Used in**: `GET /api/admin/inventory/warehouses`, `POST /api/admin/inventory/warehouses`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L7 | File header | Route overview and security guard. |
| L13–L23 | `requireAdmin()` | Admin role guard helper. |
| L25–L32 | `GET()` | Returns all registered warehouse facilities. |
| L34–L60 | `POST()` | Validates required warehouse fields and executes upsert. |

---

## `app/api/admin/inventory/warehouses/[id]/route.ts`
**Purpose**: Admin-role gated API route for updating warehouse details and active statuses.
**Used in**: `PUT /api/admin/inventory/warehouses/[id]`, `PATCH /api/admin/inventory/warehouses/[id]`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File header | Route overview. |
| L11–L20 | `requireAdmin()` | Admin role guard helper. |
| L22–L38 | `PUT()` | Warehouse update handler. |
| L40–L62 | `PATCH()` | Warehouse active status toggle handler. |

---

## `app/api/admin/inventory/adjust/route.ts`
**Purpose**: Admin-role gated API endpoint executing ledger-safe stock adjustments via `adjustInventory()`.
**Used in**: `POST /api/admin/inventory/adjust`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L7 | File header | Route overview and domain delegation. |
| L13–L23 | `requireAdmin()` | Admin role guard helper. |
| L25–L68 | `POST()` | Validates non-zero delta and non-empty reason, delegates to `adjustInventory()`, and returns new balance. |

---

## `app/api/admin/inventory/[inventoryId]/movements/route.ts`
**Purpose**: Admin-role gated API route retrieving the full movement ledger history for an inventory line.
**Used in**: `GET /api/admin/inventory/[inventoryId]/movements`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File header | Route overview. |
| L12–L22 | `requireAdmin()` | Admin role guard helper. |
| L24–L40 | `GET()` | Queries `getMovementHistory(inventoryId)` and returns ordered movement records. |

---

## `components/admin/inventory/adjust-inventory-modal.tsx`
**Purpose**: Client Component (`"use client"`) providing an interactive stock adjustment modal with delta stepper, live resulting balance preview, required reason field, and audit acknowledgment warning.
**Used in**: `components/admin/inventory/inventory-tab.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File header | Component description and interaction overview. |
| L14–L18 | Props & Types | `AdjustInventoryModalProps` interface. |
| L24–L95 | State & Submit | Handles delta stepper state, validation, required reason check, audit warning, and async POST to `/api/admin/inventory/adjust`. |
| L97–L235 | Component JSX | Dialog container, balance summary box, delta stepper (`- / + 50`), reason textarea, audit notice checkbox, and confirmation buttons. |

---

## `components/admin/inventory/movement-history-modal.tsx`
**Purpose**: Client Component (`"use client"`) rendering a modal dialog with a chronological timeline of all `inventory_movements` for an inventory line.
**Used in**: `components/admin/inventory/inventory-tab.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File header | Component description and ledger inspection overview. |
| L14–L19 | Props & Types | `MovementHistoryModalProps` interface. |
| L25–L48 | `MovementTypeBadge` | Badge styling helper mapping types (`ADJUSTMENT`, `INBOUND`, `OUTBOUND`, `ALLOCATED`) to design tokens. |
| L54–L185 | Component JSX | Modal overlay, timeline cards with signed deltas, formatted timestamps, reason notes, balance after, and admin actor attribution. |

---

## `components/admin/inventory/grade-editor.tsx`
**Purpose**: Client Component (`"use client"`) managing the inline list of quality grades (add, edit, toggle active, remove) inside the commodity modal.
**Used in**: `components/admin/inventory/commodity-form-modal.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L5 | File header | Component description. |
| L13–L18 | `GradeEditorProps` | Prop interface for grades array and change callback. |
| L24–L65 | Handlers | `handleAddGrade()`, `handleToggleActive()`, and `handleRemoveGrade()`. |
| L67–L175 | Component JSX | Grade items list with status badges, code indicators, and inline "+ Add New Grade" sub-form. |

---

## `components/admin/inventory/commodity-form-modal.tsx`
**Purpose**: Client Component (`"use client"`) providing an administrative modal to create or edit commodities, units, base/current prices, active status, and nested quality grades.
**Used in**: `components/admin/inventory/commodities-tab.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File header | Component description and form capabilities. |
| L14–L20 | `CommodityFormModalProps` | Modal props interface (commodity, isOpen, onClose). |
| L26–L140 | State & Submit | Form state management, validation, upsert submission to `/api/admin/inventory/commodities`, and grade saving. |
| L142–L290 | Component JSX | Dialog container, name/code inputs, unit selector, pricing fields, active toggle, `GradeEditor`, and action buttons. |

---

## `components/admin/inventory/warehouse-form-modal.tsx`
**Purpose**: Client Component (`"use client"`) providing an administrative modal to register or edit warehouse silo locations, capacity figures, and active statuses.
**Used in**: `components/admin/inventory/warehouses-tab.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File header | Component description. |
| L14–L20 | `WarehouseFormModalProps` | Modal props interface. |
| L26–L95 | State & Submit | Form state management, validation, and async POST to `/api/admin/inventory/warehouses`. |
| L97–L215 | Component JSX | Dialog container, name/code inputs, location/address fields, capacity input, active status toggle, and action buttons. |

---

## `components/admin/inventory/inventory-tab.tsx`
**Purpose**: Server Component rendering the Inventory Balances tab with dense desktop tabular view and mobile stacked cards displaying physical, reserved, and available quantities alongside `AdjustInventoryModal` and `MovementHistoryModal`.
**Used in**: `app/admin/inventory/page.tsx` (Inventory tab).

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L7 | File header | Component description and layout overview. |
| L15–L21 | `InventoryTabProps` | Prop interface for inventory lines, commodities, and warehouses. |
| L27–L55 | Helpers | `GradeBadge` and `QuantityCell` styling components. |
| L61–L115 | `InventoryTableRow` | Dense desktop table row with commodity specs, warehouse location, mono numbers, reserved pill, and action buttons. |
| L121–L165 | `InventoryMobileCard` | Mobile stacked card with 3-stat breakdown (Physical, Reserved, Available) and compact action triggers. |
| L171–L230 | `InventoryTab` | Master container rendering table on desktop, cards on mobile, or empty state. |

---

## `components/admin/inventory/commodities-tab.tsx`
**Purpose**: Client Component (`"use client"`) rendering the commodity catalog management table on desktop and stacked cards on mobile, active toggles, and "+ Add Commodity" action trigger.
**Used in**: `app/admin/inventory/page.tsx` (Commodities tab).

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File header | Component description. |
| L14–L18 | `CommoditiesTabProps` | Prop interface for commodities array. |
| L24–L65 | Handlers | Modal open/edit triggers and quick active toggle handler calling `PATCH /api/admin/inventory/commodities/[id]`. |
| L67–L225 | Component JSX | Header action bar, dense desktop table, mobile cards, empty state, and `CommodityFormModal`. |

---

## `components/admin/inventory/warehouses-tab.tsx`
**Purpose**: Client Component (`"use client"`) rendering the warehouse storage hubs table on desktop and stacked cards on mobile, capacity statistics, active status toggles, and "+ Add Warehouse" trigger.
**Used in**: `app/admin/inventory/page.tsx` (Warehouses tab).

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File header | Component description. |
| L14–L18 | `WarehousesTabProps` | Prop interface for warehouses array. |
| L24–L65 | Handlers | Modal open/edit triggers and active toggle handler calling `PATCH /api/admin/inventory/warehouses/[id]`. |
| L67–L215 | Component JSX | Header action bar, dense desktop table, mobile cards, empty state, and `WarehouseFormModal`. |

---

## `app/admin/inventory/page.tsx`
**Purpose**: Server Component page at `/admin/inventory` rendering the complete 3-tab operational stock control interface, 4 stat cards, URL-driven filtering, and tab content switching.
**Used in**: Protected admin route `/admin/inventory`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L7 | File header | Page overview and SSR data loading. |
| L14–L19 | Metadata | Dynamic SEO metadata for Admin Inventory & Silos. |
| L34–L56 | `StatCard` | Metric presentation component for silo statistics. |
| L62–L165 | `AdminInventoryPage()` | Resolves URL searchParams (`tab`, `commodity`, `warehouse`), queries stats, inventory lines, commodities, and warehouses in parallel, and renders header, 4 stat cards, tab navigation, filter bar, and active tab view (`InventoryTab`, `CommoditiesTab`, `WarehousesTab`). |

---

# Feature 20: Admin Pricing & Valuation

## `lib/types/admin-pricing.ts`
**Purpose**: TypeScript type definitions for commodity pricing, price history points, operational metric cards, update payloads, and price delta calculations.
**Used in**: `app/admin/pricing/page.tsx`, `components/admin/pricing/*`, `lib/supabase/queries/admin/pricing.ts`, `app/api/admin/pricing/*`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L5 | File header | Type module purpose and usage locations. |
| L10–L35 | Entity Types | `AdminPricingGrade` and `AdminPricingCommodity` interfaces with live pricing, sparklines, and 30-day gain metrics. |
| L40–L55 | `PriceHistoryPoint` | Historical recorded price point interface for charting and ledger tracking. |
| L60–L75 | `PricingMetricsData` | Top-level operational metrics interface (total commodities, spread %, highest gainer, last update). |
| L80–L110 | Payloads & Calculations | `UpdatePricingPayload`, `UpdatePricingResult`, and `PriceDeltaCalculation` interfaces. |

---

## `lib/supabase/queries/admin/pricing.ts`
**Purpose**: Supabase query and mutation layer for administrative commodity pricing, atomic `price_history` ledger insertion, dynamic buyback computation, and operational metrics.
**Used in**: `app/admin/pricing/page.tsx`, `app/api/admin/pricing/route.ts`, `app/api/admin/pricing/[commodityId]/history/route.ts`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L7 | File header | Module purpose, service-role RLS bypass, and usage locations. |
| L18–L25 | Synthetic Sparkline Helper | `generateSyntheticSparkline()` utility generating deterministic trend data when history is sparse. |
| L30–L105 | `getAllCommodityPrices()` | Server query fetching all commodities joined with grades, 10-point price sparklines, and 30d gain/loss percentages. |
| L110–L160 | `getPricingMetrics()` | Computes total priced commodities, average spread %, highest 30d gainer, and latest update timestamp. |
| L165–L235 | `getCommodityPriceHistory()` | Queries `price_history` table ordered chronologically or falls back to synthetic seasonal points for Recharts. |
| L240–L325 | `updateCommodityPricing()` | Executes atomic price update: (1) Inserts into `price_history`, (2) Updates `commodities` current_price and updated_at, (3) Inserts into `audit_logs`. Zero direct writes to `holdings`. |

---

## `app/api/admin/pricing/route.ts`
**Purpose**: Admin-role gated API route executing atomic commodity price updates and ledger logging.
**Used in**: `POST /api/admin/pricing`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File header | Route overview and security invariants. |
| L12–L45 | Authentication & Role Check | Verifies user session and asserts `profiles.role === 'admin'`. |
| L47–L75 | Validation & Execution | Validates positive sale and buyback prices, executes `updateCommodityPricing()`, and returns result. |

---

## `app/api/admin/pricing/[commodityId]/history/route.ts`
**Purpose**: Admin-role gated API route returning historical recorded price points for a commodity.
**Used in**: `GET /api/admin/pricing/[commodityId]/history`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File header | Route overview. |
| L12–L45 | Authentication & Role Check | Verifies user session and admin role. |
| L47–L60 | Data Query | Fetches price history via `getCommodityPriceHistory(commodityId, gradeId)` and returns JSON. |

---

## `components/admin/pricing/pricing-metrics.tsx`
**Purpose**: Server Component rendering 4 operational pricing stat cards: Total Priced Commodities, Average Buyback Spread, Highest 30d Gainer, and Last Price Update.
**Used in**: `app/admin/pricing/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File header | Component description and token mapping. |
| L12–L16 | `PricingMetricsProps` | Props interface for `PricingMetricsData`. |
| L20–L75 | Component JSX | 4-card responsive grid featuring Paper `#F7F4EA` cards, IBM Plex Mono numbers, and status indicators. |

---

## `components/admin/pricing/price-delta-preview.tsx`
**Purpose**: Client Component (`"use client"`) computing and rendering live absolute (₦) and percentage (%) deltas for sale and buyback prices with color-coded gain/loss badges.
**Used in**: `components/admin/pricing/update-price-modal.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L5 | File header | Component description. |
| L11–L17 | `PriceDeltaPreviewProps` | Props interface for old and new sale/buyback prices. |
| L23–L80 | Component JSX | Calculates sale delta, buyback delta, and platform spread %, rendering Deep Grain Green (positive) or Danger (negative) cards. |

---

## `components/admin/pricing/admin-price-history-chart.tsx`
**Purpose**: Client Component (`"use client"`) rendering an interactive Recharts line & area chart showing price trajectory for a commodity with custom tooltips and time range toggles.
**Used in**: `components/admin/pricing/update-price-modal.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File header | Component description and design tokens. |
| L18–L22 | `AdminPriceHistoryChartProps` | Props interface for price history array and commodity name. |
| L30–L65 | State & Scale Computation | Manages active range (`7d`, `30d`, `All`), dynamic min/max domain scaling. |
| L70–L165 | Recharts Canvas | Responsive `AreaChart` with Harvest Wheat (`#D8B56A`) stroke, smooth gradient fill, and formatted tooltips. |

---

## `components/admin/pricing/update-price-modal.tsx`
**Purpose**: Client Component (`"use client"`) providing a slide-over drawer / modal to set new sale and buyback prices with live delta preview, embedded Recharts chart, and safety propagation notice.
**Used in**: `components/admin/pricing/pricing-table.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File header | Component description. |
| L15–L21 | `UpdatePriceModalProps` | Props interface (commodity, isOpen, onClose, onSuccess). |
| L30–L110 | State & Handlers | Form state, dynamic 90% buyback spread calculation, history fetching, validation, and async POST to `/api/admin/pricing`. |
| L115–L285 | Component JSX | Slide-over drawer container, grade selector, price inputs, `PriceDeltaPreview`, `AdminPriceHistoryChart`, safety notice, and "Confirm & Propagate" CTA. |

---

## `components/admin/pricing/pricing-table.tsx`
**Purpose**: Client Component (`"use client"`) rendering the commodity pricing overview table on desktop and stacked cards on mobile, search filtering, 30d trend sparklines, and "Update Price" modal triggers.
**Used in**: `app/admin/pricing/page.tsx`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L6 | File header | Component description. |
| L16–L45 | `MiniSparkline` | Pure SVG polyline component rendering 30-day commodity price trajectory. |
| L50–L105 | State & Filter Logic | Manages search query filtering, modal selection state, and refresh callbacks. |
| L110–L240 | Desktop Table | Dense tabular view with columns: Commodity, Grades, Current Sale Price, Buyback Price, 30d Trend, Last Updated, Actions. |
| L245–L310 | Mobile Cards | Stacked card view for mobile viewports (<1024px) with full-width update action. |

---

## `app/admin/pricing/page.tsx`
**Purpose**: Server Component page at `/admin/pricing` rendering the commodity pricing and valuation management control center with triple-layer admin authorization.
**Used in**: Protected admin route `/admin/pricing`.

| Lines | Block | Description |
|-------|-------|-------------|
| L1–L8 | File header | Page overview, SSR data fetching, and security rules. |
| L14–L19 | Metadata | SEO metadata for Commodity Pricing & Valuation. |
| L25–L55 | `AdminPricingPage()` | Queries all commodity prices and operational metrics parallelly, rendering header, `PricingMetrics`, and `PricingTable`. |

---

## Maintenance: client-safe errors and stable display values

- Buyback and notification route handlers log unexpected exceptions server-side and return a generic 500 response without exposing exception details.
- Buyback grade badges use shared normalization for database names/codes, including the legacy `Standard` label and a `Grade A` fallback.
- Resale listing dates read from a cached minute-based clock store so React snapshots remain stable between subscription updates.
















