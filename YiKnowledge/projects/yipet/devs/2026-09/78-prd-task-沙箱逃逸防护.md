---

doc_type: module
prd_task_id: "YP-09-71"
title: "YP-09-71: 沙箱逃逸防护 — 开发方案"
status: 方案已编写
owner: 陈铭
created: 2026-09-11
updated: 2026-09-23
priority: P2
project: YiPet
roles: [engineer]
prd_month: "202609"
related_tests: ["78-prd-test-沙箱逃逸防护.md"]
source_prd: "78-架构设计-沙箱逃逸防护.md"

type: task
---

# YP-09-71: 沙箱逃逸防护 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-71 · 状态：方案已编写

## 防护层

| 层级 | 防护 |
|------|------|
| iframe sandbox | `sandbox="allow-scripts"` |
| CSP | script-src 'self' |
| Origin 校验 | postMessage origin 检查 |
| 超时限制 | 5s 强制终止 |
| 内存限制 | 50MB heap 上限 |

---

## 一、需求背景

来源 PRD：78-架构设计-沙箱逃逸防护.md

### 用户痛点

1. **用户输入注入 `new Function`**：通过聊天消息注入恶意代码
1. **宿主页面数据污染扩展世界**：通过 DOM 属性读取恶意数据
1. **第三方依赖引入 eval**：依赖更新引入新风险

## 二、功能实现

| 功能 | 实现方案 |
|------|----------|
| 层级 | 防护 |
| iframe sandbox | `sandbox="allow-scripts"` |
| CSP | script-src 'self' |
| Origin 校验 | postMessage origin 检查 |
| 超时限制 | 5s 强制终止 |
| 内存限制 | 50MB heap 上限 |
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
| 1 | 未净化 Markdown 输入 | P1 | ### 挑战 | 待实施 |
| 2 | 动态代码执行点难发现 | P1 | 深层调用链中的 `eval` 不易追踪 | 待实施 |

