---

title: "10-prd-仪表盘指标增强"
tags: ["prd", "dashboard", "metrics", "bug-severity", "unassigned"]
category: "requirements"
created: "2026-09-23"
updated: "2026-09-23"
source: "claude"
type: prd
status: 已完成
owner: "Chengliang Yi"

---

## 需求背景

YiVad 首页仪表盘和项目详情页当前展示了基础的 Issue/Bug 统计，但缺少对关键风险指标的突出展示。通过数据分析发现：

- **232 个未分配 Issue（46.4%）** — 最大的管理盲区
- **48 个开放 Bug，其中 9 个 Critical + 52 个 Major** — 严重度分布不可见
- **Bug 状态与严重度在项目详情页无独立展示** — 需要到 Bug 列表页才能看到完整情况

## 需求目标

1. **首页：新增未分配 Issue 提示 + Bug 严重度分布卡片**
2. **项目详情页：新增 Bug 严重度分布模块**
3. **提升坏指标的可见性，促进主动管理**

## 功能规格

### 1. 首页 — 建议区域增强

在已有 alert 区域新增两条高优先级提醒：

- **未分配任务**：当 `unassignedCount > 0` 时显示红色警告，引导进入 Issue 列表
- **严重 Bug**：当 `criticalBugCount > 0` 时显示红色警告，引导进入 Bug 列表

### 2. 首页 — Bug 严重度分布卡片

在侧边栏新增 Bug 严重度分布卡片，使用横向条状图展示：

- 按严重度降序排列（Critical > Major > Medium > Minor > Trivial）
- 每个严重度对应不同颜色（红色 Critical、橙色 Major、蓝色 Medium、灰色 Minor/Trivial）
- 条长按最大计数比例计算

### 3. 项目详情页 — Bug 严重度分布

在项目详情 Overview 页面新增 Bug 严重度分布模块：

- 统计当前项目未关闭 Bug（open/reopened/in_progress）的严重度分布
- 使用横向条状图可视化
- 顶部显示「未关闭 N 个」总结

## 数据来源

- `useHomeData.ts` 新增 MongoDB 聚合查询：`countDocuments("bugs", { status: { $in: OPEN_BUGS_QUERY } }, "severity")`
- 项目详情页直接使用 `allBugs` 前端聚合计算

## 验收标准

- [x] 首页显示未分配 Issue 警告（当 count > 0）
- [x] 首页显示严重 Bug 警告（当 count > 0）
- [x] 首页侧边栏显示 Bug 严重度分布卡片
- [x] 项目详情页显示 Bug 严重度分布模块
- [x] `vue-tsc --noEmit` 通过