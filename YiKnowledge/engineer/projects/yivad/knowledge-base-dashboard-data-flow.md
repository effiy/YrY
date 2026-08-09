---
status: stable
title: Knowledge Base Dashboard — Data Flowlifecycle: active
type: summary
category: engineer/projects/yivadcreated: 2026-08-07
updated: 2026-08-07review_cycle: quarterly
source: internal
lifecycle: active
created: 2026-08-07
updated: 2026-08-09tacit: >
  Knowledge Base Dashboard 是 YiVad 中数据流最复杂的纯前端分析页面。
  理解其联动关系的关键是：后端一次返回全量数据（非分页），所有筛选、排序、聚合均在前端 computed 中完成。
roles:
  - engineer
  - ai-engineer
  - tech-lead
tags:
  - yivad
  - dashboard
  - knowledge-base
  - data-flow
  - frontend
related:
  - engineer/projects/yivad/architecture.md
  - engineer/projects/yivad/functional-modules.md
---

# Knowledge Base Dashboard 数据来源与联动关系

## 路由与组件映射

```
URL:  http://localhost:8848/#/dashboard/knowledgeBase
      │
      ▼
菜单定义: YiAi/src/data/seeds/menus.json  ──  key: "menu_knowledgeBase"
      │                                         path: "/dashboard/knowledgeBase"
      │                                         component: "/dashboard/knowledgeBase/index"
      ▼
动态路由: YiVad/src/routers/modules/dynamicRouter.ts
      │   viewsGlob 解析 "/dashboard/knowledgeBase/index" → "@/views/dashboard/knowledgeBase/index.vue"
      ▼
页面组件: YiVad/src/views/dashboard/knowledgeBase/index.vue  (纯编排层)
      │   import { useKnowledgeBase } from "./composables/useKnowledgeBase"
      │   const kb = useKnowledgeBase()
      │   const { knowledgeData, filteredFiles, drillTableData, ... } = kb  // 解构所有模板绑定
      ▼
核心逻辑: YiVad/src/views/dashboard/knowledgeBase/composables/useKnowledgeBase.ts  (~900 行)
```

## 数据来源 (单向数据流)

### 第一层: MongoDB 数据源

```
YiKnowledge/*.md  (markdown 文件树)
      │
      ▼  knowledge.watcher (apscheduler 轮询, macOS FSEvents 损坏)
MongoDB: knowledge_files 集合
      每条文档结构:
      {
        path: "engineer/projects/yivad/architecture.md",
        category: "engineer",
        name: "architecture.md",
        size: 12345,
        updatedTime: "2026-08-05T10:30:00Z",
        meta: {                    ← YAML frontmatter 解析结果
          status: "stable",
          lifecycle: "active",
          type: "summary",
          review_cycle: "quarterly",
          tacit: true | "some string",
          roles: ["engineer", "tech-lead"],
          tags: ["yivad", "architecture"],
          benefit: "...",
          related: ["path/to/other.md"],
          title: "架构总览"
        }
      }
```

### 第二层: 后端聚合 (YiAi FastAPI)

```
GET /dashboard/knowledge-stats
      │
      ▼
YiAi/src/server/routes/dashboard.py :: knowledge_stats()
      │
      ├── db.initialize() → collection = db.db["knowledge_files"]
      ├── cursor = collection.find({}, {"_id": 0})
      ├── files = await cursor.to_list(length=None)   ← 全量加载到内存
      │
      ├── 逐文件遍历, 从 meta 中提取:
      │   - status, lifecycle, type, review_cycle, tacit, roles, tags
      │   - 从 path 解析: category (第一段), module (第二段), sub_module (第三段)
      │   - Stale 检测: updatedTime + review_cycle → 是否超过 review 周期
      │
      ├── Counter 聚合:
      │   - categories, statuses, lifecycles, types, review_cycles, roles
      │   - tacit_count, stale_count, no_review_cycle_count
      │
      ├── module_map[(category, module_name)] → 模块级聚合
      ├── sub_module_map[(category, module, sub)] → 子模块级聚合
      │
      └── 返回 KnowledgeStatsData:
            {
              total: 文件总数,
              categories: [{name, count}, ...],
              statuses: [{name, count}, ...],
              lifecycles: [{name, count}, ...],
              types: [{name, count}, ...],
              review_cycles: [{name, count}, ...],
              roles: [{name, count}, ...],
              health: { tacit_count, stale_count, no_review_cycle_count, review_coverage_pct },
              files: [KnowledgeFileSummary × N],    ← 全量文件明细
              modules: [KnowledgeModuleStats × M],  ← 模块聚合
              recent: [KnowledgeRecentFile × 5]
            }
```

### 第三层: 前端 API 调用

```typescript
// YiVad/src/api/modules/dashboard.ts
export function getKnowledgeStats() {
  return http.get("/dashboard/knowledge-stats");
  // RequestHttp (src/api/index.ts) → Axios → GET http://localhost:10086/dashboard/knowledge-stats
}

export function searchKnowledge(query, category?, maxResults?) {
  return http.post("/knowledge-search", { query, category, max_results });
  // 全文搜索 (走 YiAi 独立端点)
}
```

### 第四层: Composable 状态管理

```
useKnowledgeBase() 内部状态 (全部 ref, 无 Pinia store):

核心数据:
  knowledgeData: ref<KnowledgeStatsData | null>   ← getKnowledgeStats() 的返回值

筛选状态:
  activeFilter: ref<Record<string, string>>        ← { category, module, sub_module, status, type, ... }
  activeSubCategory: ref<string>                    ← 当前选中的模块名
  searchText: ref<string>                           ← 搜索关键词
  searchMode: ref<"title" | "content">              ← 标题搜索 / 内容搜索
  activeTimeFilter: ref<string>                     ← "today" | "week" | "month"
  drillView: ref<"all" | "recent" | "stale">       ← 文件列表视图模式
  viewMode: ref<"files" | "modules">                ← 文件表格 / 模块分类

排序/分页:
  sortField: ref<string>                            ← 当前排序列
  sortOrder: ref<"asc" | "desc">
  drillPage: ref<number>
  drillPageSize: 20

文件预览:
  selectedFile: ref<KnowledgeFileSummary | null>    ← 内联预览
  dialogFilePath: ref<string>                       ← 弹窗预览
  recentlyViewed: ref<KnowledgeFileSummary[]>       ← 最近查看 (最多 10 个)
  fileContent, fileContentLoading, showFileContent  ← 预览内容懒加载
```

## 核心联动链 (Computed 依赖图)

```
knowledgeData (API 返回)
  │
  ├── topCategory, tacitPct, topRole, totalModules, totalSizeFormatted
  │   └── 顶部 8 个 Stat Card
  │
  ├── filteredFiles = applyFiltersToList(knowledgeData.files)
  │   │   filter by: activeFilter (category/module/sub_module/status/type/...)
  │   │            + activeTimeFilter (today/week/month)
  │   │            + searchText (title match)
  │   │            + activeSubCategory (module name)
  │   │
  │   └── drillTableData
  │       │   if drillView === "recent" → 最近 50 个文件
  │       │   if drillView === "stale"  → 仅过期文件
  │       │   else → filteredFiles 全量
  │       │
  │       ├── sortedDrillTableData (sort by sortField/sortOrder)
  │       │   └── paginatedDrillFiles (slice by drillPage/drillPageSize)
  │       │       └── 文件表格 / 画廊视图
  │       │
  │       ├── drillSummary (当前筛选集的模块/状态/类型分布)
  │       └── fileClassificationStats
  │
  ├── moduleDrillData (modules 聚合 + files 关联)
  │   │   按 (category, module) 分组，挂载 files 数组
  │   │
  │   └── filteredModuleDrillData (moduleDrillSearch 过滤)
  │       └── Module Classification 表格 (viewMode === "modules")
  │
  ├── subCategories (当前 category 下的模块列表)
  │   └── Sub-Module Grid 卡片
  │
  ├── moduleDetail (当前选中模块的聚合数据)
  │   ├── subdirectoryBreakdown (子模块条形图)
  │   └── topModuleFiles (前 12 个文件 chips)
  │
  └── Chart Options (ECharts 配置, 响应式)
      ├── reviewCycleDonutOption    ← buildReviewCycleDonut(data, missing)
      ├── typeBarOption             ← buildTypeBar(data)
      ├── statusBarOption           ← buildStatusBar(data)
      ├── sizeDistOption            ← buildSizeDist(files)
      ├── fileAgeOption             ← buildFileAge(files)
      ├── lifecycleBarOption        ← buildLifecycleBar(data)
      ├── moduleBarOption           ← buildModuleBar(modules, category, colors)
      ├── rolesBarOption            ← buildRolesBar(data, colors)
      └── classificationHeatmapOption ← buildClassificationHeatmap(modules, category)
```

## 用户交互 → 联动路径

### 1. 点击 Stat Card → 设置筛选

```
点击 "Review Coverage" card
  → toggleNoReviewFilter()
    → activeFilter.review_cycle = "__missing__"
    → activeSubCategory = "", drillPage = 1
    → scrollToDrillDown()
      ↓
  filteredFiles 重新计算 → drillTableData 更新 → 表格只显示无 review_cycle 的文件
```

### 2. 点击分类面包屑 → 下钻

```
点击文件路径中的 category 段
  → setFilter("category", "engineer")
    → activeFilter = { category: "engineer" }
      ↓
  showSubModuleGrid = true (当只有 category 筛选时)
    → 渲染 Sub-Module Grid (engineer 下的模块卡片)
  subCategories = modules.filter(m => m.category === "engineer")
    → 每个卡片显示: 文件数/状态/类型/生命周期/角色/Coverage
```

### 3. 点击模块卡片 → 模块详情

```
点击 Sub-Module Grid 中的卡片
  → activeSubCategory = "yivad"
    ↓
  moduleDetail = modules.find(m.category === cat && m.name === "yivad")
    → 渲染 Module Detail Card (coverage bar, status/type/lifecycle 分布)
  topModuleFiles = files.filter(f.category === cat && f.module === "yivad").slice(0, 12)
    → 渲染文件 chips
  drillTableData = filteredFiles.filter(f.module === "yivad")
    → 文件表格只显示该模块的文件
```

### 4. 交叉筛选 (cross-filter)

```
在 Sub-Module Grid 中点击某个 status chip
  → crossFilterSubModule(moduleName, "status", "draft")
    → activeSubCategory = moduleName
    → activeFilter = { status: "draft", category: currentCategory }
    ↓
  filteredFiles = 同时满足 module + status 的文件
  drillTableData 和 drillSummary 同步更新
```

### 5. 文件预览 → 内容懒加载

```
点击文件行 / Preview 按钮
  → openFilePreview(row) / openFileInDialog(row)
    → selectedFile = row  (内联面板) 或 dialogFilePath = row.path (弹窗)
    → addRecentlyViewed(row)
      ↓
  watch(selectedFile) 触发:
    → readKnowledgeFile(f.path)
      → POST /knowledge-read { target_file: path }
      → 返回 { content: "markdown 正文" }
    → fileContent = content
    → 渲染 markdown 预览 (前 3000 字符)
```

### 6. 全文搜索

```
searchMode = "content", 输入关键词
  → onSearchInput() → debounce 300ms → doContentSearch()
    → POST /knowledge-search { query, category, max_results: 50 }
    → contentSearchResults = [{ path, title, snippet, size }]
    → enrichedSearchResults = 合并 file metadata (category/module/type)
    → 渲染搜索结果卡片 (带 snippet 高亮)
```

### 7. 跳转 aiChat

```
点击文件行的 "Chat" 按钮
  → discussInAiChat(row)
    → useAiChatBridge().openInAiChat({
        title, pageContent, tags, sourceUrl: "/dashboard/knowledgeBase"
      })
    → 跳转到 /aiChat 页面，自动创建会话并附带文件上下文
```

## 文件清单

| 文件 | 角色 |
|------|------|
| `YiVad/src/views/dashboard/knowledgeBase/index.vue` | 页面组件 (模板 + 样式导入) |
| `YiVad/src/views/dashboard/knowledgeBase/composables/useKnowledgeBase.ts` | 全部状态/计算/方法 (~900 行) |
| `YiVad/src/views/dashboard/knowledgeBase/charts/index.ts` | ECharts option 工厂函数 (8 个图表) |
| `YiVad/src/views/dashboard/knowledgeBase/utils.ts` | 格式化/颜色映射/健康检查 |
| `YiVad/src/views/dashboard/knowledgeBase/index.scss` | 页面样式 |
| `YiVad/src/api/modules/dashboard.ts` | `getKnowledgeStats()` + `searchKnowledge()` |
| `YiVad/src/api/interface/yiweb.ts:605-676` | TypeScript 类型定义 |
| `YiVad/src/api/modules/knowledgeService.ts` | `readKnowledgeFile()` (文件内容读取) |
| `YiVad/src/hooks/useAiChatBridge.ts` | aiChat 跳转桥接 |
| `YiVad/src/views/aiChat/components/KnowledgePreviewDialog.vue` | 文件预览弹窗 |
| `YiAi/src/server/routes/dashboard.py:425-690` | 后端 `/dashboard/knowledge-stats` 端点 |
| `YiAi/src/data/seeds/menus.json:546` | 菜单/路由定义 |

## 关键设计决策

1. **全量数据一次返回**: 后端不做分页/筛选，一次返回所有文件 + 聚合数据。所有筛选/排序/分页在前端 computed 中完成。代价是首次加载数据量大 (~数千文件)，但后续交互均为即时响应。

2. **无 Pinia Store**: 该页面不使用全局 store，所有状态在 `useKnowledgeBase()` composable 内部。页面卸载时状态自动释放。

3. **文件内容懒加载**: 文件列表只包含 metadata (含文件大小)，实际 markdown 内容在用户点击预览时才通过 `/knowledge-read` 按需加载。

4. **模块解析规则**: 从文件路径 `{category}/{module}/{sub_module}/.../{file}.md` 解析，第二段为 module，第三段为 sub_module。以 `.md` 结尾的段跳过（即根目录文件属于 `__root__` 模块）。
