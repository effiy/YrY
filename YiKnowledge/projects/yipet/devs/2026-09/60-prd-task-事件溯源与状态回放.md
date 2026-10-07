---

doc_type: module
prd_task_id: "YP-09-53"
title: "YP-09-53: 事件溯源与状态回放 — 开发方案"
status: 方案已编写
owner: 陈铭
created: 2026-09-11
updated: 2026-09-23
priority: P2
project: YiPet
roles: [engineer]
prd_month: "202609"
related_tests: ["60-prd-test-事件溯源与状态回放.md"]
source_prd: "60-架构设计-事件溯源与状态回放.md"

type: task
---

# YP-09-53: 事件溯源与状态回放 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-53 · 状态：方案已编写

## 事件溯源

记录所有状态变更事件 → 可回放到任意时间点。

| 事件类型 | 数据 |
|---------|------|
| message.send | {role, content, timestamp} |
| session.create | {id, title, timestamp} |
| pet.configChange | {role, color, timestamp} |

---

## 一、需求背景

来源 PRD：60-架构设计-事件溯源与状态回放.md

### 用户痛点

1. **状态异常后无法恢复——用户只能刷新页面**：中
1. **多来源状态变更（用户操作、SPA 路由、SW 消息、Popup 控制）无统一日志**：中
1. **无状态快照——无法快速跳到某个时间点的状态**：中

## 二、功能实现

| 功能 | 实现方案 |
|------|----------|
| 事件类型 | 数据 |
| message.send | {role, content, timestamp} |
| session.create | {id, title, timestamp} |
| pet.configChange | {role, color, timestamp} |
| 步骤 | 任务 |
| 1 | Composable 核心逻辑开发与单元测试 |
| 2 | UI 组件开发 + Popup/Side Panel 集成 |
| 3 | 边界场景处理 + 集成验证 |

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
| 1 | 用户报告 Bug 时无法复现——不知道用户执行了什么操作序列 | P1 | 排查效率低，大量 Bug 标记为"无法复现" | 待实施 |
| 2 | 状态异常后无法恢复——用户只能刷新页面 | P1 | 用户丢失当前会话状态 | 待实施 |

