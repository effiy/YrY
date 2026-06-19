import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/infrastructure/**/*.test.mjs'],
    // Legacy test files (skills/ integration/) use the custom
    // test-harness.mjs API and are managed by `node tests/run.mjs`.
    // Agents and rules are now integrated into skills/.
    // Vitest focuses on engineering-grade tests using vitest-native primitives.
    exclude: ['node_modules', '.claude/**', 'cdn/**'],
    globals: false,
    isolate: true,
    testTimeout: 30_000,
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      reportsDirectory: 'tests/coverage',
      reporter: ['text', 'html', 'json'],
      include: [
        'skills/**/*.mjs',
        'skills/**/*.md',
        'lib/**/*.mjs',
      ],
    },
  },
});
