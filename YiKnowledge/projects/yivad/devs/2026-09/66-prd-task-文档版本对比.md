---
prd_task_id: "YV-09-136"
title: "YV-09-136: 文档版本对比 — 开发方案"
status: 待开始
priority: P3
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiVad
prd_month: "202609"
source_prd: "66-prd-文档版本对比.md"
type: task
category: projects/yivad/devs
source: YiVad
tags: [yivad, dev, 文档版本对比]
roles: [engineer]
benefit: "开发方案：task-文档版本对比"
lifecycle: active
---

# YV-09-136: 文档版本对比 — 开发方案

> 需求编号：YV-09-136 · 状态：待开始

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

<a id="sec-1"></a>
## 一、方案概述

文档编辑历史的版本对比：并排 diff 视图，高亮差异行。

### Diff 视图

```
┌──────────────┬──────────────┐
│ v3 (当前)     │ v2 (上一版)   │
├──────────────┼──────────────┤
│ 未变更行      │ 未变更行      │
│ + 新增行      │              │
│              │ - 删除行      │
│ ~ 修改行      │ ~ 修改行      │
└──────────────┴──────────────┘
```

> 低优先级。


### 架构方案

**技术路线**：知识库文件版本历史查看 + diff 对比，基于 Git 或手动快照

**数据模型**：
```
MongoDB `doc_versions` 集合；字段：`file_path`, `content_hash`, `diff`, `created_at`, `created_by`
```

**组件树**：
```
DocVersionHistory.vue (ProTable) + DocDiffViewer.vue (双栏 diff 渲染)
```

**关键决策**：
Diff 渲染使用 `diff` 或 `diff2html` npm 包；快照触发：手动保存按钮 vs 自动保存（debounce 2s）


---

<a id="sec-gap"></a>
## 已知缺口与技术债

> 状态：待开始

### 功能缺口

> 功能尚未进入实现阶段，详细缺口将在开发启动时评估和记录。

### 技术债

> 技术债将在首次实现时识别和记录。
