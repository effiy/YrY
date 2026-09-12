---
doc_type: module
prd_task_id: "YV-08-09"
title: "Kanban 看板 — 拖拽式项目任务管理 — 开发任务"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202608"
estimate_frontend: 3.0
source_prd: "09-prd-Kanban看板.md"
---

# Kanban 看板 — 拖拽式项目任务管理 — 开发任务

> 来源 PRD：[09-prd-Kanban看板.md](../prds/2026-08/09-prd-Kanban看板.md)
> 需求编号：YV-08-09 · 优先级：P1 · 人天：3.0d

## 五、实施步骤

### 步骤 1: 子组件开发（1.0d）

- [x] `KanbanColumn`：列渲染 + 拖拽接收 + 排序
- [x] `KanbanCard`：卡片渲染 + 优先级/日期/标签/头像
- [x] `KanbanStats`：统计面板
- [x] `KanbanSearchBar`：搜索 + 日期导航
- [x] `KanbanFilters`：类型/优先级筛选
- [x] `KanbanProgressBar`：进度条
- [x] `KanbanContextMenu`：右键菜单
- [x] `CreateIssueDialog`：创建 Issue 弹窗

### 步骤 2: 主页面编排（1.0d）

- [x] 数据加载 + 按 status 分组
- [x] 拖拽逻辑：乐观更新 + API 同步 + 失败回滚
- [x] 筛选逻辑：类型/优先级/日期/搜索
- [x] 统计计算

### 步骤 3: 路由与导航（0.25d）

- [x] 注册 Kanban 路由
- [x] 侧边栏菜单 + QuickNav 入口

### 步骤 4: 交互优化（0.5d）

- [x] 拖拽动画（CSS transition）
- [x] 右键菜单定位
- [x] 加载态（v-loading）
- [x] 空状态

---
