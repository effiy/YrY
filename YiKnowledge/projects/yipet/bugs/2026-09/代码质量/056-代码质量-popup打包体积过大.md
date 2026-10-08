---
title: Popup 构建产物 1MB 未做代码分割
tags: [yipet, code-quality, build]
category: projects/yipet/bugs/code-quality
created: 2026-09-09
updated: 2026-09-10
source: YiPet
type: bug
status: resolved
severity: minor
priority: p2
---

# Popup 构建产物 1MB 未做代码分割

## 现象

YiPet popup 构建产物 `popup.js` 达到 **1008KB**（约 1MB），对于一个 Chrome 扩展弹窗（通常只有几个按钮和一个预览）来说是异常大的。

Popup 入口仅包含 6 个小组件（AppHeader、PetPreview、ColorPicker、RolePicker、AppFooter、AboutCard），但构建打包了：
- 完整的 Element Plus 组件库（`el-select`、`el-collapse` 等）
- Vue 3 运行时
- Pinia 状态管理
- 完整的类型定义和工具函数

## 根因分析

- Rsbuild 构建配置未对 popup 入口做代码分割（`splitChunks`）
- Element Plus 的 `unplugin-vue-components` 自动导入虽然减少了手动导入，但按需加载的 tree-shaking 可能不完全
- Popup 和 Chat 入口共享相同的 Rsbuild 基础配置，但 popup 不需要 Chat 的依赖

## 涉及文件

- `rsbuild.config.ts` — Popup 构建入口配置
- `package.json` — 依赖管理
- `dist/assets/popup.js` — 构建产物

## 修复方案

1. 为 popup 单独配置 `splitChunks`，将 Element Plus 拆到独立 chunk
2. 使用 `manualChunks` 手动拆分 vendor 代码
3. 检查 Element Plus 的 tree-shaking 是否正确工作
4. 考虑对 popup 使用更轻量的 UI 方案（或仅使用需要的 Element Plus 组件的手动导入）
5. 启用 Rsbuild 的 `performance.removeConsole` 和 minify 选项


## 影响范围

**影响模块**：Popup 构建产物（`popup.js` 约 1MB）。
**影响用户**：弹窗加载慢，影响用户首次交互体验。大体积的弹窗在每次点击扩展图标时都会重新加载。
**影响范围**：所有用户的 Popup 弹窗打开速度。
## 预防措施

| 层面 | 措施 | 责任人 |
|------|------|--------|
| 构建 | 为 Popup 单独配置 `splitChunks`，将 Element Plus 拆到独立 chunk | DevOps |
| 构建 | 设置体积预算（popup < 200KB、chat < 500KB），CI 中检查 | DevOps |
| 代码 | 检查 Element Plus tree-shaking 是否正确工作 | 开发者 |
| 架构 | 考虑对 Popup 使用更轻量的 UI（或仅引入需要的组件） | 架构师 |


## 经验教训

Chrome 扩展的 Popup 弹窗应该在 100ms 内打开。1MB 的 JavaScript bundle 首屏加载可能需要数百毫秒，用户体验明显变差。对于只包含几个控件的弹窗，Element Plus 的全量引入是严重的过度使用。
