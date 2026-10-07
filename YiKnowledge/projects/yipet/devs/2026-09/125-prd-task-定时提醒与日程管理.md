---

doc_type: module
prd_task_id: "YP-09-118"
title: "YP-09-118: 定时提醒与日程管理 — 开发方案"
status: 方案已编写
owner: 陈铭
created: 2026-09-11
updated: 2026-09-23
priority: P2
project: YiPet
estimate_frontend: 0.5
roles: [engineer]
prd_month: "202609"
related_tests: ["125-prd-test-定时提醒与日程管理.md"]
source_prd: "125-功能实现-定时提醒与日程管理.md"

type: task
---

# YP-09-118: 定时提醒与日程管理 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-118 · 状态：方案已编写

## 提醒功能

| 功能 | API |
|------|-----|
| 定时提醒 | `chrome.alarms.create` |
| 通知 | `chrome.notifications.create` |
| 重复提醒 | `periodInMinutes` |
| 日程列表 | chrome.storage 持久化 |

---

## 一、需求背景

来源 PRD：125-功能实现-定时提醒与日程管理.md

### 用户痛点

1. **对话后续事项遗忘**：AI 建议"3 小时后跟进"，用户忘记
1. **每日总结无法自动生成**：用户希望每晚 8 点收到当日对话摘要
1. **提醒创建流程繁琐**：需要手动选择日期时间，而非自然语言输入

## 二、功能实现

| 功能 | 实现方案 |
|------|----------|
| 定时提醒 | `chrome.alarms.create` |
| 通知 | `chrome.notifications.create` |
| 重复提醒 | `periodInMinutes` |
| 日程列表 | chrome.storage 持久化 |
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
| 1 | 每周一上午的站会提醒需要手动重新创建 | P1 | ### 挑战 | 待实施 |
| 2 | SW 休眠后唤醒 | P1 | chrome.alarms 可在 SW 休眠后触发，但需确保回调逻辑正确 | 待实施 |

