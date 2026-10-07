---

title: "18-prd-task-WIP与最近完成"
tags: ["dev", "wip", "recently-completed"]
category: projects/yivad/devs
created: "2026-09-23"
updated: "2026-09-23"
source: "claude"
type: task
status: 已完成
owner: "Chengliang Yi"
estimate_frontend: "0.5d"
priority: "P2"
source_prd: "18-prd-WIP与最近完成"

---

## 实施计划

### WIP 卡片

- `DetailOverview.vue` 新增 `wipTotal`、`wipBars` computed
- 统计 in_progress/in_review/todo 数量（排除 backlog/done/cancelled）
- 模板：3 行彩色条状图
- 样式：`.do-wip-bars`、`.do-wip-row`、`__label/track/fill/count`

### 最近完成

- `DetailOverview.vue` 新增 `recentlyCompleted` computed
- 取 status=done 的 Issue，按 updated_at 倒序，取前 5
- 计算相对时间（just now / Xh ago / Xd ago）
- 模板：绿色勾 + 标题 + 时间

### 国际化

- `project.zh.ts/en.ts`：`overview.wip.title/totalItems`、`overview.recentlyCompleted.title`