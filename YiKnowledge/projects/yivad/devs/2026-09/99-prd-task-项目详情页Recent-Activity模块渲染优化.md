---
prd_task_id: "YV-09-99"
title: "YV-09-99: 项目详情页 Recent Activity 模块渲染优化 — 开发方案"
status: 已完成
priority: P2
owner: Chengliang.Yi
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiVad
project_id: yivad
prd_month: "202609"
estimate_frontend: 0.35
source_prd: "99-prd-项目详情页Recent-Activity模块渲染优化.md"
tags: [开发方案, 体验优化, 渲染优化, 时间轴, 骨架屏]
type: task
category: 项目/管理后台/开发
source: YiVad
benefit: "开发方案：task-项目详情页Recent-Activity模块渲染优化"
lifecycle: active
updated: 2026-09-23
---

# YV-09-99: 项目详情页 Recent Activity 模块渲染优化 — 开发方案

> 关联 PRD: [99-prd-项目详情页Recent-Activity模块渲染优化](../prds/2026-09/99-prd-项目详情页Recent-Activity模块渲染优化.md)

## 修改清单

| # | 文件 | 变更 | 行数 |
|---|------|------|------|
| 1 | `composables/useActivityTimeline.ts` | **新增** — 活动数据构建、筛选、分组逻辑（含后续优化） | +420 |
| 2 | `components/ActivityTimeline.vue` | **新增** — 独立时间轴组件 + 类型统计条 | +172 |
| 3 | `components/DetailOverview.vue` | 模板改用 `<ActivityTimeline>`；移除 ~380 行内联代码 | -380 / +15 |
| 4 | `styles/DetailOverview.scss` | 骨架屏、动画、统计条样式 | +140 / -5 |
| 5 | `languages/.../en.ts` | 新增 `emptyFiltered`、`summaryWithRecent`、`summaryRecent` | +3 |
| 6 | `languages/.../zh.ts` | 新增 `emptyFiltered`、`summaryWithRecent`、`summaryRecent` | +3 |
| 7 | `tests/hooks/useActivityTimeline.test.ts` | **新增** — 15 个 Vitest 单元测试（全通过）| +260 |

### Bug 修复

- **时区偏移**：`activityGroups`/`activitySummary` 中 "Today" 检测从 `setHours(0,0,0,0)`+`toISOString()` 改为直接 `toISOString().slice(0,10)`，消除非 UTC 时区日期比较偏差。

## 实现要点

### 0. Composable 提取（架构决策）

将 DetailOverview.vue 中 ~350 行 activity 逻辑提取到独立 composable：

```ts
// useActivityTimeline.ts
export function useActivityTimeline(input: {
  allIssues, allBugs, allModules, knowledgeFiles,
  projectKey, filterDateStr, now
}) {
  return {
    activityTypeFilter, overviewActivity, filteredActivity,
    activityFilters, activitySummary, activityEmptyText,
    activityGroups, expandedPreviews,
    togglePreview, isActivityFresh, activityTypeIcon, activityTooltip, activityColor
  };
}
```

**使用方式**（DetailOverview.vue）：

```ts
const activity = useActivityTimeline({
  allIssues, allBugs, allModules, knowledgeFiles,
  projectKey: computed(() => project.value?.key || ""),
  filterDateStr, now
});
const { activityTypeFilter, filteredActivity, activityFilters, ... } = activity;
```

**收益**：
- `DetailOverview.vue` 从 ~1445 → 1086 行（-25%）
- Activity 数据构建、类型检测、文档字幕等辅助函数内聚在 composable 中
- 可直接在 `ActivityTimeline.vue` 组件中复用（未来拆分）
- 所有 4 种数据源（issue/bug/module/knowledgeFile）的 ActivityItem 构建逻辑集中管理

### 1. Activity 骨架屏

```html
<div v-if="loading && !filteredActivity.length" class="do-activity-skeleton">
  <div v-for="n in 5" :key="n" class="do-activity-skel-item"
       :style="{ animationDelay: `${(n - 1) * 0.08}s` }">
    <span class="do-activity-skel-dot" />
    <span class="do-activity-skel-content">
      <span class="do-activity-skel-line" />
      <span class="do-activity-skel-line is-short" />
    </span>
  </div>
</div>
```

- 5 行骨架匹配时间轴布局（圆点 + 主行 + 短行）
- 每行 80ms 递增的 `animationDelay`，产生瀑布流 shimmer 效果
- 复用全局 `skeleton-shimmer` 关键帧

### 2. 类型图标

```ts
function activityTypeIcon(type: string): Component | null {
  const icons: Record<string, Component> = {
    requirement: Document,  // 需求
    bug: Warning,          // 缺陷
    module: Grid,          // 模块
    doc: Notebook          // 文档
  };
  return icons[type] || null;
}
```

- 使用 Element Plus Icons 已有图标，无需额外依赖
- 返回 `null` 时模板 `v-if` 跳过渲染

### 3. 时间戳 Tooltip

```html
<el-tooltip :content="activityTooltip(a)" :show-after="600" placement="top">
  <span class="do-timeline-time">{{ a.timeAgo }}</span>
</el-tooltip>
```

- `formatAbsolute(ts)` 输出 `dayjs(ts).format("L LTS")`（如 "09/23/2026 2:30:45 PM"）
- `show-after="600"` 避免快速扫过时频繁弹出

### 4. 可展开内容预览

```html
<div v-if="a.contentPreview"
     class="do-timeline-preview"
     :class="{ 'is-expanded': expandedPreviews.has(a.id) }"
     @click.stop="togglePreview(a.id)">
  {{ a.contentPreview }}
</div>
```

- 默认 `-webkit-line-clamp: 2`（CSS 截断，不丢内容）
- 点击切换 `is-expanded` 类：移除 clamp、`white-space: pre-wrap` 保留换行
- `@click.stop` 阻止冒泡到父级的文件打开行为
- `cleanPreview()` 移除 `.slice(0, 120)` 改用完整文本

### 5. 筛选过渡动画

```scss
.do-timeline {
  animation: timeline-enter 0.25s ease-out;
}
@keyframes timeline-enter {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

- 容器 `:key="activityTypeFilter"`：Vue 在 key 变化时销毁旧 DOM → 创建新 DOM → 触发 `timeline-enter` 动画
- 轻量方案，无需完整 TransitionGroup

### 6. 圆点光晕变体

```scss
.do-timeline-dot {
  &--requirement { box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.18); }
  &--bug         { box-shadow: 0 0 0 3px rgba(245, 108, 108, 0.18); }
  &--module      { box-shadow: 0 0 0 3px rgba(89, 126, 247, 0.18); }
  &--doc         { box-shadow: 0 0 0 3px rgba(115, 209, 61, 0.18); }
}
```

- 18% 透明度光晕，与主色协调但不喧宾夺主

### 7. Hover 交互增强

```scss
.do-timeline-item {
  transition: padding-left 0.2s ease;
  &:hover {
    padding-left: 24px; // +4px 微动效
    .do-timeline-content {
      background: var(--el-fill-color-lighter);
      border-radius: 6px;
    }
  }
}

// ── 更新整个 DetailOverview.vue 和 DetailOverview.scss ──
```

### 8. 新条目呼吸动画

```ts
function isActivityFresh(a: ActivityItem): boolean {
  if (!a.updatedAt) return false;
  return Date.now() - new Date(a.updatedAt).getTime() < 300_000; // 5 分钟
}
```

```scss
.do-timeline-item.is-fresh .do-timeline-dot {
  animation: fresh-pulse 2s ease-in-out infinite;
}
@keyframes fresh-pulse {
  0%, 100% { box-shadow: 0 0 0 0 currentColor; }
  50% { box-shadow: 0 0 0 6px transparent; }
}
```

- 5 分钟内更新的条目圆点显示呼吸光晕，快速识别"刚刚发生"的活动
- 使用 `currentColor` 继承圆点颜色，所有类型通用

### 9. 条目错峰入场动画

```scss
.do-timeline-item {
  animation: item-enter 0.3s ease-out both;
}
@keyframes item-enter {
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
}
```

- 模板中 `:style="{ animationDelay: `${i * 0.04}s` }"` 递增延迟
- 筛选切换时 `:key="activityTypeFilter"` 重新挂载，重新触发入场
- `both` fill-mode 确保动画前后状态正确

### 10. 日期分组增强

```ts
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
// 日期标签：Today / Yesterday / 2026-09-22 · Mon
```

分组标题右侧显示条目计数徽章：
```html
<span class="do-timeline-group-count">{{ group.items.length }}</span>
```

## 轮询兼容性

- `lastUpdated` watch 触发 `loadDescFile()` — 不影响 activity 数据流
- overviewActivity 依赖注入的 `allIssues`/`allBugs`/`allModules`/`knowledgeFiles` — 由 `useProjectDetail` 轮询自动刷新
- 骨架屏仅在 `loading && !filteredActivity.length` 时显示，轮询刷新时不闪现

## 后续优化（2026-09-23）

### 11. 内容预览增强

`buildDocPreview()` 扩展 fallback 链，覆盖更多文档类型：

- **开发方案**：新增 `technical_notes`、`scope` 字段提取
- **测试规格**：新增 `test_cases[].description`、`test_scope` 提取
- **OKR**：新增 `objective` 字段提取
- **通用**：新增 `summary` 字段兜底

### 12. 文档元数据扩展

`buildDocSubtitle()` 增强每个文档类型的副标题信息：

- **开发方案**：显示 `priority`（P0/P1/P2/P3）
- **测试规格**：显示 `test_cases` 数量（"N test cases"）
- **OKR**：显示 `krCount`（"N KRs"）

### 13. 活动类型统计条

新增 `do-activity-stats-strip` 水平统计条，位于筛选器和时间轴之间：

```
[Req 12██████████████] [Doc 8████████] [Bug 3████] [Mod 2██]
```

- 每个类型卡片显示：类型标签 + 数量 + 底部百分比进度条
- 点击卡片可快速筛选该类型（与筛选按钮同步）
- 引入 `activityTypeStats` computed 和 `setFilter()` 方法
- 活跃卡片高亮显示（is-active 样式）

### 14. 活动摘要增强

`activitySummary` 从仅展示今日统计改为 3 天滚动摘要：

- 今日有更新：显示分类型计数（"3 Requirements, 2 Bugs"）+ 近 3 天总数
- 仅近日有更新：显示 "X updates in last 3 days"
- 新增 i18n keys：`summaryWithRecent`、`summaryRecent`

### 15. 日期格式专业化

分组标题日期从 ISO 格式改进为紧凑可读格式：

- `2026-09-23 · Tue` → `Sep 23 · Tue`
- 本周内日期：`Thu · Sep 21`（星期在前）
- 更早日期：`Sep 18 · Thu`（日期在前）
- 引入 `MONTH_ABBR` 常量和 `compactDate()` 辅助函数
- Today/Yesterday 保留原有行为