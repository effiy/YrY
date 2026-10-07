---

doc_type: module
prd_task_id: "YP-09-77"
title: "YP-09-77: 插件化钩子系统 — 开发方案"
status: 方案已编写
owner: 陈铭
created: 2026-09-11
updated: 2026-09-23
priority: P2
project: YiPet
roles: [engineer]
prd_month: "202609"
related_tests: ["84-prd-test-插件化钩子系统.md"]
source_prd: "84-架构设计-插件化钩子系统.md"

type: task
---

# YP-09-77: 插件化钩子系统 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-77 · 状态：方案已编写

## 生命周期钩子

| 钩子 | 时机 |
|------|------|
| onInject | Content Script 注入完成 |
| onChatOpen | 聊天窗口打开 |
| onMessageSend | 消息发送前 |
| onMessageReceive | AI 回复到达 |
| onPetClick | 宠物被点击 |

---

## 一、需求背景

来源 PRD：84-架构设计-插件化钩子系统.md

### 用户痛点

1. **新增功能需修改 bootstrap**：每次添加新模块
1. **模块间初始化顺序不可控**：模块 A 依赖模块 B
1. **无法按页面类型加载不同模块**：不同页面需要不同功能集

## 二、功能实现

| 功能 | 实现方案 |
|------|----------|
| 钩子 | 时机 |
| onInject | Content Script 注入完成 |
| onChatOpen | 聊天窗口打开 |
| onMessageSend | 消息发送前 |
| onMessageReceive | AI 回复到达 |
| onPetClick | 宠物被点击 |
| 步骤 | 任务 |
| 1 | Composable 核心逻辑开发与单元测试 |

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
| 1 | 新增功能需修改核心 | P1 | 硬编码 bootstrap | 待实施 |
| 2 | EventEmitter | P1 | 自定义 HookSystem | 待实施 |

