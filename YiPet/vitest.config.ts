import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: [resolve(__dirname, "tests/setup.ts")],
    globals: true,
    env: {
      RSBUILD_ENV_API_URL: "http://localhost:10086",
      RSBUILD_ENV_YIVAD_URL: "http://localhost:8848",
      RSBUILD_ENV_GLOB_APP_TITLE: "YiPet"
    }
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src")
    }
  }
});