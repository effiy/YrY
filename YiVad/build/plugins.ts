import { resolve } from "path";
import { PluginOption } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { createHtmlPlugin } from "vite-plugin-html";
import { visualizer } from "rollup-plugin-visualizer";
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import eslintPlugin from "vite-plugin-eslint";
import viteCompression from "vite-plugin-compression";
import vueSetupExtend from "unplugin-vue-setup-extend-plus/vite";
import NextDevTools from "vite-plugin-vue-devtools";
import { codeInspectorPlugin } from "code-inspector-plugin";

/**
 * Create vite plugins
 * @param viteEnv
 */
export const createVitePlugins = (viteEnv: ViteEnv): (PluginOption | PluginOption[])[] => {
  const { VITE_GLOB_APP_TITLE, VITE_REPORT, VITE_DEVTOOLS, VITE_PWA, VITE_CODEINSPECTOR } = viteEnv;
  return [
    vue(),
    // Vue can use jsx/tsx syntax
    vueJsx(),
    // devTools
    VITE_DEVTOOLS && NextDevTools({ launchEditor: "code" }),
    // Display esLint errors in the browser interface
    eslintPlugin(),
    // name can be written on the script tag
    vueSetupExtend({}),
    // Create build compression configuration
    createCompression(viteEnv),
    // Inject variables into the html file
    createHtmlPlugin({
      minify: true,
      inject: {
        data: { title: VITE_GLOB_APP_TITLE }
      }
    }),
    // Use svg icons
    createSvgIconsPlugin({
      iconDirs: [resolve(process.cwd(), "src/assets/icons")],
      symbolId: "icon-[dir]-[name]"
    }),
    // vitePWA
    VITE_PWA && createVitePwa(viteEnv),
    // Generate bundle preview to analyze and optimize dependency sizes
    VITE_REPORT && (visualizer({ filename: "stats.html", gzipSize: true, brotliSize: true }) as PluginOption),
    // Code inspector: automatically locates the DOM element's source code in IDE. See: https://inspector.fe-dev.cn/guide/start.html
    VITE_CODEINSPECTOR &&
      codeInspectorPlugin({
        bundler: "vite"
      })
  ];
};

/**
 * @description Generate different compression rules based on compress configuration
 * @param viteEnv
 */
const createCompression = (viteEnv: ViteEnv): PluginOption | PluginOption[] => {
  const { VITE_BUILD_COMPRESS = "none", VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE } = viteEnv;
  const compressList = VITE_BUILD_COMPRESS.split(",");
  const plugins: PluginOption[] = [];
  if (compressList.includes("gzip")) {
    plugins.push(
      viteCompression({
        ext: ".gz",
        algorithm: "gzip",
        deleteOriginFile: VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE
      })
    );
  }
  if (compressList.includes("brotli")) {
    plugins.push(
      viteCompression({
        ext: ".br",
        algorithm: "brotliCompress",
        deleteOriginFile: VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE
      })
    );
  }
  return plugins;
};

/**
 * @description VitePwa
 * @param viteEnv
 */
const createVitePwa = (viteEnv: ViteEnv): PluginOption | PluginOption[] => {
  const { VITE_GLOB_APP_TITLE } = viteEnv;
  return VitePWA({
    registerType: "autoUpdate",
    manifest: {
      name: VITE_GLOB_APP_TITLE,
      short_name: VITE_GLOB_APP_TITLE,
      theme_color: "#ffffff",
      icons: [
        {
          src: "/logo.png",
          sizes: "192x192",
          type: "image/png"
        },
        {
          src: "/logo.png",
          sizes: "512x512",
          type: "image/png"
        },
        {
          src: "/logo.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable"
        }
      ]
    }
  });
};
