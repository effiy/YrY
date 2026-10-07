---

title: "16-prd-task-标签覆盖与今日数据精确化"
tags: ["dev", "labels", "today"]
category: projects/yivad/devs
created: "2026-09-23"
updated: "2026-09-23"
source: "claude"
type: task
status: 已完成
owner: "Chengliang Yi"
estimate_frontend: "0.3d"
priority: "P2"
source_prd: "16-prd-标签覆盖与今日数据精确化"

---

## 实施计划

### 1. 数据质量标签覆盖

- `DetailOverview.vue` `dataQualityIssues` 新增 `noLabels` 指标
- 统计 `openIssues.filter(i => !i.labels || i.labels.length === 0).length`
- 导入 `PriceTag` 图标

### 2. 今日 done 精确化

- `useHomeData.ts` 新增 `doneTodayExact` 字段和查询
- 查询：`status in DONE_QUERY, updated_at >= today`
- 首页今日摘要栏改用 `doneTodayExact`

### 3. 国际化

- `project.zh.ts/en.ts`：`dataQuality.noLabels`