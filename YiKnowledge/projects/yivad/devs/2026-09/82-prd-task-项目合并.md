---
prd_task_id: "YV-09-228"
title: "YV-09-228: 项目合并 — 开发方案"
status: 待开始
priority: P3
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiVad
prd_month: "202609"
source_prd: "82-prd-项目合并.md"
type: task
category: projects/yivad/devs
source: YiVad
tags: [yivad, dev, 项目合并]
roles: [engineer]
benefit: "开发方案：task-项目合并"
lifecycle: active
---

# YV-09-228: 项目合并 — 开发方案

> 需求编号：YV-09-228 · 状态：待开始

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

<a id="sec-1"></a>
## 一、方案概述

将两个项目合并为一个：源项目的 Issue/模块/文档迁移到目标项目。

### 合并选项

| 选项 | 说明 |
|------|------|
| 合并 Issue | 源项目 Issue 迁移到目标项目 |
| 合并模块 | 模块去重后合并 |
| 保留源项目 | 合并后保留或归档源项目 |

> 低优先级。


### 架构方案

**技术路线**：项目管理操作 → 合并向导（选择源项目 + 目标项目 + 选择合并范围）

**数据模型**：
```
涉及 `projects`, `issues`, `modules`, `bugs` 集合的批量迁移
```

**组件树**：
```
ProjectMergeWizard.vue (三步向导：源项目 → 目标项目 → 确认)
```

**关键决策**：
合并为不可逆操作，需二次确认 + 输入项目名验证；合并后源项目标记为 archived；Issue key 冲突时保留目标项目 key


---

<a id="sec-gap"></a>
## 已知缺口与技术债

> 状态：待开始

### 功能缺口

> 功能尚未进入实现阶段，详细缺口将在开发启动时评估和记录。

### 技术债

> 技术债将在首次实现时识别和记录。
