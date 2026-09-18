---
doc_type: module
prd_task_id: "YP-09-12"
title: "YP-09-12: Service Worker 生命周期状态机 — 开发方案"
status: 已完成
priority: P0
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiPet
prd_month: "202609"
source_prd: "19-架构设计-SW生命周期状态机.md"
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
