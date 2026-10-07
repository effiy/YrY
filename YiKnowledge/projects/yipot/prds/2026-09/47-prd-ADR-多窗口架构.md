---
doc_type: prd
title: "YP-09-A04: ADR-004 多窗口而非单页路由"
status: 已完成
priority: P1
project: YiPot
project_id: yipot
owner: Pot-App 社区
prd_month: "202609"
prd_task_id: YP-09-A04
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: 需求
issue_type: 架构
roles: [engineer]
tags: [ADR, 多窗口, Tauri, 架构]
category: 项目/桌面应用/需求
---

# ADR-004: 多窗口架构而非单页路由

> 状态：已采纳 · 日期：2023 年

## 背景

YiPot 有 5 个功能窗口：翻译、OCR识别、截图、设置、更新。需要决定是使用单窗口 + 前端路由（SPA）还是多窗口（Tauri 多窗口）。

## 决策

使用 **Tauri 多窗口架构**。

## 理由

| 方案 | 优势 | 劣势 |
|------|------|------|
| SPA + 路由 | 状态共享简单 | 窗口定位困难、无法独立显示 |
| 多窗口 | 独立定位/尺寸/层级 | 状态需要跨窗口同步 |

**决定因素**：
- 翻译窗口需要在鼠标附近弹出（独立定位）
- OCR 窗口需要居中显示（不同定位策略）
- 截图窗口必须全屏置顶（特殊窗口属性）
- 不同窗口可以独立关闭而不影响其他窗口

## 窗口 → 组件映射

```javascript
const windowMap = {
  translate: <Translate />,
  recognize: <Recognize />,
  screenshot: <Screenshot />,
  config: <Config />,       // 内部使用 React Router
  updater: <Updater />,
};
```

## 后果

- 跨窗口状态通过 Tauri event 同步
- 每个窗口独立的前端 bundle
- 设置窗口内部使用 React Router 管理子页面路由

## 备选方案详细对比

### 多窗口 vs SPA 路由 vs Tab 布局 vs 混合模式

| 维度 | 多窗口 (采纳) | SPA 路由 | Tab 布局 | 混合模式 |
|------|-------------|---------|---------|---------|
| 窗口独立定位 | 原生 (每个窗口独立位置) | 不支持 (单窗口内布局) | 不支持 (单窗口内 Tab) | 支持 (关键窗口独立) |
| 窗口层级管理 | 原生 (alwaysOnTop/focused) | 不支持 | 不支持 | 支持 |
| 截图全屏置顶 | 原生支持 | 需 CSS fullscreen + 复杂 hack | 不支持 | 原生 |
| 翻译在鼠标附近弹出 | 原生支持 (`set_position()`) | 需计算偏移 + CSS | 不支持 | 原生 |
| 状态共享 | 需 Tauri event 桥接 | 原生 (Context/Store) | 原生 | 部分桥接 |
| 内存占用 | 每个窗口 ~30MB WebView | 单 WebView ~50MB | 单 WebView ~50MB | ~100MB (2-3 WebViews) |
| 代码分割 | 每个窗口独立 bundle | 统一 bundle (lazy 分割) | 统一 bundle | 独立 bundle |
| 开发体验 | 需分别调试各窗口 | 统一调试 | 统一调试 | 中 |
| Tauri 窗口管理 | 原生 API (`WebviewWindowBuilder`) | 无需 (单窗口) | 无需 | 原生 |
| 关闭行为 | 各自独立 | 统一 (路由跳转) | Tab 关闭 | 各自独立 |
| 构建配置 | 多 entry points | 单 entry point | 单 entry point | 多 entry points |

### 各方案适用场景

| 方案 | 适用场景 |
|------|----------|
| SPA 路由 | Web 应用、管理后台 (如 YiVad) |
| Tab 布局 | IDE、编辑器类应用 |
| 多窗口 | 桌面工具类应用 (翻译、截图、OCR) |
| 混合模式 | ERP/管理系统 (主窗口 + 弹窗) |

### 淘汰方案分析

- **SPA 路由**：无法满足窗口独立定位需求。翻译窗口需要在鼠标附近弹出，OCR 窗口需要居中，截图窗口需要全屏置顶——单窗口内无法实现三种不同的窗口状态。
- **Tab 布局**：用户同时查看翻译结果 + OCR 结果时，Tab 切换破坏并行查看体验。桌面工具需要同时可见多个功能区。

### 多窗口架构的特性决策

YiPot 的 5 个窗口有不同的窗口属性要求：

| 窗口 | 标签 | 类型 | 装饰 | 置顶 | 调整大小 | 独立定位 |
|------|------|------|------|------|----------|----------|
| 翻译 | `translate` | 普通 | 迷你工具栏 | 是 (`always_on_top`) | 是 | 在鼠标附近 |
| OCR | `recognize` | 普通 | 迷你工具栏 | 否 | 是 | 屏幕居中 |
| 截图 | `screenshot` | 全屏 | 无 (undecorated) | 是 | 否 | 全屏 |
| 设置 | `config` | 普通 | 标准窗口装饰 | 否 | 是 | 屏幕居中 |
| 更新 | `updater` | 普通 | 标准窗口装饰 | 是 | 否 | 屏幕居中 |

### 与 Electron 多窗口的区别

| 方面 | Tauri 多窗口 | Electron BrowserWindow |
|------|-------------|----------------------|
| 窗口创建 | `WebviewWindowBuilder` | `new BrowserWindow()` |
| WebView 实例 | 系统 WebView (轻量) | Chromium 实例 (重) |
| 预创建 | 支持窗口复用 | 支持 hide/show |
| IPC | Tauri event / invoke | ipcMain/ipcRenderer |
| 构建 | 多 entry points (Rsbuild) | 多 entry points (Webpack/Vite) |

## 决策后果与迁移路径

### 正向后果

1. **各窗口最优定位**：翻译在鼠标附近、OCR 居中、截图全屏——窗口属性原生定制
2. **独立生命周期**：关闭 OCR 窗口不影响正在进行的翻译查看
3. **内存效率**：大多数时间仅托盘运行 (~50MB)，需要时打开窗口 (~30MB/窗口)
4. **截图窗口特殊属性**：`transparent + decorations(false) + always_on_top` 组合，SPA 路由无法模拟
5. **窗口复用**：翻译窗口关闭后可以预创建或快速重建（< 200ms）

### 负向后果

1. **跨窗口状态同步**：翻译语言的修改需要 `Tauri event` 通知设置窗口（如果同时打开）
2. **多 bundle 构建**：Rsbuild 需配置 5 个 entry points，增加了构建配置复杂度
3. **调试复杂**：每个窗口有独立的 DevTools，需要分别打开调试
4. **窗口管理代码**：需要额外的窗口管理器 (`window.rs`) 追踪各窗口状态

### 如果将来需要迁移

迁移到混合模式 (SPA 路由 + 弹窗) 的触发条件：
- 用户反馈多窗口混乱（同时打开 3+ 个翻译窗口）
- 移动端/平板适配需求（多窗口体验差）
- 性能压力（多个 WebView 内存 > 200MB）

迁移成本：
- 翻译/OCR 窗口合并到主窗口的 Tab 页面
- 截图窗口保留为全屏弹窗（不可合并）
- 跨窗口 event 改为 Context/Jotai Provider
- 估计工时：1 周

## 后续决策依赖

本 ADR 影响以下后续决策：

| 后续决策 | 影响方式 | ADR 引用 |
|----------|----------|----------|
| 状态管理跨窗口同步 | 多窗口需要 Jotai + Tauri event bridge | [ADR-002: Jotai](./45-prd-ADR-Jotai选择.md) |
| 设置页面内路由 | 设置窗口内部使用 React Router | [S26: 设置页面](./37-prd-设置页面架构.md) |
| 翻译/OCR 窗口交互 | "一键翻译" 需打开新窗口 (Tauri event) | [S24: 翻译窗口](./35-prd-翻译窗口交互.md) |
| Rsbuild 构建配置 | 5 个 HTML entry points | 构建配置 |
| 窗口位置记忆 | 每个窗口独立 localStorage key | [S24: 翻译](./35-prd-翻译窗口交互.md), [S25: OCR](./36-prd-OCR窗口交互.md) |

**不可逆的影响**：
- 所有功能窗口的设计基于独立窗口，UI 组件之间存在物理隔离
- 如果迁移到 SPA 路由，翻译/OCR/Screenshot 组件需要从独立入口合并到统一入口
- 窗口属性的平台差异（macOS/Windows/Linux 装饰行为不同）需要持续处理

## 参考

- [44-prd-ADR-Tauri选择](./44-prd-ADR-Tauri选择.md) — Tauri 框架选择（多窗口依赖 Tauri 的 WebviewWindowBuilder）
- [45-prd-ADR-Jotai选择](./45-prd-ADR-Jotai选择.md) — Jotai 状态管理（跨窗口状态同步）
- [35-prd-翻译窗口交互](./35-prd-翻译窗口交互.md) — 翻译窗口交互细节
- [36-prd-OCR窗口交互](./36-prd-OCR窗口交互.md) — OCR 窗口交互细节
- [37-prd-设置页面架构](./37-prd-设置页面架构.md) — 设置窗口内部路由