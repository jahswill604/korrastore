// lib/supabase/queries/admin/orders.ts — Admin Order Management Queries & State Machine for KorraStore.
// Provides complete cross-buyer order retrieval, status state-machine transitions, exception resolution, and audit logging.
// Security: Strictly restricted to administrative operations via service-role client.
// Used in: app/admin/orders/page.tsx, app/admin/orders/[orderId]/page.tsx, app/api/admin/orders/[id]/status/route.ts

import 'server-only';
import { createServiceClient } from '@/lib/supabase/service';
import {
  AdminOrderFilters,
  AdminOrderMetrics,
  AdminOrderItem,
  AdminOrderListItem,
  AdminOrderDetail,
  OrderFulfillmentStatus,
  PaymentStatusType,
  ALLOWED_STATUS_TRANSITIONS,
} from '@/lib/types/admin-orders';

export type {
  AdminOrderFilters,
  AdminOrderMetrics,
  AdminOrderItem,
  AdminOrderListItem,
  AdminOrderDetail,
  OrderFulfillmentStatus,
  PaymentStatusType,
};
export { ALLOWED_STATUS_TRANSITIONS };

// ----------------------------------------------------------------------------
// Query Helpers
// ----------------------------------------------------------------------------

// Helper to format ISO timestamp into human-readable relative time (e.g. "5m ago")
function formatRelativeTime(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return 'Recent';
  }
}

// ----------------------------------------------------------------------------
// Fetch All Admin Orders (with Filtering & Metrics)
// ----------------------------------------------------------------------------

export async function getAllAdminOrders(filters: AdminOrderFilters = {}): Promise<{
  orders: AdminOrderListItem[];
  metrics: AdminOrderMetrics;
  totalCount: number;
  totalPages: number;
  currentPage: number;
}> {
  const supabase = createServiceClient();
  const page = Math.max(1, filters.page || 1);
  const limit = Math.max(1, Math.min(filters.limit || 15, 100));
  const offset = (page - 1) * limit;

  // 1. Fetch aggregate metrics across all orders in database
  const { data: allRawOrders, error: metricsError } = await supabase
    .from('orders')
    .select('id, status, is_exception');

  if (metricsError) {
    console.error('Error fetching admin order metrics:', metricsError);
  }

  const metrics: AdminOrderMetrics = {
    totalOrders: allRawOrders?.length || 0,
    pendingCount: allRawOrders?.filter((o) => o.status === 'pending_payment').length || 0,
    sourcingCount: allRawOrders?.filter((o) => o.status === 'sourcing').length || 0,
    inTransitCount: allRawOrders?.filter((o) => o.status === 'in_transit').length || 0,
    storedCount: allRawOrders?.filter((o) => o.status === 'stored').length || 0,
    deliveredCount: allRawOrders?.filter((o) => o.status === 'delivered').length || 0,
    exceptionCount: allRawOrders?.filter((o) => o.is_exception === true).length || 0,
    cancelledCount: allRawOrders?.filter((o) => o.status === 'cancelled').length || 0,
  };

  // 2. Build filtered paginated query
  let query = supabase
    .from('orders')
    .select(
      `
      id,
      user_id,
      status,
      total_amount,
      platform_fee,
      delivery_type,
      delivery_address,
      is_exception,
      exception_reason,
      created_at,
      updated_at,
      profiles:user_id (
        full_name,
        email,
        phone_number
      ),
      order_items (
        id,
        commodity_id,
        grade_id,
        quantity,
        unit_price,
        total_price,
        commodities:commodity_id (
          name,
          unit,
          image_url
        ),
        commodity_grades:grade_id (
          grade_name,
          grade_code
        )
      ),
      payments (
        status
      )
    `,
      { count: 'exact' }
    );

  // Apply status filter
  if (filters.status && filters.status !== 'all') {
    if (filters.status === 'exception') {
      query = query.eq('is_exception', true);
    } else {
      query = query.eq('status', filters.status);
    }
  }

  // Apply search query across order ID if present (UUID or prefix)
  if (filters.search && filters.search.trim()) {
    const term = filters.search.trim();
    query = query.or(`id.ilike.%${term}%`);
  }

  // Order by created_at descending
  query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error('Error fetching admin orders list:', error);
    return {
      orders: [],
      metrics,
      totalCount: 0,
      totalPages: 0,
      currentPage: page,
    };
  }

  // Transform raw Supabase rows into strongly-typed AdminOrderListItem[]
  const orders: AdminOrderListItem[] = (data || []).map((row: any) => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    const rawItem = Array.isArray(row.order_items) ? row.order_items[0] : row.order_items;
    const rawCommodity = rawItem?.commodities
      ? Array.isArray(rawItem.commodities)
        ? rawItem.commodities[0]
        : rawItem.commodities
      : null;
    const rawGrade = rawItem?.commodity_grades
      ? Array.isArray(rawItem.commodity_grades)
        ? rawItem.commodity_grades[0]
        : rawItem.commodity_grades
      : null;
    const payment = Array.isArray(row.payments) ? row.payments[0] : row.payments;

    const item: AdminOrderItem = {
      id: rawItem?.id || '',
      commodityId: rawItem?.commodity_id || '',
      commodityName: rawCommodity?.name || 'Agricultural Commodity',
      gradeId: rawItem?.grade_id || '',
      gradeName: rawGrade?.grade_name || 'Standard Grade',
      gradeCode: (rawGrade?.grade_code as 'A' | 'B' | 'C') || 'A',
      quantity: Number(rawItem?.quantity || 0),
      unitPrice: Number(rawItem?.unit_price || 0),
      totalPrice: Number(rawItem?.total_price || 0),
      unit: rawCommodity?.unit || 'kg',
      imageUrl: rawCommodity?.image_url || null,
    };

    return {
      id: row.id,
      userId: row.user_id,
      buyerName: profile?.full_name || 'Verified Buyer',
      buyerEmail: profile?.email || 'buyer@korrastore.ng',
      buyerPhone: profile?.phone_number || null,
      status: row.status as OrderFulfillmentStatus,
      paymentStatus: (payment?.status as PaymentStatusType) || (row.status === 'pending_payment' ? 'pending' : 'paid'),
      totalPrice: Number(row.total_amount || 0),
      platformFee: Number(row.platform_fee || 0),
      deliveryType: row.delivery_type || 'silo_storage',
      deliveryAddress: row.delivery_address || null,
      isException: Boolean(row.is_exception),
      exceptionReason: row.exception_reason || null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      item,
    };
  });

  const totalCount = count || orders.length;
  const totalPages = Math.ceil(totalCount / limit);

  return {
    orders,
    metrics,
    totalCount,
    totalPages,
    currentPage: page,
  };
}

// ----------------------------------------------------------------------------
// Fetch Single Admin Order Detail (with Audit Trail)
// ----------------------------------------------------------------------------

export async function getAdminOrderDetail(orderId: string): Promise<AdminOrderDetail | null> {
  const supabase = createServiceClient();

  // 1. Fetch Order with joined buyer profile, items, and payment
  const { data: row, error } = await supabase
    .from('orders')
    .select(
      `
      id,
      user_id,
      status,
      total_amount,
      platform_fee,
      delivery_type,
      delivery_address,
      is_exception,
      exception_reason,
      created_at,
      updated_at,
      profiles:user_id (
        full_name,
        email,
        phone_number
      ),
      order_items (
        id,
        commodity_id,
        grade_id,
        quantity,
        unit_price,
        total_price,
        commodities:commodity_id (
          name,
          unit,
          image_url
        ),
        commodity_grades:grade_id (
          grade_name,
          grade_code
        )
      ),
      payments (
        id,
        amount,
        currency,
        status,
        provider_reference,
        paid_at
      )
    `
    )
    .eq('id', orderId)
    .maybeSingle();

  if (error || !row) {
    console.error('Error fetching admin order detail:', error);
    return null;
  }

  // 2. Fetch associated audit logs for this specific order
  const { data: rawAuditLogs } = await supabase
    .from('audit_logs')
    .select(
      `
      id,
      action,
      old_state,
      new_state,
      created_at,
      profiles:user_id (
        email
      )
    `
    )
    .eq('entity_id', orderId)
    .order('created_at', { ascending: false });

  const auditTrail = (rawAuditLogs || []).map((log: any) => {
    const actorProfile = Array.isArray(log.profiles) ? log.profiles[0] : log.profiles;
    return {
      id: log.id,
      action: log.action,
      oldState: log.old_state,
      newState: log.new_state,
      actorEmail: actorProfile?.email || 'admin@korrastore.ng',
      createdAt: log.created_at,
    };
  });

  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  const rawItem = Array.isArray(row.order_items) ? row.order_items[0] : row.order_items;
  const rawCommodity = rawItem?.commodities
    ? Array.isArray(rawItem.commodities)
      ? rawItem.commodities[0]
      : rawItem.commodities
    : null;
  const rawGrade = rawItem?.commodity_grades
    ? Array.isArray(rawItem.commodity_grades)
      ? rawItem.commodity_grades[0]
      : rawItem.commodity_grades
    : null;
  const payment = Array.isArray(row.payments) ? row.payments[0] : row.payments;

  const item: AdminOrderItem = {
    id: rawItem?.id || '',
    commodityId: rawItem?.commodity_id || '',
    commodityName: rawCommodity?.name || 'Agricultural Commodity',
    gradeId: rawItem?.grade_id || '',
    gradeName: rawGrade?.grade_name || 'Standard Grade',
    gradeCode: (rawGrade?.grade_code as 'A' | 'B' | 'C') || 'A',
    quantity: Number(rawItem?.quantity || 0),
    unitPrice: Number(rawItem?.unit_price || 0),
    totalPrice: Number(rawItem?.total_price || 0),
    unit: rawCommodity?.unit || 'kg',
    imageUrl: rawCommodity?.image_url || null,
  };

  return {
    id: row.id,
    userId: row.user_id,
    buyerName: profile?.full_name || 'Verified Buyer',
    buyerEmail: profile?.email || 'buyer@korrastore.ng',
    buyerPhone: profile?.phone_number || null,
    status: row.status as OrderFulfillmentStatus,
    paymentStatus: (payment?.status as PaymentStatusType) || (row.status === 'pending_payment' ? 'pending' : 'paid'),
    totalPrice: Number(row.total_amount || 0),
    platformFee: Number(row.platform_fee || 0),
    deliveryType: row.delivery_type || 'silo_storage',
    deliveryAddress: row.delivery_address || null,
    isException: Boolean(row.is_exception),
    exceptionReason: row.exception_reason || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    item,
    paymentDetails: payment
      ? {
          id: payment.id,
          amount: Number(payment.amount || 0),
          currency: payment.currency || 'NGN',
          status: payment.status,
          reference: payment.provider_reference || 'N/A',
          paidAt: payment.paid_at || null,
        }
      : null,
    auditTrail,
  };
}

// ----------------------------------------------------------------------------
// Controlled Status Advancement Mutation (with State Machine & Audit Log)
// ----------------------------------------------------------------------------

export async function advanceOrderStatus(
  orderId: string,
  targetStatus: OrderFulfillmentStatus,
  adminId: string,
  notes?: string
): Promise<{ success: boolean; error?: string; updatedStatus?: OrderFulfillmentStatus }> {
  const supabase = createServiceClient();

  // 1. Fetch current order status
  const { data: currentOrder, error: fetchError } = await supabase
    .from('orders')
    .select('id, user_id, status, is_exception')
    .eq('id', orderId)
    .single();

  if (fetchError || !currentOrder) {
    return { success: false, error: 'Order not found.' };
  }

  const currentStatus = currentOrder.status as string;

  // 2. Validate transition against state machine
  const allowedNext = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
  const isAllowed = allowedNext.some((t) => t.target === targetStatus);

  if (!isAllowed) {
    return {
      success: false,
      error: `Invalid status transition from "${currentStatus}" to "${targetStatus}".`,
    };
  }

  // 3. Perform atomic update on order status
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: targetStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  if (updateError) {
    console.error('Error updating order status:', updateError);
    return { success: false, error: updateError.message };
  }

  // 4. If status reached 'stored', verify or create user holding record if not present
  if (targetStatus === 'stored') {
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('commodity_id, grade_id, quantity, unit_price')
      .eq('order_id', orderId);

    if (orderItems && orderItems.length > 0) {
      for (const item of orderItems) {
        // Check if holding already exists for this order item
        const { data: existingHolding } = await supabase
          .from('holdings')
          .select('id')
          .eq('user_id', currentOrder.user_id)
          .eq('commodity_id', item.commodity_id)
          .eq('grade_id', item.grade_id)
          .maybeSingle();

        if (!existingHolding) {
          // Insert holding
          await supabase.from('holdings').insert({
            user_id: currentOrder.user_id,
            commodity_id: item.commodity_id,
            grade_id: item.grade_id,
            quantity: item.quantity,
            purchase_price: item.unit_price,
            reserved_quantity: 0,
            status: 'active',
          });
        }
      }
    }
  }

  // 5. Write immutable entry to audit_logs
  await supabase.from('audit_logs').insert({
    user_id: adminId,
    action: 'admin_order_status_update',
    entity_type: 'orders',
    entity_id: orderId,
    old_state: { status: currentStatus, is_exception: currentOrder.is_exception },
    new_state: { status: targetStatus, notes: notes || 'Manual admin status advancement' },
  });

  // 6. Enqueue buyer notification
  await supabase.from('notifications').insert({
    user_id: currentOrder.user_id,
    type: 'order_status_update',
    channel: 'in_app',
    title: `Order Status Updated: ${targetStatus.toUpperCase().replace('_', ' ')}`,
    body: `Your KorraStore order #${orderId.slice(0, 8)} is now marked as ${targetStatus.replace('_', ' ')}.`,
    metadata: { order_id: orderId, new_status: targetStatus },
  });

  return { success: true, updatedStatus: targetStatus };
}

// ----------------------------------------------------------------------------
// Resolve Exception / Reconciliation State
// ----------------------------------------------------------------------------

export async function resolveOrderException(
  orderId: string,
  action: 'allocate_inventory' | 'refund_and_cancel',
  adminId: string,
  details?: { warehouseId?: string; notes?: string }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceClient();

  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('id, user_id, status, is_exception')
    .eq('id', orderId)
    .single();

  if (fetchError || !order) {
    return { success: false, error: 'Order not found.' };
  }

  if (action === 'allocate_inventory') {
    // Clear exception flag and advance to 'sourcing' or 'in_transit'
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        is_exception: false,
        exception_reason: null,
        status: 'sourcing',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Write audit log
    await supabase.from('audit_logs').insert({
      user_id: adminId,
      action: 'admin_order_exception_resolved',
      entity_type: 'orders',
      entity_id: orderId,
      old_state: { is_exception: true },
      new_state: { is_exception: false, action: 'allocate_inventory', notes: details?.notes },
    });
  } else if (action === 'refund_and_cancel') {
    // Mark as cancelled and clear exception flag
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        is_exception: false,
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Write audit log
    await supabase.from('audit_logs').insert({
      user_id: adminId,
      action: 'admin_order_exception_refunded',
      entity_type: 'orders',
      entity_id: orderId,
      old_state: { is_exception: true, status: order.status },
      new_state: { is_exception: false, status: 'cancelled', action: 'refund_and_cancel', notes: details?.notes },
    });
  }

  return { success: true };
}
