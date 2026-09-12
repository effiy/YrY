---
title: content 脚本中 _scheduleIdle 回退 setTimeout 未在 cancelIdleCallback 中清理
tags: [yipet, code-quality, timer-management]
category: projects/yipet/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: trivial
priority: p3
---

# content 脚本中 _scheduleIdle 回退 setTimeout 未在 cancelIdleCallback 中清理

## 现象

`content/bootstrap.ts:64-67` 的 `_scheduleIdle` 包装对 `setTimeout` 回退没有提供取消机制：

```typescript
const _scheduleIdle = 'requestIdleCallback' in window
  ? (fn: () => void) => requestIdleCallback(fn)
  : (fn: () => void) => setTimeout(fn, 50);
```

当使用 `setTimeout` 回退时，如果 SPA 路由快速切换（`popstate` 事件触发新的 `ensurePetOverlay`），之前排队的 `setTimeout` 回调仍会执行——可能导致多个宠物覆盖层同时渲染。

而 `requestIdleCallback` 返回的 handle 可以调用 `cancelIdleCallback(handle)` 取消。

## 根因分析

- `_scheduleIdle` 的 API 设计未返回取消 handle
- 在 `requestIdleCallback` 路径下缺少 `cancelIdleCallback` 配对

## 涉及文件

- `src/content/bootstrap.ts:64-67` — _scheduleIdle

## 修复方案

```typescript
let _pendingIdle: number | undefined;
function _scheduleIdle(fn: () => void) {
  _cancelIdle();
  if ('requestIdleCallback' in window) {
    _pendingIdle = requestIdleCallback(() => { _pendingIdle = undefined; fn(); });
  } else {
    _pendingIdle = window.setTimeout(() => { _pendingIdle = undefined; fn(); }, 50);
  }
}
function _cancelIdle() {
  if (_pendingIdle !== undefined) {
    'requestIdleCallback' in window ? cancelIdleCallback(_pendingIdle) : clearTimeout(_pendingIdle);
    _pendingIdle = undefined;
  }
}
```


## 影响范围

**影响模块**：`src/content/bootstrap.ts` 中的 `_scheduleIdle` 调度逻辑。
**影响用户**：当 Content Script 被移除或扩展卸载时，已调度但未执行的回调无法被取消，可能导致对已销毁 DOM 的操作。
**影响范围**：所有使用 `_scheduleIdle` 调度延迟执行的 DOM 操作。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 代码 | `_scheduleIdle` 应返回取消函数，允许调用方取消已调度的任务 | 开发者 |
| 代码 | 在 `pagehide` 事件中取消所有待执行的 idle 回调 | 开发者 |
| 代码 | 回调中检查 DOM 元素是否仍然存在再执行操作 | 开发者 |


## 经验教训

可取消的异步操作是健壮系统的基础。没有取消机制，回调可能在 DOM 已被销毁后执行，导致操作无效或报错。返回值是取消句柄（如 `clearTimeout` 的 timer ID）是最简单的取消模式。
