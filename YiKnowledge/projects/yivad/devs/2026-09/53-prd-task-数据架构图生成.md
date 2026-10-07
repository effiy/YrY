---
prd_task_id: "YV-09-114"
title: "YV-09-114: 数据架构图生成 — 开发方案"
status: 待开始
priority: P3
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiVad
prd_month: "202609"
source_prd: "53-prd-数据架构图生成.md"
type: task
category: projects/yivad/devs
source: YiVad
tags: [yivad, dev, 数据架构图生成]
roles: [engineer]
benefit: "开发方案：task-数据架构图生成"
lifecycle: active
---

# YV-09-114: 数据架构图生成 — 开发方案

> 需求编号：YV-09-114 · 状态：待开始

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

<a id="sec-1"></a>
## 一、方案概述

基于 MongoDB 集合和关联关系自动生成数据架构图（Mermaid ER 图或可视化图表）。

### 数据源

从 YiAi 的集合 Schema 和 Repository 关系推断实体间的引用关系。

> 低优先级。


### 架构方案

**技术路线**：独立页面 (`/data-arch`)，从数据库 Schema 自动生成 ER 图/架构图

**数据模型**：
```
MongoDB 集合结构通过 YiAi 新端点获取；图形渲染使用 Mermaid.js 或 D3.js
```

**组件树**：
```
DataArchPage.vue (即时时渲染) + SchemaSelector.vue（选择集合/关系）
```

**关键决策**：
Mermaid.js 渲染 ER 图更简单（声明式），D3.js 更灵活但开发成本高；初版用 Mermaid.js


---

<a id="sec-gap"></a>
## 已知缺口与技术债

> 状态：待开始

### 功能缺口

> 功能尚未进入实现阶段，详细缺口将在开发启动时评估和记录。

### 技术债

> 技术债将在首次实现时识别和记录。
