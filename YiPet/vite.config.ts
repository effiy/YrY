import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { copyFileSync, writeFileSync } from 'node:fs';

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';

  return {
    root: '.',
    publicDir: 'public',
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      minify: !isDev,
      sourcemap: isDev ? 'inline' : false,
      rollupOptions: {
        input: {
          content:   resolve(__dirname, 'src/content/index.ts'),
          bootstrap: resolve(__dirname, 'src/content/bootstrap.ts'),
          popup:     resolve(__dirname, 'src/popup/popup.html'),
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
          // 1. Copy manifest.json to dist/
          copyFileSync(
            resolve(__dirname, 'manifest.json'),
            resolve(__dirname, 'dist/manifest.json'),
          );

          // 2. Write build metadata for extension auto-reload detection
          writeFileSync(
            resolve(__dirname, 'dist/build-meta.json'),
            JSON.stringify({
              builtAt: Date.now(),
              mode,
              version: '1.2.0',
            }, null, 2),
          );

          // 3. Dev-mode summary
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
