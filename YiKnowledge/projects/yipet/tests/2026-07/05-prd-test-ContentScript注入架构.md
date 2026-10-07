---

doc_type: test
title: "YP-07-05: Content Script 注入架构 — 双世界注入 + 防重复 + ShadowDOM + IPC 桥接 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202607"
prd_task_id: "YP-07-05"
source_prds: ["05-架构设计-ContentScript注入架构"]
source_modules: ["05-prd-task-ContentScript注入架构"]
source_okr: [yipet-001]

type: test
---

# YP-07-05: Content Script 注入架构 — 测试规格

> 来源 PRD：[05-架构设计-ContentScript注入架构.md](../../prds/2026-07/05-架构设计-ContentScript注入架构.md)
> 开发方案：[05-prd-task-ContentScript注入架构.md](../../devs/2026-07/05-prd-task-ContentScript注入架构.md)

---

## 一、测试策略

Content Script 注入是 YiPet 最核心的架构——所有用户可见的宠物交互都依赖注入成功。测试覆盖 3 个世界（ISOLATED/MAIN/SW）× 4 种页面类型（静态/SPA/chrome:///file://）× 注入全生命周期。

| 层级 | 范围 | 工具 |
|------|------|------|
| L1 单元 | bootstrap 逻辑、`__YIPET_LOADED__` flag、注入决策树 | Vitest + jsdom |
| L2 集成 | ISOLATED↔MAIN IPC、ShadowDOM 创建、MutationObserver | Vitest + mock chrome.* |
| L3 E2E | 真实页面注入、SPA 路由切换、iframe 排除 | Chrome + DevTools |

---

## 二、单元测试

### U-01: 注入决策逻辑

```typescript
describe("Injection decision", () => {
  it("U-01-S01: allows injection on http:// pages", () => {
    expect(shouldInject("http://example.com")).toBe(true);
  });

  it("U-01-S02: allows injection on https:// pages", () => {
    expect(shouldInject("https://example.com")).toBe(true);
  });

  it("U-01-S03: blocks injection on chrome:// pages", () => {
    expect(shouldInject("chrome://extensions")).toBe(false);
    expect(shouldInject("chrome://settings")).toBe(false);
    expect(shouldInject("chrome-extension://abc123/popup.html")).toBe(false);
  });

  it("U-01-S04: blocks injection on file:// pages", () => {
    expect(shouldInject("file:///Users/test/page.html")).toBe(false);
  });

  it("U-01-S05: blocks injection in iframes of same extension", () => {
    // chrome-extension://{EXT_ID}/chat.html → 不注入 CS
  });

  it("U-01-S06: blocks injection when __YIPET_LOADED__ is already set", () => {
    window.__YIPET_LOADED__ = true;
    expect(shouldInject("https://example.com")).toBe(false);
  });
});
```

### U-02: `__YIPET_LOADED__` 防重复机制

```typescript
describe("__YIPET_LOADED__ guard", () => {
  beforeEach(() => {
    delete (window as any).__YIPET_LOADED__;
  });

  it("U-02-S01: sets flag after successful injection", () => {
    bootstrap();
    expect((window as any).__YIPET_LOADED__).toBe(true);
  });

  it("U-02-S02: second bootstrap call is no-op", () => {
    bootstrap();
    const spy = vi.spyOn(document, "createElement");
    bootstrap(); // 第二次调用
    expect(spy).not.toHaveBeenCalledWith("script"); // 不创建新的注入脚本
  });

  it("U-02-S03: failed injection clears flag for retry", () => {
    vi.spyOn(document, "createElement").mockImplementation(() => {
      throw new Error("CSP blocked");
    });
    try { bootstrap(); } catch {}
    expect((window as any).__YIPET_LOADED__).toBeUndefined();
    // 下次调用允许重试
    const spy = vi.spyOn(document, "createElement");
    bootstrap();
    expect(spy).toHaveBeenCalled();
  });
});
```

### U-03: ShadowDOM 样式隔离

```typescript
describe("ShadowDOM isolation", () => {
  it("U-03-S01: creates ShadowDOM with mode: 'closed'", () => {
    const host = document.createElement("div");
    host.id = "yipet-root";
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: "closed" });
    expect(host.shadowRoot).toBeNull(); // closed → 外部不可访问
  });

  it("U-03-S02: host page CSS does not penetrate ShadowDOM", () => {
    // 注入宿主样式 `body { font-size: 50px; }`
    // ShadowDOM 内元素 font-size 不受影响
    const style = document.createElement("style");
    style.textContent = "body { font-size: 50px !important; }";
    document.head.appendChild(style);
    const shadowEl = shadowRoot.querySelector(".pet-text");
    expect(getComputedStyle(shadowEl!).fontSize).not.toBe("50px");
  });

  it("U-03-S03: ShadowDOM CSS uses :host for root styling", () => {
    const styles = readFile("src/content/styles/shadow.css");
    expect(styles).toContain(":host");
  });
});
```

---

## 三、集成测试

```typescript
describe("CS injection integration", () => {
  beforeEach(() => {
    // mock chrome.runtime.sendMessage + chrome.storage
    vi.stubGlobal("chrome", mockChromeAPI());
    // 清空注入状态
    delete (window as any).__YIPET_LOADED__;
  });

  it("I-01: full injection flow on static page", () => {
    // 1. bootstrap() → 注入 ISOLATED script
    // 2. ISOLATED script → 注入 MAIN world <script>
    // 3. MAIN world → Vue app mount → pet visible
    // 4. __YIPET_LOADED__ = true
  });

  it("I-02: SPA route change does not re-inject", async () => {
    bootstrap();
    expect((window as any).__YIPET_LOADED__).toBe(true);
    // 模拟 Vue Router push → URL 变化
    history.pushState({}, "", "/other-page");
    window.dispatchEvent(new PopStateEvent("popstate"));
    // MutationObserver 触发但 bootstrap 被 flag 阻止
    await sleep(100);
    const scripts = document.querySelectorAll('script[data-yipet]');
    expect(scripts.length).toBe(1); // 仅注入一次
  });

  it("I-03: MutationObserver re-checks on DOM mutation", async () => {
    bootstrap();
    // 宿主 SPA 替换了整个 <body>
    document.body.innerHTML = '<div id="new-app"></div>';
    await sleep(100);
    // MutationObserver 检测 <body> 变更 → 重新注入
    expect((window as any).__YIPET_LOADED__).toBe(true);
  });

  it("I-04: IPC relay from MAIN to ISOLATED", () => {
    // MAIN world: window.postMessage({ type: "YIPET", payload, meta: {secret, ts} })
    // ISOLATED world: window.addEventListener("message") → 验证 secret → 处理
  });

  it("I-05: IPC relay from ISOLATED to MAIN", () => {
    // ISOLATED: document.dispatchEvent(new CustomEvent("yipet-main", {detail}))
    // MAIN: document.addEventListener("yipet-main") → 处理
  });
});
```

---

## 四、E2E 验证矩阵

| 编号 | 页面类型 | URL 示例 | 预期结果 |
|------|----------|----------|----------|
| E2E-01 | 静态 HTML | `https://example.com` | 宠物浮窗可见，ShadowDOM 隔离 |
| E2E-02 | Vue SPA (YiVad) | `http://localhost:8848/#/dashboard` | 宠物浮窗可见，路由切换不消失 |
| E2E-03 | React SPA | 任意 React 站点 | 宠物浮窗可见 |
| E2E-04 | chrome:// 页面 | `chrome://extensions` | 不注入，无报错 |
| E2E-05 | chrome-extension:// 页面 | `chrome-extension://{id}/chat.html` | 不注入（自身页面） |
| E2E-06 | file:// 页面 | `file:///Users/test/page.html` | 不注入 |
| E2E-07 | iframe 内页面 | 页面含 `<iframe src="...">` | iframe 内不注入，仅顶级页面注入 |
| E2E-08 | CSP 禁止 script-src 页面 | 自定义 CSP 头 | 降级：注入失败但 Popup 仍可用 |

---

## 五、边缘场景

| 编号 | 场景 | 触发条件 | 预期行为 |
|------|------|----------|----------|
| EDGE-01 | 页面加载极慢（> 30s） | 慢网络 | `document_idle` 等待 DOMContentLoaded 后注入 |
| EDGE-02 | 页面 DOM 极深（> 10000 节点） | 大型 SPA | MutationObserver 不导致性能退化（< 5ms 回调） |
| EDGE-03 | 页面频繁 DOM 变更（每秒 100+ 次） | 实时数据仪表盘 | MutationObserver 节流至 200ms |
| EDGE-04 | 页面同时有多个 `<body>` | 异常 HTML | 仅在第一个 body 注入 |
| EDGE-05 | Chrome 标签页后台 | 标签页不可见 | CS 注入正常，但动画暂停（requestAnimationFrame 不触发） |
| EDGE-06 | 扩展禁用后重新启用 | `chrome.management.setEnabled` | 新标签页注入，已打开标签页需刷新 |

---

## 六、完成定义

- [ ] 单元测试：U-01(6) + U-02(3) + U-03(3) = 12 用例全通过
- [ ] 集成测试：I-01~05 全通过
- [ ] E2E 验证：E2E-01~08 全部通过
- [ ] 边缘场景：EDGE-01~06 全部验证
- [ ] 静态页面 + SPA + chrome:// + file:// 4 类页面验证完成
- [ ] `__YIPET_LOADED__` 防重复注入验证通过
- [ ] ShadowDOM 样式隔离验证通过（宿主 CSS 不穿透）