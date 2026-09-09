// Direct unit tests for allocatePurchaseToHolding(). Supabase is represented by
// fluent query doubles so the tests verify ledger writes and failure ordering.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ createServiceClient: vi.fn() }));

vi.mock('server-only', () => ({}));
vi.mock('@/lib/supabase/service', () => ({ createServiceClient: mocks.createServiceClient }));

import { allocatePurchaseToHolding } from '@/lib/domain/ledger/holdings-ledger';

type QueryResult = { data?: unknown; error?: unknown };

function query(result: QueryResult) {
  const builder: Record<string, ReturnType<typeof vi.fn>> & PromiseLike<QueryResult> = {
    eq: vi.fn(), maybeSingle: vi.fn(), select: vi.fn(), single: vi.fn(), then: vi.fn(),
  };
  builder.eq.mockReturnValue(builder);
  builder.select.mockReturnValue(builder);
  builder.maybeSingle.mockResolvedValue(result);
  builder.single.mockResolvedValue(result);
  builder.then.mockImplementation((resolve, reject) => Promise.resolve(result).then(resolve, reject));
  return builder;
}

interface LedgerDbOptions {
  existingHolding?: Record<string, unknown> | null;
  holdingInsertError?: Record<string, unknown> | null;
  holdingMovementError?: Record<string, unknown> | null;
  holdingUpdateError?: Record<string, unknown> | null;
  inventory?: Record<string, unknown> | null;
  inventoryError?: Record<string, unknown> | null;
  inventoryMovementError?: Record<string, unknown> | null;
  inventoryUpdateError?: Record<string, unknown> | null;
}

function createLedgerDb(options: LedgerDbOptions = {}) {
  const inventory = options.inventory === undefined
    ? { id: 'inventory-1', quantity: '10', allocated_quantity: '0' }
    : options.inventory;
  const existingHolding = options.existingHolding === undefined ? null : options.existingHolding;
  const builders = {
    holdingInsert: query({
      data: options.holdingInsertError ? null : { id: 'holding-new' },
      error: options.holdingInsertError ?? null,
    }),
    holdingMovementInsert: query({
      data: options.holdingMovementError ? null : { id: 'holding-movement-1' },
      error: options.holdingMovementError ?? null,
    }),
    holdingSelect: query({ data: existingHolding, error: null }),
    holdingUpdate: query({ error: options.holdingUpdateError ?? null }),
    inventoryMovementInsert: query({
      data: options.inventoryMovementError ? null : { id: 'inventory-movement-1' },
      error: options.inventoryMovementError ?? null,
    }),
    inventorySelect: query({ data: inventory, error: options.inventoryError ?? null }),
    inventoryUpdate: query({ error: options.inventoryUpdateError ?? null }),
  };
  const tables = {
    holding_movements: { insert: vi.fn(() => builders.holdingMovementInsert) },
    holdings: {
      insert: vi.fn(() => builders.holdingInsert),
      select: vi.fn(() => builders.holdingSelect),
      update: vi.fn(() => builders.holdingUpdate),
    },
    inventory: {
      select: vi.fn(() => builders.inventorySelect),
      update: vi.fn(() => builders.inventoryUpdate),
    },
    inventory_movements: { insert: vi.fn(() => builders.inventoryMovementInsert) },
  };
  const db = { from: vi.fn((table: keyof typeof tables) => tables[table]) };
  return { builders, db, tables };
}

const params = {
  orderId: 'order-1', userId: 'user-1', commodityId: 'commodity-1', gradeId: 'grade-a',
  warehouseId: 'warehouse-1', quantity: 4, unitPrice: 125,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => vi.restoreAllMocks());

describe('allocatePurchaseToHolding — validation and inventory failures', () => {
  it.each([0, -1])('rejects a non-positive quantity (%s) before creating a database client', async quantity => {
    await expect(allocatePurchaseToHolding({ ...params, quantity })).rejects.toThrow('quantity must be positive');
    expect(mocks.createServiceClient).not.toHaveBeenCalled();
  });

  it('reports the requested inventory dimensions when no matching row exists', async () => {
    const context = createLedgerDb({ inventory: null, inventoryError: { message: 'not found' } });
    mocks.createServiceClient.mockReturnValue(context.db);

    await expect(allocatePurchaseToHolding(params)).rejects.toThrow(
      'no inventory row for warehouse=warehouse-1 commodity=commodity-1 grade=grade-a. not found'
    );
    expect(context.tables.inventory.update).not.toHaveBeenCalled();
  });

  it('rejects insufficient stock without changing inventory or writing a movement', async () => {
    const context = createLedgerDb({ inventory: { id: 'inventory-1', quantity: '3' } });
    mocks.createServiceClient.mockReturnValue(context.db);

    await expect(allocatePurchaseToHolding(params)).rejects.toThrow('insufficient stock (have 3, need 4)');
    expect(context.tables.inventory.update).not.toHaveBeenCalled();
    expect(context.tables.inventory_movements.insert).not.toHaveBeenCalled();
  });

  it('stops before ledger writes when the inventory balance update fails', async () => {
    const context = createLedgerDb({ inventoryUpdateError: { message: 'update denied' } });
    mocks.createServiceClient.mockReturnValue(context.db);

    await expect(allocatePurchaseToHolding(params)).rejects.toThrow(
      'failed to decrement inventory for order order-1: update denied'
    );
    expect(context.tables.inventory_movements.insert).not.toHaveBeenCalled();
    expect(context.tables.holdings.insert).not.toHaveBeenCalled();
  });

  it('raises a reconciliation error when inventory changed but its movement insert fails', async () => {
    const context = createLedgerDb({ inventoryMovementError: { message: 'ledger unavailable' } });
    mocks.createServiceClient.mockReturnValue(context.db);

    await expect(allocatePurchaseToHolding(params)).rejects.toThrow(
      'Inventory movement insert failed after balance update for order order-1'
    );
    expect(context.tables.holdings.insert).not.toHaveBeenCalled();
  });
});

describe('allocatePurchaseToHolding — ownership and immutable movements', () => {
  it('creates a new holding and both balancing movement rows', async () => {
    const context = createLedgerDb();
    mocks.createServiceClient.mockReturnValue(context.db);

    const result = await allocatePurchaseToHolding(params);

    expect(context.tables.inventory.update).toHaveBeenCalledWith(expect.objectContaining({ quantity: 6 }));
    expect(context.tables.inventory_movements.insert).toHaveBeenCalledWith(expect.objectContaining({
      movement_type: 'SALE', quantity: -4, balance_after: 6, reference_id: 'order-1',
    }));
    expect(context.tables.holdings.insert).toHaveBeenCalledWith({
      user_id: 'user-1', commodity_id: 'commodity-1', grade_id: 'grade-a', warehouse_id: 'warehouse-1',
      quantity: 4, cost_basis: 500, unit_purchase_price: 125,
    });
    expect(context.tables.holding_movements.insert).toHaveBeenCalledWith(expect.objectContaining({
      holding_id: 'holding-new', movement_type: 'purchase', quantity: 4, balance_after: 4,
      reference_id: 'order-1',
    }));
    expect(result).toEqual({
      holdingId: 'holding-new', inventoryMovementId: 'inventory-movement-1',
      holdingMovementId: 'holding-movement-1', newHoldingQuantity: 4,
    });
  });

  it('allows a purchase that exactly exhausts inventory and records a zero balance', async () => {
    const context = createLedgerDb({ inventory: { id: 'inventory-1', quantity: 4 } });
    mocks.createServiceClient.mockReturnValue(context.db);

    await allocatePurchaseToHolding(params);

    expect(context.tables.inventory.update).toHaveBeenCalledWith(expect.objectContaining({ quantity: 0 }));
    expect(context.tables.inventory_movements.insert).toHaveBeenCalledWith(expect.objectContaining({ balance_after: 0 }));
  });

  it('updates an existing holding using weighted-average cost basis', async () => {
    const context = createLedgerDb({
      existingHolding: { id: 'holding-existing', quantity: '6', cost_basis: '600' },
    });
    mocks.createServiceClient.mockReturnValue(context.db);

    const result = await allocatePurchaseToHolding(params);

    expect(context.tables.holdings.insert).not.toHaveBeenCalled();
    expect(context.tables.holdings.update).toHaveBeenCalledWith(expect.objectContaining({
      quantity: 10, cost_basis: 1100, unit_purchase_price: 110,
    }));
    expect(context.builders.holdingUpdate.eq).toHaveBeenCalledWith('id', 'holding-existing');
    expect(context.tables.holding_movements.insert).toHaveBeenCalledWith(expect.objectContaining({
      holding_id: 'holding-existing', balance_after: 10,
    }));
    expect(result.newHoldingQuantity).toBe(10);
  });

  it('does not write a holding movement when creating the holding fails', async () => {
    const context = createLedgerDb({ holdingInsertError: { message: 'insert denied' } });
    mocks.createServiceClient.mockReturnValue(context.db);

    await expect(allocatePurchaseToHolding(params)).rejects.toThrow(
      'failed to create holding for order order-1: insert denied'
    );
    expect(context.tables.holding_movements.insert).not.toHaveBeenCalled();
  });

  it('surfaces an existing-holding update failure before writing its movement', async () => {
    const context = createLedgerDb({
      existingHolding: { id: 'holding-existing', quantity: 6, cost_basis: 600 },
      holdingUpdateError: { message: 'conflict' },
    });
    mocks.createServiceClient.mockReturnValue(context.db);

    await expect(allocatePurchaseToHolding(params)).rejects.toThrow(
      'failed to update holding for order order-1: conflict'
    );
    expect(context.tables.holding_movements.insert).not.toHaveBeenCalled();
  });

  it('raises a reconciliation error when ownership changed but its movement insert fails', async () => {
    const context = createLedgerDb({ holdingMovementError: { message: 'ledger unavailable' } });
    mocks.createServiceClient.mockReturnValue(context.db);

    await expect(allocatePurchaseToHolding(params)).rejects.toThrow(
      'Holding movement insert failed after balance update for order order-1'
    );
  });
});
