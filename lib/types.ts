// lib/types.ts — Global domain and application TypeScript definitions for KorraStore.
// Serves as the central export location for shared entity types, enum definitions, and utility types.
// Used throughout: Server Components, Client Components, Server Actions, and Domain Services.

export * from './supabase/types';
export * from './types/admin-orders';

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

// Quality grade availability descriptor for commodity details purchase panel.
// Tracks per-grade pricing, remaining stock quantity, and current availability status.
export interface GradeAvailability {
  gradeId: string;
  gradeName: string;
  gradeCode: "A" | "B" | "C";
  unitPrice: number;
  availableQuantity: number;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
}

// Single price history data point for the interactive Recharts price trend line chart.
// Stores raw timestamp, numeric price value, and formatted date label for chart tooltips.
export interface PriceHistoryPoint {
  date: string;
  price: number;
  formattedDate: string;
}

// Comprehensive single-commodity detail model for /commodities/[commodityId].
// Aggregates main commodity specs, grade-specific pricing, inventory stock, price history points, and storage compliance metadata.
export interface CommodityDetails {
  id: string;
  code: string;
  name: string;
  category: string;
  type: string;
  description: string;
  unit: string;
  basePrice: number;
  currentPrice: number;
  imageUrl: string | null;
  grades: GradeAvailability[];
  priceHistory: PriceHistoryPoint[];
  storageInfo: {
    warehouseName: string;
    location: string;
    temperature: string;
    humidity: string;
    insuranceStatus: string;
  };
}

// Data shape for a commodity fetched specifically for the /checkout page.
// Returned by getCheckoutCommodity() and passed as props to OrderReviewForm.
export interface CheckoutCommodity {
  commodityId: string;
  commodityName: string;
  gradeId: string;
  gradeName: string;
  gradeCode: string;
  unitPrice: number;
  availableQuantity: number;
  unit: string;
  imageUrl: string | null;
}

// POST /api/orders request body shape — sent by the checkout form client component.
export interface CreateOrderRequest {
  commodityId: string;
  gradeId: string;
  quantity: number;
}

// POST /api/orders success response — the client redirects to this URL.
export interface CreateOrderResponse {
  authorizationUrl: string;
  orderId: string;
}
