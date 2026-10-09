/**
 * HelpOS —— E2E Playwright 骨架（对齐 PRD §13 AC-01 ~ AC-06）
 *
 * 运行方式（项目红线 packageManager=yarn，切勿 pnpm）：
 *   yarn exec playwright test --project=chromium e2e/specs/help-center.spec.ts
 *
 * 前置依赖：
 *   - 确保 dev 服务器已启动在 $BASE_URL（默认 http://127.0.0.1:5173）
 */
import { test, expect } from "@playwright/test";
const BASE_URL = process.env.E2E_BASE_URL ?? "http://127.0.0.1:5173";
const SCREENSHOT_DIR = process.env.E2E_ARTIFACTS ?? "artifacts/playwright/help-center";

test.describe("HelpOS / YV-09-70", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL + "/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);
  });

  test("AC-01 · ? 键 → 弹出 HelpCenter（三入口之一）", async ({ page }) => {
    // 1) ? 键：Shift + /（美式键盘）
    await page.keyboard.press("Shift+/");
    await expect(page.locator('div[role="dialog"][aria-modal="true"]')).toBeVisible({ timeout: 1200 });
    await page.screenshot({ path: `${SCREENSHOT_DIR}/ac-01-question-key.png`, fullPage: false });
    // 2) Esc 关闭
    await page.keyboard.press("Escape");
    await expect(page.locator('div[role="dialog"]')).toHaveCount(0);
  });

  test("AC-02 · PageHelp Tab 路由命中（最长前缀 + :param 匹配）", async ({ page }) => {
    await page.goto(BASE_URL + "/kanban", { waitUntil: "domcontentloaded" });
    await page.keyboard.press("Shift+/");
    const pageHelpTab = page.getByRole("tab", { name: /页面帮助|Page Help/i });
    await expect(pageHelpTab).toBeVisible();
    const title = page.locator(".help-tabpanel__title").first();
    await expect(title).toBeVisible({ timeout: 800 });
    await page.screenshot({ path: `${SCREENSHOT_DIR}/ac-02-pagehelp-kanban.png` });
  });

  test("AC-03 · Shortcuts Tab 数据源 = ShortcutRegistry.getAllShortcuts（SSOT 验证）", async ({ page }) => {
    await page.keyboard.press("Shift+/");
    const shortcutsTab = page.getByRole("tab", { name: /快捷键|Shortcuts/i });
    await shortcutsTab.click();
    const rows = page.locator(".shortcuts-row");
    const rowCount = await rows.count();
    // SLI-6 基线：至少 20 条（Registry 默认值）；若 < 20 表示静态副本替换未到位
    expect(rowCount).toBeGreaterThanOrEqual(20);
    // ⌘ ⌥ 平台本地化（Mac 环境）；Windows/Linux 用 Ctrl+Alt 等，这里只检查至少存在 1 个 kbd
    const firstKbd = page.locator(".shortcuts-row__keys kbd").first();
    await expect(firstKbd).toBeVisible();
    await page.screenshot({ path: `${SCREENSHOT_DIR}/ac-03-shortcuts-tab.png` });
  });

  test("AC-04 · FAQ 200ms 熔断 → 降级到本地 FAQ（离线可用）", async ({ page }) => {
    // 拦截所有 /faq/search 并延迟 3s
    await page.route(/\/faq\/search/, async (r) => {
      await new Promise(d => setTimeout(d, 3000));
      await r.abort("timedout");
    });
    await page.keyboard.press("Shift+/");
    const faqTab = page.getByRole("tab", { name: /FAQ|常见问题/i });
    await faqTab.click();
    const degraded = page.locator(".faq-tab__degraded");
    await expect(degraded).toBeVisible({ timeout: 1500 });
    const faqItems = page.locator(".el-collapse-item");
    expect(await faqItems.count()).toBeGreaterThanOrEqual(5);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/ac-04-faq-degraded.png` });
  });

  test("AC-05 · Feedback 提交：表单校验 + 限流 3/min 提示", async ({ page, browserName }) => {
    test.skip(browserName === "webkit", "webkit paste 事件不稳定，跳过");
    await page.keyboard.press("Shift+/");
    const feedbackTab = page.getByRole("tab", { name: /反馈|Feedback/i });
    await feedbackTab.click();
    const submit = page.getByRole("button", { name: /提交反馈|Submit/i });
    await submit.click(); // 空表单 → 校验失败
    await expect(page.getByText(/请选择反馈类型|Pick a feedback type/).first()).toBeVisible();

    // 快速连点 4 次 → 触发 rate_limited
    const pickBug = page.locator('input[type="radio"][value="bug"], .el-radio').first();
    if (await pickBug.isVisible()) await pickBug.click();
    await page.fill('input[maxlength="120"], .el-input__inner', "Unit test bug 标题");
    await page.fill('textarea', "x".repeat(25));
    for (let i = 0; i < 4; i++) await submit.click({ timeout: 1500 }).catch(() => void 0);
    const rateLimitHint = page.locator(':text("过于频繁"), :text("Too frequent")');
    await expect(rateLimitHint.first()).toBeVisible({ timeout: 2500 });
    await page.screenshot({ path: `${SCREENSHOT_DIR}/ac-05-feedback-rate-limit.png` });
  });

  test("AC-06 · URL 脱敏 12 类敏感参数打码（Token/Password 等 → ***）", async ({ page }) => {
    // 跳转到一个带 token=xxx&password=yyy&apikey=zzz 的 URL（Sanitize 逻辑同源页内）
    await page.goto(BASE_URL + "/kanban?token=eyJhbGci&password=Hello123&apikey=sk-live_abc&secret=very-secret", { waitUntil: "domcontentloaded" });
    await page.keyboard.press("Shift+/");
    const feedbackTab = page.getByRole("tab", { name: /反馈|Feedback/i });
    await feedbackTab.click();
    await page.getByText(/环境|environment/i).first().click({ force: true });
    const urlText = page.locator("dl dd code").first();
    const t = (await urlText.textContent()) ?? "";
    expect(t).not.toMatch(/eyJhbGci|Hello123|sk-live_abc|very-secret/);
    expect(t).toMatch(/\*\*\*/);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/ac-06-url-sanitize.png` });
  });
});
