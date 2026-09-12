---
title: "Content Script: SPA 客户端路由切换后宠物注入失败"
tags: [content-script, spa, vue-router, mutation-observer, injection-timing, history-api]
category: projects/yipet/bugs/content
created: 2026-09-05
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: major
priority: p1
project: YiPet
module: src/content/bootstrap.ts
reporter: Claude
environment: Chrome 130+ / macOS 15
affectedVersion: 1.2.0
fixedVersion: 1.2.1
frequency: always
execution_world: ISOLATED → MAIN
---

# Content Script: SPA 客户端路由切换后宠物注入失败

## 现象

在 SPA 页面中，用户通过客户端路由（Vue Router `router.push`、React Router `navigate`）切换页面时，浏览器的 URL 变化但不会触发完整页面重载。YiPet 的 Content Script 注入逻辑仅在初始页面加载时触发一次，导致路由切换后 Floating Pet 和 Chat Window 从 DOM 中消失且不再重新注入。

**用户感知**：首次加载时宠物正常显示，点击导航链接切换页面后宠物消失，必须手动刷新（F5）才能恢复。

**影响页面**：YiVad 管理后台（`/project` → `/project/yivad` → `/issue/xxx` 等所有路由切换），以及任何使用客户端路由的 SPA 页面。

## 复现步骤

1. Chrome 中加载 YiPet 扩展，访问 `http://localhost:8848/#/project`
2. 确认 Floating Pet 右下角正常显示（首次加载正常）
3. 点击任意项目卡片，导航到 `http://localhost:8848/#/project/yivad`
4. **观察**：宠物消失，右下角无任何 YiPet 元素
5. 打开 DevTools → 顶栏切换至 "Content Script" 上下文 → 控制台无任何错误日志
6. 手动刷新页面（F5）→ 宠物重新出现

## 预期行为

SPA 路由切换后，Content Script 应检测到 DOM 变化并重新注入宠物组件，用户无感知。

## 实际行为

宠物组件在路由切换后消失，不重新注入。控制台无错误——注入逻辑完全未触发，属于静默失败。

## 影响评估

| 维度 | 评估 |
|------|------|
| 用户影响 | **高** — 任何 SPA 页面导航后宠物消失，核心体验中断 |
| 影响范围 | 所有 SPA 页面（YiVad 全部页面、GitHub、GitLab 等） |
| 数据损失 | 无（聊天消息持久化在 chrome.storage，仅 UI 不可见） |
| 安全影响 | 无 |

## 根因分析

### 直接原因

`bootstrap.ts` 中的注入逻辑仅监听 `DOMContentLoaded` 和检查 `document.readyState`，未监听 SPA 的 DOM 变化：

```typescript
// src/content/bootstrap.ts — 修复前
if (document.readyState === "complete") {
  injectPet();
} else {
  document.addEventListener("DOMContentLoaded", injectPet);
}
```

SPA 路由切换时：
- `DOMContentLoaded` **不会重新触发**（页面未重载）
- `document.readyState` 仍为 `"complete"`（页面未重载）
- 注入逻辑**不会再执行**

### 深层原因

Content Script 运行在 ISOLATED World，无法直接访问页面 JavaScript 上下文中的 Vue Router / React Router 实例。但可以通过以下浏览器 API 检测 URL 变化：

| 检测方式 | 覆盖场景 | 限制 |
|----------|----------|------|
| `history.pushState` 拦截 | `router.push()` 触发的导航 | 需猴子补丁 `history` 对象 |
| `history.replaceState` 拦截 | `router.replace()` 触发的导航 | 同上 |
| `popstate` 事件 | 浏览器前进/后退按钮 | 仅覆盖用户手动导航 |
| `MutationObserver` | DOM 被意外清除（如 `document.body.innerHTML = ""`) | 作为兜底保活机制 |

### 失败链路

```
用户点击导航链接
  → Vue Router pushState 修改 URL
  → Vue 卸载旧页面组件，挂载新页面组件
  → 旧 DOM 被移除（含 #yipet-root、#yipet-chat-root）
  → Content Script 注入逻辑未触发（无 DOMContentLoaded）
  → Floating Pet 和 Chat Window 永久消失
  → 用户只能手动刷新恢复
```

## 修复方案

### 修复前

```typescript
// src/content/bootstrap.ts
if (document.readyState === "complete") {
  injectPet();
} else {
  document.addEventListener("DOMContentLoaded", injectPet);
}
```

### 修复后

```typescript
// src/content/bootstrap.ts
let lastUrl = location.href;
const YIPET_ROOT_ID = "yipet-root";
const YIPET_CHAT_ROOT_ID = "yipet-chat-root";

// ============================================================
// 1. 首次注入
// ============================================================
injectPet();

// ============================================================
// 2. SPA 路由切换检测（history API 拦截）
// ============================================================
const origPushState = history.pushState.bind(history);
const origReplaceState = history.replaceState.bind(history);

history.pushState = function (...args: Parameters<typeof history.pushState>) {
  origPushState(...args);
  onUrlChange();
};

history.replaceState = function (...args: Parameters<typeof history.replaceState>) {
  origReplaceState(...args);
  onUrlChange();
};

window.addEventListener("popstate", onUrlChange);
window.addEventListener("hashchange", onUrlChange);

function onUrlChange(): void {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    // 延迟注入：等待 SPA 框架完成 DOM 更新
    // requestIdleCallback 优先，setTimeout 兜底
    const schedule = window.requestIdleCallback || setTimeout;
    schedule(() => reInject(), { timeout: 1000 });
  }
}

// ============================================================
// 3. DOM 保活（MutationObserver 兜底）
// ============================================================
function reInject(): void {
  const petRoot = document.getElementById(YIPET_ROOT_ID);
  const chatRoot = document.getElementById(YIPET_CHAT_ROOT_ID);

  if (!petRoot || !document.body.contains(petRoot)) {
    removeExistingPet();
    injectPet();
  }
  if (!chatRoot || !document.body.contains(chatRoot)) {
    injectChatWindow();
  }
}

// 监听 body 的剧烈 DOM 变化（如框架替换整个 #app 内容）
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === "childList") {
      for (const node of mutation.removedNodes) {
        if (node instanceof HTMLElement) {
          if (node.id === YIPET_ROOT_ID || node.querySelector(`#${YIPET_ROOT_ID}`)) {
            requestIdleCallback(() => reInject(), { timeout: 500 });
            return;
          }
        }
      }
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });
```

### 设计决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 注入延迟方式 | `requestIdleCallback` 优先，`setTimeout` 兜底 | 避免阻塞 SPA 框架的 DOM 更新 |
| 延迟超时 | 1000ms | 覆盖绝大多数 SPA 路由切换的渲染时间 |
| MutationObserver 范围 | `document.body` + `subtree: true` | 覆盖框架替换整个 `#app` 的场景 |
| 重复注入防护 | 注入前清除旧 DOM + 检查 `__YIPET_LOADED__` | 防止多次注入导致 UI 叠加 |

## 时间线

| 时间 | 事件 |
|------|------|
| 2026-09-05 10:00 | 用户反馈：YiVad 项目详情页切换后宠物消失 |
| 2026-09-05 10:30 | 确认复现：所有 SPA 路由切换场景均受影响 |
| 2026-09-05 11:00 | 定位根因：`bootstrap.ts` 仅监听 `DOMContentLoaded` |
| 2026-09-05 14:00 | 实现修复：history API 拦截 + MutationObserver 保活 |
| 2026-09-05 16:00 | 验证通过：YiVad 5 个页面连续切换，宠物始终可见 |

## 验证方法

- [x] YiVad 列表页 → 项目详情页 → Issue 详情页 → 知识库页面 → RAG 页面：宠物始终可见
- [x] 浏览器前进/后退按钮：宠物正常显示，无闪烁
- [x] 首次加载页面：宠物正常显示，无重复注入
- [x] 非 SPA 页面（静态 HTML）：行为不变，宠物正常注入
- [x] `hashchange` 事件触发：宠物重新注入
- [x] 快速连续切换 5 个路由：无重复注入、无闪烁

## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 代码 | Content Script 注入逻辑 MUST 覆盖：首次加载、SPA 路由切换、浏览器前进/后退、DOM 被意外清除 | 开发者 |
| 测试 | 添加 SPA 路由切换的 E2E 测试用例（Cypress/Playwright） | QA |
| 文档 | 在[扩展架构](../specs/extension-arch.md)中记录 SPA 兼容性要求 | 开发者 |
| 工具 | ESLint 规则检查 `document.addEventListener("DOMContentLoaded", ...)` 是否同时有路由切换检测 | DevOps |

## 相关资源

- PR：#142
- Commit：`3d09bd7`
- 相关缺陷：无
- 参考：[Chrome Extension Content Scripts 文档](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts)