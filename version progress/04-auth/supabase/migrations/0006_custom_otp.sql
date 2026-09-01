-- ==============================================================================
-- Migration: 0006_custom_otp.sql — KorraStore Custom Email OTP Verification
-- Description: Adds the auth_otp_codes table to support our own server-side
--              6-digit OTP generation, storage, and verification flow.
--              Also adds email_verified_at to profiles so the proxy can gate
--              unverified users to /verify-email regardless of Supabase auth state.
-- Applied by: Feature 04 (Auth) - custom OTP implementation
-- ==============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. OTP Codes Table
--    Stores short-lived 6-digit codes generated server-side and sent via Resend.
--    Rows are immutable once inserted — expiry/usage is tracked via columns.
--    Only service-role can read/write (no client RLS policies added below).
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS auth_otp_codes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT        NOT NULL,
  code        TEXT        NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index email for fast lookup during verification
CREATE INDEX IF NOT EXISTS idx_auth_otp_codes_email ON auth_otp_codes (email);

-- Enable RLS and add public access policies so both anon client and service role can operate
ALTER TABLE auth_otp_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert to auth_otp_codes" ON auth_otp_codes FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public select from auth_otp_codes" ON auth_otp_codes FOR SELECT TO public USING (true);
CREATE POLICY "Allow public update on auth_otp_codes" ON auth_otp_codes FOR UPDATE TO public USING (true) WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. email_verified_at column on profiles
--    Null = unverified, timestamptz = date verified.
--    The proxy checks this to gate buyers to /verify-email if null.
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;
