/**
 * Rsbuild config — replaces vite.config.ts.
 *
 * Mappings (see /Users/ruiyi/.claude/plans/noble-dreaming-bear.md):
 *   vite.base           → server.base (dev) + output.assetPrefix (prod CDN)
 *   vite.resolve.alias  → source.alias
 *   vite.define         → source.define
 *   vite.css.scss       → @rsbuild/plugin-sass sassLoaderOptions.additionalData
 *   vite.server         → server (same shape, proxy uses pathRewrite not rewrite)
 *   vite.build.rollupOptions.output.* → output.filename + tools.rspack.output.chunkFilename
 *   vite-plugin-html    → html.templateParameters
 *   vite-plugin-svg-icons → build/svg-sprite-plugin.ts
 */
import { defineConfig, loadEnv } from "@rsbuild/core";
import { pluginVue } from "@rsbuild/plugin-vue";
import { pluginVueJsx } from "@rsbuild/plugin-vue-jsx";
import { pluginBabel } from "@rsbuild/plugin-babel";
import { pluginSass } from "@rsbuild/plugin-sass";
import AutoImport from "unplugin-auto-import/rspack";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/rspack";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import pkg from "./package.json";
import dayjs from "dayjs";
import { createProxy, sourceRawMiddleware } from "./build/proxy";
import { svgSpritePlugin } from "./build/svg-sprite-plugin";
import { viewsGlobPlugin } from "./build/views-glob-plugin";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = __dirname;

const { dependencies, devDependencies, name, version } = pkg;
const __APP_INFO__ = {
  pkg: { dependencies, devDependencies, name, version },
  lastBuildTime: dayjs().format("YYYY-MM-DD HH:mm:ss")
};

// Rsbuild loads .env and .env.[mode] into process.env automatically, but only
// vars prefixed `PUBLIC_` are exposed to `import.meta.env` by default. The Yi
// family uses `RSBUILD_ENV_*` for both config-side and client-side vars, so
// we manually bridge them via `source.define` here.
const envResult = loadEnv({ cwd: root, prefixes: ["RSBUILD_ENV_"] });
const define: Record<string, string> = {
  __APP_INFO__: JSON.stringify(__APP_INFO__),
  ...envResult.publicVars
};

const PUBLIC_PATH = process.env.RSBUILD_ENV_PUBLIC_PATH || "/";
const PORT = Number(process.env.RSBUILD_ENV_PORT || 8848);
const OPEN = process.env.RSBUILD_ENV_OPEN === "true";
const PROXY = process.env.RSBUILD_ENV_PROXY ? JSON.parse(process.env.RSBUILD_ENV_PROXY) : [];
const GLOB_APP_TITLE = process.env.RSBUILD_ENV_GLOB_APP_TITLE || "YiVad";

export default defineConfig({
  plugins: [
    pluginBabel({
      include: /\.(?:jsx|tsx)$/,
    }),
    pluginVue(),
    pluginVueJsx(),
    pluginSass({
      sassLoaderOptions: {
        additionalData: `@use "@/styles/var.scss" as *;`
      }
    }),
    svgSpritePlugin(root),
    viewsGlobPlugin(root)
  ],
  tools: {
    rspack: {
      plugins: [
        AutoImport({
          imports: ["vue", "vue-router", "pinia", { "element-plus": ["ElMessage", "ElMessageBox", "ElNotification", "ElLoading"] }],
          dts: resolve(root, "src/typings/auto-imports.d.ts"),
          resolvers: [ElementPlusResolver()]
        }),
        Components({
          resolvers: [ElementPlusResolver()],
          dts: resolve(root, "src/typings/components.d.ts"),
          // No `include` override: the default filter matches .vue SFCs AND
          // their virtual template modules (.vue?vue&type=template), which is
          // where el-* tags actually live. Scoping to src/ only broke virtual
          // module matching, so ElementPlusResolver never ran and EP
          // components (el-container, el-button, ...) leaked to runtime as
          // unresolved. JSON files don't match the default filter anyway.
        })
      ],
      output: {
        chunkFilename: "assets/js/[name]-[hash].js",
        assetModuleFilename: "assets/[ext]/[name]-[hash].[ext]"
      }
    }
  },
  root,
  source: {
    entry: { index: "./src/main.ts" },
    define
  },
  resolve: {
    alias: {
      "@": resolve(root, "src"),
      "vue-i18n": "vue-i18n/dist/vue-i18n.cjs.js"
    }
  },
  html: {
    template: "./index.html",
    templateParameters: { title: GLOB_APP_TITLE }
  },
  output: {
    distPath: {
      root: "dist",
      js: "assets/js",
      css: "assets/css",
      assets: "assets",
      font: "assets/font",
      image: "assets/image",
      media: "assets/media",
      svg: "assets/svg"
    },
    assetPrefix: PUBLIC_PATH,
    minify: true,
    sourceMap: false,
    filename: {
      js: "[name]-[hash].js",
      css: "[name]-[hash].css"
    }
  },
  server: {
    host: "0.0.0.0",
    port: PORT,
    open: OPEN,
    base: PUBLIC_PATH,
    cors: true,
    proxy: createProxy(PROXY)
  },
  dev: {
    // Vite-compatible `?raw` source fetch — needed because Rsbuild doesn't
    // support `?raw` out of the box, and story/scenario cards reference
    // YiVad's own source paths that can only be read via the dev server.
    setupMiddlewares: [
      (middlewares: any) => {
        middlewares.unshift(sourceRawMiddleware(root));
      }
    ]
  }
});
