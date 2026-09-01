// lib/supabase/client.ts — Browser Supabase client factory for KorraStore.
// Creates a browser-side Supabase client using public environment variables.
// Used in: Client Components ("use client") for read-only or RLS-governed real-time subscriptions.
// Security Rule: Restricted to anonymous key capabilities; strictly governed by PostgreSQL Row Level Security (RLS).

import { createBrowserClient } from '@supabase/ssr';

// Creates and returns a singleton-friendly Supabase browser client instance.
// Reads process.env.NEXT_PUBLIC_SUPABASE_URL and process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
