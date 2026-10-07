---
doc_type: prd
title: "YP-09-A02: ADR-002 选择 Jotai 而非 Redux/Zustand"
status: 已完成
priority: P2
project: YiPot
project_id: yipot
owner: Pot-App 社区
prd_month: "202609"
prd_task_id: YP-09-A02
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: 需求
issue_type: 架构
roles: [engineer]
tags: [ADR, 状态管理, Jotai, React]
category: 项目/桌面应用/需求
---

# ADR-002: 选择 Jotai 作为状态管理方案

> 状态：已采纳 · 日期：2023 年

## 背景

YiPot 的状态管理需求相对简单——主要是翻译配置、服务实例管理、UI 状态。不需要复杂的状态管理方案。

## 决策

选择 **Jotai**（原子化状态管理）。

## 理由

| 方案 | 优势 | 劣势 |
|------|------|------|
| Redux | 生态最大 | 模板代码多，过度设计 |
| Zustand | 简洁 | store 粒度粗 |
| Jotai | 原子化、按需渲染、与 React 深度集成 | 生态较小 |

**决定因素**：
- Jotai 的原子化模型适合"配置项"这种细粒度状态
- 按需渲染避免不必要的重渲染（翻译结果更新不影响语言选择器）
- API 简洁，学习成本低

## 后果

- 使用 `useConfig` hook 封装 Jotai + tauri-plugin-store 双向同步
- 状态原子化使得配置修改仅触发相关组件更新

## 备选方案详细对比

### Redux Toolkit vs Zustand vs Jotai vs Recoil vs MobX vs Valtio

| 维度 | Jotai (2.x) | Redux Toolkit (2.x) | Zustand (4.x) | Recoil (0.7) | MobX (6.x) | Valtio (1.x) |
|------|------------|-------------------|--------------|-------------|-----------|-------------|
| 包大小 | ~3KB | ~12KB | ~2KB | ~30KB | ~16KB | ~3KB |
| 学习曲线 | 极低 | 中等 | 低 | 中等 | 中等 | 低 |
| API 复杂度 | 3 个核心 API | 5+ API | 1 个核心 API | 4 个核心 API | 5+ API | 2 个核心 API |
| 按需渲染 | 原生 (原子粒度) | 需 selector + shallowEqual | 需 shallow selector | 原生 (原子粒度) | 需要 observer | 原生 (proxy) |
| DevTools | 一般 | 优秀 | 良好 | 实验性 | 良好 | 无 |
| TypeScript | 优秀 | 优秀 | 优秀 | 一般 | 良好 | 优秀 |
| React 集成深度 | 基于 Context | 独立于 React | 独立于 React | 基于 Context | 独立于 React | 独立于 React |
| 异步支持 | 原生 async atom | createAsyncThunk | 手动 | async selector | flow/computed | 手动 |
| SSR 支持 | 良好 | 优秀 | 良好 | 实验性 | 良好 | 一般 |
| 持久化中间件 | jotai-tanstack-query | redux-persist | zustand/middleware | 无官方 | 手动 | 手动 |
| 原子组合 (派生状态) | 原生 `atom(get => ...)` | 需 reselect.createSelector | 无，需手动 | 原生 selector | computed | derive |

### 淘汰方案分析

- **Redux Toolkit**：模板代码仍然偏多。对于 "配置项" 这种细粒度状态，一个 store 文件 100+ 行，而 Jotai 仅需 5 行。过度设计。
- **Recoil**：Meta 维护力度下降，2023 年几乎没有更新，项目长期风险高。
- **MobX**：Proxy-based 响应式与 React 18 Concurrent Mode 存在兼容问题。对于翻译工具的简单状态，使用 class-based store 过于重量。
- **Valtio**：与 Jotai 同作者的 proxy 方案。与本项目 "配置项" 交互模式（大量原子读写）相比，Jotai 的声明式 API 更匹配。

### 最终候选: Zustand vs Jotai

两种方案在体积和 TypeScript 支持上接近，差异在于：

| 对比维度 | Jotai 优势 | Zustand 优势 |
|----------|-----------|-------------|
| 按需渲染 | 原生原子粒度，不需 selector | 需额外 shallow selector |
| 配置项场景 | 天然匹配 "一个配置项 = 一个 atom" | 需要细粒度拆分 store |
| Tauri store 双向同步 | `useConfig` hook 封装简单 | 需手动处理同步 |
| 社区支持 | 较小但活跃 | 更大 |
| DevTools 成熟度 | 一般 | 更好 |
| 团队熟悉度 | 新学习 | 可能有部分熟悉 |

### 关键场景性能对比

| 场景 | Jotai | Zustand |
|------|-------|---------|
| 修改翻译源语言 | 仅 languageSelector 重渲染 | 需 selector 避免全局重渲染 |
| 修改一个服务配置 | 仅该服务 atom 通知 | 需拆分细粒度 store |
| 翻译结果更新 | isolate 于配置状态 | 需合理拆分 store |
| 10 个 atom 同时更新 | batch 内一次提交 | 自动批量 |
| 1000 个翻译服务 | atomFamily O(1) | 手动管理 map store |

Jotai 在最后两个场景（原子同时更新和大数量服务）表现更好。

## 决策后果与迁移路径

### 正向后果

1. **配置项的原子化管理**：每个配置项一个 atom，修改不会扩散到无关组件
2. **`useConfig` hook 封装**：统一 Jotai + tauri-plugin-store 的双向同步逻辑
3. **服务实例管理简化**：`atomFamily` 天然适合管理多个翻译/OCR 服务实例
4. **窗口间状态同步**：Jotai Provider + Tauri event 实现跨窗口共享

### 负向后果

1. **学习曲线**：Jotai 的原子化思维与 Redux 的单 store 思维不同，存在转换成本
2. **DevTools**：不如 Redux DevTools 成熟，调试复杂状态时需要更多 console.log
3. **社区资源**：中英文教程和最佳实践较少

### 如果将来需要迁移

迁移到 Zustand 的触发条件：
- Jotai 长期不维护 / 被废弃
- atomFamily 性能瓶颈（翻译服务 > 100 个）
- 团队更喜欢 Zustand 的简洁 API

迁移成本评估：
- 配置 atom → Zustand store 的分片
- `useConfig` hook 重写为 Zustand middleware
- `atomFamily` → 手动管理的 Map store
- 估计工时：1 周

## 后续决策依赖

本 ADR 影响以下后续决策：

| 后续决策 | 影响方式 | ADR 引用 |
|----------|----------|----------|
| 配置持久化方案 | `useConfig` hook 封装 Jotai + tauri-plugin-store | [S26: 设置页面](./37-prd-设置页面架构.md) |
| 服务插件状态管理 | `atomFamily` 管理服务实例 | [ADR-003: 插件架构](./46-prd-ADR-插件架构.md) |
| 多窗口状态同步 | Jotai Provider 跨窗口共享 (需 Tauri event bridge) | [ADR-004: 多窗口](./47-prd-ADR-多窗口架构.md) |
| 主题切换 | `themeAtom` 驱动全局 CSS 变量 | [S26: General 设置页](./37-prd-设置页面架构.md) |
| 翻译历史/收藏 | Jotai + localStorage 持久化 | [S24: 翻译窗口](./35-prd-翻译窗口交互.md) |

**不可逆的影响**：
- 项目中所有状态管理基于 atom 模式，迁移到单 store 模式 (Redux/Zustand) 需要全局重写
- `useConfig` hook 作为配置读取的唯一入口，后续所有组件必须遵循此约定

## 参考

- [44-prd-ADR-Tauri选择](./44-prd-ADR-Tauri选择.md) — Tauri 框架选择（Jotai 在 Tauri 环境中的适配）
- [46-prd-ADR-插件架构](./46-prd-ADR-插件架构.md) — 插件架构（atomFamily 管理插件实例）
- [37-prd-设置页面架构](./37-prd-设置页面架构.md) — 设置页面（useConfig hook 的使用场景）