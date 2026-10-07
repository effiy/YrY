---

doc_type: module
prd_task_id: "YP-09-13"
title: "YP-09-13: 扩展构建优化与代码分割 — 开发方案"
status: 方案已编写
priority: P2
owner: 陈铭
created: 2026-09-11
updated: 2026-09-23
project: YiPet
roles: [engineer]
prd_month: "202609"
related_tests: ["20-prd-test-扩展构建优化与代码分割.md"]
source_prd: "20-架构设计-扩展构建优化与代码分割.md"

type: task
---

# YP-09-13: 扩展构建优化与代码分割 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-13 · 优先级：P2

---

<a id="sec-1"></a>
## 一、方案概述

Tree Shaking 优化 + 动态导入 + vendor chunk 分离。

### 优化项

| 优化 | 预期收益 |
|------|---------|
| Element Plus 按需导入 | -200KB |
| marked/DOMPurify 动态导入 | 首屏 -80KB |
| Vendor chunk 分离 | 缓存命中率 ↑ |
| CSS 提取 | 减少 JS 体积 |

---

## 已知缺口与技术债

### 功能缺口

| # | 缺口 | 影响 | 建议 |
|---|------|------|------|
| — | 无 | — | — |

### 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------|
| — | 无 | — | — | — | — |

---

## 一、需求背景

来源 PRD：20-架构设计-扩展构建优化与代码分割.md

### 用户痛点

1. **`vite-plugin-size-budget` 为自实现插件——缺少 `gzip` 后体积检查（仅检查原始体积）**：0.25
1. **CDN external 依赖列表硬编码在 `vite.config.ts` 中——与 `manifest.json` 的 `content_security_policy` 和 CDN 实际可用性不同步**：0.25
1. **`popup.js` 和 `chat.js` 各自独立打包 Vue runtime——未共享 vendor chunk**：0.25

## 二、功能实现

| 功能 | 实现方案 |
|------|----------|
| 优化 | 预期收益 |
| Element Plus 按需导入 | -200KB |
| marked/DOMPurify 动态导入 | 首屏 -80KB |
| Vendor chunk 分离 | 缓存命中率 ↑ |
| CSS 提取 | 减少 JS 体积 |
| # | 缺口 |
| — | 无 |
| — | ### 技术债 |

## 三、关键技术决策

| # | 决策 | 理由 |
|---|------|------|
| 1 | 纯前端浏览器 API 实现 | 无需服务端依赖，响应 < 50ms，离线可用 |
| 2 | 独立 Vue 3 Composable 封装 | 单一职责，可复用于 Popup + Side Panel |

## 四、实施步骤

| 步骤 | 任务 | 预估 |
|------|------|------|
| 1 | Composable 核心逻辑 + 状态管理 | 0.1d |
| 2 | Vue 3 UI 组件开发（含错误/空/加载状态） | 0.1d |
| 3 | 边界场景处理 + 集成测试 | 0.1d |

**总计：0.3d**

## 五、完成记录

> **状态**：方案已编写 · **日期**：2026-09-23 · 实施排期待定

## 六、技术债与缺口

| # | 项目 | 优先级 | 说明 | 状态 |
|---|------|--------|------|------|
| 1 | Vue 3.5 + Element Plus 全量打包 | P1 | `chat.bundle.js` > 500KB (gzip ~150KB) | 待实施 |
| 2 | Content Script 打包了聊天窗口组件 | P1 | content script 仅需宠物 overlay——不应包含聊天代码 | 待实施 |

