// __tests__/holdings-ledger.test.ts — Unit tests for purchase-to-holding allocation.
// Supabase is replaced with a fluent recording double so every balance and ledger write is asserted.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockSupabase, MockSupabaseResults } from './test-utils/mock-supabase';

const mocks = vi.hoisted(() => ({ createServiceClient: vi.fn() }));

vi.mock('server-only', () => ({}));
vi.mock('@/lib/supabase/service', () => ({ createServiceClient: mocks.createServiceClient }));

import { allocatePurchaseToHolding } from '@/lib/domain/ledger/holdings-ledger';

const params = {
  orderId: 'order-1',
  userId: 'user-1',
  commodityId: 'commodity-1',
  gradeId: 'grade-a',
  warehouseId: 'warehouse-1',
  quantity: 2,
  unitPrice: 200,
};

function allocationDatabase(overrides: MockSupabaseResults = {}) {
  return createMockSupabase({
    'inventory.select.single': {
      data: { id: 'inventory-1', quantity: '10', allocated_quantity: '1' },
      error: null,
    },
    'inventory.update.then': { error: null },
    'inventory_movements.insert.single': { data: { id: 'inventory-movement-1' }, error: null },
    'holdings.select.maybeSingle': { data: null, error: null },
    'holdings.insert.single': { data: { id: 'holding-1' }, error: null },
    'holdings.update.then': { error: null },
    'holding_movements.insert.single': { data: { id: 'holding-movement-1' }, error: null },
    ...overrides,
  });
}

describe('allocatePurchaseToHolding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([0, -1])('rejects non-positive quantity %s before creating a database client', async (quantity) => {
    await expect(allocatePurchaseToHolding({ ...params, quantity })).rejects.toThrow(
      'quantity must be positive'
    );
    expect(mocks.createServiceClient).not.toHaveBeenCalled();
  });

  it('reports the requested stock dimensions when no inventory row exists', async () => {
    const db = allocationDatabase({
      'inventory.select.single': { data: null, error: { message: 'row not found' } },
    });
    mocks.createServiceClient.mockReturnValue(db.client);

    await expect(allocatePurchaseToHolding(params)).rejects.toThrow(
      'no inventory row for warehouse=warehouse-1 commodity=commodity-1 grade=grade-a. row not found'
    );
    expect(db.operation('inventory', 'update')).toBeUndefined();
  });

  it('rejects purchases larger than physical inventory without writing any balances', async () => {
    const db = allocationDatabase({
      'inventory.select.single': {
        data: { id: 'inventory-1', quantity: '1.5', allocated_quantity: '0' },
        error: null,
      },
    });
    mocks.createServiceClient.mockReturnValue(db.client);

    await expect(allocatePurchaseToHolding(params)).rejects.toThrow(
      'insufficient stock (have 1.5, need 2) for order order-1'
    );
    expect(db.operation('inventory', 'update')).toBeUndefined();
    expect(db.operation('inventory_movements', 'insert')).toBeUndefined();
  });

  it('creates a new holding and matching immutable movement records', async () => {
    const db = allocationDatabase();
    mocks.createServiceClient.mockReturnValue(db.client);

    const result = await allocatePurchaseToHolding(params);

    expect(result).toEqual({
      holdingId: 'holding-1',
      inventoryMovementId: 'inventory-movement-1',
      holdingMovementId: 'holding-movement-1',
      newHoldingQuantity: 2,
    });
    expect(db.operation('inventory', 'select')?.filters).toEqual([
      { column: 'warehouse_id', value: 'warehouse-1' },
      { column: 'commodity_id', value: 'commodity-1' },
      { column: 'grade_id', value: 'grade-a' },
    ]);
    expect(db.operation('inventory', 'update')?.payload).toMatchObject({ quantity: 8 });
    expect(db.operation('inventory_movements', 'insert')?.payload).toMatchObject({
      warehouse_id: 'warehouse-1',
      commodity_id: 'commodity-1',
      grade_id: 'grade-a',
      movement_type: 'SALE',
      quantity: -2,
      balance_after: 8,
      reference_type: 'order',
      reference_id: 'order-1',
    });
    expect(db.operation('holdings', 'insert')?.payload).toEqual({
      user_id: 'user-1',
      commodity_id: 'commodity-1',
      grade_id: 'grade-a',
      warehouse_id: 'warehouse-1',
      quantity: 2,
      cost_basis: 400,
      unit_purchase_price: 200,
    });
    expect(db.operation('holding_movements', 'insert')?.payload).toMatchObject({
      holding_id: 'holding-1',
      user_id: 'user-1',
      movement_type: 'purchase',
      quantity: 2,
      balance_after: 2,
      reference_id: 'order-1',
      reference_type: 'order',
    });
  });

  it('updates an existing holding using weighted-average cost basis', async () => {
    const db = allocationDatabase({
      'holdings.select.maybeSingle': {
        data: { id: 'holding-existing', quantity: '3', cost_basis: '300' },
        error: null,
      },
    });
    mocks.createServiceClient.mockReturnValue(db.client);

    const result = await allocatePurchaseToHolding(params);

    expect(result.newHoldingQuantity).toBe(5);
    expect(result.holdingId).toBe('holding-existing');
    expect(db.operation('holdings', 'insert')).toBeUndefined();
    expect(db.operation('holdings', 'update')?.payload).toMatchObject({
      quantity: 5,
      cost_basis: 700,
      unit_purchase_price: 140,
    });
    expect(db.operation('holdings', 'update')?.filters).toEqual([
      { column: 'id', value: 'holding-existing' },
    ]);
    expect(db.operation('holding_movements', 'insert')?.payload).toMatchObject({
      holding_id: 'holding-existing',
      balance_after: 5,
    });
  });

  it('stops before ledger writes when inventory decrement fails', async () => {
    const db = allocationDatabase({
      'inventory.update.then': { error: { message: 'write conflict' } },
    });
    mocks.createServiceClient.mockReturnValue(db.client);

    await expect(allocatePurchaseToHolding(params)).rejects.toThrow(
      'failed to decrement inventory for order order-1: write conflict'
    );
    expect(db.operation('inventory_movements', 'insert')).toBeUndefined();
    expect(db.operation('holdings', 'insert')).toBeUndefined();
  });

  it('surfaces a reconciliation error when the inventory movement cannot be recorded', async () => {
    const db = allocationDatabase({
      'inventory_movements.insert.single': { data: null, error: { message: 'ledger unavailable' } },
    });
    mocks.createServiceClient.mockReturnValue(db.client);

    await expect(allocatePurchaseToHolding(params)).rejects.toThrow(
      'Inventory movement insert failed after balance update for order order-1'
    );
    expect(db.operation('holdings', 'select')).toBeUndefined();
  });

  it('propagates an existing-holding update failure before recording its movement', async () => {
    const db = allocationDatabase({
      'holdings.select.maybeSingle': {
        data: { id: 'holding-existing', quantity: '3', cost_basis: '300' },
        error: null,
      },
      'holdings.update.then': { error: { message: 'holding locked' } },
    });
    mocks.createServiceClient.mockReturnValue(db.client);

    await expect(allocatePurchaseToHolding(params)).rejects.toThrow(
      'failed to update holding for order order-1: holding locked'
    );
    expect(db.operation('holding_movements', 'insert')).toBeUndefined();
  });

  it('propagates a new-holding insert failure before recording its movement', async () => {
    const db = allocationDatabase({
      'holdings.insert.single': { data: null, error: { message: 'holding insert failed' } },
    });
    mocks.createServiceClient.mockReturnValue(db.client);

    await expect(allocatePurchaseToHolding(params)).rejects.toThrow(
      'failed to create holding for order order-1: holding insert failed'
    );
    expect(db.operation('holding_movements', 'insert')).toBeUndefined();
  });

  it('surfaces a reconciliation error when the final holding movement cannot be recorded', async () => {
    const db = allocationDatabase({
      'holding_movements.insert.single': { data: null, error: { message: 'ledger unavailable' } },
    });
    mocks.createServiceClient.mockReturnValue(db.client);

    await expect(allocatePurchaseToHolding(params)).rejects.toThrow(
      'Holding movement insert failed after balance update for order order-1'
    );
  });
});
