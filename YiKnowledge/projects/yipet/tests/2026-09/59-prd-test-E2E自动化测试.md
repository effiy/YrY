---

doc_type: test
title: "YP-09-52: E2E 自动化测试 — Playwright + Chrome Extension — 测试规格"
status: 已完成
priority: P1
owner: 陈铭
created: 2026-09-23
updated: 2026-09-23
project: YiPet
prd_month: "202609"
prd_task_id: "YP-09-52"
source_prds: ["59-架构设计-E2E自动化测试"]
source_modules: ["59-prd-task-E2E自动化测试"]

type: test
---

# YP-09-52: E2E 自动化测试 — 测试规格

## 一、核心场景

```typescript
describe("YiPet E2E", () => {
  it("extension loads → popup renders skin center", async () => {
    await loadExtension("dist/");
    const popup = await openPopup();
    expect(await popup.$(".pet-preview")).not.toBeNull();
  });

  it("content script injects → pet visible on arbitrary page", async () => {
    const page = await browser.newPage();
    await page.goto("https://example.com");
    const pet = await page.waitForSelector("#yipet-overlay", { timeout: 5000 });
    expect(pet).not.toBeNull();
  });

  it("chat: send message → SSE streaming → AI response rendered", async () => {
    await page.keyboard.press("Control+Shift+X");
    const input = await page.waitForSelector(".chat-input textarea");
    await input!.type("Hello");
    await page.keyboard.press("Enter");
    const bubble = await page.waitForSelector(".message-bubble.pet", { timeout: 10000 });
    expect(await bubble!.textContent()).toBeTruthy();
  });

  it("SPA route switch 5× → pet persists", async () => {
    const page = await browser.newPage();
    await page.goto("http://localhost:8848/#/dashboard");
    await page.waitForSelector("#yipet-overlay");
    for (let i = 0; i < 5; i++) {
      await page.evaluate((n) => history.pushState({}, "", `/page-${n}`), i);
      await page.waitForTimeout(200);
    }
    expect(await page.$("#yipet-overlay")).not.toBeNull();
  });

  it("cross-project bridge → YiVad opens with session", async () => {
    const [newPage] = await Promise.all([
      browser.waitForTarget(t => t.url().includes("aiChat")),
      page.click(".bridge-yivad-btn"),
    ]);
    expect(newPage.url()).toContain("session=");
  });
});
```

## 二、完成定义

- [ ] 5 个 E2E 场景全通过
- [ ] CI 中 `npm run test:e2e` 通过