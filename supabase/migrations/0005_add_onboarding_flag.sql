-- ==============================================================================
-- Migration: 0005_add_onboarding_flag.sql — KorraStore Onboarding Flag
-- Description: Adds the onboarding_completed boolean flag to the profiles table.
--              This flag controls whether the first-run onboarding carousel has
--              been seen and dismissed by a new buyer. Defaults to false so that
--              every new account is shown the carousel exactly once.
-- Applied by: Feature 05 — Onboarding Flow
-- ==============================================================================

-- Add onboarding_completed column to profiles (idempotent — safe to re-run)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;

-- Commentary: The existing "Users can update own profile" RLS policy on profiles
-- (UPDATE WHERE auth.uid() = id) already covers this column, so the server action
-- calling markOnboardingComplete via the anon/authenticated Supabase client will
-- succeed without needing service-role elevation.
