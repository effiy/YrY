/**
 * Vite config for CDN utility builds.
 *
 * Reads TypeScript sources from public/cdn/utils/ and outputs
 * a single IIFE bundle at public/cdn/utils/index.js that attaches
 * UrlBuilder, LoggerUtils, and YiPetApi to window globals.
 */
import { defineConfig } from 'vite';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  publicDir: false,
  build: {
    outDir: resolve(__dirname, 'public/cdn/utils'),
    emptyOutDir: false,
    minify: false,
    lib: {
      entry: resolve(__dirname, 'public/cdn/utils/index.ts'),
      formats: ['iife'],
      name: 'YiPetUtils',
      fileName: () => 'index.js',
    },
  },
});
