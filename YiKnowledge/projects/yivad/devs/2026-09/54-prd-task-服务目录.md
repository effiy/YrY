---
prd_task_id: "YV-09-115"
title: "YV-09-115: 服务目录 — 开发方案"
status: 待开始
priority: P3
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiVad
prd_month: "202609"
source_prd: "54-prd-服务目录.md"
type: task
category: projects/yivad/devs
source: YiVad
tags: [yivad, dev, 服务目录]
roles: [engineer]
benefit: "开发方案：task-服务目录"
lifecycle: active
---

# YV-09-115: 服务目录 — 开发方案

> 需求编号：YV-09-115 · 状态：待开始

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

<a id="sec-1"></a>
## 一、方案概述

微服务/模块目录：展示所有 RPC 服务模块、API 端点、依赖关系。

### 目录内容

| 列 | 说明 |
|-----|------|
| 模块名 | `services.database.data_service` |
| 方法 | `query_documents` / `create_document` |
| 参数 | cname, filter, pageNum, pageSize |
| 返回 | QueryResult |
| 消费者 | YiVad, YiPet |

> 低优先级。


### 架构方案

**技术路线**：独立页面 (`/services`)，卡片网格 + 搜索 + 状态指示，类似微服务注册中心 UI

**数据模型**：
```
MongoDB `services` 集合；字段：`name`, `url`, `status`, `health_check`, `owner_team`, `dependencies[]`, `docs_url`
```

**组件树**：
```
ServiceCatalog.vue (卡片网格 + 依赖拓扑图) + ServiceDetail.vue (健康指标/依赖/SLA)
```

**关键决策**：
依赖拓扑图使用 ECharts 力导向图或 Mermaid 流程图；健康检查由 YiAi 后端定时探测


---

<a id="sec-gap"></a>
## 已知缺口与技术债

> 状态：待开始

### 功能缺口

> 功能尚未进入实现阶段，详细缺口将在开发启动时评估和记录。

### 技术债

> 技术债将在首次实现时识别和记录。
