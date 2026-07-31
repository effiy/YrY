/**
 * Rsbuild root config — popup (React 18 + Ant Design) + background service worker.
 *
 * Replaces vite.config.ts. Preserves the multi-entry pattern (popup HTML +
 * background JS) and the custom build steps (manifest copy, build-meta.json,
 * chat.css concatenation) via a Rsbuild plugin hooking `onAfterBuild`.
 */

import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type RsbuildPluginAPI } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = __dirname;

// ── Chat CSS build ───────────────────────────────────────────────────
// Each component's CSS lives co-located in its own component directory.
// At build time we concatenate them into a single dist/cdn/styles/chat.css
// that is injected at runtime via <link> (chat runs in MAIN world and
// cannot import CSS through the bundler).

function buildChatCSS() {
  const componentsDir = resolve(rootDir, 'src/chat/components');
  const outDir = resolve(rootDir, 'dist', 'cdn', 'styles');
  const outPath = resolve(outDir, 'chat.css');

  const files = [
    'ChatWindow/ChatWindow.css',
    'ChatInput/ChatInput.css',
    'ChatMessages/ChatMessages.css',
    'ChatSidebar/ChatSidebar.css',
  ];

  const parts: string[] = [];
  const missing: string[] = [];

  function add(label: string, filePath: string) {
    try {
      parts.push(readFileSync(filePath, 'utf-8').trimEnd());
    } catch {
      missing.push(label);
    }
  }

  for (const name of files) add(name, resolve(componentsDir, name));

  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  writeFileSync(outPath, parts.join('\n\n') + '\n', 'utf-8');

  if (missing.length > 0) {
    console.log(`  ⚠️  chat.css: ${missing.length} file(s) skipped (${missing.join(', ')})`);
  }
}

// ── YiPet build plugin ──────────────────────────────────────────────
// Replicates vite.config.ts's `yipet-build` closeBundle plugin: copy
// manifest.json, write build-meta.json, concatenate chat.css.

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
        buildChatCSS();
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
  plugins: [pluginReact({ fastRefresh: false }), yipetBuildPlugin(mode)],
  root: rootDir,
  resolve: {
    alias: { '@': resolve(rootDir, 'src') },
  },
  source: {
    entry: {
      popup: './src/popup/index.tsx',
      background: './src/background/index.ts',
    },
  },
  html: {
    template: './src/popup/popup.html',
    filename: 'popup.html',
    // Chrome substitutes __MSG_*__ at runtime — disable Rsbuild's EJS substitution
    // so it doesn't choke on the i18n placeholders.
    templateParameters: {},
  },
  output: {
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
      output: {
        chunkFilename: 'assets/[name].js',
      },
      optimization: {
        // MV3 background service worker is loaded as classic script (no `type: module`
        // in manifest) — must be a single file. Disable all chunk splitting so each
        // entry (popup, background) produces exactly one self-contained JS file.
        splitChunks: false,
        runtimeChunk: false,
      },
    },
  },
}));
