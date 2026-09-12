import { resolve } from "node:path";
import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import AutoImport from "unplugin-auto-import/vite";

const rootDir = __dirname;

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    AutoImport({
      imports: ["vue", "vue-router", "pinia"],
    }),
  ],
  test: {
    environment: "jsdom",
    setupFiles: [resolve(rootDir, "tests/setup.ts")],
    globals: true,
    env: {
      RSBUILD_ENV_ROUTER_MODE: "hash",
      RSBUILD_ENV_API_URL: "http://localhost:10086",
      RSBUILD_ENV_GLOB_APP_TITLE: "YiVad",
    },
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "dist", "e2e"],
    testTimeout: 10000,
    hookTimeout: 10000,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
      include: ["src/**/*.{ts,tsx,vue}"],
      exclude: [
        "src/**/*.d.ts",
        "src/main.ts",
        "src/routers/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": resolve(rootDir, "src"),
      "@yivad/views-glob": resolve(rootDir, "tests/mocks/viewsGlob.ts"),
    },
  },
});