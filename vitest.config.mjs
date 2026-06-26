import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'skills/rui/tests/infrastructure/**/*.test.mjs',
      'lib/tests/**/*.test.mjs',
      'skills/*/tests/**/*.test.mjs',
    ],
    // Legacy test files have been migrated to vitest-adapter.mjs.
    // All tests now run under vitest with vitest-native primitives.
    // The legacy test-harness.mjs and run.mjs are retained for standalone Node.js execution.
    exclude: ['node_modules', '.claude/**', 'cdn/**'],
    globals: false,
    isolate: true,
    testTimeout: 60_000,
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      reporter: ['text', 'html', 'json'],
      include: [
        'lib/**/*.mjs',
        'skills/**/*.mjs',
      ],
      exclude: [
        'lib/tests/**',
        'skills/*/tests/**',
        'lib/test-harness.mjs',
        'lib/vitest-adapter.mjs',
        'node_modules',
        '.claude',
        'cdn',
      ],
      // Coverage goals (not enforced as thresholds yet):
      // lib/: 30% → 50% → 70%
      // Pure utility functions (tty, help-layout, constants, test-helpers, scoring): 85%+
      // 起步阈值（基于 2026-06-25 实测：All files 8.97% lines, lib/engine 24%）— 防止未来退化
      // 全量实测后逐步提升：lines 8% → 15% → 30%
      thresholds: {
        lines: 8,
        statements: 8,
        functions: 10,
        branches: 10,
      },
    },
  },
});
