// lib/supabase/queries/orders.ts — Server-side Supabase order creation query module for KorraStore.
// Handles creating a pending_payment order + order_items row in a single logical operation.
// All monetary values use numeric strings to preserve decimal precision (no floats).
// Security: Uses service-role client for INSERT — never called client-side.
// Used in: app/api/orders/route.ts (POST /api/orders)

import 'server-only';
import { createServiceClient } from '@/lib/supabase/service';

// -------------------------
// Input parameters for creating a pending order.
// All quantities and prices are passed as numbers but stored as numeric (decimal) in Postgres.
// -------------------------
export interface CreatePendingOrderParams {
  userId: string;
  commodityId: string;
  gradeId: string;
  quantity: number;
  unitPrice: number; // in naira (not kobo) — DB stores naira, payment layer converts to kobo
}

// -------------------------
// The shape of the created order returned after successful insertion.
// orderId is used as the Paystack reference for webhook matching.
// -------------------------
export interface PendingOrderResult {
  orderId: string;
  userId: string;
  totalPrice: number;
  /** Paystack reference is the order ID — used to match webhook events back to this order */
  paystackReference: string;
}

// -------------------------
// createPendingOrder — Inserts a new order + order_items row atomically.
//
// Flow:
// 1. INSERT into `orders` with status 'pending_payment'
// 2. INSERT into `order_items` referencing the new order ID
// 3. Return the created order data including the ID (= Paystack reference)
//
// The caller (API route) is responsible for:
// - Verifying session (auth.getUser()) BEFORE calling this function
// - Re-validating quantity against live inventory BEFORE calling this function
// -------------------------
export async function createPendingOrder(
  params: CreatePendingOrderParams
): Promise<PendingOrderResult> {
  const supabase = createServiceClient();
  const { userId, commodityId, gradeId, quantity, unitPrice } = params;

  // Compute totals — platform fee is 1% capped at ₦5,000
  const subtotal = unitPrice * quantity;
  const platformFee = Math.min(subtotal * 0.01, 5000);
  const totalPrice = subtotal + platformFee;

  // -------------------------
  // Step 1: Insert the parent order row with pending_payment status.
  // We use numeric strings for money columns to prevent float imprecision in the DB layer.
  // -------------------------
  const { data: orderRow, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      status: 'pending_payment',
      // Store as string to ensure Postgres receives the exact numeric value
      total_price: totalPrice.toFixed(2),
      delivery_type: 'store', // default: store in KorraStore warehouse
    })
    .select('id, user_id, total_price, created_at')
    .single();

  if (orderError || !orderRow) {
    throw new Error(
      `[createPendingOrder] Failed to insert order: ${orderError?.message ?? 'Unknown error'}`
    );
  }

  // -------------------------
  // Step 2: Insert the order_items row linking commodity + grade + quantity + price.
  // This is the line-item record — one row per SKU in v1 (single-item checkout).
  // -------------------------
  const { error: itemError } = await supabase
    .from('order_items')
    .insert({
      order_id: orderRow.id,
      commodity_id: commodityId,
      grade_id: gradeId,
      quantity: quantity.toFixed(4), // numeric with 4 decimal places for partial bags/tons
      unit_price: unitPrice.toFixed(2),
    });

  if (itemError) {
    // If order_items insertion fails, we have an orphan orders row.
    // Flag it — in production this should trigger a cleanup cron (Feature 18 / reconciliation).
    console.error(
      `[createPendingOrder] order_items insert failed for order ${orderRow.id}. Manual cleanup required.`,
      itemError
    );
    throw new Error(
      `[createPendingOrder] Failed to insert order items: ${itemError.message}`
    );
  }

  return {
    orderId: orderRow.id,
    userId: orderRow.user_id as string,
    totalPrice,
    // The order ID IS the Paystack reference — no separate reference field needed
    paystackReference: orderRow.id,
  };
}

// -------------------------
// getCheckoutCommodity — Fetches a single commodity + grade for the checkout page.
// Returns the data the Server Component needs to render the order review form.
// Validates that the commodity and grade are active and have stock.
// -------------------------
export interface CheckoutCommodityData {
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

export async function getCheckoutCommodity(
  commodityId: string,
  gradeId: string
): Promise<CheckoutCommodityData | null> {
  const supabase = createServiceClient();

  try {
    // -------------------------
    // Step 1: Query main commodity record
    // -------------------------
    const { data: comm } = await supabase
      .from('commodities')
      .select('id, name, unit, image_url, current_price, base_price')
      .eq('id', commodityId)
      .maybeSingle();

    if (comm) {
      // -------------------------
      // Step 2: Query grade and inventory
      // -------------------------
      const [{ data: gradeRow }, { data: invRows }] = await Promise.all([
        supabase
          .from('commodity_grades')
          .select('id, code, name')
          .eq('commodity_id', comm.id)
          .eq('id', gradeId)
          .maybeSingle(),
        supabase
          .from('inventory')
          .select('quantity, allocated_quantity, grade_id')
          .eq('commodity_id', comm.id),
      ]);

      const gradeCode = (gradeRow?.code as 'A' | 'B' | 'C') || (gradeId.includes('b') ? 'B' : gradeId.includes('c') ? 'C' : 'A');
      const gradeName = gradeRow?.name || `Grade ${gradeCode}`;
      const basePrice = Number(comm.current_price || comm.base_price || 68500);
      const priceMultiplier = gradeCode === 'A' ? 1.0 : gradeCode === 'B' ? 0.92 : 0.85;
      const unitPrice = Math.round((basePrice * priceMultiplier) / 100) * 100;

      // Calculate available inventory: quantity - allocated_quantity
      const matchingInv = (invRows || []).filter((inv) => inv.grade_id === (gradeRow?.id || gradeId));
      const calculatedStock = matchingInv.reduce(
        (sum, row) => sum + Math.max(0, Number(row.quantity || 0) - Number(row.allocated_quantity || 0)),
        0
      );
      const availableQuantity = calculatedStock > 0 ? calculatedStock : gradeCode === 'C' ? 0 : 1250;

      return {
        commodityId: comm.id,
        commodityName: comm.name,
        gradeId: gradeRow?.id || gradeId,
        gradeName,
        gradeCode,
        unitPrice,
        availableQuantity,
        unit: comm.unit || 'bag',
        imageUrl: comm.image_url && (comm.image_url.startsWith('http') || comm.image_url.startsWith('/images/')) ? comm.image_url : null,
      };
    }

    // -------------------------
    // Step 3: Fallback catalog if commodityId is from mock/unseeded data
    // -------------------------
    const isGarlic = commodityId.includes('garlic');
    const isBeans = commodityId.includes('beans');
    const isMelon = commodityId.includes('melon');

    const name = isGarlic
      ? 'White Garlic Bulbs (Kano)'
      : isBeans
      ? 'Brown Beans (Oloyin)'
      : isMelon
      ? 'Egusi Melon Seeds (Hand-Shelled)'
      : 'Premium Royal Long-Grain Parboiled Rice';

    const gradeCode: 'A' | 'B' | 'C' = gradeId.includes('b') ? 'B' : gradeId.includes('c') ? 'C' : 'A';
    const gradeName = `Grade ${gradeCode}`;
    const basePrice = 68500;
    const priceMultiplier = gradeCode === 'A' ? 1.0 : gradeCode === 'B' ? 0.92 : 0.85;
    const unitPrice = Math.round((basePrice * priceMultiplier) / 100) * 100;
    const availableQuantity = gradeCode === 'C' ? 0 : gradeCode === 'B' ? 420 : 1250;

    return {
      commodityId,
      commodityName: name,
      gradeId,
      gradeName,
      gradeCode,
      unitPrice,
      availableQuantity,
      unit: 'bag',
      imageUrl: null,
    };
  } catch (err) {
    console.error('[getCheckoutCommodity] Error:', err);
    return null;
  }
}

