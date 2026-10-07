---

doc_type: test
title: "YP-09-08: CDN 资源加载 — CDN_CATALOG + CdnInjector + window[global] 去重 — 测试规格"
status: 已完成
priority: 中
owner: 陈铭
created: 2026-09-23
updated: 2026-09-23
project: YiPet
prd_month: "202609"
prd_task_id: "YP-09-08"
source_prds: ["15-基础设施-CDN资源加载系统"]
source_modules: ["08-prd-task-CDN资源加载"]

type: test
---

# YP-09-08: CDN 资源加载 — 测试规格

## 一、单元测试

```typescript
describe("CdnInjector", () => {
  let injector: CdnInjector;

  beforeEach(() => {
    injector = new CdnInjector();
    vi.spyOn(chrome.runtime, "getURL").mockReturnValue("chrome-extension://id/cdn/");
  });

  it("U-01: skip injection when window[global] already exists", async () => {
    (window as any).Vue = {}; // Vue 已加载
    const createSpy = vi.spyOn(document, "createElement");
    await injector.injectJS({ path: "vendor/vue.js", global: "Vue", version: "3.5.13", type: "js" });
    expect(createSpy).not.toHaveBeenCalled(); // 跳过
    delete (window as any).Vue;
  });

  it("U-02: injects script when window[global] is undefined", async () => {
    const createSpy = vi.spyOn(document, "createElement");
    const mockScript = { src: "", async: true, onload: null as any, onerror: null as any };
    createSpy.mockReturnValue(mockScript);
    const promise = injector.injectJS({ path: "vendor/vue.js", global: "Vue", version: "3.5.13", type: "js" });
    mockScript.onload();
    await promise;
    expect(createSpy).toHaveBeenCalledWith("script");
    expect(mockScript.src).toContain("vendor/vue.js");
  });

  it("U-03: CSS loads synchronously (blocks further injection)", async () => {
    const createSpy = vi.spyOn(document, "createElement");
    const mockLink = { rel: "", href: "", onload: null as any, onerror: null as any };
    createSpy.mockReturnValue(mockLink);
    const promise = injector.injectCSS({ path: "styles/chat.css", version: "1.0.0", type: "css" });
    mockLink.onload();
    await promise;
    expect(createSpy).toHaveBeenCalledWith("link");
  });

  it("U-04: shows error banner after 3 consecutive load failures", async () => {
    const createSpy = vi.spyOn(document, "createElement");
    for (let i = 0; i < 3; i++) {
      const mockEl = { src: "", onerror: null as any };
      createSpy.mockReturnValue(mockEl);
      try { await injector.injectJS({ path: `fail${i}.js`, version: "1.0", type: "js" }); } catch {}
    }
    expect(document.getElementById("yipet-update-banner")).not.toBeNull();
  });

  it("U-05: CDN_CATALOG has no duplicate global names", () => {
    const globals = CDN_CATALOG.filter(e => e.global).map(e => e.global);
    expect(new Set(globals).size).toBe(globals.length);
  });
});
```

## 二、完成定义

- [ ] U-01~05 全通过
- [ ] `grep -r 'https://' cdn/` 零外部 URL (CSP 合规)