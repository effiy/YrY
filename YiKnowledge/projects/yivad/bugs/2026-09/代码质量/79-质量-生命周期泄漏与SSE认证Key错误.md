---
title: "生命周期泄漏与认证 bug：KeepAlive 监听器积累 + SSE 错误 key"
key: yivad-lifecycle-auth-bugs-20260923
tags:
- bug-fix
- memory-leak
- keep-alive
- sse
- auth
category: projects/yivad/bugs/代码质量
created: "2026-09-23"
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: medium
priority: p2
project: YiVad
reporter: Claude
environment: Chrome / macOS
affectedVersion: main (pre-fix)
fixedVersion: main (2026-09-23)
frequency: always
---

## Description

审查事件监听器生命周期和认证机制时发现两个 bug：

1. **Grid 组件 KeepAlive 监听器积累** — 每次组件 reactivate→activate 都会增加重复的 `window.resize` 监听器
2. **通知 SSE localStorage key 错误** — 从 `"user-store"` 读取 token，但实际的 Pinia persisted state key 是 `"yivad-user"`

## Bug 1: Grid 组件 resize 监听器泄漏

### 根因

Grid 组件在 `onMounted` 和 `onActivated` 中都注册了 `window.addEventListener("resize", ...)`。KeepAlive 组件的首次挂载会同时触发 `onMounted` + `onActivated`，导致监听器被添加两次。`onDeactivated` 仅移除一次，剩余一个泄漏的监听器。每次 reactivate → activate 循环再增加一个。

```
首次挂载: onMounted → +1, onActivated → +1  (= 2 个监听器)
离开页面: onDeactivated → -1                    (= 1 个泄漏)
回来页面: onActivated → +1                      (= 2 个监听器)
离开页面: onDeactivated → -1                    (= 1 个泄漏)
最终卸载: onUnmounted → -1                      (= 0, 但之前的泄漏一直在)
```

每一轮 activate/deactivate 周期净增一个监听器。如果页面切换 10 次，就会有 10 个重复的 resize 监听器。

### 修复

使用守卫标志防止重复注册：

```ts
let _resizeListener = false;
function addResizeListener() {
  if (_resizeListener) return;
  window.addEventListener("resize", resize);
  _resizeListener = true;
}
function removeResizeListener() {
  if (!_resizeListener) return;
  window.removeEventListener("resize", resize);
  _resizeListener = false;
}
```

## Bug 2: 通知 SSE 错误 localStorage key

### 根因

`useNotificationSSE.ts` 的 `getToken()` 函数读取 `localStorage.getItem("user-store")`，但 Pinia user store 配置的 persisted state key 是 `"yivad-user"`：

```ts
// stores/modules/user.ts
export const useUserStore = defineStore(..., {
  persist: piniaPersistConfig("yivad-user")  // key = "yivad-user"
});

// hooks/useNotificationSSE.ts
const raw = localStorage.getItem("user-store");  // ← 永远为 null
```

在默认 auth disabled 模式下不影响功能（SSE endpoint 不需要 token）。一旦启用认证，SSE 连接将始终无 token，后端可能 401。

### 修复

```diff
- const raw = localStorage.getItem("user-store");
+ const raw = localStorage.getItem("yivad-user");
```

## Files Changed

| File | Change |
|------|--------|
| `src/components/Grid/index.vue` | 添加 `_resizeListener` 守卫标志，防止 KeepAlive 周期中的监听器泄漏 |
| `src/hooks/useNotificationSSE.ts` | `"user-store"` → `"yivad-user"` (正确匹配 Pinia persisted state key) |

## Verification

- `vue-tsc --noEmit`: 0 errors
- `eslint --quiet`: clean
- 逻辑验证: Grid 组件在 KeepAlive 场景中重复切换不会积累多余的 resize 事件处理函数

## Prevention

1. **KeepAlive 模式**：当组件同时使用 `onMounted` 和 `onActivated` 注册副作用时，必须实现幂等守卫
2. **localStorage key**：Pinia persisted state 的 key 由 `piniaPersistConfig(id)` 定义，必须通过该函数获取，禁止硬编码 key 字符串
3. **建议添加 `getYiAiToken()` 工具函数**：已有 `src/config/yiAi.ts` 中的 `getYiAiToken()` 实现完全相同逻辑，`useNotificationSSE` 应直接导入使用，而非重复实现