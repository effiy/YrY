/**
 * Rsbuild root config — popup (Vue 3 + Element Plus) + background service worker.
 *
 * Replaces the React 18 + Ant Design config. Uses @rsbuild/plugin-vue for SFC
 * compilation, @rsbuild/plugin-sass for SCSS, and unplugin-auto-import +
 * unplugin-vue-components for Element Plus on-demand imports.
 */

import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type RsbuildPluginAPI } from '@rsbuild/core';
import { pluginVue } from '@rsbuild/plugin-vue';
import { pluginVueJsx } from '@rsbuild/plugin-vue-jsx';
import { pluginSass } from '@rsbuild/plugin-sass';
import AutoImport from 'unplugin-auto-import/rspack';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/rspack';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = __dirname;

// ── YiPet build plugin ──────────────────────────────────────────────────
// Copies manifest.json, writes build-meta.json, removes auto-generated
// background.html (MV3 service worker is JS-only).

function yipetBuildPlugin(mode: string) {
  return {
    name: 'yipet-build',
    setup(api: RsbuildPluginAPI) {
      api.onAfterBuild(() => {
        copyFileSync(resolve(rootDir, 'manifest.json'), resolve(rootDir, 'dist', 'manifest.json'));
        writeFileSync(
          resolve(rootDir, 'dist', 'build-meta.json'),
          JSON.stringify({ builtAt: Date.now(), mode, version: '1.2.0' }, null, 2),
        );
        // Delete background.html — Rsbuild auto-generates an HTML for every
        // entry, but the background service worker is JS-only in MV3.
        const bgHtml = resolve(rootDir, 'dist', 'background.html');
        if (existsSync(bgHtml)) rmSync(bgHtml, { force: true });
        if (mode === 'development') {
          console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('  🐾  YiPet dev build ready (rsbuild)');
          console.log('  📁  dist/  →  Load as unpacked extension');
          console.log('  🕐 ', new Date().toLocaleTimeString());
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [
    pluginVue(),
    pluginVueJsx(),
    pluginSass({
      sassLoaderOptions: {
        additionalData: `@use "@/styles/var.scss" as *;`,
      },
    }),
    yipetBuildPlugin(mode),
  ],
  root: rootDir,
  resolve: {
    alias: { '@': resolve(rootDir, 'src') },
  },
  source: {
    entry: {
      popup: './src/popup/main.ts',
      background: './src/background/index.ts',
    },
  },
  html: {
    template: './src/popup/popup.html',
    filename: 'popup.html',
    // Chrome substitutes __MSG_*__ at runtime — disable Rsbuild's EJS substitution
    templateParameters: {},
  },
  output: {
    cleanDistPath: false,
    distPath: {
      root: resolve(rootDir, 'dist'),
      js: 'assets',
      css: 'assets',
      assets: 'assets',
      html: './',
    },
    filename: {
      js: '[name].js',
      css: '[name].css',
      html: '[name].html',
    },
    // Disable filename hashing — MV3 manifest references fixed filenames.
    filenameHash: false,
  },
  tools: {
    rspack: {
      plugins: [
        AutoImport({
          imports: ['vue', 'pinia', { 'element-plus': ['ElMessage', 'ElMessageBox', 'ElNotification', 'ElLoading'] }],
          dts: resolve(rootDir, 'src/typings/auto-imports.d.ts'),
          resolvers: [ElementPlusResolver()],
        }),
        Components({
          resolvers: [ElementPlusResolver()],
          dts: resolve(rootDir, 'src/typings/components.d.ts'),
        }),
      ],
      output: {
        chunkFilename: 'assets/[name].js',
      },
      optimization: {
        // MV3 background service worker is loaded as classic script — must be a
        // single file. Disable all chunk splitting so each entry produces exactly
        // one self-contained JS file.
        splitChunks: false,
        runtimeChunk: false,
      },
    },
  },
}));