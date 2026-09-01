// vitest.config.mts — Vitest configuration for KorraStore automated testing suite.
// Configures test environment, alias mappings matching tsconfig path `@/*`, and test execution rules.
// Used by: `npm run test` (Vitest test runner).

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    passWithNoTests: true,
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
