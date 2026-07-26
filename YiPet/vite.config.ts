import { defineConfig } from 'vite';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { copyFileSync, writeFileSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = __dirname;

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';

  return {
    root: rootDir,
    publicDir: resolve(rootDir, 'public'),
    build: {
      outDir: resolve(rootDir, 'dist'),
      emptyOutDir: true,
      minify: !isDev,
      sourcemap: isDev ? 'inline' : false,
      rollupOptions: {
        input: {
          background: resolve(rootDir, 'src/background/index.ts'),
          content:   resolve(rootDir, 'src/content/index.ts'),
          bootstrap: resolve(rootDir, 'src/content/bootstrap.ts'),
          popup:     resolve(rootDir, 'src/popup/popup.html'),
        },
        output: {
          entryFileNames: 'assets/[name].js',
          chunkFileNames: 'assets/[name].js',
          assetFileNames: 'assets/[name].[ext]',
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
            JSON.stringify({
              builtAt: Date.now(),
              mode,
              version: '1.2.0',
            }, null, 2),
          );

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
