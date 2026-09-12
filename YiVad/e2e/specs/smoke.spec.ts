import { test, expect } from "@playwright/test";

test.describe("YiVad Smoke Tests", () => {
  test("login page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/YiVad/);
  });

  test("app shell renders without crash", async ({ page }) => {
    await page.goto("/");
    // The app should at minimum render the root element
    await expect(page.locator("#app")).toBeAttached();
  });

  test("navigating to a project detail page does not crash the app", async ({ page }) => {
    await page.goto("/project/PL");
    // Should not show a blank page — either login redirect or content
    await expect(page.locator("#app")).toBeAttached();
    await expect(page).not.toHaveTitle(/500|404|Error/);
  });

  test("navigating to bug list does not crash the app", async ({ page }) => {
    await page.goto("/bug");
    await expect(page.locator("#app")).toBeAttached();
    await expect(page).not.toHaveTitle(/500|404|Error/);
  });
});