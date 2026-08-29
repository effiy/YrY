import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

const rootDir = __dirname;

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: [resolve(rootDir, "tests/setup.ts")],
    globals: true,
  },
  resolve: {
    alias: {
      "@": resolve(rootDir, "src"),
    },
  },
});