---

title: "17-prd-task-MTTR与标签覆盖补全"
tags: ["dev", "mttr", "labels"]
category: projects/yivad/devs
created: "2026-09-23"
updated: "2026-09-23"
source: "claude"
type: task
status: 已完成
owner: "Chengliang Yi"
estimate_frontend: "0.3d"
priority: "P2"
source_prd: "17-prd-MTTR与标签覆盖补全"

---

## 实施计划

### MTTR 卡片

- `DetailOverview.vue` statTiles 新增 MTTR 卡片
- 使用 IIFE 计算中位修复时间：遍历 `allBugs` 已解决 Bug，取 `(updatedAt - createdAt) / 3600000` 的中位数
- 卡片 variant 动态：<24h 绿色，≥24h 蓝色
- BugDocument 字段为 camelCase：`createdAt`/`updatedAt` (number)