---
doc_type: module
prd_task_id: "YV-08-11"
title: "Roadmap 路线图 — 多项目模块进度可视化 — 开发任务"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202608"
estimate_frontend: 2.0
source_prd: "11-prd-Roadmap路线图.md"
---

# Roadmap 路线图 — 多项目模块进度可视化 — 开发任务

> 来源 PRD：[11-prd-Roadmap路线图.md](../prds/2026-08/11-prd-Roadmap路线图.md)
> 需求编号：YV-08-11 · 优先级：P1 · 人天：2.0d

## 五、实施步骤

### 步骤 1: 数据加载与列布局（0.5d）

- [x] 实现 `loadData()`：并行加载 Module + Issue
- [x] 实现 `progressOf()`：基于 Issue 状态计算进度
- [x] 实现按项目分列 + 5 种渐变列头
- [x] 实现日期筛选 `inDateRange()`

**验证：** 页面加载后显示按项目分列的 Module 卡片，进度条正确

### 步骤 2: 卡片渲染与筛选（0.5d）

- [x] 实现 RoadmapItem 卡片：状态色条、key、类型、状态、日期、进度
- [x] 实现 Kind 类型筛选（el-check-tag）
- [x] 实现文本搜索（250ms 防抖）
- [x] 实现列内排序（日期/进度/名称）

**验证：** 卡片正确显示所有字段，筛选和排序正常工作

### 步骤 3: 右键菜单与预览（0.5d）

- [x] 实现右键菜单：Teleport + position:fixed + 全局点击关闭
- [x] 实现 4 种快速状态切换
- [x] 实现 Module/Issue Markdown 预览（KnowledgePreviewDialog）
- [x] 实现复制 ID + 删除确认

**验证：** 右键菜单正确出现在鼠标位置，状态切换即时生效

### 步骤 4: 统计与交互优化（0.5d）

- [x] 实现统计 Pills：Total / Modules / Progress%
- [x] 实现类型分布条
- [x] 实现逾期高亮（红色边框）
- [x] 实现空状态 + 加载态
- [x] 实现点击统计 Pill 清除所有筛选

**验证：** 统计数据正确，逾期 Module 红色边框高亮

---
