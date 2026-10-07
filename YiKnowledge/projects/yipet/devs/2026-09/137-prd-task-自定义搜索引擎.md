---

doc_type: module
prd_task_id: "YP-09-130"
title: "YP-09-130: 自定义搜索引擎 — 开发方案"
status: 方案已编写
owner: 陈铭
created: 2026-09-11
updated: 2026-09-23
priority: P2
project: YiPet
estimate_frontend: 0.5
roles: [engineer]
prd_month: "202609"
related_tests: ["137-prd-test-自定义搜索引擎.md"]
source_prd: "137-功能实现-自定义搜索引擎.md"

type: task
---

# YP-09-130: 自定义搜索引擎 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-130 · 状态：方案已编写

## 搜索配置

| 引擎 | URL 模板 |
|------|---------|
| Google | `https://google.com/search?q=%s` |
| GitHub | `https://github.com/search?q=%s` |
| StackOverflow | `https://stackoverflow.com/search?q=%s` |
| 自定义 | 用户添加任意 URL |

---

## 一、需求背景

来源 PRD：137-功能实现-自定义搜索引擎.md

### 用户痛点

1. **无法添加自定义搜索引擎，频繁手动访问**：开发者每天手动打开 GitHub 搜索代码 20+ 次，每次输入 `github.com/search?q=...`
1. **搜索结果碎片化，跨引擎切换低效**：解决一个技术问题需要分别在 Google、Stack Overflow、GitHub 搜索，打开 10+ 标签页
1. **特定网站上搜索体验差**：在 Rust 文档站搜索 `Vec`，地址栏默认用 Google 搜索 "Vec"，返回一堆无关结果

## 二、功能实现

| 功能 | 实现方案 |
|------|----------|
| 引擎 | URL 模板 |
| Google | `https://google.com/search?q=%s` |
| GitHub | `https://github.com/search?q=%s` |
| StackOverflow | `https://stackoverflow.com/search?q=%s` |
| 自定义 | 用户添加任意 URL |
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
| 1 | 用户搜索结果中有 20 个链接，需要逐个打开查看内容才能判断是否相关 | P1 | ### 挑战 | 待实施 |
| 2 | OpenSearch 描述文件解析 | P1 | 不同网站的 OpenSearch 描述文件格式不完全一致，需兼容解析 | 待实施 |

