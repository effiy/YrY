/**
 * Rsbuild config for chat bundle — outputs a single IIFE file to dist/assets/chat.js.
 *
 * chat.js is injected into the MAIN world as a classic <script> tag, so it
 * cannot rely on ESM imports. `output.library.type: 'var'` + `chunkSplit:
 * 'all-in-one'` + `optimization.splitChunks: false` produces a single
 * self-contained file.
 *
 * Vue 3 SFC scoped SCSS is inlined into the JS bundle via `output.injectStyles`.
 */

import { pluginVue } from '@rsbuild/plugin-vue';
import { pluginVueJsx } from '@rsbuild/plugin-vue-jsx';
import { pluginSass } from '@rsbuild/plugin-sass';
import { defineConfig } from '@rsbuild/core';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import AutoImport from 'unplugin-auto-import/rspack';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/rspack';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    pluginVue(),
    pluginVueJsx(),
    pluginSass({
      sassLoaderOptions: {
        additionalData: `@use "@/styles/var.scss" as *;`,
      },
    }),
  ],
  server: {
    publicDir: false,
  },
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
  source: {
    entry: { index: './src/chat/index.ts' },
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
      plugins: [
        AutoImport({
          imports: ['vue', 'pinia', { 'element-plus': ['ElMessage', 'ElMessageBox', 'ElNotification', 'ElLoading'] }],
          resolvers: [ElementPlusResolver()],
        }),
        Components({
          resolvers: [ElementPlusResolver()],
        }),
      ],
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