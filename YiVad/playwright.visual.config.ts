import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./visual-regression/specs",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  snapshotPathTemplate: "{testDir}/../screenshots/{arg}{ext}",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8848",
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    animations: "disabled",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});