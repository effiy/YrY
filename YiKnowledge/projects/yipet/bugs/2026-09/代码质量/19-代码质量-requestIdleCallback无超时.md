---
title: _scheduleIdle requestIdleCallback polyfill 未设置超时
tags: [yipet, code-quality, performance]
category: projects/yipet/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: trivial
priority: p3
---

# _scheduleIdle requestIdleCallback polyfill 未设置超时

## 现象

`src/content/bootstrap.ts:64-65` 使用 `requestIdleCallback` 延迟执行非紧急的 DOM 操作，但未传递 `timeout` 选项：

```typescript
const _scheduleIdle = 'requestIdleCallback' in window
  ? (fn: () => void) => requestIdleCallback(fn)
  : (fn: () => void) => setTimeout(fn, 50);
```

`requestIdleCallback` 在页面持续繁忙时（如动画、滚动），回调可能被无限期推迟。MDN 推荐始终设置 `{ timeout: 1000 }` 以确保回调在合理时间内执行。

Polyfill 回退 `setTimeout(fn, 50)` 在性能上略优于无超时的 idle callback——后者可能永远不执行。

## 根因分析

- 开发者在测试环境中未遇到页面持续繁忙的场景
- `requestIdleCallback` 的 `timeout` 选项是可选参数但强烈推荐
- 无超时时，宠物覆盖层的恢复可能被显著延迟

## 涉及文件

- `src/content/bootstrap.ts:64-67` — `_scheduleIdle` 实现

## 修复方案

```typescript
const _scheduleIdle = 'requestIdleCallback' in window
  ? (fn: () => void) => requestIdleCallback(fn, { timeout: 2000 })
  : (fn: () => void) => setTimeout(fn, 50);
```


## 影响范围

**影响模块**：`src/content/bootstrap.ts` 中的 `_scheduleIdle` 工具函数。
**影响用户**：在页面持续繁忙（如动画、视频播放）时，宠物覆盖层的恢复可能被无限期推迟，用户看到宠物"消失"了很长时间。
**影响范围**：所有使用 `_scheduleIdle` 延迟的 DOM 操作（宠物重新注入、覆盖层恢复）。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 代码 | 所有 `requestIdleCallback` 调用必须设置 `timeout` 选项 | 开发者 |
| 代码 | timeout 值应根据操作紧迫性设置（关键操作 1-2 秒，非关键操作 5-10 秒） | 开发者 |
| 工具 | ESLint 规则要求 `requestIdleCallback` 必须有第二个参数 | DevOps |


## 经验教训

`requestIdleCallback` 的 `timeout` 参数不是可选的——在繁忙页面上，没有 timeout 的回调可能永远不执行。MDN 明确建议始终设置 timeout。这是一个"看起来可选但实际上必需"的 API 设计陷阱。
