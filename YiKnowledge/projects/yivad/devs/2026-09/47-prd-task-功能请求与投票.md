---
prd_task_id: "YV-09-100"
title: "YV-09-100: 功能请求与投票 — 开发方案"
status: 待开始
priority: P3
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiVad
prd_month: "202609"
source_prd: "47-prd-功能请求与投票.md"
type: task
category: projects/yivad/devs
source: YiVad
tags: [yivad, dev, 功能请求与投票]
roles: [engineer]
benefit: "开发方案：task-功能请求与投票"
lifecycle: active
---

# YV-09-100: 功能请求与投票 — 开发方案

> 需求编号：YV-09-100 · 状态：待开始

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

<a id="sec-1"></a>
## 一、方案概述

用户可提交功能请求，其他用户投票，按票数排列优先级。管理员可标记为 planned/in_progress/done。

### 数据模型

```typescript
interface FeatureRequest {
  title: string;
  description: string;
  votes: number;
  voters: string[];    // 用户 ID，防重复投票
  status: "open" | "planned" | "in_progress" | "done" | "declined";
  linkedIssue?: string; // 关联开发 Issue
}
```

> 低优先级。


### 架构方案

**技术路线**：独立页面 (`/feedback`)，ProTable + 投票排序 + 状态看板 (planned/in_progress/released/declined)

**数据模型**：
```
MongoDB `feature_requests` 集合；字段：`votes[]`, `status`, `linked_issue`, `category`
```

**组件树**：
```
FeatureRequestList.vue (ProTable + 投票按钮) + FeatureRequestKanban.vue (状态看板)
```

**关键决策**：
投票防重复通过用户 ID + IP 双重校验；转为 Issue 后同步状态


---

<a id="sec-gap"></a>
## 已知缺口与技术债

> 状态：待开始

### 功能缺口

> 功能尚未进入实现阶段，详细缺口将在开发启动时评估和记录。

### 技术债

> 技术债将在首次实现时识别和记录。
