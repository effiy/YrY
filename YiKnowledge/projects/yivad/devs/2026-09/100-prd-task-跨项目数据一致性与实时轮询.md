---
prd_task_id: "YV-09-100"
title: "YV-09-100: 跨项目数据一致性与实时轮询 — YiVad 开发方案"
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
tags: [开发方案, 跨项目, 数据一致性, 实时轮询, 数据新鲜度]
type: task
category: 项目/管理后台/开发
source: YiVad
benefit: "YiVad 侧跨项目数据新鲜度增强 + 项目详情 ActivityTimeline/Todo List 优化"
lifecycle: active
---

# YV-09-100: 跨项目数据一致性与实时轮询 — YiVad 开发方案

> 关联 PRD: [YA-09-122: 跨项目数据一致性](../../../yiai/prds/2026-09/122-需求-跨项目数据一致性.md)

## 修改清单

| # | 文件 | 变更 | 
|---|------|------|
| 1 | `views/project/components/ActivityTimeline.vue` | 统一摘要栏（移除 v-if/v-else 布局跳动）、新增周环比趋势指示器（↑/↓/→ + 百分比）、热力图从 28 天扩展到 56 天 |
| 2 | `views/project/composables/useActivityTimeline.ts` | `weeklyTrend` 计算属性（本周 vs 上周对比）、热力图从 28 天扩展到 56 天 |
| 3 | `views/project/components/DetailOverview.vue` | **Bug 修复：** `todoDevs`/`todoTests` 合并到 `todoItems`（dev/test 过滤器此前永远为空）、接入 PRD 引用（`source_prd` 字段）、堆叠进度条（done/in-progress/pending 三色段）、逾期徽章（红色 pill + Warning 图标） |
| 4 | `views/dashboard/analytics/TranslationAnalytics.vue` | 新增 `useNow` + `lastFetched` 数据时效指示器（绿色新鲜/灰色过期） |
| 5 | `views/rag/index.vue` | 新增 60s 自动刷新 RAG 状态 + `useNow` 实时时间戳 |
| 6 | `styles/DetailOverview.scss` | 趋势指示器样式、宽热力图网格、逾期徽章、堆叠进度条段、进度优先级标签 |
| 7 | `languages/modules/project/zh.ts` | 新增 `emptySummary`、`completed`、`inProgress` i18n key |
| 8 | `languages/modules/project/en.ts` | 新增 `emptySummary`、`completed`、`inProgress` i18n key |

## 实现要点

### 1. ActivityTimeline — 统一摘要栏

**之前**：摘要栏（`v-if="periodMetrics.total"`）和纯过滤器（`v-else`）是两个独立 DOM 分支，数据加载时 Layout Shift。

**之后**：摘要栏始终渲染，`activitySummary` 为空时显示 `emptySummary` i18n 文本，metrics 仅在 `periodMetrics.total > 0` 时显示。

### 2. Weekly Trend 计算

```ts
// useActivityTimeline.ts
const weeklyTrend = computed(() => {
  // 计算本周一（Mon）到本周日的活动数 vs 上周同期
  const thisMonday = /* 本周一日期 */;
  let thisWeek = 0, lastWeek = 0;
  overviewActivity.value.forEach(a => {
    const d = a.updatedAt.slice(0, 10);
    if (d >= thisMonday && d <= thisSunday) thisWeek++;
    else if (d >= lastMonday && d < thisMonday) lastWeek++;
  });
  if (!lastWeek) return { direction: 'flat', pct: 0, thisWeek, lastWeek };
  const pct = Math.round((thisWeek - lastWeek) / lastWeek * 100);
  return { direction: pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat', pct: Math.abs(pct), thisWeek, lastWeek };
});
```

### 3. Todo List — Dev/Test 合并 Bug 修复

**之前**：`todoDevs` 和 `todoTests` computed 存在但仅在 `todoStats` 进度条中使用，从未被合并到 `todoItems`。因此 dev/test 类型过滤器永远显示空结果。

**之后**：在 `todoItems` computed 中新增两个 forEach 块：
```ts
// Dev tasks from YiKnowledge devs/ directory
todoDevs.value.forEach(d => {
  items.push({
    id: d.path, type: "dev", target: d.title, filePath: d.path,
    priorityLabel: d.priority, priorityColor: ykPriorityColor(d.priority),
    priorityRank: PRIORITY_RANK[d.priority] ?? 4, assignee: d.owner,
    issueType: "dev", issueTypeLabel: t("project.overview.todo.dev"),
    estimate: d.estimate_frontend ? `${d.estimate_frontend}d` : "",
    prdRef: d.source_prd  // ← PRD 引用接入
  });
});
// Test tasks from YiKnowledge tests/ directory
todoTests.value.forEach(spec => { /* 同理 */ });
```

### 4. 数据时效指示器

通用模式：`useNow(30_000)` → `formatRelativeTime(lastFetched, now)` → 绿色（<60s）或灰色（>60s）标签。

## 验证

- `npx vue-tsc --noEmit` ✅ 通过
- `pnpm dev` → `http://localhost:8848/#/project/yipot` → Overview Tab 验证 ActivityTimeline + Todo List
- `http://localhost:8848/#/rag` → 验证 RAG 概览 60s 自动刷新
- `http://localhost:8848/#/dashboard/analytics/translation` → 验证时效指示器