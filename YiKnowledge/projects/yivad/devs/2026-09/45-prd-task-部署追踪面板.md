---
prd_task_id: "YV-09-97"
title: "YV-09-97: 部署追踪面板 — 开发方案"
status: 待开始
priority: P3
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiVad
prd_month: "202609"
source_prd: "45-prd-部署追踪面板.md"
type: task
category: projects/yivad/devs
source: YiVad
tags: [yivad, dev, 部署追踪面板]
roles: [engineer]
benefit: "开发方案：task-部署追踪面板"
lifecycle: active
---

# YV-09-97: 部署追踪面板 — 开发方案

> 需求编号：YV-09-97 · 状态：待开始

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

<a id="sec-1"></a>
## 一、方案概述

可视化部署历史：每次部署的时间/版本/环境/状态/关联 Issue。

### 部署记录

| 字段 | 说明 |
|------|------|
| 版本 | v1.2.3 |
| 环境 | DEV / TEST / PROD |
| 状态 | deploying / success / failed / rolled_back |
| 触发人 | 部署操作者 |
| 关联 Issue | 本次部署包含的 Issue 列表 |
| 耗时 | 部署耗时 |

> 依赖 CI/CD 集成。


### 架构方案

**技术路线**：独立页面 (`/deployments`)，ProTable + 时间线视图，状态流转可视化

**数据模型**：
```
MongoDB `deployments` 集合；关联 `projects` 和 `issues`（部署关联的 Issue）
```

**组件树**：
```
DeploymentList.vue + DeploymentTimeline.vue (ECharts 甘特图) + DeploymentDetail.vue (关联 Issue/变更日志)
```

**关键决策**：
状态流转遵循：pending → deploying → deployed → failed/rolled_back；WebSocket 推送部署进度（可选，初版可用轮询）


---

<a id="sec-gap"></a>
## 已知缺口与技术债

> 状态：待开始

### 功能缺口

> 功能尚未进入实现阶段，详细缺口将在开发启动时评估和记录。

### 技术债

> 技术债将在首次实现时识别和记录。
