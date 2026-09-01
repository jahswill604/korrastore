# Implementation Plan: Duplicate Email Validation & Error Handling (04-auth)

## Executive Summary
This document details the backend and frontend changes required to detect when an email address is already registered in KorraStore and display a clear, user-friendly error message ("An account with this email address already exists. Please log in instead or use a different email.") on the signup form (`/signup`).

## Requirements
1. **API / Auth Route (`app/api/auth/signup/route.ts`)**:
   - Check if normalized email exists in `profiles` or Supabase Auth.
   - If user already exists, or `signUpError` returns an `already registered` / `user_already_exists` error, return HTTP 400 with `{ success: false, error: "An account with this email address already exists. Please log in instead or use a different email." }`.
   - Do NOT send verification OTP email or issue new OTP code for existing email addresses.

2. **Client Signup Form (`components/auth/signup-form.tsx`)**:
   - Call `/api/auth/signup` (or client `supabase.auth.signUp()`) and inspect `data.user?.identities` or API error message.
   - If user exists or `identities.length === 0` (Supabase duplicate signup behavior), set explicit error message: `"An account with this email address already exists. Please log in instead or use a different email."`.
   - Render red alert banner with warning icon above inputs.

3. **User Experience & Styling**:
   - Light mode only (`Paper` #F7F4EA, `Danger` #B3432E alert box).
   - Display clear actionable advice ("Please log in instead").

## File Changes Breakdown
- `app/api/auth/signup/route.ts`: Add existing profile check via `adminSupabase.from("profiles")` and `adminSupabase.auth.admin.listUsers()`. Return HTTP 400 error on duplicate.
- `components/auth/signup-form.tsx`: Handle duplicate email response gracefully, update error message state, prevent unwanted redirects to `/verify-email`.
- `docs/overview.md`: Record new error handling logic and line line range changes.
