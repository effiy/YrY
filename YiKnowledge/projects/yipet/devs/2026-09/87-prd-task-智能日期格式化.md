---

doc_type: module
prd_task_id: "YP-09-80"
title: "YP-09-80: 智能日期格式化 — 开发方案"
status: 方案已编写
owner: 陈铭
created: 2026-09-11
updated: 2026-09-23
priority: P2
project: YiPet
roles: [engineer]
prd_month: "202609"
related_tests: ["87-prd-test-智能日期格式化.md"]
source_prd: "87-架构设计-智能日期格式化.md"

type: task
---

# YP-09-80: 智能日期格式化 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-80

## Intl API

| 格式 | API |
|------|-----|
| 相对时间 | `Intl.RelativeTimeFormat` |
| 日期 | `Intl.DateTimeFormat` |
| 数字 | `Intl.NumberFormat` |
| 时区转换 | `toLocaleString({timeZone})` |

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

来源 PRD：87-架构设计-智能日期格式化.md

### 用户痛点

1. **创建 `src/shared/utils/time.ts`**：单元测试覆盖所有阈值和语言
1. **编写单元测试**：16 个测试用例全部通过
1. **改造 MessageBubble.vue**：消息列表时间显示正确

## 二、功能实现

| 功能 | 实现方案 |
|------|----------|
| 格式 | API |
| 相对时间 | `Intl.RelativeTimeFormat` |
| 日期 | `Intl.DateTimeFormat` |
| 数字 | `Intl.NumberFormat` |
| 时区转换 | `toLocaleString({timeZone})` |
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
| 1 | `src/chat/components/MessageBubble/MessageBubble.v | P1 | `new Date(ts).toLocaleString()` | 待实施 |
| 2 | `src/chat/components/ChatSidebar.vue` | P1 | `new Date(ts).toLocaleDateString()` | 待实施 |

