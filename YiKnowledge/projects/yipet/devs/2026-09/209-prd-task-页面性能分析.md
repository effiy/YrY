---

doc_type: module
prd_task_id: "YP-09-204"
title: "YP-09-204: 页面性能分析 — 开发方案"
status: 方案已编写
owner: 陈铭
created: 2026-09-11
updated: 2026-09-23
priority: P2
project: YiPet
estimate_frontend: 0.3
roles: [engineer]
prd_month: "202609"
related_tests: ["209-prd-test-页面性能分析.md"]
source_prd: "209-功能实现-页面性能分析.md"

type: task
---

# YP-09-204: 页面性能分析 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-204 · 状态：方案已编写

## 性能指标

| 指标 | API |
|------|-----|
| FCP | PerformanceObserver |
| LCP | Largest Contentful Paint |
| TBT | Total Blocking Time |
| CLS | Cumulative Layout Shift |
| 资源瀑布图 | performance.getEntries |

---

## 一、需求背景

来源 PRD：209-功能实现-页面性能分析.md

### 用户痛点

1. **性能分析工具切换成本高**：DevTools → Lighthouse → PageSpeed → 来回切换
1. **Core Web Vitals 不可见**：不知道当前页面的 LCP/INP/CLS 值是多少
1. **资源瀑布图难以解读**：200 个请求的瀑布图——难以找到慢请求

## 二、功能实现

| 功能 | 实现方案 |
|------|----------|
| 指标 | API |
| FCP | PerformanceObserver |
| LCP | Largest Contentful Paint |
| TBT | Total Blocking Time |
| CLS | Cumulative Layout Shift |
| 资源瀑布图 | performance.getEntries |
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
| 1 | 截图多个面板——粘贴到聊天窗口 | P1 | ### 挑战 | 待实施 |
| 2 | Core Web Vitals 延迟获取 | P1 | LCP/INP/CLS 需要页面完全加载和用户交互后才能测量——可能晚于页面打开 10 秒 | 待实施 |

