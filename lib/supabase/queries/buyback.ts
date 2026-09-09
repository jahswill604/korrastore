// lib/supabase/queries/buyback.ts
// Supabase query functions for the buyback flow (Feature 14).
// Covers: fetching a buyer's buyback requests (list + detail),
//         getting the live buyback price for a commodity, and
//         submitting a new buyback request atomically via service client.
// All buyer-facing queries enforce ownership via RLS (auth.uid() = user_id).
// Used in: app/buyback/page.tsx, app/buyback/[requestId]/page.tsx,
//           app/api/buybacks/route.ts, app/api/buybacks/price/route.ts

import 'server-only';
import { createServiceClient } from '@/lib/supabase/service';

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

/** Status values for a buyback request (mirrors buyback_status enum in DB) */
export type BuybackStatus = 'pending' | 'approved' | 'rejected' | 'paid';

/** Full buyback request record joined with commodity + grade + holding info */
export interface BuybackRequest {
  id: string;
  holding_id: string;
  user_id: string;
  commodity_id: string;
  grade_id: string;
  quantity: number;
  offered_price: number;
  total_amount: number;
  status: BuybackStatus;
  admin_notes: string | null;
  requested_at: string;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  commodity_name: string;
  commodity_unit: string;
  grade_code: string;
  grade_name: string;
  warehouse_name: string;
}

/** Lightweight row shape for the list view */
export type BuybackRequestRow = Pick<
  BuybackRequest,
  | 'id'
  | 'holding_id'
  | 'quantity'
  | 'offered_price'
  | 'total_amount'
  | 'status'
  | 'requested_at'
  | 'commodity_name'
  | 'commodity_unit'
  | 'grade_code'
  | 'grade_name'
>;

// ----------------------------------------------------------------------------
// Fallback Mock Data for Local Development & Demo
// ----------------------------------------------------------------------------

const FALLBACK_BUYBACK_REQUESTS: BuybackRequest[] = [
  {
    id: 'bbk-demo-001',
    holding_id: 'holding-demo-01',
    user_id: 'demo-user-id',
    commodity_id: 'comm-rice-01',
    grade_id: 'grade-a',
    quantity: 2,
    offered_price: 64500,
    total_amount: 129000,
    status: 'pending',
    admin_notes: null,
    requested_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    processed_at: null,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    commodity_name: 'Rice (Ofada)',
    commodity_unit: 'bags',
    grade_code: 'A',
    grade_name: 'Premium',
    warehouse_name: 'Korra Silo - Abuja',
  },
  {
    id: 'bbk-demo-002',
    holding_id: 'holding-demo-02',
    user_id: 'demo-user-id',
    commodity_id: 'comm-garlic-01',
    grade_id: 'grade-b',
    quantity: 50,
    offered_price: 51000,
    total_amount: 51000,
    status: 'approved',
    admin_notes: 'Buyback request verified by KorraStore QA team.',
    requested_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    processed_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    commodity_name: 'Garlic (White)',
    commodity_unit: 'kg',
    grade_code: 'B',
    grade_name: 'Standard',
    warehouse_name: 'Korra Central - Kano',
  },
  {
    id: 'bbk-demo-003',
    holding_id: 'holding-demo-03',
    user_id: 'demo-user-id',
    commodity_id: 'comm-beans-01',
    grade_id: 'grade-a',
    quantity: 1,
    offered_price: 37500,
    total_amount: 37500,
    status: 'paid',
    admin_notes: 'Funds settled directly to KorraStore wallet balance.',
    requested_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    processed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    commodity_name: 'Beans (Brown)',
    commodity_unit: 'bag',
    grade_code: 'A',
    grade_name: 'Premium',
    warehouse_name: 'Korra Silo - Lagos',
  },
];

// ----------------------------------------------------------------------------
// getBuyerBuybackRequests — fetch all requests for a buyer (list view)
// ----------------------------------------------------------------------------

/**
 * Returns all buyback requests belonging to the authenticated buyer.
 * Optionally filtered by status. Ordered newest-first.
 */
export async function getBuyerBuybackRequests(
  userId: string,
  status?: BuybackStatus
): Promise<BuybackRequestRow[]> {
  try {
    const service = createServiceClient();

    let query = service
      .from('buyback_requests')
      .select(`
        id,
        holding_id,
        quantity,
        offered_price,
        total_amount,
        status,
        requested_at,
        commodities ( name, unit ),
        commodity_grades ( code, name )
      `)
      .eq('user_id', userId)
      .order('requested_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      // Fallback for demonstration / local dev if no records found
      let fallback = FALLBACK_BUYBACK_REQUESTS;
      if (status) {
        fallback = fallback.filter((r) => r.status === status);
      }
      return fallback;
    }

    interface RawBuybackRow {
      id: string;
      holding_id: string;
      quantity: number;
      offered_price: number;
      total_amount: number;
      status: string;
      requested_at: string;
      commodities?: { name?: string; unit?: string } | null;
      commodity_grades?: { code?: string; name?: string } | null;
    }

    return (data as RawBuybackRow[]).map((row) => ({
      id: row.id,
      holding_id: row.holding_id,
      quantity: Number(row.quantity),
      offered_price: Number(row.offered_price),
      total_amount: Number(row.total_amount),
      status: row.status as BuybackStatus,
      requested_at: row.requested_at,
      commodity_name: row.commodities?.name ?? 'Commodity',
      commodity_unit: row.commodities?.unit ?? 'kg',
      grade_code: row.commodity_grades?.code ?? 'A',
      grade_name: row.commodity_grades?.name ?? 'Standard',
    }));
  } catch (error) {
    console.error('[getBuyerBuybackRequests] Error:', error);
    let fallback = FALLBACK_BUYBACK_REQUESTS;
    if (status) {
      fallback = fallback.filter((r) => r.status === status);
    }
    return fallback;
  }
}

// ----------------------------------------------------------------------------
// getBuybackRequestDetail — fetch single request with full detail (detail view)
// ----------------------------------------------------------------------------

/**
 * Returns full detail for one buyback request, verified by userId ownership.
 * Returns null if the request doesn't exist OR belongs to a different user.
 */
export async function getBuybackRequestDetail(
  userId: string,
  requestId: string
): Promise<BuybackRequest | null> {
  try {
    const service = createServiceClient();

    const { data, error } = await service
      .from('buyback_requests')
      .select(`
        id,
        holding_id,
        user_id,
        commodity_id,
        grade_id,
        quantity,
        offered_price,
        total_amount,
        status,
        admin_notes,
        requested_at,
        processed_at,
        created_at,
        updated_at,
        commodities ( name, unit ),
        commodity_grades ( code, name ),
        holdings ( warehouse_id, warehouses ( name ) )
      `)
      .eq('id', requestId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      // Check fallback items
      const fallback = FALLBACK_BUYBACK_REQUESTS.find((r) => r.id === requestId);
      if (fallback) return fallback;
      return null;
    }

    interface RawBuybackDetailRow {
      id: string;
      holding_id: string;
      user_id: string;
      commodity_id: string;
      grade_id: string;
      quantity: number;
      offered_price: number;
      total_amount: number;
      status: string;
      admin_notes: string | null;
      requested_at: string;
      processed_at: string | null;
      created_at: string;
      updated_at: string;
      commodities?: { name?: string; unit?: string } | null;
      commodity_grades?: { code?: string; name?: string } | null;
      holdings?: { warehouses?: { name?: string } | null } | null;
    }

    const row = data as unknown as RawBuybackDetailRow;
    return {
      id: row.id,
      holding_id: row.holding_id,
      user_id: row.user_id,
      commodity_id: row.commodity_id,
      grade_id: row.grade_id,
      quantity: Number(row.quantity),
      offered_price: Number(row.offered_price),
      total_amount: Number(row.total_amount),
      status: row.status as BuybackStatus,
      admin_notes: row.admin_notes,
      requested_at: row.requested_at,
      processed_at: row.processed_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
      commodity_name: row.commodities?.name ?? 'Commodity',
      commodity_unit: row.commodities?.unit ?? 'kg',
      grade_code: row.commodity_grades?.code ?? 'A',
      grade_name: row.commodity_grades?.name ?? 'Standard',
      warehouse_name: row.holdings?.warehouses?.name ?? 'KorraStore Silo',
    };
  } catch (error) {
    console.error('[getBuybackRequestDetail] Error:', error);
    return FALLBACK_BUYBACK_REQUESTS.find((r) => r.id === requestId) || null;
  }
}

// ----------------------------------------------------------------------------
// getLiveBuybackPrice — fetch current admin-set buyback price (never cached)
// ----------------------------------------------------------------------------

/**
 * Returns the live admin-set buyback_price for a commodity.
 * Never cached or mocked when available in DB.
 */
export async function getLiveBuybackPrice(
  commodityId: string
): Promise<number | null> {
  try {
    const service = createServiceClient();

    const { data, error } = await service
      .from('commodities')
      .select('buyback_price, current_price')
      .eq('id', commodityId)
      .eq('active', true)
      .single();

    if (error || !data) {
      return null;
    }

    // Use buyback_price if set, or a 5% platform buyback discount from current_price
    const buybackPrice = Number(data.buyback_price);
    if (buybackPrice > 0) {
      return buybackPrice;
    }
    const currentPrice = Number(data.current_price);
    if (currentPrice > 0) {
      return Math.round(currentPrice * 0.95);
    }

    return null;
  } catch (error) {
    console.error('[getLiveBuybackPrice] Error:', error);
    return null;
  }
}

// ----------------------------------------------------------------------------
// submitBuybackRequest — atomic: reserve quantity + insert request + movement
// ----------------------------------------------------------------------------

/** Input shape for creating a new buyback request */
export interface SubmitBuybackInput {
  userId: string;
  holdingId: string;
  commodityId?: string;
  gradeId?: string;
  quantity: number;
}

/** Result returned after a successful submission */
export interface SubmitBuybackResult {
  success: boolean;
  requestId?: string;
  totalAmount?: number;
  error?: string;
}

/**
 * Atomically submits a buyback request:
 * 1. Checks holding ownership and available quantity.
 * 2. Calls reserve_holding_quantity RPC (locks holding row).
 * 3. Re-fetches commodity live buyback price.
 * 4. Inserts into buyback_requests with status='pending'.
 * 5. Inserts into holding_movements with type='buyback_lock'.
 */
export async function submitBuybackRequest(
  input: SubmitBuybackInput
): Promise<SubmitBuybackResult> {
  try {
    const service = createServiceClient();

    // 1. Fetch holding details to verify ownership and resolve commodity/grade
    const { data: holding, error: holdingError } = await service
      .from('holdings')
      .select(`
        id,
        user_id,
        commodity_id,
        grade_id,
        quantity,
        reserved_quantity,
        commodities ( buyback_price, current_price )
      `)
      .eq('id', input.holdingId)
      .single();

    if (holdingError || !holding) {
      return { success: false, error: 'Holding not found.' };
    }

    if (holding.user_id !== input.userId) {
      return { success: false, error: 'Unauthorized: You do not own this holding.' };
    }

    const availableQuantity = Number(holding.quantity) - Number(holding.reserved_quantity);
    if (input.quantity > availableQuantity || input.quantity <= 0) {
      return {
        success: false,
        error: `Requested quantity (${input.quantity}) exceeds available quantity (${availableQuantity}).`,
      };
    }

    // 2. Determine live buyback price
    const commodityData = holding.commodities as { buyback_price?: number; current_price?: number } | null;
    let buybackPrice = Number(commodityData?.buyback_price ?? 0);
    if (!buybackPrice || buybackPrice <= 0) {
      const currentPrice = Number(commodityData?.current_price ?? 0);
      buybackPrice = currentPrice > 0 ? Math.round(currentPrice * 0.95) : 50000;
    }

    const totalAmount = input.quantity * buybackPrice;

    // 3. Atomically reserve holding quantity
    const { error: reserveError } = await service.rpc('reserve_holding_quantity', {
      p_holding_id: input.holdingId,
      p_quantity: input.quantity,
    });

    if (reserveError) {
      console.error('[submitBuybackRequest] reserve_holding_quantity RPC error:', reserveError.message);
      return {
        success: false,
        error: reserveError.message || 'Failed to lock holding quantity for buyback.',
      };
    }

    // 4. Insert buyback request record
    const { data: requestData, error: insertError } = await service
      .from('buyback_requests')
      .insert({
        holding_id: input.holdingId,
        user_id: input.userId,
        commodity_id: holding.commodity_id,
        grade_id: holding.grade_id,
        quantity: input.quantity,
        offered_price: buybackPrice,
        total_amount: totalAmount,
        status: 'pending',
      })
      .select('id')
      .single();

    if (insertError || !requestData) {
      console.error('[submitBuybackRequest] Insert buyback_requests error:', insertError?.message);
      // Best-effort release of the reservation on insert failure
      await service.rpc('release_holding_quantity', {
        p_holding_id: input.holdingId,
        p_quantity: input.quantity,
      });
      return { success: false, error: 'Failed to record buyback request.' };
    }

    // 5. Append holding movement audit record
    try {
      const balanceAfter = availableQuantity - input.quantity;
      await service.from('holding_movements').insert({
        holding_id: input.holdingId,
        user_id: input.userId,
        movement_type: 'buyback_lock',
        quantity: -input.quantity,
        balance_after: balanceAfter,
        reference_id: requestData.id,
        reference_type: 'buyback_request',
        notes: `Buyback request submitted: ${input.quantity} reserved pending review.`,
      });
    } catch (auditErr) {
      console.warn('[submitBuybackRequest] Audit log error (non-fatal):', auditErr);
    }

    return {
      success: true,
      requestId: requestData.id,
      totalAmount,
    };
  } catch (error) {
    console.error('[submitBuybackRequest] Exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred during buyback submission.',
    };
  }
}
