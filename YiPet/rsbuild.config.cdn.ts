/**
 * Rsbuild config for CDN utility builds.
 *
 * Reads TypeScript sources from public/cdn/utils/ and outputs
 * a single IIFE bundle at public/cdn/utils/index.js that attaches
 * UrlBuilder, LoggerUtils, and YiPetApi to window globals.
 *
 * The root rsbuild.config.ts copies public/ → dist/ so the bundle
 * ends up at dist/cdn/utils/index.js at the end of the build.
 *
 * Replaces vite.cdn.config.ts.
 */
import { defineConfig } from '@rsbuild/core';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  source: {
    entry: { index: './public/cdn/utils/index.ts' },
  },
  server: {
    publicDir: false,
  },
  output: {
    filename: { js: 'index.js' },
    distPath: {
      root: resolve(__dirname, 'public/cdn/utils'),
      js: './',
    },
    cleanDistPath: false,
    minify: false,
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
          name: 'YiPetUtils',
        },
      },
      optimization: {
        splitChunks: false,
        runtimeChunk: false,
      },
    },
  },
});
