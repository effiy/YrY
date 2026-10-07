---

doc_type: module
prd_task_id: "YP-09-94"
title: "YP-09-94: DevTools 调试面板 — 开发方案"
status: 方案已编写
priority: P3
owner: 陈铭
created: 2026-09-11
updated: 2026-09-23
project: YiPet
estimate_frontend: 0.5
roles: [engineer]
prd_month: "202609"
related_tests: ["101-prd-test-DevTools调试面板.md"]
source_prd: "101-基础设施-DevTools调试面板.md"

type: task
---

# YP-09-94: DevTools 调试面板 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-94 · 状态：方案已编写

---

<a id="sec-1"></a>
## 一、方案概述

`window.YiPet.help()` 调试面板：扩展状态/CDN 加载/Storage 数据/IPC 消息日志。

### 调试命令

| 命令 | 功能 |
|------|------|
| `YiPet.help()` | 显示调试面板 |
| `YiPet.status()` | 扩展状态概览 |
| `YiPet.storage()` | chrome.storage 数据查看 |
| `YiPet.ipc()` | IPC 消息日志 |

---

## 一、需求背景

来源 PRD：101-基础设施-DevTools调试面板.md

### 用户痛点

1. **调试效率低下**：排查一个跨上下文 bug 需要 30 分钟切换面板
1. **新开发者上手困难**：不理解扩展的运行时状态和数据流
1. **性能问题无法量化**：宠物注入慢了不知道是哪个环节

## 二、功能实现

| 功能 | 实现方案 |
|------|----------|
| 命令 | 功能 |
| `YiPet.help()` | 显示调试面板 |
| `YiPet.status()` | 扩展状态概览 |
| `YiPet.storage()` | chrome.storage 数据查看 |
| `YiPet.ipc()` | IPC 消息日志 |
| 步骤 | 任务 |
| 1 | Composable 核心逻辑开发与单元测试 |
| 2 | UI 组件开发 + Popup/Side Panel 集成 |

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
| 1 | SSE 消息散落在控制台，无法过滤和搜索 | P1 | ### 挑战 | 待实施 |
| 2 | Content Script 的 console.log | P1 | 无法查看 SW 日志 | 待实施 |

