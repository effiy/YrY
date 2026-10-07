---

doc_type: module
prd_task_id: "YP-09-01"
title: "YP-09-01: Content Script 稳定性 — SPA 路由检测 + MutationObserver 保活 + 注入重试 — 开发方案"
status: 已完成
priority: P0
owner: 陈铭
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
estimate_frontend: 3.0
source_prd: "08-稳定性-ContentScript.md"
source_okr: [yipet-001]

type: task
---

# YP-09-01: Content Script 稳定性 — 开发方案

> 来源 PRD：[08-稳定性-ContentScript.md](../../prds/2026-09/08-稳定性-ContentScript.md)
> 需求编号：YP-09-01 · 优先级：P0 · 人天：3.0d

---

## 一、方案概述

SPA 路由切换使用 `history.pushState` 不触发 `popstate` 事件，导致宠物在页面切换后消失。同时 `MutationObserver` 缺乏节流在高频 DOM 变更页面造成性能退化。本方案实现双重路由检测 + 注入状态机 + 智能重试。

### 问题链路

```
用户点击 SPA 导航 → history.pushState('/new-page')
  → popstate 不触发 → Content Script 无感知
  → SPA 框架替换 <body> 内容 → pet DOM 被移除
  → MutationObserver 检测到 body 变更 → 但 __YIPET_LOADED__ 未清除
  → 重新注入逻辑跳过 → 宠物永久消失
```

### 修复架构

```
SPA 路由变更检测（双重监听）
  ├── popstate 事件（浏览器后退/前进）
  └── pushState/replaceState 猴子补丁
        ↓
MutationObserver（body 子节点变更，200ms 节流）
        ↓
__YIPET_LOADED__ 状态机
  ├── NOT_LOADED → 执行注入
  ├── LOADING → 等待
  ├── LOADED → 检测 DOM 存在性 → 存在则跳过，不存在则重新注入
  └── FAILED → 指数退避重试（最多 3 次）
```

---

## 二、核心模块设计

### 2.1 SPA 路由检测 (`src/content/spa-router-detector.ts`)

```typescript
// 猴子补丁 history.pushState/replaceState
const origPushState = history.pushState.bind(history);
const origReplaceState = history.replaceState.bind(history);

history.pushState = function(...args) {
  origPushState(...args);
  onRouteChanged(location.href);
};
history.replaceState = function(...args) {
  origReplaceState(...args);
  onRouteChanged(location.href);
};

// popstate 监听浏览器后退/前进
window.addEventListener("popstate", () => {
  onRouteChanged(location.href);
});

// 路由变更回调：通知注入检查
function onRouteChanged(newUrl: string) {
  // 延迟 100ms 等待 SPA 框架完成 DOM 更新
  setTimeout(() => checkAndReinject(), 100);
}
```

### 2.2 注入状态机 (`src/content/injection-state-machine.ts`)

```typescript
enum InjectState { NOT_LOADED, LOADING, LOADED, FAILED }

class InjectionStateMachine {
  private state = InjectState.NOT_LOADED;
  private retryCount = 0;
  private readonly MAX_RETRIES = 3;

  async checkAndReinject(): Promise<void> {
    // 检查 pet DOM 是否仍在页面中
    const existing = document.getElementById("yipet-overlay");

    if (existing && this.state === InjectState.LOADED) {
      return; // DOM 存在且状态正确，无需重新注入
    }

    if (this.state === InjectState.LOADING) {
      return; // 正在注入中，等待
    }

    // DOM 丢失或未注入 → 重新注入
    this.state = InjectState.LOADING;
    delete (window as any).__YIPET_LOADED__;

    try {
      await bootstrap();
      this.state = InjectState.LOADED;
      this.retryCount = 0;
    } catch (err) {
      this.retryCount++;
      if (this.retryCount < this.MAX_RETRIES) {
        const delay = 1000 * Math.pow(2, this.retryCount);
        console.warn(`[YiPet] Injection failed, retry in ${delay}ms (${this.retryCount}/${this.MAX_RETRIES})`);
        setTimeout(() => this.checkAndReinject(), delay);
      } else {
        this.state = InjectState.FAILED;
        console.error("[YiPet] Injection failed after max retries");
      }
    }
  }
}
```

### 2.3 MutationObserver 节流

```typescript
// 200ms 节流，仅监听 body 直接子节点变更
let throttleTimer: ReturnType<typeof setTimeout> | null = null;

const observer = new MutationObserver((mutations) => {
  // 仅关注 body 直接子节点的添加/移除
  const relevant = mutations.some(m =>
    m.target === document.body ||
    (m.target.parentNode === document.body &&
     (m.type === "childList"))
  );
  if (!relevant) return;

  if (throttleTimer) return;
  throttleTimer = setTimeout(() => {
    throttleTimer = null;
    injectionStateMachine.checkAndReinject();
  }, 200);
});

observer.observe(document.body, {
  childList: true,
  subtree: false,
});
```

---

## 三、实施步骤

| 步骤 | 内容 | 关键文件 | 验证 | 人天 |
|------|------|---------|------|------|
| 1 | SPA 路由检测器 (pushState 补丁 + popstate) | `spa-router-detector.ts` | pushState 触发 checkAndReinject | 0.75 |
| 2 | 注入状态机 (NOT_LOADED→LOADING→LOADED→FAILED) | `injection-state-machine.ts` | 状态转换正确，重试逻辑覆盖 | 1.0 |
| 3 | MutationObserver 节流 + body 子节点过滤 | `bootstrap.ts` | 高频变更仅触发 ≤5 次/秒 | 0.5 |
| 4 | 各种页面类型验证 (静态/SPA/chrome://) | — | 6 种页面类型注入正确 | 0.5 |
| 5 | 集成 + 回归测试 | `tests/` | 全量通过 | 0.25 |

**合计：3.0d**

---

## 四、边缘场景

| 场景 | 处理 |
|------|------|
| SPA 在 100ms 内连续切换 5 次路由 | 延迟防抖，仅最后一次触发重新注入检查 |
| body 被整体替换为全新 DOM | MutationObserver 检测 body childList → 清除 LOADED 状态 → 重新注入 |
| chrome:// 页面 | `chrome.runtime.id` 检测，静默跳过 |
| iframe 内页面 | `window.top === window.self` 检查，仅顶层注入 |
| 注入脚本加载超时 (>10s) | setTimeout 超时 → 标记 FAILED → 显示降级提示 |

---

## 五、完成定义

- [ ] SPA pushState/replaceState 后宠物保持可见
- [ ] popstate (浏览器后退/前进) 后宠物保持可见
- [ ] 连续 5 次路由切换不重复注入
- [ ] MutationObserver 200ms 节流生效
- [ ] body 被替换后自动重新注入
- [ ] chrome:// 页面静默跳过
- [ ] `tsc --noEmit` 零错误
- [ ] `npm test` 全量通过