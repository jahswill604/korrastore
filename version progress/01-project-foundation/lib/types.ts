// lib/types.ts — Global domain and application TypeScript definitions for KorraStore.
// Serves as the central export location for shared entity types, enum definitions, and utility types.
// Used throughout: Server Components, Client Components, Server Actions, and Domain Services.

// User profile role classification.
// Governs access control between standard buyers/sellers and administrative managers.
export type UserRole = 'user' | 'admin';

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
