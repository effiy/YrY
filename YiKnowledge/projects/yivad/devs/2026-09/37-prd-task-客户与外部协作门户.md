---
prd_task_id: "YV-09-82"
title: "YV-09-82: 客户与外部协作门户 — 开发方案"
status: 待开始
priority: P3
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiVad
prd_month: "202609"
source_prd: "37-prd-客户与外部协作门户.md"
type: task
category: projects/yivad/devs
source: YiVad
tags: [yivad, dev, 客户与外部协作门户]
roles: [engineer]
benefit: "开发方案：task-客户与外部协作门户"
lifecycle: active
---

# YV-09-82: 客户与外部协作门户 — 开发方案

> 需求编号：YV-09-82 · 状态：待开始 · 未来规划

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

<a id="sec-1"></a>
## 一、方案概述

独立的外部协作门户，客户/外部用户可通过链接访问指定项目，查看 Issue 进度、提交 Bug、参与讨论。

### 权限模型

| 角色 | 权限 |
|------|------|
| 访客 | 查看公开 Issue + Roadmap |
| 协作者 | 创建 Issue + 评论 |
| 管理员 | 全部权限 |

> 当前阶段：低优先级。


### 架构方案

**技术路线**：独立页面 (`/clients`)，ProTable + 客户卡片视图切换，客户详情侧边栏

**数据模型**：
```
MongoDB `clients` 集合；关联 `projects` 集合（客户可关联多个项目）
```

**组件树**：
```
ClientList.vue (卡片/表格双视图) + ClientDetailDrawer.vue (关联项目/联系人/活动日志)
```

**关键决策**：
客户与项目为多对多关系，使用中间表或嵌入式数组需评估查询性能


---

<a id="sec-gap"></a>
## 已知缺口与技术债

> 状态：待开始

### 功能缺口

> 功能尚未进入实现阶段，详细缺口将在开发启动时评估和记录。

### 技术债

> 技术债将在首次实现时识别和记录。
