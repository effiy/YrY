---
prd_task_id: "YV-09-98"
title: "YV-09-98: 事件管理与值班 — 开发方案"
status: 待开始
priority: P3
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiVad
prd_month: "202609"
source_prd: "46-prd-事件管理与值班.md"
type: task
category: projects/yivad/devs
source: YiVad
tags: [yivad, dev, 事件管理与值班]
roles: [engineer]
benefit: "开发方案：task-事件管理与值班"
lifecycle: active
---

# YV-09-98: 事件管理与值班 — 开发方案

> 需求编号：YV-09-98 · 状态：待开始

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

<a id="sec-1"></a>
## 一、方案概述

Incident 管理：创建/升级/解决事件，值班排班表，事件时间线。

### 事件生命周期

```
open → investigating → identified → mitigated → resolved → postmortem
```

### 值班排班

| 功能 | 说明 |
|------|------|
| 排班表 | 按周/日显示值班人员 |
| 轮换 | 自动通知下一班值班人员 |
| 升级 | 超时未响应自动升级 |

> 低优先级。


### 架构方案

**技术路线**：独立页面 (`/incidents`)，ProTable + 严重度标签 + 时间线，与值班排班集成

**数据模型**：
```
MongoDB `incidents` 集合；字段：`severity` (P0-P4), `status` (open/acknowledged/resolved/postmortem), `timeline[]`, `assignee`, `postmortem`
```

**组件树**：
```
IncidentList.vue + IncidentDetail.vue (时间线 + 复盘编辑器) + IncidentTimeline.vue
```

**关键决策**：
事件升级规则在 config 中定义：P0 → 即时通知，P1 → 30min 内通知；通知通过企业微信/邮件


---

<a id="sec-gap"></a>
## 已知缺口与技术债

> 状态：待开始

### 功能缺口

> 功能尚未进入实现阶段，详细缺口将在开发启动时评估和记录。

### 技术债

> 技术债将在首次实现时识别和记录。
