---
status: stable
lifecycle: active
type: summary
review_cycle: quarterly
tacit: >
  页面曾有一处"图表回归"：composable 里 9 个图表 computed 全部实现但模板从未渲染。
  修复时最关键的认知是——图表依赖 `chartContextFiles` 惰性 computed，
  选中分类/模块后自动收窄，无需在模板里单独维护图表筛选状态。
roles:
  - engineer
  - ai-engineer
  - tech-lead
tags:
  - yivad
  - dashboard
  - knowledge-base
  - ui-layout
  - echarts
  - frontend
related:
  - engineer/projects/yivad/knowledge-base-dashboard-data-flow.md
  - engineer/projects/yivad/architecture.md
  - engineer/projects/yivad/functional-modules.md
---

# Knowledge Base Dashboard UI 结构与图表区

> 本文档描述知识库分析页的 **UI 布局、图表区与交互**（渲染层）。
> 数据来源、状态管理与 computed 依赖图见
> [[engineer/projects/yivad/knowledge-base-dashboard-data-flow]]（分工：data-flow 讲数据从哪来，本文讲 UI 长什么样、怎么点）。

## 页面布局（自上而下）

```
┌────────────────────────────────────────────────────────────────────┐
│ Top 统计卡  (`.top-box` → `.card.top-box`)                         │
│   8 个 Stat Card: Top Category / Review Coverage / Tacit % /       │
│   Top Role / Total Modules / Total Size / Stale Count / Total      │
│   点击 Coverage card → toggleNoReviewFilter() 下钻                  │
├────────────────────────────────────────────────────────────────────┤
│ Knowledge Analytics  (`.card.charts-box`)  ← 本优化新增/恢复的图表行 │
│   [Review Cycle] [Status] [Type] [Lifecycle]                       │
│   [Top Modules] [Roles]   [File Size] [File Age]    ← :lg="6" 4列  │
│   [Module × Status 热力图] (全宽)  ← 可点击下钻                     │
├────────────────────────────────────────────────────────────────────┤
│ 面板操作区 (`.panel-actions`)                                      │
│   Search(Title/Content) · DrillView(All/Recent/Stale) ·            │
│   时间筛选(All/Today/Week/Month) · View(Files/Modules)             │
├────────────────────────────────────────────────────────────────────┤
│ 主下钻区 (`.main-row` → `#drill-down`)                             │
│   面包屑 / 模块分类网格 / 文件表格 (带预览、CSV 导出、Chat 跳转)     │
└────────────────────────────────────────────────────────────────────┘
```

图表行位于 `index.vue` 的 `.top-box` 与主下钻区之间，作为独立 `.card`。
它复用了 composable 里 **早已实现但从未渲染** 的 9 个图表 computed——
见下方「图表回归」小节。

## 图表区（9 张图全部可点击下钻）

模板结构（`index.vue` `charts-box` 卡片）：

```html
<el-row :gutter="12">
  <!-- 前 8 张图：大屏 4 列 × 2 行，窄屏 12/24 或 24/24 -->
  <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
    <div class="chart-box">
      <div class="chart-title">Review Cycle</div>
      <div class="chart-body"><ECharts :option="reviewCycleDonutOption" height="220" /></div>
    </div>
  </el-col>
  <!-- … 8 张图同上 … -->
  <!-- 热力图：全宽，绑定点击下钻 -->
  <el-col :xs="24">
    <div class="chart-title">Module × Status <span class="chart-title-hint">(click a cell to drill down)</span></div>
    <ECharts :option="classificationHeatmapOption" height="240" @click="onHeatmapClick" />
  </el-col>
</el-row>
```

| # | 图表 | ECharts 组件 | option computed | 工厂函数 |
|---|------|--------------|-----------------|----------|
| 1 | Review Cycle 环形图 | `height="220"` | `reviewCycleDonutOption` | `buildReviewCycleDonut` |
| 2 | Status 条形图 | `height="220"` | `statusBarOption` | `buildStatusBar` |
| 3 | Type 条形图 | `height="220"` | `typeBarOption` | `buildTypeBar` |
| 4 | Lifecycle 条形图 | `height="220"` | `lifecycleBarOption` | `buildLifecycleBar` |
| 5 | Top Modules 条形图 | `height="220"` | `moduleBarOption` | `buildModuleBar` |
| 6 | Roles 条形图 | `height="220"` | `rolesBarOption` | `buildRolesBar` |
| 7 | File Size 分布 | `height="220"` | `sizeDistOption` | `buildSizeDist` |
| 8 | File Age 分布 | `height="220"` | `fileAgeOption` | `buildFileAge` |
| 9 | Module × Status 热力图 | `height="240"` + `@click` | `classificationHeatmapOption` | `buildClassificationHeatmap` |

图表工厂位于 `charts/index.ts`，全部为纯函数 `data → ECOption`；
颜色映射（`STATUS_COLORS` 等）与格式化工具在 `utils.ts`。

### 上下文感知：`chartContextFiles`

除 Module Bar 与热力图（始终基于全量 `modules`）外，其余 7 张图都经
`chartContextFiles` 惰性 computed 收窄：

```ts
const chartContextFiles = computed(() => {
  const cat = activeFilter.value.category;
  const mod = activeSubCategory.value;
  if (!cat && !mod) return null;                    // 无筛选 → 用全量聚合数据
  let files = knowledgeData.value?.files ?? [];
  if (cat) files = files.filter(f => f.category === cat);
  if (mod) files = files.filter(f => f.module === mod);
  return files;
});
```

- **无筛选**：`chartContextFiles` 为 `null`，图表回落到后端聚合字段
  （`review_cycles` / `statuses` / `types` / … 已带 count）。
- **选中分类/模块**：图表就地按上下文文件重算（`countByField` 前端聚合），
  无需额外 state 或模板分支。

## 热力图下钻（`onHeatmapClick`）

热力图 X 轴 = 模块内出现的 status 集合（排序），Y 轴 = 当前范围前 12 个模块
（按 count 降序）。`ECharts` 组件把 echarts `ECElementEvent` 透传给 `@click`，
热力格的 `event.data` 形如 `[yIndex, xIndex, count]`。

```ts
function onHeatmapClick(event: any) {
  const d = event.data;
  if (!d || d.length < 3) return;
  const modules = knowledgeData.value?.modules ?? [];
  let filtered = modules.filter(m => m.name !== "__root__");
  const cat = activeFilter.value.category;
  if (cat) filtered = filtered.filter(m => m.category === cat);
  const topMods = filtered.sort((a, b) => b.count - a.count).slice(0, 12);
  const mod = topMods[d[0]];
  const statuses = Array.from(new Set(topMods.flatMap(m => (m.statuses || []).map(s => s.name)))).sort();
  const statusName = statuses[d[1]];
  if (mod && statusName) {
    activeFilter.value = { category: mod.category, module: mod.name, status: statusName };
    activeSubCategory.value = "";
    drillPage.value = 1;
    searchText.value = "";
    browseAllFiles.value = false;
    setTimeout(() => scrollToDrillDown(), 100);   // 平滑滚到下钻区
  }
}
```

**关键点**：点击后直接构造连贯的 `{ category, module, status }` 筛选 →
文件表按 分类/模块/状态 三重过滤，面包屑显示完整下钻路径。
（旧实现先 `navigateToModule()` 再 `setFilter()`，两者互相抵消，最终只剩
一个 status 筛选且面包屑无路径——本次已修复。）

索引换算必须与 `buildClassificationHeatmap` 内部一致：Y 轴是过滤后
`topMods`（`slice(0,12)`），X 轴是 `topMods` 摊平的 status 排序集合；
两者都不是 API 原始顺序，点击换算要用同一套数组。

## 全图表点击下钻（`onChartClick`）

除热力图外，其余 8 张图也绑定了 `@click="onChartClick(dimension, $event)"`。
统一入口从 echarts 事件取 `event.name`（条形图 = 分类轴标签；饼图 = 数据项
name，Review Cycle 的 `__missing__` 段 name 即 `"__missing__"`），再按维度
构造筛选：

| 维度 | 图表 | 下钻动作 |
|------|------|----------|
| `review_cycle` | Review Cycle 环形图 | `setFilter("review_cycle", name)`；`__missing__` 段过滤无 review_cycle 文件 |
| `status` | Status 条形图 | `setFilter("status", name)` |
| `type` | Type 条形图 | `setFilter("type", name)` |
| `lifecycle` | Lifecycle 条形图 | `setFilter("lifecycle", name)` |
| `module` | Top Modules 条形图 | **整体替换**筛选为 `{ category: mod.category, module: mod.name }`（模块名在分类下可能重名，需用图表的过滤集反查） |
| `role` | Roles 条形图 | `setFilter("role", name)` |
| `size` | File Size 分布 | 按 bucket 设置 `size_min` / `size_max` 键 |
| `age` | File Age 分布 | 按 bucket 设置 `age_min_days` / `age_max_days` 键 |

设计约定：

- **字段类图表**（status/type/lifecycle/role/review_cycle）复用 `setFilter`——
  它是**细化**语义（保留已有 category/module 上下文），并在再次点击同一段时
  **切换取消**筛选。
- **模块条形图**是**替换**语义（`activeFilter.value = {category, module}`），
  保证面包屑路径连贯，与热力图一致。
- **Size / Age 是派生 bucket**，不是后端字段，故映射为新的筛选键：
  `size_min` / `size_max`（字节，半开区间 `[min, max)`）、`age_min_days` /
  `age_max_days`（距 `updated` 的天数，半开区间）。bucket 边界常量
  `SIZE_BUCKETS` / `AGE_BUCKETS` 定义在 composable 顶部，**必须与
  `charts/index.ts` 内 `buildSizeDist` / `buildFileAge` 的 bucket 一致**
  （注释已标注）。
- `applyFiltersToList` 相应扩展了对 `lifecycle`（并入通用相等分支，含
  `__missing__`）与 `size_*` / `age_*`（半开区间）的处理；`daysSinceUpdated`
  为模块级纯函数辅助。
- 点击空白/坐标轴时 `event.name` 为空，直接 return，不会误触发下钻。
- 任意图表点击后统一重置导航态（`drillPage=1`、清空 `searchText`/
  `browseAllFiles`/`selectedFile`）并 `scrollToDrillDown()`。
- **下钻总是落到文件表格视图**：`resetChartDrill()`（内部调用
  `forceFileTableView()`）会把 `viewMode` 置为 `files`、`fileViewMode` 置为
  `table`、`searchMode` 置为 `title` 并清空 `contentSearchResults`。原因是文件表
  渲染受 `searchMode === 'title'` 门控、且模块分类/画廊/内容搜索三种状态会抢占
  视口——不强制复位，用户处于这些状态时点击图表看不到对应表格数据。热力图
  `onHeatmapClick` 同样走 `resetChartDrill()`。

## 时间筛选（接上 UI）

`activeTimeFilter` 的下游过滤逻辑早已存在（`filteredFiles` 按 today/week/month
匹配 `todayFiles`/`weekFiles`/`monthFiles`，面包屑也渲染时间文案），但此前
**没有 UI 入口**（旧 `toggleTimeFilter` 方法从未被模板引用）。本次补上 radio
组并替换 handler：

```html
<el-radio-group v-model="activeTimeFilter" size="small"
                @change="onTimeFilterChange"
                v-if="searchMode === 'title' && !isShowingTreeView">
  <el-radio-button value="">All</el-radio-button>
  <el-radio-button value="today">Today</el-radio-button>
  <el-radio-button value="week">Week</el-radio-button>
  <el-radio-button value="month">Month</el-radio-button>
</el-radio-group>
```

```ts
function onTimeFilterChange(period: string | number | boolean | undefined) {
  activeTimeFilter.value = typeof period === "string" ? period : "";
  activeSubCategory.value = "";
  drillView.value = "all";
  drillPage.value = 1;
  browseAllFiles.value = false;
  selectedFile.value = null;
}
```

注意：

- 仅 `v-model` 已足够更新值；handler 主要做 **导航态重置**（回到第一页、退出
  浏览全部/模块网格），不滚动、不 toggle。
- 签名必须接受 Element Plus `change` 事件载荷 `string | number | boolean | undefined`，
  否则 `vue-tsc` 报 `TS2322`（本次实际踩到的坑）。

## 本次清理的死代码

### `useKnowledgeBase.ts`

| 移除项 | 原因 |
|--------|------|
| `fileClassificationStats` computed | 从未被模板引用 |
| `removeFilter` 方法 | 全仓库仅本页声明、无任何调用 |
| `toggleTimeFilter` | 死方法，被 `onTimeFilterChange` 取代 |
| return 中的 `doContentSearch` | 仅内部 debounce 调用，无需对外暴露 |

### `index.vue` 解构

移除从未在模板使用的绑定：`sortField, sortOrder, moduleDrillData,
todayFiles, weekFiles, monthFiles, fileClassificationStats, removeFilter,
addRecentlyViewed, toggleTimeFilter`。
（其中 `sortField`/`sortOrder`/`todayFiles` 等 composable **内部仍在用**，
仅不再解构导出到模板。）

### `index.scss`（共删约 180 行，0 残留引用）

- `.category-bar` 块（含 `category-tabs`/`cat-tab`/`time-chips`/`time-chip`/`subcat-*`）
- `.filter-row` 块
- `.main-left-col` / `.main-right-col`（**保留** `.main-row`）
- `.module-drilldown` + 全部 `.mdd-*`
- `.treemap-box` / `.tag-cloud-box`
- `.file-classification-summary` / `.classification-overview` + `fcs-*` / `co-*`
- 尾部残留 `.mcv-expand-label` / `.mcv-chip-review`

**保留** `.chart-box` / `.chart-title` / `.chart-body` —— 本次图表行复用。
`index.scss` 里 `.top-box` 选择器改为 `.top-box, .charts-box` 共享卡片头部样式。

## 组件与文件清单

| 文件 | 角色 |
|------|------|
| `index.vue` | 模板编排：统计卡 → 图表行 → 面板操作 → 下钻区 |
| `composables/useKnowledgeBase.ts` | 全部状态/图表 option computed/交互方法 |
| `charts/index.ts` | 9 个 ECharts option 纯函数工厂 |
| `utils.ts` | 颜色映射 / 格式化 / 健康检查 |
| `index.scss` | 页面样式（`.charts-box`/`.chart-box` 复用旧样式） |
| `@/components/ECharts/index.vue` | 通用图表组件（props: `option`/`height`/`onClick`，`@click` 透传 `ECElementEvent`） |
| `@/api/modules/dashboard.ts` | `getKnowledgeStats()` |
| `@/api/interface/yiweb.ts:605-676` | 知识库类型定义 |

## 验证要点（回归清单）

1. `pnpm type:check` —— 无新增错误（基线 18 个无关 `DefaultRow` 预存错误保持）
2. 图表行渲染 9 张图；无筛选时展示全量，选中分类/模块后收窄
3. 热力图点击 → 文件表按 分类/模块/状态 过滤、面包屑含完整下钻路径
4. **其余 8 张图点击均可下钻**：Status/Type/Lifecycle/Role 按字段过滤、
   Review Cycle 含 `__missing__` 段、Top Modules 按分类/模块、Size/Age 按
   bucket 区间过滤；再次点击同一段可取消筛选；点击空白不误触
5. **下钻总落在文件表格视图**：从模块分类 / 画廊 / 内容搜索任意状态点图表，
   都会切回表格视图并显示对应行
5. All/Today/Week/Month 时间筛选生效（文件数变化、面包屑出现时间文案）
6. 原统计卡 / 模块分类网格 / 文件表 / 标题搜索 / 内容搜索 / 内联预览 / 弹窗预览 /
   CSV 导出 / 跳转 aiChat 无回归
