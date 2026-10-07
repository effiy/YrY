---

doc_type: module
prd_task_id: "YP-09-10"
title: "YP-09-10: Content Script 性能剖析与内存管理 — 开发方案"
status: 方案已编写
priority: P1
owner: 陈铭
created: 2026-09-11
updated: 2026-09-23
project: YiPet
roles: [engineer]
prd_month: "202609"
related_tests: ["17-prd-test-ContentScript性能剖析与内存管理.md"]
source_prd: "17-架构设计-ContentScript性能剖析与内存管理.md"

type: task
---

# YP-09-10: Content Script 性能剖析与内存管理 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-10 · 优先级：P1

---

<a id="sec-1"></a>
## 一、方案概述

Content Script 内存泄漏追踪、事件监听器清理、MutationObserver 生命周期管理。

### 内存管理

| 项目 | 措施 |
|------|------|
| Event Listener | `onUnmounted` 中 `removeEventListener` |
| MutationObserver | `observer.disconnect()` 在页面卸载时 |
| 定时器 | `clearInterval/clearTimeout` 清理 |
| DOM 引用 | 避免闭包持有已移除 DOM 节点 |

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

来源 PRD：17-架构设计-ContentScript性能剖析与内存管理.md

### 用户痛点

1. **无性能预算——不知道 Content Script 消耗了多少 CPU/内存**：
1. **长时间运行后的性能退化无感知**：
1. **`requestIdleCallback` 回调在低端设备上可能饥饿**：---

<a id="sec-1"></a>
## 一、现状分析

### 1.1 Content Script 资源消耗模型

```
Content Script 注入到宿主页面
  │
  ├── 常驻资源（整个页面生命周期）
  │   ├── MutationObserver × 1         (~1KB)
  │   ├── history.pushState 包装 × 2    (~1KB)
  │   ├── 事件监听器 × 4                (~2KB)
  │   ├── #yipet-overlay DOM 子树       (~5-20KB，取决于宠物复杂度)
  │   └── window.YiPet API 命名空间     (~1KB)
  │
  ├── 条件资源（用户打开聊天窗口时）
  │   ├── Vue 3.5 应用实例              (~100-200KB)
  │   ├── Pinia Store                   (~50-100KB)
  │   ├── 聊天消息 DOM                  (~10-100KB，取决于消息数量)
  │   ├── Element Plus 组件             (~50-100KB)
  │   └── marked Markdown 渲染          (~10-50KB)
  │
  └── 临时资源（流式聊天期间）
      ├── SSE EventSource / fetch stream (~5-20KB)
      ├── 流式 chunk 缓冲区              (~10-50KB)
      └── RAG 来源数据                   (~5-20KB)
```

### 1.2 性能预算基线

## 二、功能实现

| 功能 | 实现方案 |
|------|----------|
| 项目 | 措施 |
| Event Listener | `onUnmounted` 中 `removeEventListener` |
| MutationObserver | `observer.disconnect()` 在页面卸载时 |
| 定时器 | `clearInterval/clearTimeout` 清理 |
| DOM 引用 | 避免闭包持有已移除 DOM 节点 |
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
| 1 | Content Script 同步执行时间 | P1 | < 50ms/次 | 待实施 |
| 2 | Performance Observer | P1 | 高频 DOM 变化页面性能劣化 | 待实施 |

