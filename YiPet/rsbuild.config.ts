/**
 * Rsbuild root config — popup (Vue 3 + Element Plus) + background service worker.
 *
 * Uses @rsbuild/plugin-vue for SFC compilation, @rsbuild/plugin-sass for SCSS,
 * and unplugin-auto-import + unplugin-vue-components for Element Plus on-demand imports.
 */

import { defineConfig, loadEnv } from "@rsbuild/core";
import { pluginVue } from "@rsbuild/plugin-vue";
import { pluginVueJsx } from "@rsbuild/plugin-vue-jsx";
import { pluginSass } from "@rsbuild/plugin-sass";
import AutoImport from "unplugin-auto-import/rspack";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/rspack";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import dayjs from "dayjs";
import pkg from "./package.json";
import { yipetBuildPlugin } from "./build/yipet-build-plugin";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = __dirname;

const { dependencies, devDependencies, name, version } = pkg;
const __APP_INFO__ = {
  pkg: { dependencies, devDependencies, name, version },
  lastBuildTime: dayjs().format("YYYY-MM-DD HH:mm:ss")
};

// Bridge RSBUILD_ENV_* vars into client-side import.meta.env
const envResult = loadEnv({ cwd: rootDir, prefixes: ["RSBUILD_ENV_"] });
const define: Record<string, string> = {
  __APP_INFO__: JSON.stringify(__APP_INFO__),
  ...envResult.publicVars
};

export default defineConfig(({ mode }) => ({
  plugins: [
    pluginVue(),
    pluginVueJsx(),
    pluginSass({
      sassLoaderOptions: {
        additionalData: `@use "@/styles/var.scss" as *;`
      }
    }),
    yipetBuildPlugin(rootDir, mode)
  ],
  root: rootDir,
  resolve: {
    alias: { "@": resolve(rootDir, "src") }
  },
  source: {
    entry: {
      popup: "./src/popup/main.ts",
      background: "./src/background/index.ts"
    },
    define
  },
  html: {
    template: "./src/popup/popup.html",
    filename: "popup.html",
    templateParameters: {}
  },
  output: {
    cleanDistPath: false,
    distPath: {
      root: resolve(rootDir, "dist"),
      js: "assets",
      css: "assets",
      assets: "assets",
      html: "./"
    },
    filename: {
      js: "[name].js",
      css: "[name].css",
      html: "[name].html"
    },
    filenameHash: false
  },
  tools: {
    rspack: {
      plugins: [
        AutoImport({
          imports: ["vue", "pinia", { "element-plus": ["ElMessage", "ElMessageBox", "ElNotification", "ElLoading"] }],
          dts: resolve(rootDir, "src/typings/auto-imports.d.ts"),
          resolvers: [ElementPlusResolver()]
        }),
        Components({
          resolvers: [ElementPlusResolver()],
          dts: resolve(rootDir, "src/typings/components.d.ts")
        })
      ],
      output: {
        chunkFilename: "assets/[name].js"
      },
      optimization: {
        splitChunks: false,
        runtimeChunk: false
      }
    }
  }
}));