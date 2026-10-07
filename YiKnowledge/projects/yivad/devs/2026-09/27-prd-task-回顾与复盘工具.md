---
prd_task_id: "YV-09-57"
title: "YV-09-57: 回顾与复盘工具 — 开发方案"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiVad
prd_month: "202609"
source_prd: "27-prd-回顾与复盘工具.md"
type: task
category: projects/yivad/devs
source: YiVad
tags: [yivad, dev, 回顾与复盘工具]
benefit: "开发方案：task-回顾与复盘工具"
lifecycle: active
---

# YV-09-57: 回顾与复盘工具 — 开发方案

> 需求编号：YV-09-57 · 状态：待开始

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

<a id="sec-1"></a>
## 一、方案概述

迭代/Sprint 结束后的团队复盘工具：What went well / What didn't / Action items，数据持久化到 MongoDB。

### 复盘模板

```markdown
## 回顾：{迭代名称} · {日期范围}

### 👍 What went well
- 

### 👎 What didn't go well
- 

### 💡 Action items
- [ ] 
```

### 功能

| 功能 | 说明 |
|------|------|
| 创建复盘 | 选择项目 + 迭代 + 模板填充 |
| 协作编辑 | 团队成员可共同编辑 |
| 历史查看 | 按迭代/时间查看过往复盘 |
| Action 追踪 | 将 Action items 转为 Issue 跟踪 |

> 当前阶段：低优先级。


### 架构方案

**技术路线**：独立页面 (`/retrospective`)，ProTable 展示复盘列表 + Markdown 编辑器（复用 WangEditor 或 KnowledgePreviewDialog 的渲染管道）作为复盘内容编辑区

**数据模型**：
```
MongoDB `retrospectives` 集合，字段：`key`, `project_key`, `iteration`, `went_well[]`, `didnt_go_well[]`, `action_items[{text, status, linked_issue}]`, `participants[]`, `created_by`, `created_at`
```

**组件树**：
```
RetrospectiveList.vue (ProTable) + RetrospectiveEditor.vue (Markdown 编辑器 + Action 追踪面板)
```

**关键决策**：
Action items → Issue 转换复用现有 Issue 创建对话框；协作编辑通过乐观锁 (`updated_at` 版本检查) 防止覆盖


---

<a id="sec-gap"></a>
## 已知缺口与技术债

> 状态：待开始

### 功能缺口

> 功能尚未进入实现阶段，详细缺口将在开发启动时评估和记录。

### 技术债

> 技术债将在首次实现时识别和记录。
