import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['tests/**/*.test.mjs'],
    exclude: ['node_modules', 'dist'],
    globals: false,
    isolate: true,
    testTimeout: 10_000,
    setupFiles: ['tests/setup.mjs'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: 'coverage',
      // 只统计 shared/(测试实际覆盖到的)
      include: ['shared/html-sanitize.js', 'shared/vue-ce-loader.js'],
      exclude: ['tests/**', 'node_modules/**', 'scripts/**', 'yry-*/**']
    }
  }
});
