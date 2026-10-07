---

doc_type: module
prd_task_id: "YP-09-21"
title: "YP-09-21: 动画渲染 GPU 加速 — 开发方案"
status: 方案已编写
owner: 陈铭
created: 2026-09-11
updated: 2026-09-23
priority: P2
project: YiPet
roles: [engineer]
prd_month: "202609"
related_tests: ["28-prd-test-动画渲染GPU加速.md"]
source_prd: "28-架构设计-动画渲染GPU加速.md"

type: task
---

# YP-09-21: 动画渲染 GPU 加速 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-21

## GPU 加速

| 策略 | CSS |
|------|-----|
| transform | `transform: translateZ(0)` |
| will-change | `will-change: transform, opacity` |
| Composite 层 | 仅 animate transform/opacity |
| 避免 Layout | 不用 width/height/top/left 动画 |

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

来源 PRD：28-架构设计-动画渲染GPU加速.md

### 用户痛点

1. **实现 AnimationScheduler 核心类**：单元测试（调度、取消、并发控制）
1. **CSS 动画迁移到 GPU 属性**：Chrome DevTools Rendering 面板验证
1. **拖拽处理改造**：拖拽流畅度对比

## 二、功能实现

| 功能 | 实现方案 |
|------|----------|
| 策略 | CSS |
| transform | `transform: translateZ(0)` |
| will-change | `will-change: transform, opacity` |
| Composite 层 | 仅 animate transform/opacity |
| 避免 Layout | 不用 width/height/top/left 动画 |
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
| 1 | 宠物动画期间页面滚动不流畅 | P1 | 20-30%（低端设备） | 待实施 |
| 2 | CSS `@keyframes` | P1 | `width`/`height` | 待实施 |

