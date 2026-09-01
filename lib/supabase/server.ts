// lib/supabase/server.ts — Server Supabase client factory for KorraStore.
// Instantiates a cookie-bound Supabase client for Server Components, Server Actions, and Route Handlers.
// Used in: app/ (Server Components, Route Handlers, Server Actions).
// Security Rule: Uses anon key + user session cookie; all queries remain strictly governed by RLS.

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Creates and returns a Supabase server client bound to the incoming request's cookies.
// Handles asynchronous cookie reading/writing required by Next.js 16 App Router.
export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // Ignored if middleware or Route Handlers refresh user sessions.
        }
      },
    },
  });
}
