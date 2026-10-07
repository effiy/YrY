---
prd_task_id: "YV-09-129"
title: "YV-09-129: 外部集成日志 — 开发方案"
status: 待开始
priority: P3
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiVad
prd_month: "202609"
source_prd: "59-prd-外部集成日志.md"
type: task
category: projects/yivad/devs
source: YiVad
tags: [yivad, dev, 外部集成日志]
roles: [engineer]
benefit: "开发方案：task-外部集成日志"
lifecycle: active
---

# YV-09-129: 外部集成日志 — 开发方案

> 需求编号：YV-09-129 · 状态：待开始

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

<a id="sec-1"></a>
## 一、方案概述

记录所有外部集成（GitHub/Jira/Slack/Webhook）的调用日志：请求/响应/状态/耗时。

### 日志字段

| 字段 | 说明 |
|------|------|
| 集成名 | GitHub / Jira / Slack |
| 操作 | 具体 API 调用 |
| 状态 | success / failed |
| 耗时 | 响应时间 ms |
| 请求/响应 | 脱敏后的请求体和响应体 |

> 低优先级。


### 架构方案

**技术路线**：独立页面 (`/integrations/logs`)，展示外部 API 调用日志 + 重试状态

**数据模型**：
```
MongoDB `integration_logs` 集合；字段：`integration`, `endpoint`, `status`, `request/response`, `duration`, `retry_count`
```

**组件树**：
```
IntegrationLogList.vue (ProTable + 状态/耗时过滤器) + LogDetail.vue (请求/响应 diff)
```

**关键决策**：
日志保留周期：成功 7 天，失败 30 天；日志量大时考虑分页 + 异步导出


---

<a id="sec-gap"></a>
## 已知缺口与技术债

> 状态：待开始

### 功能缺口

> 功能尚未进入实现阶段，详细缺口将在开发启动时评估和记录。

### 技术债

> 技术债将在首次实现时识别和记录。
