---
title: hooks 中 createElement 绕过 Vue 渲染管道
tags: [yivad, code-quality, dom-manipulation]
category: projects/yivad/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiVad
type: bug
status: resolved
severity: trivial
priority: p3
---

# hooks 中 createElement 绕过 Vue 渲染管道

## 现象

多个 hooks 使用 `document.createElement` 创建临时 DOM 元素（下载链接、Mermaid 工具栏等），而非使用 Vue 的声明式模板：

```typescript
// useDownload.ts:32
const exportFile = document.createElement("a");

// useMermaidViewer.ts:77,140
const a = document.createElement("a");
const toolbar = document.createElement("div");

// useResizable.ts:65
overlay = document.createElement("div");
```

这些元素不受 Vue 的虚拟 DOM 和响应式系统管理，组件卸载时如果忘记手动清理会导致 DOM 泄漏。

## 根因分析

- 文件下载（`<a download>`）等场景确实需要命令式 DOM 操作
- Mermaid 工具栏是注入到 SVG 容器中的自定义控件
- Resize overlay 是全屏透明遮罩，命令式操作更简单

## 涉及文件

- `hooks/useDownload.ts:32` — 下载链接
- `hooks/useMermaidViewer.ts:77,140` — Mermaid 工具栏
- `hooks/useResizable.ts:65` — 拖拽遮罩

## 修复方案

1. 文件下载：使用 `URL.createObjectURL` + 动态 `<a>` 点击（创建完立即清理）
2. Mermaid 工具栏：检查 `onUnmounted` 是否清理了 `toolbar.remove()`
3. Resize 遮罩：确认 `endDrag` 中 `overlay.remove()`

## 预防措施

- 命令式 DOM 操作必须配套 `onUnmounted` 清理
- 优先使用 Vue Teleport 组件替代 `createElement`

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 经验教训

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况

