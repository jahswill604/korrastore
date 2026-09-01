// lib/supabase/service.ts — Administrative Service-Role Supabase client factory for KorraStore.
// Provides bypass-RLS elevated client access for backend domain services (Ledger, Payments, Valuation).
// Used in: lib/domain/ (Ledger service, Payment callbacks, Admin actions).
// Security Rule: Guarded by 'server-only'. NEVER import into Client Components or expose to client bundles!

import 'server-only';
import { createClient } from '@supabase/supabase-js';

// Instantiates and returns a service-role Supabase client instance.
// Bypasses Row Level Security (RLS) for controlled system ledger entries and administrative tasks.
export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key';

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
