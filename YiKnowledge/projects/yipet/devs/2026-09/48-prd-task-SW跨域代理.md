---

doc_type: module
prd_task_id: "YP-09-41"
title: "YP-09-41: Service Worker 跨域代理 — 开发方案"
status: 方案已编写
owner: 陈铭
created: 2026-09-11
updated: 2026-09-23
priority: P2
project: YiPet
roles: [engineer]
prd_month: "202609"
related_tests: ["48-prd-test-SW跨域代理.md"]
source_prd: "48-架构设计-SW跨域代理.md"

type: task
---

# YP-09-41: Service Worker 跨域代理 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-41 · 状态：方案已编写

## SW 代理

SW 作为网络代理层：拦截请求→添加认证→转发→返回。

| 功能 | 说明 |
|------|------|
| 请求拦截 | `fetch` 事件监听 |
| Token 注入 | 自动添加 X-Token |
| 缓存策略 | Cache API 缓存 GET 请求 |
| CORS 处理 | SW 层解决跨域 |

---

## 一、需求背景

来源 PRD：48-架构设计-SW跨域代理.md

### 用户痛点

1. **严格 CSP 页面阻止向 YiAi 发送请求**：高
1. **直接请求和代理请求无统一策略**：中
1. **实现 SW 端 API 代理 (`api-proxy.ts`)**：SW 收到代理消息 → 转发到 YiAi → 返回响应

## 二、功能实现

| 功能 | 实现方案 |
|------|----------|
| 请求拦截 | `fetch` 事件监听 |
| Token 注入 | 自动添加 X-Token |
| 缓存策略 | Cache API 缓存 GET 请求 |
| CORS 处理 | SW 层解决跨域 |
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
| 1 | 严格 CSP 页面阻止向 YiAi 发送请求 | P1 | 这些页面中聊天功能完全不可用 | 待实施 |
| 2 | Content Script 的 `fetch` 受页面 CSP 限制 | P1 | 部分 API 调用失败 | 待实施 |

