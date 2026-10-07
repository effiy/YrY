---

doc_type: module
prd_task_id: "YP-09-111"
title: "YP-09-111: 多窗口状态同步 — 开发方案"
status: 方案已编写
owner: 陈铭
created: 2026-09-11
updated: 2026-09-23
priority: P2
project: YiPet
estimate_frontend: 0.5
roles: [engineer]
prd_month: "202609"
related_tests: ["118-prd-test-多窗口状态同步.md"]
source_prd: "118-功能实现-多窗口状态同步.md"

type: task
---

# YP-09-111: 多窗口状态同步 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-111

## 同步机制

`chrome.storage.onChanged` + `BroadcastChannel` 双通道。

| 状态 | 同步通道 |
|------|---------|
| 皮肤配置 | `chrome.storage.onChanged` |
| 会话消息 | `chrome.storage.onChanged` |
| Pet 显隐 | `chrome.storage.onChanged` |
| 实时状态 | `BroadcastChannel` |

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

来源 PRD：118-功能实现-多窗口状态同步.md

### 用户痛点

1. **多标签页状态不一致**：用户打开 3 个标签页，宠物状态各不相同
1. **会话无法跨标签页连续**：在标签页 A 聊天，切换到标签页 B 后会话丢失
1. **多标签页资源竞争**：多个标签页同时调用 AI，浪费 token

## 二、功能实现

| 功能 | 实现方案 |
|------|----------|
| 状态 | 同步通道 |
| 皮肤配置 | `chrome.storage.onChanged` |
| 会话消息 | `chrome.storage.onChanged` |
| Pet 显隐 | `chrome.storage.onChanged` |
| 实时状态 | `BroadcastChannel` |
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
| 1 | 用户不知道哪些标签页有宠物 | P1 | ### 挑战 | 待实施 |
| 2 | BroadcastChannel 兼容性 | P1 | 部分浏览器不支持 BroadcastChannel API，需降级方案 | 待实施 |

