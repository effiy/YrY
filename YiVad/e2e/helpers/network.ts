import type { Page } from "@playwright/test";

/**
 * Mock YiAi API responses so E2E tests can run without a running backend.
 */
export async function mockYiAiApi(page: Page) {
  await page.route("**/10086/**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ code: 0, message: "ok", data: null }),
    });
  });
}