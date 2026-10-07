---

title: "13-prd-task-分析仪表盘图表增强"
tags: ["dev", "analytics", "charts", "aging", "velocity"]
category: projects/yivad/devs
created: "2026-09-23"
updated: "2026-09-23"
source: "claude"
type: task
status: 已完成
owner: "Chengliang Yi"
estimate_frontend: "1d"
priority: "P2"
source_prd: "13-prd-分析仪表盘图表增强"

---

## 实施计划

### 1. DetailAnalytics.vue — Issue 老化 KPI

- 新增 `ageBuckets` computed：遍历 allIssues 计算 >7d/>30d/>90d 开放数量
- 新增 `aged7d/30d/90d` + 百分比 computed
- 模板：KPI 区域新增 3 个卡片

### 2. DetailAnalytics.vue — 优先级健康图

- 新增 `openPriorities` computed：统计开放 Issue 的 priority 分布
- 新增 `priorityOption` computed：ECharts donut pie 配置
- 模板：Issue 分析区域新增饼图卡片

### 3. DetailAnalytics.vue — 周完成速度图

- 新增 `velocityData` computed：按周聚合 done Issue 数量
- 新增 `velocityOption` computed：ECharts bar 配置
- 模板：Issue 分析区域新增柱状图卡片

### 4. 国际化

- `project.zh.ts/en.ts`：`analytics.weeklyVelocity`

### 5. 类型修复

- ECharts series `type` 使用 `as const` 确保 literal type