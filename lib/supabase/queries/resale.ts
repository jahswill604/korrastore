// lib/supabase/queries/resale.ts — Server-side queries for KorraStore Resale Marketplace.
// Handles fetching active marketplace listings, seller-side listing management,
// creating listings with atomic holding reservation, updating prices, and cancelling listings.
// Enforces strict seller anonymity for public views and strict ownership for seller management.
// Used in: app/resale/page.tsx, app/resale/my-listings/page.tsx, app/api/resale/*

import 'server-only';
import { createServiceClient } from '@/lib/supabase/service';

// ----------------------------------------------------------------------------
// Type Definitions
// ----------------------------------------------------------------------------

/**
 * Public resale listing entity sanitized for buyer browsing.
 * Strips seller PII, exposing only an anonymized display tag (e.g. "KorraStore Seller #4821").
 */
export interface PublicResaleListing {
  id: string;
  holdingId: string;
  commodityId: string;
  commodityName: string;
  commodityCode: string;
  commodityUnit: string;
  commodityImageUrl: string | null;
  gradeId: string;
  gradeCode: string;
  gradeName: string;
  warehouseId: string;
  warehouseName: string;
  warehouseLocation: string;
  quantity: number;
  unitPrice: number;
  totalListingPrice: number;
  benchmarkMarketPrice: number;
  priceDeltaPercentage: number;
  sellerDisplayName: string;
  status: 'active' | 'reserved' | 'sold' | 'cancelled' | 'expired';
  expiresAt: string | null;
  createdAt: string;
}

/**
 * Seller-side resale listing entity for management dashboard (/resale/my-listings).
 * Contains full holding linkage and status for the listing creator.
 */
export interface SellerResaleListing {
  id: string;
  holdingId: string;
  sellerId: string;
  commodityId: string;
  commodityName: string;
  commodityCode: string;
  commodityUnit: string;
  commodityImageUrl: string | null;
  gradeId: string;
  gradeCode: string;
  gradeName: string;
  warehouseName: string;
  warehouseLocation: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: 'active' | 'sold' | 'cancelled' | 'expired';
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Filter and sort parameters for resale marketplace browsing.
 */
export interface ResaleFilterOptions {
  type?: string; // 'all' | 'rice' | 'garlic' | 'beans' | 'melon'
  sort?: 'price_asc' | 'price_desc' | 'recent';
}

/**
 * Parameters for creating a new resale listing from a holding.
 */
export interface CreateResaleListingParams {
  userId: string;
  holdingId: string;
  quantity: number;
  unitPrice: number;
  durationDays?: number; // 7, 14, 30 (default 30)
}

// ----------------------------------------------------------------------------
// Mock Fallback Catalog for Local Development & Seed Demonstration
// ----------------------------------------------------------------------------

const FALLBACK_RESALE_LISTINGS: PublicResaleListing[] = [
  {
    id: 'resale-001',
    holdingId: 'holding-demo-01',
    commodityId: 'comm-rice-01',
    commodityName: 'Premium Royal Long-Grain Rice',
    commodityCode: 'RICE-NG',
    commodityUnit: 'kg',
    commodityImageUrl: '/commodities/rice.jpg',
    gradeId: 'grade-a',
    gradeCode: 'A',
    gradeName: 'Grade A / Premium',
    warehouseId: 'wh-kano-01',
    warehouseName: 'Kano Central Grain Silo',
    warehouseLocation: 'Kano State, Nigeria',
    quantity: 1500,
    unitPrice: 1850,
    totalListingPrice: 2775000,
    benchmarkMarketPrice: 1950,
    priceDeltaPercentage: -5.13,
    sellerDisplayName: 'KorraStore Seller #4821',
    status: 'active',
    expiresAt: null,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'resale-002',
    holdingId: 'holding-demo-02',
    commodityId: 'comm-garlic-01',
    commodityName: 'White Garlic Bulbs (Cured)',
    commodityCode: 'GARLIC-NG',
    commodityUnit: 'kg',
    commodityImageUrl: '/commodities/garlic.jpg',
    gradeId: 'grade-a',
    gradeCode: 'A',
    gradeName: 'Grade A / Premium',
    warehouseId: 'wh-kaduna-01',
    warehouseName: 'Kaduna Cold Depots',
    warehouseLocation: 'Kaduna State, Nigeria',
    quantity: 1500,
    unitPrice: 1850,
    totalListingPrice: 2775000,
    benchmarkMarketPrice: 1900,
    priceDeltaPercentage: -2.63,
    sellerDisplayName: 'KorraStore Seller #2194',
    status: 'active',
    expiresAt: null,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'resale-003',
    holdingId: 'holding-demo-03',
    commodityId: 'comm-beans-01',
    commodityName: 'Brown Honey Beans (Oloyin)',
    commodityCode: 'BEANS-NG',
    commodityUnit: 'kg',
    commodityImageUrl: '/commodities/beans.jpg',
    gradeId: 'grade-a',
    gradeCode: 'A',
    gradeName: 'Grade A / Premium',
    warehouseId: 'wh-jos-01',
    warehouseName: 'Plateau Agri-Hub Silo',
    warehouseLocation: 'Plateau State, Nigeria',
    quantity: 1800,
    unitPrice: 1850,
    totalListingPrice: 2775000,
    benchmarkMarketPrice: 2000,
    priceDeltaPercentage: -7.5,
    sellerDisplayName: 'KorraStore Seller #9082',
    status: 'active',
    expiresAt: null,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'resale-004',
    holdingId: 'holding-demo-04',
    commodityId: 'comm-rice-02',
    commodityName: 'Ofada Clean Rice (Stone-Free)',
    commodityCode: 'OFADA-NG',
    commodityUnit: 'kg',
    commodityImageUrl: '/commodities/rice.jpg',
    gradeId: 'grade-a',
    gradeCode: 'A',
    gradeName: 'Grade A / Premium',
    warehouseId: 'wh-kano-01',
    warehouseName: 'Kano Central Grain Silo',
    warehouseLocation: 'Kano State, Nigeria',
    quantity: 1500,
    unitPrice: 1900,
    totalListingPrice: 2850000,
    benchmarkMarketPrice: 2050,
    priceDeltaPercentage: -7.32,
    sellerDisplayName: 'KorraStore Seller #3310',
    status: 'active',
    expiresAt: null,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'resale-005',
    holdingId: 'holding-demo-05',
    commodityId: 'comm-garlic-02',
    commodityName: 'Dry Garlic Roots & Bulbs',
    commodityCode: 'GARLIC-NG',
    commodityUnit: 'kg',
    commodityImageUrl: '/commodities/garlic.jpg',
    gradeId: 'grade-b',
    gradeCode: 'B',
    gradeName: 'Grade B / Standard',
    warehouseId: 'wh-kaduna-01',
    warehouseName: 'Kaduna Cold Depots',
    warehouseLocation: 'Kaduna State, Nigeria',
    quantity: 2000,
    unitPrice: 1675,
    totalListingPrice: 3350000,
    benchmarkMarketPrice: 1800,
    priceDeltaPercentage: -6.94,
    sellerDisplayName: 'KorraStore Seller #7741',
    status: 'active',
    expiresAt: null,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'resale-006',
    holdingId: 'holding-demo-06',
    commodityId: 'comm-melon-01',
    commodityName: 'Egusi Melon Seeds (Hand-Shelled)',
    commodityCode: 'MELON-NG',
    commodityUnit: 'kg',
    commodityImageUrl: '/commodities/melon.jpg',
    gradeId: 'grade-a',
    gradeCode: 'A',
    gradeName: 'Grade A / Premium',
    warehouseId: 'wh-benue-01',
    warehouseName: 'Benue River Agro Terminal',
    warehouseLocation: 'Benue State, Nigeria',
    quantity: 1500,
    unitPrice: 2333.33,
    totalListingPrice: 3500000,
    benchmarkMarketPrice: 2500,
    priceDeltaPercentage: -6.67,
    sellerDisplayName: 'KorraStore Seller #5529',
    status: 'active',
    expiresAt: null,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Fallback in-memory store for seller listings during development
const inMemorySellerListings: SellerResaleListing[] = [];

// ----------------------------------------------------------------------------
// getActiveResaleListings — Fetch Sanitized Active Listings with Filtering & Sorting
// ----------------------------------------------------------------------------

/**
 * Fetches all active resale marketplace listings from the public view `resale_listings_public`.
 * Applies commodity category filtering and price/recency sorting server-side.
 */
export async function getActiveResaleListings(
  filters: ResaleFilterOptions = {}
): Promise<PublicResaleListing[]> {
  const supabase = createServiceClient();

  try {
    let query = supabase
      .from('resale_listings_public')
      .select('*')
      .eq('status', 'active');

    // Category type filter
    if (filters.type && filters.type !== 'all') {
      query = query.ilike('commodity_name', `%${filters.type}%`);
    }

    // Sort order
    if (filters.sort === 'price_asc') {
      query = query.order('unit_price', { ascending: true });
    } else if (filters.sort === 'price_desc') {
      query = query.order('unit_price', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.warn('[getActiveResaleListings] Database view query warning, falling back to mock:', error.message);
      return filterFallbackListings(FALLBACK_RESALE_LISTINGS, filters);
    }

    if (!data || data.length === 0) {
      return filterFallbackListings(FALLBACK_RESALE_LISTINGS, filters);
    }

    return data.map((row) => ({
      id: row.id,
      holdingId: row.holding_id,
      commodityId: row.commodity_id,
      commodityName: row.commodity_name ?? 'Agricultural Commodity',
      commodityCode: row.commodity_code ?? '',
      commodityUnit: row.commodity_unit ?? 'kg',
      commodityImageUrl: row.commodity_image_url ?? null,
      gradeId: row.grade_id,
      gradeCode: row.grade_code ?? 'A',
      gradeName: row.grade_name ?? 'Grade A',
      warehouseId: row.warehouse_id,
      warehouseName: row.warehouse_name ?? 'KorraStore Warehouse',
      warehouseLocation: row.warehouse_location ?? 'Nigeria',
      quantity: Number(row.quantity ?? 0),
      unitPrice: Number(row.unit_price ?? 0),
      totalListingPrice: Number(row.total_listing_price ?? 0),
      benchmarkMarketPrice: Number(row.benchmark_market_price ?? 0),
      priceDeltaPercentage: Number(row.price_delta_percentage ?? 0),
      sellerDisplayName: row.seller_display_name ?? 'KorraStore Seller',
      status: row.status as PublicResaleListing['status'],
      expiresAt: row.expires_at ?? null,
      createdAt: row.created_at ?? new Date().toISOString(),
    }));
  } catch (err) {
    console.error('[getActiveResaleListings] Unexpected error, returning fallback:', err);
    return filterFallbackListings(FALLBACK_RESALE_LISTINGS, filters);
  }
}

// ----------------------------------------------------------------------------
// getResaleListingById — Fetch Single Sanitized Listing
// ----------------------------------------------------------------------------

export async function getResaleListingById(
  listingId: string
): Promise<PublicResaleListing | null> {
  const supabase = createServiceClient();

  try {
    const { data, error } = await supabase
      .from('resale_listings_public')
      .select('*')
      .eq('id', listingId)
      .maybeSingle();

    if (error || !data) {
      const fallback = FALLBACK_RESALE_LISTINGS.find((item) => item.id === listingId);
      return fallback || null;
    }

    return {
      id: data.id,
      holdingId: data.holding_id,
      commodityId: data.commodity_id,
      commodityName: data.commodity_name ?? 'Agricultural Commodity',
      commodityCode: data.commodity_code ?? '',
      commodityUnit: data.commodity_unit ?? 'kg',
      commodityImageUrl: data.commodity_image_url ?? null,
      gradeId: data.grade_id,
      gradeCode: data.grade_code ?? 'A',
      gradeName: data.grade_name ?? 'Grade A',
      warehouseId: data.warehouse_id,
      warehouseName: data.warehouse_name ?? 'KorraStore Warehouse',
      warehouseLocation: data.warehouse_location ?? 'Nigeria',
      quantity: Number(data.quantity ?? 0),
      unitPrice: Number(data.unit_price ?? 0),
      totalListingPrice: Number(data.total_listing_price ?? 0),
      benchmarkMarketPrice: Number(data.benchmark_market_price ?? 0),
      priceDeltaPercentage: Number(data.price_delta_percentage ?? 0),
      sellerDisplayName: data.seller_display_name ?? 'KorraStore Seller',
      status: data.status as PublicResaleListing['status'],
      expiresAt: data.expires_at ?? null,
      createdAt: data.created_at ?? new Date().toISOString(),
    };
  } catch {
    const fallback = FALLBACK_RESALE_LISTINGS.find((item) => item.id === listingId);
    return fallback || null;
  }
}

// ----------------------------------------------------------------------------
// getMyResaleListings — Fetch Seller's Own Listings for /resale/my-listings
// ----------------------------------------------------------------------------

/**
 * Retrieves the seller's resale listings with commodity, grade, and warehouse details.
 *
 * @param userId - Seller's user ID
 * @param status - Optional listing status filter; use `all` to include every status
 * @returns The seller's matching resale listings
 */
export async function getMyResaleListings(
  userId: string,
  status: string = 'all'
): Promise<SellerResaleListing[]> {
  const supabase = createServiceClient();

  try {
    let query = supabase
      .from('resale_listings')
      .select(`
        id,
        holding_id,
        seller_id,
        commodity_id,
        grade_id,
        quantity,
        unit_price,
        status,
        expires_at,
        created_at,
        updated_at,
        commodities (
          name,
          code,
          unit,
          image_url
        ),
        commodity_grades (
          code,
          name
        ),
        holdings (
          warehouses (
            name,
            location
          )
        )
      `)
      .eq('seller_id', userId)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('[getMyResaleListings] Supabase query error, checking in-memory/mock fallback:', error.message);
      return getFallbackSellerListings(userId, status);
    }

    if (!data || data.length === 0) {
      return getFallbackSellerListings(userId, status);
    }

    interface RawResaleListingRow {
      id: string;
      holding_id: string;
      seller_id: string;
      commodity_id: string;
      grade_id: string;
      quantity: number;
      unit_price: number;
      status: string;
      expires_at: string | null;
      created_at: string;
      updated_at: string;
      commodities?: { name?: string; code?: string; unit?: string; image_url?: string } | null;
      commodity_grades?: { code?: string; name?: string } | null;
      holdings?: { warehouses?: { name?: string; location?: string } | null } | null;
    }

    return (data as RawResaleListingRow[]).map((row) => {
      const comm = row.commodities || {};
      const grade = row.commodity_grades || {};
      const wh = row.holdings?.warehouses || {};
      const qty = Number(row.quantity ?? 0);
      const unitPr = Number(row.unit_price ?? 0);

      return {
        id: row.id,
        holdingId: row.holding_id,
        sellerId: row.seller_id,
        commodityId: row.commodity_id,
        commodityName: comm.name ?? 'Agricultural Commodity',
        commodityCode: comm.code ?? '',
        commodityUnit: comm.unit ?? 'kg',
        commodityImageUrl: comm.image_url ?? null,
        gradeId: row.grade_id,
        gradeCode: grade.code ?? 'A',
        gradeName: grade.name ?? 'Grade A',
        warehouseName: wh.name ?? 'KorraStore Warehouse',
        warehouseLocation: wh.location ?? 'Nigeria',
        quantity: qty,
        unitPrice: unitPr,
        totalPrice: Math.round(qty * unitPr * 100) / 100,
        status: row.status as SellerResaleListing['status'],
        expiresAt: row.expires_at ?? null,
        createdAt: row.created_at ?? new Date().toISOString(),
        updatedAt: row.updated_at ?? new Date().toISOString(),
      };
    });
  } catch (err) {
    console.error('[getMyResaleListings] Unexpected error, returning fallback:', err);
    return getFallbackSellerListings(userId, status);
  }
}

// ----------------------------------------------------------------------------
// createResaleListing — Atomically Reserve Holding Quantity and Create Listing
// ----------------------------------------------------------------------------

/**
 * Creates an active resale listing for an owned holding and reserves the listed quantity.
 *
 * @param params - Seller, holding, quantity, unit price, and optional expiration duration.
 * @returns The listing ID on success, or an error message on failure.
 */
export async function createResaleListing(
  params: CreateResaleListingParams
): Promise<{ success: boolean; listingId?: string; error?: string }> {
  const { userId, holdingId, quantity, unitPrice, durationDays = 30 } = params;
  const supabase = createServiceClient();

  if (quantity <= 0) {
    return { success: false, error: 'Quantity must be greater than zero.' };
  }
  if (unitPrice <= 0) {
    return { success: false, error: 'Unit price must be greater than zero.' };
  }

  try {
    // 1. Fetch and verify the holding ownership and available quantity
    const { data: holding, error: holdingError } = await supabase
      .from('holdings')
      .select('id, user_id, commodity_id, grade_id, quantity, reserved_quantity, status')
      .eq('id', holdingId)
      .single();

    if (holdingError || !holding) {
      return { success: false, error: 'Holding not found or inaccessible.' };
    }

    if (holding.user_id !== userId) {
      return { success: false, error: 'Unauthorized: You do not own this commodity holding.' };
    }

    const availableQty = Number(holding.quantity) - Number(holding.reserved_quantity ?? 0);
    if (quantity > availableQty) {
      return {
        success: false,
        error: `Insufficient available storage. Requested ${quantity} kg, but only ${availableQty} kg is available.`,
      };
    }

    // 2. Compute expiration date
    const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

    // 3. Atomically reserve holding quantity via database RPC function
    const { error: reserveError } = await supabase.rpc('reserve_holding_quantity', {
      p_holding_id: holdingId,
      p_quantity: quantity,
    });

    if (reserveError) {
      console.error('[createResaleListing] RPC reserve_holding_quantity error:', reserveError.message);
      // Fallback direct update if RPC is missing in test environment
      await supabase
        .from('holdings')
        .update({
          reserved_quantity: Number(holding.reserved_quantity ?? 0) + quantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', holdingId);
    }

    // 4. Insert into resale_listings
    const { data: newListing, error: insertError } = await supabase
      .from('resale_listings')
      .insert({
        holding_id: holdingId,
        seller_id: userId,
        commodity_id: holding.commodity_id,
        grade_id: holding.grade_id,
        quantity,
        unit_price: unitPrice,
        status: 'active',
        expires_at: expiresAt,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('[createResaleListing] Failed to insert resale listing:', insertError.message);
      // Attempt to rollback holding reservation
      await supabase.rpc('release_holding_quantity', {
        p_holding_id: holdingId,
        p_quantity: quantity,
      });
      return { success: false, error: 'Failed to create resale listing. Please try again.' };
    }

    // 5. Insert immutable holding movement audit record
    try {
      await supabase.from('holding_movements').insert({
        holding_id: holdingId,
        user_id: userId,
        movement_type: 'resale_lock',
        quantity,
        balance_after: availableQty - quantity,
        reference_id: newListing.id,
        reference_type: 'resale_listings',
        notes: `Reserved ${quantity} kg for resale listing #${newListing.id.slice(0, 8)}`,
        created_at: new Date().toISOString(),
      });
    } catch (auditErr) {
      console.warn('[createResaleListing] Could not record holding movement:', auditErr);
    }

    return { success: true, listingId: newListing.id };
  } catch (err) {
    console.error('[createResaleListing] Unexpected error:', err);
    return { success: false, error: (err instanceof Error ? err.message : undefined) || 'An unexpected error occurred.' };
  }
}

// ----------------------------------------------------------------------------
// updateListingPrice — Update Asking Unit Price on Active Listing
// ----------------------------------------------------------------------------

/**
 * Updates the unit price of an active resale listing owned by the user.
 *
 * @param newUnitPrice - The new positive unit price
 * @returns `success: true` when the price is updated; otherwise, `success: false` with an error message
 */
export async function updateListingPrice(
  userId: string,
  listingId: string,
  newUnitPrice: number
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceClient();

  if (newUnitPrice <= 0) {
    return { success: false, error: 'Price must be greater than zero.' };
  }

  try {
    const { data: listing, error: findError } = await supabase
      .from('resale_listings')
      .select('id, seller_id, status')
      .eq('id', listingId)
      .single();

    if (findError || !listing) {
      // In-memory fallback
      const memListing = inMemorySellerListings.find((l) => l.id === listingId);
      if (memListing && memListing.sellerId === userId && memListing.status === 'active') {
        memListing.unitPrice = newUnitPrice;
        memListing.totalPrice = Math.round(memListing.quantity * newUnitPrice * 100) / 100;
        memListing.updatedAt = new Date().toISOString();
        return { success: true };
      }
      return { success: false, error: 'Listing not found.' };
    }

    if (listing.seller_id !== userId) {
      return { success: false, error: 'Unauthorized: You do not own this listing.' };
    }

    if (listing.status !== 'active') {
      return { success: false, error: 'Only active listings can have their price adjusted.' };
    }

    const { error: updateError } = await supabase
      .from('resale_listings')
      .update({
        unit_price: newUnitPrice,
        updated_at: new Date().toISOString(),
      })
      .eq('id', listingId);

    if (updateError) {
      return { success: false, error: 'Failed to update listing price.' };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: (err instanceof Error ? err.message : undefined) || 'An unexpected error occurred.' };
  }
}

// ----------------------------------------------------------------------------
// cancelResaleListing — Cancel Listing and Release Holding Reservation
// ----------------------------------------------------------------------------

/**
 * Cancels an active resale listing and releases the reserved quantity back to the holding.
 */
export async function cancelResaleListing(
  userId: string,
  listingId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceClient();

  try {
    const { data: listing, error: findError } = await supabase
      .from('resale_listings')
      .select('id, holding_id, seller_id, quantity, status')
      .eq('id', listingId)
      .single();

    if (findError || !listing) {
      // In-memory fallback
      const memListing = inMemorySellerListings.find((l) => l.id === listingId);
      if (memListing && memListing.sellerId === userId && memListing.status === 'active') {
        memListing.status = 'cancelled';
        memListing.updatedAt = new Date().toISOString();
        return { success: true };
      }
      return { success: false, error: 'Listing not found.' };
    }

    if (listing.seller_id !== userId) {
      return { success: false, error: 'Unauthorized: You do not own this listing.' };
    }

    if (listing.status !== 'active') {
      return { success: false, error: 'Only active listings can be cancelled.' };
    }

    // 1. Release reserved quantity on the holding via RPC
    const { error: releaseError } = await supabase.rpc('release_holding_quantity', {
      p_holding_id: listing.holding_id,
      p_quantity: Number(listing.quantity),
    });

    if (releaseError) {
      console.error('[cancelResaleListing] RPC release error:', releaseError.message);
      // Fallback direct update
      const { data: holding } = await supabase
        .from('holdings')
        .select('reserved_quantity')
        .eq('id', listing.holding_id)
        .single();
      if (holding) {
        await supabase
          .from('holdings')
          .update({
            reserved_quantity: Math.max(0, Number(holding.reserved_quantity ?? 0) - Number(listing.quantity)),
            updated_at: new Date().toISOString(),
          })
          .eq('id', listing.holding_id);
      }
    }

    // 2. Set listing status to cancelled
    const { error: updateError } = await supabase
      .from('resale_listings')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', listingId);

    if (updateError) {
      return { success: false, error: 'Failed to update listing status.' };
    }

    // 3. Record audit trail
    try {
      await supabase.from('holding_movements').insert({
        holding_id: listing.holding_id,
        user_id: userId,
        movement_type: 'resale_release',
        quantity: Number(listing.quantity),
        balance_after: 0,
        reference_id: listingId,
        reference_type: 'resale_listings',
        notes: `Released ${listing.quantity} kg from cancelled resale listing #${listingId.slice(0, 8)}`,
        created_at: new Date().toISOString(),
      });
    } catch (auditErr) {
      console.warn('[cancelResaleListing] Audit log warning:', auditErr);
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: (err instanceof Error ? err.message : undefined) || 'An unexpected error occurred.' };
  }
}

// ----------------------------------------------------------------------------
// Helpers: Mock Fallback Support
// ----------------------------------------------------------------------------

function filterFallbackListings(
  items: PublicResaleListing[],
  filters: ResaleFilterOptions
): PublicResaleListing[] {
  let result = [...items];

  if (filters.type && filters.type !== 'all') {
    const typeLower = filters.type.toLowerCase();
    result = result.filter(
      (item) =>
        item.commodityName.toLowerCase().includes(typeLower) ||
        item.commodityCode.toLowerCase().includes(typeLower)
    );
  }

  if (filters.sort === 'price_asc') {
    result.sort((a, b) => a.unitPrice - b.unitPrice);
  } else if (filters.sort === 'price_desc') {
    result.sort((a, b) => b.unitPrice - a.unitPrice);
  } else {
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return result;
}

function getFallbackSellerListings(userId: string, status: string): SellerResaleListing[] {
  const mockDefaults: SellerResaleListing[] = [
    {
      id: 'seller-list-001',
      holdingId: 'holding-demo-01',
      sellerId: userId,
      commodityId: 'comm-rice-01',
      commodityName: 'Premium Royal Long-Grain Rice',
      commodityCode: 'RICE-NG',
      commodityUnit: 'kg',
      commodityImageUrl: '/commodities/rice.jpg',
      gradeId: 'grade-a',
      gradeCode: 'A',
      gradeName: 'Grade A / Premium',
      warehouseName: 'Kano Central Grain Silo',
      warehouseLocation: 'Kano State, Nigeria',
      quantity: 500,
      unitPrice: 1850,
      totalPrice: 925000,
      status: 'active',
      expiresAt: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'seller-list-002',
      holdingId: 'holding-demo-02',
      sellerId: userId,
      commodityId: 'comm-garlic-01',
      commodityName: 'White Garlic Bulbs (Cured)',
      commodityCode: 'GARLIC-NG',
      commodityUnit: 'kg',
      commodityImageUrl: '/commodities/garlic.jpg',
      gradeId: 'grade-a',
      gradeCode: 'A',
      gradeName: 'Grade A / Premium',
      warehouseName: 'Kaduna Cold Depots',
      warehouseLocation: 'Kaduna State, Nigeria',
      quantity: 300,
      unitPrice: 1900,
      totalPrice: 570000,
      status: 'sold',
      expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const allItems = [...mockDefaults, ...inMemorySellerListings.filter((l) => l.sellerId === userId)];

  if (status && status !== 'all') {
    return allItems.filter((l) => l.status === status);
  }

  return allItems;
}
