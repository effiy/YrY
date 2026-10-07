---
prd_task_id: "YV-09-101"
title: "YV-09-101: 项目详情 Activity 摘要栏趋势 + Todo 列表 Bug 修复 — 开发方案"
status: 已完成
priority: P1
owner: Chengliang.Yi
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiVad
project_id: yivad
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "YA-09-122"
tags: [开发方案, 项目详情, 活动时间轴, 待办列表, 数据趋势, Bug修复]
type: task
category: 项目/管理后台/开发
source: YiVad
benefit: "Activity 摘要栏消除 Layout Shift + 周环比趋势；Todo 过滤器修复 + PRD 引用接入 + 堆叠进度条"
lifecycle: active
---

# YV-09-101: 项目详情 Activity 摘要栏趋势 + Todo 列表 Bug 修复

> 关联: [YV-09-99 ActivityTimeline 优化](../../devs/2026-09/99-prd-task-项目详情页Recent-Activity模块渲染优化.md)
> 关联 PRD: [YA-09-122 跨项目数据一致性](../../../yiai/prds/2026-09/122-需求-跨项目数据一致性.md)

## 修改清单

| # | 文件 | 变更 |
|---|------|------|
| 1 | `components/ActivityTimeline.vue` | 统一摘要栏（移除 v-if/v-else 双分支）、周环比趋势指示器（↑/↓/→%）、56 天热力图触发区 |
| 2 | `composables/useActivityTimeline.ts` | `weeklyTrend` 计算属性、热力图 28→56 天、`emptySummary` 空状态 |
| 3 | `components/DetailOverview.vue` | **Bug 修复：** `todoDevs`/`todoTests` 合并到 `todoItems`、PRD 引用接入、堆叠进度条（done/in-progress/pending 三色段）、逾期徽章（红色 pill + Warning 图标） |
| 4 | `styles/DetailOverview.scss` | 趋势指示器、宽热力图网格、逾期徽章、堆叠进度段、进度优先级标签样式 |
| 5 | `languages/modules/project/zh.ts` | `emptySummary`、`completed`、`inProgress` i18n key |
| 6 | `languages/modules/project/en.ts` | `emptySummary`、`completed`、`inProgress` i18n key |

## 实现要点

### 1. ActivityTimeline — 统一摘要栏

**问题**：`v-if="periodMetrics.total"` 摘要栏 + `v-else` 纯过滤器是两个独立 DOM 分支。数据从空变为有数据时 Layout Shift。

**修复**：摘要栏始终渲染。activitySummary 为空时显示 `emptySummary` i18n 文本。metrics 仅在 `periodMetrics.total > 0` 时显示。

### 2. Weekly Trend 计算（新增）

```ts
const weeklyTrend = computed(() => {
  // 本周 vs 上周活动数对比
  if (!lastWeek) return { direction: 'flat', pct: 0, thisWeek, lastWeek };
  const pct = Math.round((thisWeek - lastWeek) / lastWeek * 100);
  return { direction: pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat', pct: Math.abs(pct), ... };
});
```

模板中渲染：`↑ 25% vs last week`（绿色 up / 红色 down / 灰色 flat）

### 3. Todo List — Dev/Test 合并 (Bug 修复)

**Root Cause**：`todoDevs`/`todoTests` computed 仅在 `todoStats` 进度条中使用，从未被合并到 `todoItems`。dev/test 类型过滤器永远显示空结果。

**修复**：在 `todoItems` computed 中新增 `todoDevs.forEach` + `todoTests.forEach` 块，将 YiKnowledge 任务与 MongoDB Issues/Bugs 统一排序。

**PRD 引用接入**：dev 任务使用 `source_prd` 字段，test 任务使用 `source_prds[0]` 字段，在 UI 中显示为 `← <prd-name>` 可点击链接。

### 4. 堆叠进度条

```html
<div class="do-todo-progress__bar">
  <div class="do-todo-progress__seg is-done" :style="{ width: donePct }" />
  <div class="do-todo-progress__seg is-active" :style="{ width: activePct }" />
  <div class="do-todo-progress__seg is-pending" :style="{ width: pendingPct }" />
</div>
```

绿色 done + 橙色 active + 灰色 pending，width transition 0.4s。

## 验证

- `npx vue-tsc --noEmit` ✅
- `http://localhost:8848/#/project/yipot` → Overview Tab：
  - Activity 摘要栏始终可见，无 Layout Shift
  - 周环比趋势指示器正确显示 ↑/↓/→
  - Todo "开发"/"测试"过滤器显示 YiKnowledge 任务
  - 进度条三色段正确
  - 逾期项显示红色徽章