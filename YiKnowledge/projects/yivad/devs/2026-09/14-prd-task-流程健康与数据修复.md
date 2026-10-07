---

title: "14-prd-task-流程健康与数据修复"
tags: ["dev", "process-health", "data-fix"]
category: projects/yivad/devs
created: "2026-09-23"
updated: "2026-09-23"
source: "claude"
type: task
status: 已完成
owner: "Chengliang Yi"
estimate_frontend: "0.5d"
priority: "P1"
source_prd: "14-prd-流程健康与数据修复"

---

## 实施计划

### 1. useHomeData.ts — 新增 inReviewCount

- `HomeStats` 新增 `inReviewCount`
- `COUNT_QUERIES` 新增：`{ key: "inReviewCount", cname: "issues", filter: { status: "in_review" } }`

### 2. 首页 UI — 流程健康指标

- 今日摘要栏 `recentSummary` 新增 `review` 参数
- 建议区域新增「评审阻塞」告警（>10 阈值）
- 告警可见性条件新增 `inReviewCount > 10`

### 3. 数据修复

- 孤儿模块 `project_key` 设置：`db.modules.updateMany({project_key: { $in: [?, '', null] }}, { $set: { project_key: 'yivad' } })`

### 4. 国际化

- `home.zh.ts/en.ts`：`recentSummary` 更新、`reviewBottleneck` 新增