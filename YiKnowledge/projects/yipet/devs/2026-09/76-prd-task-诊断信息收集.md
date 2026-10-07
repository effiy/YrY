---

doc_type: module
prd_task_id: "YP-09-69"
title: "YP-09-69: 诊断信息收集 — 开发方案"
status: 方案已编写
owner: 陈铭
created: 2026-09-11
updated: 2026-09-23
priority: P2
project: YiPet
roles: [engineer]
prd_month: "202609"
related_tests: ["76-prd-test-诊断信息收集.md"]
source_prd: "76-架构设计-诊断信息收集.md"

type: task
---

# YP-09-69: 诊断信息收集 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-69

## 诊断信息

| 信息 | 来源 |
|------|------|
| Chrome 版本 | `navigator.userAgent` |
| 扩展版本 | `chrome.runtime.getManifest().version` |
| Storage 用量 | `chrome.storage.local.getBytesInUse` |
| SW 状态 | `chrome.runtime.getBackgroundPage` |
| 错误日志 | `window.__YIPET_ERRORS__` |

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

来源 PRD：76-架构设计-诊断信息收集.md

### 用户痛点

1. **Bug 诊断效率低**：每个 Bug 平均 3-5 轮沟通
1. **开发者无法复现 Bug**：缺少环境上下文
1. **用户隐私泄露风险**：截图/日志可能含敏感信息

## 二、功能实现

| 功能 | 实现方案 |
|------|----------|
| 信息 | 来源 |
| Chrome 版本 | `navigator.userAgent` |
| 扩展版本 | `chrome.runtime.getManifest().version` |
| Storage 用量 | `chrome.storage.local.getBytesInUse` |
| SW 状态 | `chrome.runtime.getBackgroundPage` |
| 错误日志 | `window.__YIPET_ERRORS__` |
| # | 缺口 |
| — | 无 |

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
| 1 | 缺少其他扩展信息 | P1 | ### 挑战 | 待实施 |
| 2 | 信息分散在不同位置 | P1 | 每次 Bug 报告 | 待实施 |

