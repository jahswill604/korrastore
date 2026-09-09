// __tests__/test-utils/mock-supabase.ts — Minimal fluent Supabase test double.
// It records each terminal query while allowing tests to configure table/action results.

import { vi } from 'vitest';

export interface MockQueryOperation {
  table: string;
  action: 'select' | 'insert' | 'update';
  payload?: unknown;
  columns?: string;
  filters: Array<{ column: string; value: unknown }>;
  terminal: 'single' | 'maybeSingle' | 'then';
}

interface MockQueryResult {
  data?: unknown;
  error?: unknown;
}

export type MockSupabaseResults = Record<string, MockQueryResult>;

export function createMockSupabase(results: MockSupabaseResults = {}) {
  const operations: MockQueryOperation[] = [];

  function resultFor(
    table: string,
    action: MockQueryOperation['action'],
    terminal: MockQueryOperation['terminal']
  ): MockQueryResult {
    return results[`${table}.${action}.${terminal}`] ?? { data: null, error: null };
  }

  const from = vi.fn((table: string) => {
    let action: MockQueryOperation['action'] = 'select';
    let payload: unknown;
    let columns: string | undefined;
    const filters: MockQueryOperation['filters'] = [];

    const finish = (terminal: MockQueryOperation['terminal']) => {
      operations.push({ table, action, payload, columns, filters: [...filters], terminal });
      return Promise.resolve(resultFor(table, action, terminal));
    };

    const query = {
      select(selectedColumns: string) {
        columns = selectedColumns;
        return query;
      },
      insert(insertPayload: unknown) {
        action = 'insert';
        payload = insertPayload;
        return query;
      },
      update(updatePayload: unknown) {
        action = 'update';
        payload = updatePayload;
        return query;
      },
      eq(column: string, value: unknown) {
        filters.push({ column, value });
        return query;
      },
      single() {
        return finish('single');
      },
      maybeSingle() {
        return finish('maybeSingle');
      },
      then<TResult1 = MockQueryResult, TResult2 = never>(
        onFulfilled?: ((value: MockQueryResult) => TResult1 | PromiseLike<TResult1>) | null,
        onRejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
      ) {
        return finish('then').then(onFulfilled, onRejected);
      },
    };

    return query;
  });

  return {
    client: { from },
    from,
    operations,
    operation(table: string, action: MockQueryOperation['action']) {
      return operations.find((entry) => entry.table === table && entry.action === action);
    },
  };
}
