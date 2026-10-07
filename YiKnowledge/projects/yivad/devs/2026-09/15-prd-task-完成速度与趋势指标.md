---

title: "15-prd-task-完成速度与趋势指标"
tags: ["dev", "velocity", "trend"]
category: projects/yivad/devs
created: "2026-09-23"
updated: "2026-09-23"
source: "claude"
type: task
status: 已完成
owner: "Chengliang Yi"
estimate_frontend: "0.5d"
priority: "P2"
source_prd: "15-prd-完成速度与趋势指标"

---

## 实施计划

### 1. useHomeData.ts

- `HomeStats` 新增 `doneWeekCount`、`doneLastWeekCount`
- `loadTodayCounts` 新增查询：
  - 本周 done：`status in DONE_QUERY, updated_at >= 7d ago`
  - 上周 done：`status in DONE_QUERY, updated_at between 14d and 7d ago`
- 新增 `twoWeeksAgo` 日期计算

### 2. 首页 statCards

- 新增「本周完成」卡片（doneThisWeek），绿色左边框
- sub 显示「上周 N」对比
- delta 显示周环比

### 3. 完成率趋势箭头

- 新增 `completionTrend` computed：本周完成率 - 上周完成率
- 仪表盘标签旁显示 ↑↓ 箭头（绿色上升、红色下降）
- 新增 `.ho-stat-card__trend` SCSS 样式

### 4. 国际化

- `home.zh.ts/en.ts`：`doneThisWeek`、`lastWeek`