/**
 * Rsbuild config for chat bundle — outputs a single IIFE file to dist/assets/chat.js.
 *
 * chat.js is injected into the MAIN world as a classic <script> tag, so it
 * cannot rely on ESM imports (the page cannot resolve `./chunks/antd.js`).
 * `output.library.type: 'var'` (via tools.rspack) + `chunkSplit: 'all-in-one'`
 * + `optimization.splitChunks: false` produces a single self-contained file
 * wrapped as `var YiPetChatBundle = (function(){ ... })()`.
 *
 * CSS is inlined into the JS bundle via `output.injectStyles` so the IIFE
 * is fully self-contained — chat.css (a separate concatenated file from
 * co-located component CSS) is loaded via <link> at runtime by index.tsx.
 *
 * Replaces vite.chat.config.ts.
 */
import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rsbuild/core';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [pluginReact({ fastRefresh: false })],
  server: {
    publicDir: false,
  },
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
  source: {
    entry: { index: './src/chat/index.tsx' },
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env': JSON.stringify({ NODE_ENV: 'production' }),
    },
  },
  output: {
    filename: { js: 'chat.js' },
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
          name: 'YiPetChatBundle',
        },
      },
      optimization: {
        splitChunks: false,
        runtimeChunk: false,
      },
    },
  },
});
