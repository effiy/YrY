---
title: ChatWindow 中 drag/resize 事件未使用 passive 选项
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

# ChatWindow 中 drag/resize 事件未使用 passive 选项

## 现象

`chat/components/ChatWindow.vue:121-122` 的全局鼠标事件监听未使用 `{ passive: true }` 选项：

```typescript
window.addEventListener('mousemove', onGlobalMouseMove);
window.addEventListener('mouseup', onGlobalMouseUp);
```

`mousemove` 事件在 `passive: true` 时允许浏览器优化滚动性能——告诉浏览器事件处理器不会调用 `preventDefault()`。虽然 ChatWindow 的鼠标事件不需要 `preventDefault`，但浏览器在不声明 passive 时需要等待事件处理器执行完毕才能继续渲染。

## 根因分析

- 未意识到 `passive` 选项对 `mousemove`/`touchmove` 的性能影响
- ChatWindow 是浮动的，不涉及页面滚动，影响有限

## 涉及文件

- `src/chat/components/ChatWindow.vue:121-122`

## 修复方案

```typescript
window.addEventListener('mousemove', onGlobalMouseMove, { passive: true });
```


## 影响范围

**影响模块**：`src/content/rendering/overlay.ts` 中宠物拖拽的 `mousemove` 监听器。
**影响用户**：未使用 `passive: true` 的 `mousemove` 监听器可能阻塞主线程，导致页面滚动卡顿或宠物拖拽不流畅。
**影响范围**：所有页面的宠物拖拽交互。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 代码 | 不调用 `preventDefault()` 的事件监听器添加 `{ passive: true }` 选项 | 开发者 |
| 代码 | `mousemove`/`touchmove`/`scroll` 等高频事件始终使用 passive 模式 | 开发者 |
| 性能 | 使用 Lighthouse 或 Performance 面板检查滚动性能 | DevOps |
| 工具 | ESLint 规则检测未使用 passive 的高频事件监听器 | DevOps |


## 经验教训

Chrome 默认假设所有 `touchstart` 和 `touchmove` 事件监听器可能调用 `preventDefault()`，因此必须等待监听器执行完毕才能开始滚动。`{ passive: true }` 告诉浏览器"我不会阻止默认行为"，滚动可以立即开始，显著提升流畅度。
