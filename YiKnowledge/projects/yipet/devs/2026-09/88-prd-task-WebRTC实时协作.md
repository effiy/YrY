---

doc_type: module
prd_task_id: "YP-09-81"
title: "YP-09-81: WebRTC 实时协作 — 开发方案"
status: 方案已编写
owner: 陈铭
created: 2026-09-11
updated: 2026-09-23
priority: P2
project: YiPet
roles: [engineer]
prd_month: "202609"
related_tests: ["88-prd-test-WebRTC实时协作.md"]
source_prd: "88-架构设计-WebRTC实时协作.md"

type: task
---

# YP-09-81: WebRTC 实时协作 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-81 · 状态：方案已编写

## P2P 协作

WebRTC DataChannel 实现点对点会话共享。

| 功能 | API |
|------|-----|
| 信令 | YiAi WebSocket |
| 数据通道 | RTCDataChannel |
| 光标同步 | 实时位置广播 |
| 编辑冲突 | CRDT/OT 算法 |

---

## 一、需求背景

来源 PRD：88-架构设计-WebRTC实时协作.md

### 用户痛点

1. **设计协作消息协议**：协议评审通过
1. **实现 WebRTC 管理器**：P2P 连接建立成功
1. **实现远程渲染器**：远程宠物动画正确渲染

## 二、功能实现

| 功能 | 实现方案 |
|------|----------|
| 信令 | YiAi WebSocket |
| 数据通道 | RTCDataChannel |
| 光标同步 | 实时位置广播 |
| 编辑冲突 | CRDT/OT 算法 |
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
| 1 | `src/content/ipc/relay.ts` | P1 | ISOLATED ↔ MAIN 世界消息中继 | 待实施 |
| 2 | `src/background/` | P1 | Service Worker 命令分发 | 待实施 |

