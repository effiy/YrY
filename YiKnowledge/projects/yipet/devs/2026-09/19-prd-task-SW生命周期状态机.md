---

doc_type: module
prd_task_id: "YP-09-12"
title: "YP-09-12: Service Worker 生命周期状态机 — 开发方案"
status: 方案已编写
priority: P0
owner: 陈铭
created: 2026-09-11
updated: 2026-09-23
project: YiPet
roles: [engineer]
prd_month: "202609"
related_tests: ["19-prd-test-SW生命周期状态机.md"]
source_prd: "19-架构设计-SW生命周期状态机.md"

type: task
---

# YP-09-12: Service Worker 生命周期状态机 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-12 · 优先级：P0

---

<a id="sec-1"></a>
## 一、方案概述

SW 完整生命周期状态机：install → activate → running → idle → terminated，每阶段有明确的状态持久化和恢复策略。

### 状态机

```typescript
type SWState = "installing" | "activating" | "running" | "idle" | "terminated";

class SWLifecycle {
  private state: SWState = "installing";

  onInstall() { this.transition("activating"); }
  onActivate() { this.transition("running"); this.startHeartbeat(); }
  onIdle() { this.transition("idle"); }
  onTerminate() { this.persistState(); this.transition("terminated"); }
  onWakeUp() { this.restoreState(); this.transition("running"); }
}
```

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

来源 PRD：19-架构设计-SW生命周期状态机.md

### 用户痛点

1. **SW 状态快照（checkpoint）仅包含部分字段——`pendingMessages` 的精确队列内容未持久化**：0.5
1. **`onTerminate()` 无 Chrome 事件触发——通过 30s 定时 checkpoint 间接实现，存在最长 30s 的数据丢失窗口**：0.5
1. **SW 状态机的 `phase` 字段仅用于调试日志——未用于决策逻辑（如"仅在 active 阶段处理消息"）**：0.25

## 二、功能实现

| 功能 | 实现方案 |
|------|----------|
| "activating" | "running" |
| # | 缺口 |
| — | 无 |
| — | ### 技术债 |
| 技术债 | 优先级 |
| 说明 | 状态 |
| — | 无 |
| — | — |

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
| 1 | SW 启动→终止的转换时机不可预测（浏览器控制） | P1 | 状态恢复逻辑分散 | 待实施 |
| 2 | 多个 Tab 同时唤醒 SW 时的竞态条件 | P1 | 心跳 Timer 重复注册 | 待实施 |

