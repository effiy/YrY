/**
 * Rsbuild config for bootstrap bundle — outputs a single IIFE file to
 * dist/assets/bootstrap.js.
 *
 * bootstrap.js is injected into the MAIN world as a classic <script> tag
 * (see src/content/ipc/relay.ts → injectIntoMainWorld), so it cannot
 * rely on ESM imports — the page cannot resolve `./defaults.js` and
 * Chrome throws "Cannot use import statement outside a module".
 *
 * Replaces vite.bootstrap.config.ts.
 */
import { defineConfig } from '@rsbuild/core';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  server: {
    publicDir: false,
  },
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
  source: {
    entry: { index: './src/content/bootstrap.ts' },
  },
  output: {
    filename: { js: 'bootstrap.js' },
    distPath: {
      root: resolve(__dirname, 'dist', 'assets'),
      js: './',
    },
    cleanDistPath: false,
    injectStyles: true,
  },
  performance: {
    chunkSplit: { strategy: 'all-in-one' },
  },
  tools: {
    htmlPlugin: false,
    rspack: {
      output: {
        library: {
          type: 'var',
          name: 'YiPetBootstrap',
        },
      },
      optimization: {
        splitChunks: false,
        runtimeChunk: false,
      },
    },
  },
});
