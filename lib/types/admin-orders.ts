// lib/types/admin-orders.ts — Admin Order Management Types and State Machine Definitions for KorraStore.
// Client & Server shared module (no 'server-only' dependency).
// Used in: components/admin/orders/*, lib/supabase/queries/admin/orders.ts, app/api/admin/orders/*

// ----------------------------------------------------------------------------
// Type Definitions
// ----------------------------------------------------------------------------

export type OrderFulfillmentStatus =
  | 'pending_payment'
  | 'sourcing'
  | 'in_transit'
  | 'stored'
  | 'delivered'
  | 'cancelled'
  | 'failed';

export type PaymentStatusType = 'paid' | 'pending' | 'failed';

export interface AdminOrderFilters {
  status?: string; // 'all' | 'pending_payment' | 'sourcing' | 'in_transit' | 'stored' | 'delivered' | 'exception' | 'cancelled'
  search?: string; // Search term matching order ID, buyer name, or buyer email
  page?: number;
  limit?: number;
}

export interface AdminOrderMetrics {
  totalOrders: number;
  pendingCount: number;
  sourcingCount: number;
  inTransitCount: number;
  storedCount: number;
  deliveredCount: number;
  exceptionCount: number;
  cancelledCount: number;
}

export interface AdminOrderItem {
  id: string;
  commodityId: string;
  commodityName: string;
  gradeId: string;
  gradeName: string;
  gradeCode: 'A' | 'B' | 'C';
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit: string;
  imageUrl: string | null;
}

export interface AdminOrderListItem {
  id: string;
  userId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string | null;
  status: OrderFulfillmentStatus | 'exception';
  paymentStatus: PaymentStatusType;
  totalPrice: number;
  platformFee: number;
  deliveryType: string;
  deliveryAddress: string | null;
  isException: boolean;
  exceptionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  item: AdminOrderItem;
}

export interface AdminOrderDetail extends AdminOrderListItem {
  paymentDetails?: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    reference: string;
    paidAt: string | null;
  } | null;
  auditTrail: Array<{
    id: string;
    action: string;
    oldState: Record<string, unknown> | null;
    newState: Record<string, unknown> | null;
    actorEmail: string;
    createdAt: string;
  }>;
}

// ----------------------------------------------------------------------------
// State Machine Transitions Definition
// ----------------------------------------------------------------------------

export const ALLOWED_STATUS_TRANSITIONS: Record<
  string,
  Array<{ target: OrderFulfillmentStatus; label: string; description: string }>
> = {
  pending_payment: [
    { target: 'cancelled', label: 'Cancel Unpaid Order', description: 'Buyer abandoned checkout or payment expired.' },
  ],
  sourcing: [
    { target: 'in_transit', label: 'Dispatch to Transit', description: 'Commodity sourced and verified; currently en route to silo.' },
    { target: 'cancelled', label: 'Cancel & Refund', description: 'Commodity could not be sourced; initiate customer refund.' },
  ],
  in_transit: [
    { target: 'stored', label: 'Store in Korra Silo', description: 'Commodity safely arrived and verified in climate-controlled silo.' },
    { target: 'delivered', label: 'Mark as Delivered', description: 'Commodity reached physical customer delivery destination.' },
    { target: 'cancelled', label: 'Cancel & Issue Return', description: 'Shipment failed in transit; issue return and refund.' },
  ],
  stored: [], // Terminal fulfillment state
  delivered: [], // Terminal fulfillment state
  cancelled: [], // Terminal state
  failed: [], // Terminal state
};
