import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

// NOTE: No `@vitejs/plugin-react` here. The current test suite is pure `.ts`
// (no `.tsx`/JSX), and `@vitejs/plugin-react@6` requires a Vite version that
// exports `vite/internal` (Vite 6+), which conflicts with the Vite 5.4 that
// Vitest 2 pins. Importing it here made `npm test` fail at config-load time.
// Re-add a Vite-5-compatible plugin only if a JSX test is ever introduced.
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
