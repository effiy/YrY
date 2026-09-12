---
title: Chat 窗口 resize 事件在文档级别监听无 throttle
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

# Chat 窗口 resize 事件在文档级别监听无 throttle

## 现象

ChatWindow resize 拖拽时 `mousemove` 事件在每次触发时都更新 Vue 响应式状态，无 `requestAnimationFrame` 或 throttle 优化。

## 涉及文件

- `src/chat/components/ChatWindow.vue` — resize move handler

## 修复方案

在 `rAF` 中批量更新状态。


## 影响范围

**影响模块**：窗口 resize 监听器。
**影响用户**：浏览器窗口大小调整时，resize 事件以极高频率触发（每帧），未节流的处理函数可能导致 CPU 飙升和 UI 卡顿。
**影响范围**：所有监听 `resize` 事件的模块（宠物覆盖层、聊天窗口）。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 代码 | `resize` 事件监听器使用 `requestAnimationFrame` 节流或 `debounce` | 开发者 |
| 代码 | 节流间隔根据操作类型设置：布局计算用 rAF，API 调用用 200-500ms debounce | 开发者 |
| 代码 | ResizeObserver 通常优于 window.resize 事件 | 开发者 |


## 经验教训

`window.resize` 是高频率事件，每个像素的变化都会触发。未节流的 resize 处理会显著影响性能。`ResizeObserver` 是更优的选择——它仅在目标元素实际改变大小时触发，且天然是异步的。
