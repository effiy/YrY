---
prd_task_id: "YV-09-226"
title: "YV-09-226: 项目克隆复制 — 开发方案"
status: 待开始
priority: P3
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiVad
prd_month: "202609"
source_prd: "80-prd-项目克隆复制.md"
type: task
category: projects/yivad/devs
source: YiVad
tags: [yivad, dev, 项目克隆复制]
roles: [engineer]
benefit: "开发方案：task-项目克隆复制"
lifecycle: active
---

# YV-09-226: 项目克隆复制 — 开发方案

> 需求编号：YV-09-226 · 状态：待开始

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

<a id="sec-1"></a>
## 一、方案概述

将一个项目及其关联数据（Issue/模块/文档）完整复制为新项目。

### 复制范围选择

| 数据 | 默认 | 说明 |
|------|------|------|
| 项目设置 | ✅ | 名称/描述/状态 |
| Issue | ☐ | 可选复制 Issue |
| 模块 | ☐ | 可选复制模块结构 |
| 成员 | ☐ | 可选复制成员列表 |

> 低优先级。

### 架构方案

**技术路线**：项目详情页操作菜单 → 克隆向导（el-dialog 三步流程），通过 YiAi `data_service` 批量复制文档

**数据模型**：
```
复制流程：
  1. 选择复制范围（project settings / issues / modules / members）
  2. 生成新 project key（原 key + '-copy' 或用户自定义）
  3. 批量 upsert MongoDB 文档（新 key，保持原数据内容）
```

**组件树**：
```
ProjectCloneWizard.vue (三步 dialog)
├── Step 1: 新项目信息（名称/标识符/描述）
├── Step 2: 复制范围选择（checkbox 列表）
└── Step 3: 预览 + 确认
```

**关键决策**：
- Issue key 处理：复制后生成新 key（原 key 前缀 + 新项目标识符），保持追溯关系
- 关联数据清理：复制时清除 `created_at`/`updated_at` 时间戳，重置为新项目创建时间
- 大项目复制：若 Issue > 500 条，使用异步任务（创建后台 job → 轮询状态 → 完成后通知）

---

<a id="sec-gap"></a>
## 已知缺口与技术债

> 状态：待开始

### 功能缺口

> 功能尚未进入实现阶段，详细缺口将在开发启动时评估和记录。

### 技术债

> 技术债将在首次实现时识别和记录。
