---
prd_task_id: "YV-09-91"
title: "跨页面组件统一与代码去重 — 开发方案"
status: 已完成
priority: P1
owner: Chengliang.Yi
roles:
- engineer
created: '2026-09-23'
updated: '2026-09-23'
project: YiVad
project_id: yivad
prd_month: '202609'
estimate_frontend: 1.0
source_prd: "91-prd-跨页面组件统一与代码去重.md"
related_tests:
- "YV-09-91"
implementation_progress: "18 轮迭代完成，48 文件修改，-697 行净减少"
type: task
category: projects/yivad/devs
source: YiVad
tags: [yivad, dev, 跨页面组件统一与代码去重]
benefit: "开发方案：task-跨页面组件统一与代码去重"
lifecycle: active
---

# 跨页面组件统一与代码去重 — 开发方案

> 来源 PRD：[91-prd-跨页面组件统一与代码去重.md](../../prds/2026-09/91-prd-跨页面组件统一与代码去重.md)
> 需求编号：YV-09-91 · 优先级：P1 · 人天：1.0d

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

---

## 源码索引

| 文件 | 变更类型 | 行数变化 | 说明 |
|------|---------|---------|------|
| `src/styles/common.scss` | 新增 | +15 | 全局 `.page` + `.card` 工具类 |
| `src/styles/skeleton.scss` | 保留 | 0 | 全局 `@keyframes skeleton-shimmer` 唯一定义 |
| `src/components/FilterPills/FilterPills.vue` | 新建 | +80 | 共享筛选 Pill 组件 |
| `src/components/RecentlyViewed/RecentlyViewed.vue` | 新建 | +100 | 共享最近查看组件 |
| `src/views/bug/components/BugSidebar.vue` | 新建 | +150 | Bug 侧边栏组件 |
| `src/views/bug/index.vue` | 重构 | -105 / +15 | 使用 FilterPills + RecentlyViewed + BugSidebar |
| `src/views/bug/styles/bug.scss` | 重构 | -200 / +5 | 移除 sidebar/recent/filter 独占样式 |
| `src/views/bug/detail.vue` | 重构 | -5 / +2 | formatDate → formatAbsolute |
| `src/views/issue/index.vue` | 重构 | -5 / +8 | 使用 FilterPills + RecentlyViewed |
| `src/views/issue/IssueFilterBar.vue` | 删除 | -37 | 功能已迁移至共享 FilterPills |
| `src/views/issue/components/IssueRecentlyViewed.vue` | 删除 | -119 | 功能已迁移至共享 RecentlyViewed |
| `src/views/module/index.vue` | 重构 | -40 / +15 | 使用 FilterPills + RecentlyViewed |
| `src/views/module/styles/module.scss` | 重构 | -80 / +2 | 移除 recent/filter 独占样式 |
| `src/views/knowledge/skills/index.vue` | 重构 | -50 / +15 | 使用 FilterPills + RecentlyViewed |
| `src/views/knowledge/skills/styles/skills.scss` | 重构 | -68 / +1 | 移除 recent 独占样式 |
| `src/views/project/index.vue` | 重构 | -30 / +25 | 工具栏精简 + freshness dot + ⌘K |
| `src/views/project/index.scss` | 重构 | -96 / +15 | 移除 poll/server-synced/live-dot/pulse 样式 |
| `src/views/project/detail.vue` | 重构 | -10 / +15 | pd-pulse → skeleton-shimmer |
| `src/components/DetailSkeleton.vue` | 重构 | -10 / +2 | detail-skel-shimmer → skeleton-shimmer |
| `src/components/Skeleton/SkeletonCard.vue` | 重构 | -10 / +1 | 移除本地 skeleton-shimmer |
| `src/components/Skeleton/SkeletonList.vue` | 重构 | -10 / +1 | 移除本地 skeleton-shimmer |
| `src/components/Skeleton/SkeletonTable.vue` | 重构 | -10 / +1 | 移除本地 skeleton-shimmer |
| `src/components/charts/ChartContainer.vue` | 重构 | -10 / +1 | 移除本地 skeleton-shimmer |
| `src/views/rag/constants.ts` | 重构 | -8 / +3 | formatTimestamp → 委托至 formatAbsolute |
| `src/views/ai-chat/components/KnowledgeChatPanel.vue` | 重构 | -4 / +2 | timeLabel → formatAbsolute |
| `src/views/ai-chat/composables/useKnowledgeChatMessages.ts` | 重构 | -1 / +2 | timeLabel → 委托至 formatAbsolute |
| `src/views/ai-chat/components/SessionEditDialog.vue` | 增强 | +1 | autofocus |
| `src/views/bug/components/BugFormDialog.vue` | 增强 | +1 | autofocus |
| `src/views/project/components/CodeHealthPanel.vue` | 增强 | +1 | title tooltip |
| `src/views/system/*/index.vue` (7 files) | 重构 | -20 / +10 | 使用 `.page` 类 |
| `src/views/knowledge/*/index.vue` (5 files) | 重构 | -15 / +5 | background 委托至 `.page` |
| `src/views/notification/index.vue` | 重构 | -5 / +3 | 使用 `.page` + tooltip |
| `src/views/showcase/index.vue` | 重构 | -2 / +1 | 使用 `.page` |
| `src/views/dashboard/analytics/*.vue` (2 files) | 重构 | -4 / +1 | 使用 `.page` |

---

## 共享组件 API 设计

### FilterPills

```typescript
// Props
pills: Array<{ key: string; label: string; clear: () => void; display?: string; color?: string }>
canUndo?: boolean

// Events
@clearAll: () => void
@undo: () => void
@remove: (key: string) => void
```

### RecentlyViewed

```typescript
// Props
items: Array<{ key: string; title: string; color?: string }>
label?: string        // default: "Recently viewed"
maxItems?: number     // default: 8

// Events
@click: (key: string) => void
@clear: () => void
```

### BugSidebar

```typescript
// Props
sidebarStats: { total: number; open: number; resolved: number }
attention: { critical: number; unassigned: number; stale: number }
completeness: Array<{ key: string; label: string; pct: number }>
completenessTotal: number
resolutionPct: number
viewMode: string

// Events
@update:viewMode: (v: string) => void
@filter: (type: string) => void
@navAll: () => void
```

---

## 全局 CSS 工具类

### `.page` — 页面容器

```scss
.page {
  padding: var(--page-gutter);    // 24px
  background: var(--el-bg-color-page);
}
```

### `.card` — 内容面板

```scss
.card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: var(--radius-md);  // 12px
}
```

---

## 关键设计决策

1. **Scoped CSS vs 全局类** — Scoped 样式的 `padding` 可覆盖 `.page` 的 padding（通过更高特异性），但 `background` 应由 `.page` 统一提供。Scoped 样式中仅保留自定义 padding 及其他页面专属规则。

2. **FilterPills 接口设计** — 采用 `key` 而非 `id` 作为唯一标识字段，与 issue 的 `useIssueList` composable 的 `id` 字段区分，避免 Vue scoped 编译时冲突。

3. **RecentlyViewed 数据映射** — 各消费页面的数据模型不同（BugDocument, Module, Issue, SkillDef），通过 `computed` 属性映射为统一的 `{ key, title, color? }` 接口传入共享组件。

4. **formatAbsolute vs toLocaleString** — 共享的 `formatAbsolute` 使用 dayjs `"L LTS"` 格式而非 `toLocaleString()`，输出格式略有差异但语义等价。保留 `toLocaleString()` 风格的本地实现不做强制替换。

---

## 已删除的废弃文件

| 文件 | 原因 |
|------|------|
| `src/views/issue/IssueFilterBar.vue` | 功能已迁移至共享 `components/FilterPills` |
| `src/views/issue/components/IssueRecentlyViewed.vue` | 功能已迁移至共享 `components/RecentlyViewed` |