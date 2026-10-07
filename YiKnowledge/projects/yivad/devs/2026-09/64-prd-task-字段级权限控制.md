---
prd_task_id: "YV-09-134"
title: "YV-09-134: 字段级权限控制 — 开发方案"
status: 待开始
priority: P3
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiVad
prd_month: "202609"
source_prd: "64-prd-字段级权限控制.md"
type: task
category: projects/yivad/devs
source: YiVad
tags: [yivad, dev, 字段级权限控制]
roles: [engineer]
benefit: "开发方案：task-字段级权限控制"
lifecycle: active
---

# YV-09-134: 字段级权限控制 — 开发方案

> 需求编号：YV-09-134 · 状态：待开始

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

<a id="sec-1"></a>
## 一、方案概述

按角色控制文档字段的可见性和可编辑性。如 viewer 可看所有字段但不可编辑，engineer 不可见成本字段。

### 权限矩阵

| 字段 | admin | engineer | viewer |
|------|-------|----------|--------|
| 所有字段 | R/W | — | — |
| 成本/预算 | R/W | — | — |
| 技术字段 | R/W | R/W | R |
| 描述 | R/W | R/W | R |

> 依赖 YiAi 后端字段级过滤。


### 架构方案

**技术路线**：系统管理子页面 (`/system/field-permissions`)，角色 × 字段矩阵配置

**数据模型**：
```
MongoDB `field_permissions` 集合；字段：`role`, `collection`, `field`, `access` (read/write/hidden)
```

**组件树**：
```
FieldPermissionMatrix.vue (角色×字段二维表 + 下拉选择) + PermissionPreview.vue
```

**关键决策**：
权限拦截点：前端通过 v-auth 指令扩展 → API 响应过滤（YiAi 后端 middleware 移除无权限字段）


---

<a id="sec-gap"></a>
## 已知缺口与技术债

> 状态：待开始

### 功能缺口

> 功能尚未进入实现阶段，详细缺口将在开发启动时评估和记录。

### 技术债

> 技术债将在首次实现时识别和记录。
