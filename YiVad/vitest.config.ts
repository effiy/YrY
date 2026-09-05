import { resolve } from "node:path";
import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";

const rootDir = __dirname;

export default defineConfig({
  plugins: [vue(), vueJsx()],
  test: {
    environment: "jsdom",
    setupFiles: [resolve(rootDir, "tests/setup.ts")],
    globals: true,
    env: {
      RSBUILD_ENV_ROUTER_MODE: "hash",
      RSBUILD_ENV_API_URL: "http://localhost:10086",
      RSBUILD_ENV_GLOB_APP_TITLE: "YiVad",
    },
  },
  resolve: {
    alias: {
      "@": resolve(rootDir, "src"),
      "@yivad/views-glob": resolve(rootDir, "tests/mocks/viewsGlob.ts"),
    },
  },
});