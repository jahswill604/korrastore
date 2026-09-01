// lib/types.ts — Global domain and application TypeScript definitions for KorraStore.
// Serves as the central export location for shared entity types, enum definitions, and utility types.
// Used throughout: Server Components, Client Components, Server Actions, and Domain Services.

export * from '@/lib/supabase/types';


// Generic API response structure for Server Actions and internal endpoints.
// Standardizes status reporting, error messages, and payload delivery across the application.
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// System health and foundation status descriptor.
// Used by the foundation landing view to report Supabase client factory readiness.
export interface SystemStatus {
  service: string;
  status: 'ready' | 'pending' | 'error';
  timestamp: string;
}

// Commodity summary item used for marketplace browsing (/home).
// Aggregates commodity attributes, total available inventory, price per unit, and available grades.
export interface MarketplaceCommodity {
  id: string;
  code: string;
  name: string;
  description: string | null;
  unit: string;
  base_price: number;
  current_price: number;
  image_url: string | null;
  total_available_quantity: number;
  available_grades: string[];
  warehouse_count: number;
}

