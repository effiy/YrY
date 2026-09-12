---
title: 宠物覆盖层图片使用 draggable=false 但 dragstart 事件未阻止
tags: [yipet, code-quality, ux]
category: projects/yipet/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: trivial
priority: p3
---

# 宠物覆盖层图片使用 draggable=false 但 dragstart 事件未阻止

## 现象

`rendering/overlay.ts` 中宠物图片设置了 `draggable=false`，但未在容器上阻止 `dragstart` 事件——部分浏览器中仍可能触发拖拽行为。

## 涉及文件

- `src/content/rendering/overlay.ts`

## 修复方案

```typescript
petImg.addEventListener('dragstart', (e) => e.preventDefault());
```


## 影响范围

**影响模块**：宠物覆盖层的拖拽逻辑。
**影响用户**：设置 `draggable="false"` 但未阻止 `dragstart` 事件时，某些浏览器可能仍然允许拖拽，导致宠物图标意外变为拖拽幽灵图像。
**影响范围**：所有页面上的宠物覆盖层元素。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 代码 | 需要禁止拖拽的元素同时设置 `draggable="false"` 和 `@dragstart.prevent` | 开发者 |
| 代码 | 使用 CSS `user-select: none` 配合禁止拖拽 | 开发者 |
| 代码 | 通过 `pointer-events` 精确控制哪些元素可交互 | 开发者 |


## 经验教训

HTML 的 `draggable="false"` 属性在某些浏览器实现中不完全可靠——元素仍可能触发 `dragstart` 事件。同时阻止事件和设置属性是防御性编程的体现。
