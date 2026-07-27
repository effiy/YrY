import { copyFileSync, writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = __dirname;

// ── Chat CSS build (inlined from scripts/build-chat-css.mjs) ──────────

function buildChatCSS() {
  const stylesDir = resolve(rootDir, 'src/chat/styles');
  const componentsDir = resolve(rootDir, 'src/chat/components');
  const outDir = resolve(rootDir, 'dist', 'cdn', 'styles');
  const outPath = resolve(outDir, 'chat.css');

  const sharedFirst = ['tokens.css', 'layout.css'];
  const sharedLast = ['chat-markdown.css', 'animations.css', 'scrollbar.css'];
  const componentOrder = [
    'ChatHeader/ChatHeader.css',
    'ChatMessages/ChatMessages.css',
    'MessageBubble/MessageBubble.css',
    'WelcomeCard/WelcomeCard.css',
    'ChatInput/ChatInput.css',
    'ChatSidebar/ChatSidebar.css',
    'SearchBar/SearchBar.css',
    'SessionListItem/SessionListItem.css',
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

  for (const name of sharedFirst) add(name, resolve(stylesDir, name));
  for (const name of componentOrder) add(name, resolve(componentsDir, name));
  for (const name of sharedLast) add(name, resolve(stylesDir, name));

  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  writeFileSync(outPath, parts.join('\n\n') + '\n', 'utf-8');

  if (missing.length > 0) {
    console.log(`  ⚠️  chat.css: ${missing.length} file(s) skipped (${missing.join(', ')})`);
  }
}

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';

  return {
    root: rootDir,
    publicDir: resolve(rootDir, 'public'),
    resolve: {
      alias: {
        '@': resolve(rootDir, 'src'),
      },
    },
    build: {
      outDir: resolve(rootDir, 'dist'),
      emptyOutDir: true,
      minify: !isDev,
      sourcemap: isDev ? 'inline' : false,
      rollupOptions: {
        input: {
          background: resolve(rootDir, 'src/background/index.ts'),
          bootstrap: resolve(rootDir, 'src/content/bootstrap.ts'),
          popup: resolve(rootDir, 'src/popup/popup.html'),
          chat: resolve(rootDir, 'src/chat/index.ts'),
        },
        output: {
          entryFileNames: 'assets/[name].js',
          chunkFileNames: 'assets/[name].js',
          assetFileNames: 'assets/[name].[ext]',
          banner: '(function(){',
          footer: '})();',
        },
      },
    },
    plugins: [
      {
        name: 'yipet-build',
        closeBundle() {
          // Copy manifest.json to dist/
          copyFileSync(
            resolve(rootDir, 'manifest.json'),
            resolve(rootDir, 'dist', 'manifest.json'),
          );

          // Write build metadata for extension auto-reload detection
          writeFileSync(
            resolve(rootDir, 'dist', 'build-meta.json'),
            JSON.stringify(
              {
                builtAt: Date.now(),
                mode,
                version: '1.2.0',
              },
              null,
              2,
            ),
          );

          // Build chat CSS from component sources
          buildChatCSS();

          if (isDev) {
            console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('  🐾  YiPet dev build ready');
            console.log('  📁  dist/  →  Load as unpacked extension');
            console.log('  🔍  Source maps: enabled (inline)');
            console.log('  🕐 ', new Date().toLocaleTimeString());
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
          }
        },
      },
    ],
  };
});
