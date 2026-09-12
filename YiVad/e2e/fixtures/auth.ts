import type { Page } from "@playwright/test";

/**
 * Set auth token in localStorage to bypass login page.
 */
export async function setupAuth(page: Page) {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem(
      "yivad-token",
      JSON.stringify({ accessToken: "test-token", refreshToken: "test-refresh" })
    );
  });
}