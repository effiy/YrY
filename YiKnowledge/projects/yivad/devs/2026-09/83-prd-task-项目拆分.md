---
prd_task_id: "YV-09-229"
title: "YV-09-229: 项目拆分 — 开发方案"
status: 待开始
priority: P3
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiVad
prd_month: "202609"
source_prd: "83-prd-项目拆分.md"
type: task
category: projects/yivad/devs
source: YiVad
tags: [yivad, dev, 项目拆分]
roles: [engineer]
benefit: "开发方案：task-项目拆分"
lifecycle: active
---

# YV-09-229: 项目拆分 — 开发方案

> 需求编号：YV-09-229 · 状态：待开始

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

<a id="sec-1"></a>
## 一、方案概述

将一个项目拆分为多个子项目：选择 Issue/模块分配到不同目标项目。

### 拆分流程

```
1. 选择源项目
2. 创建目标项目（可多个）
3. 分配 Issue/模块到各目标项目
4. 确认拆分 → 执行迁移
5. 源项目归档
```

> 低优先级。


### 架构方案

**技术路线**：项目管理操作 → 拆分向导（选择要拆出的 Issue/模块 + 新项目信息）

**数据模型**：
```
涉及 `projects` (新建), `issues`, `modules` 集合的数据分离
```

**组件树**：
```
ProjectSplitWizard.vue (选择拆分项 → 新项目信息 → 确认)
```

**关键决策**：
拆分后原 Issue/模块 key 保持不变（仅更新 project_key）；新项目自动创建并继承原项目的部分设置


---

<a id="sec-gap"></a>
## 已知缺口与技术债

> 状态：待开始

### 功能缺口

> 功能尚未进入实现阶段，详细缺口将在开发启动时评估和记录。

### 技术债

> 技术债将在首次实现时识别和记录。
