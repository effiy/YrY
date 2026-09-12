import { test, expect } from "@playwright/test";

test.describe("Visual Regression — Core Pages", () => {
  test("project list page screenshot", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("project-list.png", {
      fullPage: false,
      maxDiffPixelRatio: 0.005,
    });
  });

  test("project detail page screenshot", async ({ page }) => {
    await page.goto("/project/PL");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("project-detail.png", {
      fullPage: false,
      maxDiffPixelRatio: 0.005,
    });
  });

  test("bug list page screenshot", async ({ page }) => {
    await page.goto("/bug");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("bug-list.png", {
      fullPage: false,
      maxDiffPixelRatio: 0.005,
    });
  });
});