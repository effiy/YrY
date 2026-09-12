---
doc_type: module
prd_task_id: "YV-09-50"
title: "活动日志与审计追踪 — 开发任务"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "24-prd-活动日志与审计追踪.md"
---

# 活动日志与审计追踪 — 开发任务

> 来源 PRD：[24-prd-活动日志与审计追踪.md](../prds/2026-09/24-prd-活动日志与审计追踪.md)
> 需求编号：YV-09-50 · 优先级：P2 · 人天：0.5d

## 五、实施步骤

| 步骤 | 任务 | 产出 | 验证方式 | 人天 |
|------|------|------|----------|------|
| 1 | 定义活动日志类型接口 | `types/activity.ts` | TypeScript 类型检查通过 | 0.03 |
| 2 | 实现活动日志 API 服务 | `services/activity.service.ts` | 接口调用返回正确数据结构 | 0.04 |
| 3 | 实现 useActivityLog Composable | `composables/useActivityLog.ts` | 筛选/分页/导出逻辑正确 | 0.05 |
| 4 | 实现 ActivityFilter 组件 | `components/audit/ActivityFilter.vue` | 6 种筛选条件均正常工作 | 0.06 |
| 5 | 实现 ActivityLog 列表页面 | `views/audit/ActivityLog.vue` | 列表展示、筛选、分页、导出正常 | 0.08 |
| 6 | 实现 DiffViewer 组件 | `components/audit/DiffViewer.vue` | 新增/删除/修改/未变更 4 种状态正确渲染 | 0.06 |
| 7 | 实现 ActivityDetail 抽屉 | `views/audit/ActivityDetail.vue` | 详情抽屉正常打开/关闭 | 0.04 |
| 8 | 实现 ActivityTimeline 组件 | `components/audit/ActivityTimeline.vue` | 时间线正确展示，展开详情正常 | 0.05 |
| 9 | 实现 ActivityFeed 仪表盘组件 | `components/dashboard/ActivityFeed.vue` | 仪表盘展示最近 20 条活动 | 0.03 |
| 10 | 实体详情页集成时间线 | 修改 Issue/项目/文档详情页 | 详情页底部显示操作时间线 | 0.03 |
| 11 | 编写样式文件 | `styles/audit.scss` | 样式与 Element Plus 一致 | 0.02 |
| 12 | 组件测试 | 测试文件 | 6 个测试场景通过 | 0.01 |

**总计：** 0.5d

---
