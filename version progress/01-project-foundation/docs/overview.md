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
