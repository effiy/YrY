---
title: "useProjectInsights 分层重构"
tags: [重构, 组合式, 架构, 前端]
category: 项目/管理后台/需求
created: 2026-09-02
updated: 2026-09-04
source: 内部
type: 需求
status: 已完成
priority: 高
project: YiVad
project_id: yivad
owner: 陈铭
prd_month: "202609"
prd_task_id: YV-09-01-2
estimate_frontend: 1.0
review_status: 已评审
issue_type: 功能
roles: [engineer]
---

# useProjectInsights 分层重构

> 需求编号：YV-09-01-2 · 优先级：P0 · 人天：1.0d
> 依赖：无（最先执行，为后续所有任务提供基础）

## 改动总览

| 改动点 | 类型 | 涉及文件 |
|--------|------|---------|
| 数据加载层提取 | 新增 | `composables/useProjectData.ts` (~60 行) |
| 统计聚合层提取 | 新增 | `composables/useProjectStats.ts` (~130 行) |
| 风险检测层提取 | 新增 | `composables/useProjectRisk.ts` (~100 行) |
| 过滤层提取 | 新增 | `composables/useProjectFilter.ts` (~120 行) |
| 组合入口精简 | 重写 | `composables/useProjectInsights.ts` (380 → ≤100 行) |
| 常量与类型提取 | 迁移 | `types.ts` (+12 常量 + 4 类型 + 1 工具函数) |

## 涉及文件

```
src/views/project/
├── types.ts                                 # 扩展：+STALE_DAYS, RISK_META, ProjectStats 等
└── composables/
    ├── useProjectData.ts                    # 新增：数据加载层
    ├── useProjectStats.ts                   # 新增：统计聚合层
    ├── useProjectRisk.ts                    # 新增：风险检测层
    ├── useProjectFilter.ts                  # 新增：过滤层
    └── useProjectInsights.ts               # 重写：组合入口
```

## 基本信息

| 字段 | 值 |
|------|-----|
| 需求编号 | YV-09-01-2 |
| 模块 | `src/views/project/composables/` |
| 优先级 | **P0**（阻塞 YV-09-01-1） |
| 前端人天 | 1.0d |
| 后端人天 | — |
| 依赖 | 无 |

## 功能需求

> 将当前 380 行、28 个导出项的 `useProjectInsights.ts` 拆分为 4 个独立 composable + 1 个组合入口，每个 composable 职责单一、可独立测试。

| 层 | 职责 | 输入 | 输出 |
|----|------|------|------|
| `useProjectData` | 数据加载 | 无（内部调用 API） | `loading, lastUpdated, projects, issues, bugs, load` |
| `useProjectStats` | 统计聚合 | `Ref<Project[]>, Ref<Issue[]>, Ref<Bug[]>, Ref<string>?` | `statsByKey, statsFor, completionPct, rollup, activitySeries, topProjects` |
| `useProjectRisk` | 风险检测 | `Ref<Project[]>, Ref<Issue[]>, ComputedRef<StatsMap>, Ref<string>?` | `risksByKey, risksFor, healthFor, riskCounts, flaggedCount` |
| `useProjectFilter` | 跨维度过滤 | 无（纯状态管理） | `activeFilter, setFilter, removeFilter, clearAllFilters, undoLastFilter, matchesFilter, activeFilterPills` |
| `useProjectInsights` | 组合入口 | `Ref<string>?` | 以上四层的全部输出（API 兼容） |

**不改动范围：** `index.vue` 的解构赋值、模板、样式均不做任何修改。`useProjectInsights` 对外接口与现有完全一致。

## 数据契约

> 本节定义所有新增/变更的类型、常量、工具函数。各 composable 之间的数据传递依赖此契约。

### 类型定义

| 类型 | 定义 | 使用方 |
|------|------|--------|
| `RiskKey` | `"overdue" \| "stale" \| "unassigned" \| "no_members" \| "no_description"` | useProjectRisk, useProjectFilter |
| `HealthLevel` | `"good" \| "warn" \| "poor"` | useProjectRisk, useProjectFilter |
| `ProjectStats` | `interface { issues, done, open, requirements, overdue, unassigned, cycles, activeCycles, totalBugs, lastActivity, statuses, openPriorities, types }` | useProjectStats, useProjectRisk, useProjectFilter |
| `FilterPill` | `interface { key, val, label, display, color }` | useProjectFilter |
| `FilterState` | `Record<string, string>` | useProjectFilter |
| `UseProjectDataReturn` | `interface { loading, lastUpdated, projects, issues, bugs, load }` | useProjectInsights |
| `UseProjectStatsReturn` | `interface { statsByKey, statsFor, completionPct, rollup, activitySeries, topProjects }` | useProjectInsights |
| `UseProjectRiskReturn` | `interface { risksByKey, risksFor, healthFor, riskCounts, flaggedCount }` | useProjectInsights |
| `UseProjectFilterReturn` | `interface { activeFilter, setFilter, removeFilter, ... }` | useProjectInsights |

### 常量

| 常量 | 值 | 使用方 |
|------|-----|--------|
| `STALE_DAYS` | `14` | useProjectRisk |
| `ACTIVITY_DAYS` | `30` | useProjectStats |
| `MAX_HISTORY` | `20` | useProjectFilter |
| `EMPTY_STATS` | `ProjectStats` 零值模板 | useProjectStats, useProjectRisk |
| `RISK_META` | `Record<RiskKey, { label, hint, color }>` | useProjectRisk |
| `RISK_ORDER` | `RiskKey[]` 渲染顺序 | useProjectRisk |
| `FILTER_LABEL_MAP` | `Record<string, string>` | useProjectFilter |
| `FILTER_DIMENSION_COLORS` | `Record<string, string>` | useProjectFilter |
| `CLOSED_STATUSES` | `Set<string>` — `["done", "cancelled"]` | useProjectStats |

### 工具函数

| 函数 | 签名 | 使用方 |
|------|------|--------|
| `daysSince` | `(iso: string \| undefined) => number` | useProjectRisk |

## 背景

当前 `useProjectInsights.ts` (380 行，28 个导出项) 同时承担数据加载、聚合统计、风险检测、跨维度过滤、活动序列构建五类职责。任何修改都需要在 380 行中定位，`matchesFilter` 内部隐式调用 `statsFor`/`risksFor`/`healthFor`，形成紧耦合。

## 现状分析

| 职责 | 行数 | 导出项 | 建议归属 |
|------|------|--------|----------|
| 数据加载 | ~40 | `loading`, `lastUpdated`, `projects`, `issues`, `bugs`, `load` | `useProjectData` |
| 聚合统计 | ~80 | `statsByKey`, `statsFor`, `completionPct`, `rollup` | `useProjectStats` |
| 风险检测 | ~60 | `risksByKey`, `risksFor`, `healthFor`, `riskCounts`, `flaggedCount` | `useProjectRisk` |
| 跨维度过滤 | ~90 | `activeFilter`, `setFilter`, `removeFilter`, `clearAllFilters`, `undoLastFilter`, `matchesFilter`, `activeFilterPills`, `filterHistory` | `useProjectFilter` |
| 活动序列 | ~30 | `activitySeries` | `useProjectStats` |
| 工具函数/常量 | ~80 | `STALE_DAYS`, `RISK_META`, `daysSince`, `ProjectStats`, `EMPTY_STATS` | `types.ts` |

---

## 目标架构

```
┌──────────────────────────────────────────────────────────┐
│            useProjectInsights.ts (组合入口, ≤ 100 行)      │
│                                                          │
│  useProjectData()  ──→  projects, issues, bugs, loading  │
│       │                                                  │
│       ├── useProjectStats(projects, issues, bugs, date)   │
│       │   ──→  statsFor, completionPct, rollup,          │
│       │       activitySeries, topProjects                │
│       │                                                  │
│       ├── useProjectRisk(projects, issues, statsByKey)   │
│       │   ──→  risksFor, healthFor, riskCounts,          │
│       │       flaggedCount                               │
│       │                                                  │
│       └── useProjectFilter()                             │
│           ──→  activeFilter, setFilter, matchesFilter,   │
│                undoLastFilter, activeFilterPills, ...    │
│                                                          │
│  返回：统一接口（与现有 API 完全兼容）                      │
└──────────────────────────────────────────────────────────┘
```

**依赖方向（严格单向）：**

```
useProjectData  (无依赖)
    ↓
useProjectStats  (依赖 useProjectData 的输出)
    ↓
useProjectRisk   (依赖 useProjectStats 的 statsByKey)
    ↓
useProjectFilter (无依赖 — 纯状态管理)
    ↓
useProjectInsights (组合以上全部)
```

---

# 技术方案

## 框架能力确认

> 验证 Vue 3 Composition API 是否支持本次重构模式，无需改动框架或公共组件。

| 本次需求 | Vue 3 能力 | 依据 |
|---------|-----------|------|
| composable 接收 `Ref<T>` 参数 | `ref` / `computed` 作为函数参数传递，响应式自动追踪 | Vue 3 官方模式，项目已有 `useTable` 等先例 |
| composable 之间数据传递 | `ref` 引用传递，多 composable 共享同一响应式对象 | `useProjectData` 返回的 `ref` 直接传入 `useProjectStats` |
| `computed` 跨 composable 缓存 | 依赖不变时不重算，自动缓存 | Vue computed 内置 lazy evaluation |
| 纯函数 composable 可单元测试 | 无生命周期 hook 的 composable 可在任何环境下调用 | `useProjectStats`/`useProjectRisk`/`useProjectFilter` 均为纯逻辑 |
| 组合入口保持 API 兼容 | 返回对象解构赋值，调用方无需感知内部拆分 | `index.vue` 的解构赋值变量名和类型完全不变 |

## 公共改动

> `types.ts` 为本模块公共契约，所有 composable 依赖此文件，不产生跨模块影响。

### 常量

```typescript
// types.ts 新增常量
export const STALE_DAYS = 14;
export const ACTIVITY_DAYS = 30;
export const MAX_HISTORY = 20;

export const CLOSED_STATUSES = new Set(["done", "cancelled"]);

export const EMPTY_STATS: ProjectStats = {
  issues: 0, done: 0, open: 0, requirements: 0,
  overdue: 0, unassigned: 0, cycles: 0, activeCycles: 0,
  totalBugs: 0, lastActivity: "",
  statuses: {}, openPriorities: {}, types: {},
};

export const RISK_META: Record<RiskKey, { label: string; hint: string; color: string }> = {
  overdue:      { label: "逾期",   hint: "有未关闭 Issue 已超过截止日期",    color: "#ee6666" },
  stale:        { label: "停滞",   hint: "超过 14 天无活动记录",            color: "#fac858" },
  unassigned:   { label: "未分配",  hint: "有未关闭 Issue 未指定负责人",     color: "#73c0de" },
  no_members:   { label: "无成员",  hint: "项目成员列表为空",               color: "#9a60b4" },
  no_description:{ label: "无描述", hint: "项目描述为空或仅含空白字符",       color: "#91cc75" },
};

export const RISK_ORDER: RiskKey[] = ["overdue", "stale", "unassigned", "no_members", "no_description"];

export const FILTER_LABEL_MAP: Record<string, string> = {
  status: "状态", issueStatus: "Issue 状态", priority: "优先级",
  issueType: "Issue 类型", risk: "风险", health: "健康度",
  flagged: "已标记", project: "项目",
};

export const FILTER_DIMENSION_COLORS: Record<string, string> = {
  status: "#5470c6", issueStatus: "#73c0de", priority: "#fc8452",
  issueType: "#9a60b4", risk: "#ee6666", health: "#91cc75",
  flagged: "#e6a23c", project: "#3ba272",
};
```

### 工具函数

```typescript
// types.ts 新增工具函数
export function daysSince(iso?: string): number {
  if (!iso) return Infinity;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}
```

### 类型

```typescript
// types.ts 新增类型
export type RiskKey = "overdue" | "stale" | "unassigned" | "no_members" | "no_description";
export type HealthLevel = "good" | "warn" | "poor";

export interface ProjectStats {
  issues: number; done: number; open: number; requirements: number;
  overdue: number; unassigned: number; cycles: number; activeCycles: number;
  totalBugs: number; lastActivity: string;
  statuses: Record<string, number>; openPriorities: Record<string, number>;
  types: Record<string, number>;
}

export interface FilterPill { key: string; val: string; label: string; display: string; color: string; }
export type FilterState = Record<string, string>;

export interface UseProjectDataReturn { loading: Ref<boolean>; lastUpdated: Ref<string>; projects: Ref<Project[]>; issues: Ref<Issue[]>; bugs: Ref<BugDocument[]>; load: () => Promise<void>; }
export interface UseProjectStatsReturn { statsByKey: ComputedRef<Record<string, ProjectStats>>; statsFor: (key: string) => ProjectStats; completionPct: (key: string) => number; rollup: (list: Project[]) => RollupResult; activitySeries: (list: Project[]) => ActivityDay[]; topProjects: (list: Project[], limit?: number) => TopProjectRow[]; }
export interface UseProjectRiskReturn { risksByKey: ComputedRef<Record<string, RiskKey[]>>; risksFor: (key: string) => RiskKey[]; healthFor: (risks: RiskKey[]) => HealthLevel; riskCounts: ComputedRef<Record<RiskKey, number>>; flaggedCount: ComputedRef<number>; }
export interface UseProjectFilterReturn { activeFilter: Ref<FilterState>; setFilter: (key: string, val: string) => void; removeFilter: (key: string) => void; clearAllFilters: () => void; undoLastFilter: () => void; hasActiveFilter: ComputedRef<boolean>; canUndo: ComputedRef<boolean>; matchesFilter: (project: Project, stats: ProjectStats, risks: RiskKey[], health: HealthLevel) => boolean; activeFilterPills: ComputedRef<FilterPill[]>; }
```

---

## 详细设计

### Composable 1: useProjectData — 数据加载层

**文件：** `composables/useProjectData.ts` (~60 行)

**职责：** 加载 projects、issues、bugs 完整列表。**不包含任何聚合、过滤或统计逻辑。**

```typescript
export function useProjectData(): UseProjectDataReturn {
  const loading = ref(false);
  const lastUpdated = ref("");
  const projects = ref<Project[]>([]);
  const issues = ref<Issue[]>([]);
  const bugs = ref<BugDocument[]>([]);

  async function load(): Promise<void> {
    loading.value = true;
    try {
      const [projectRes, issueRes, bugRes] = await Promise.all([
        getProjectList({ pageSize: 500 }),
        getIssueList({ pageSize: 2000 }),
        getBugList({ pageSize: 2000 })
      ]);
      projects.value = (projectRes.data?.list as Project[]) ?? [];
      issues.value = (issueRes.data?.list as Issue[]) ?? [];
      bugs.value = (bugRes.data?.list as BugDocument[]) ?? [];
      lastUpdated.value = new Date().toLocaleTimeString();
    } finally {
      loading.value = false;
    }
  }

  return { loading, lastUpdated, projects, issues, bugs, load };
}
```

> `pageSize` 硬编码与当前实现一致，未来可改为参数化配置。

**错误处理策略：**

| 场景 | 处理方式 | 用户体验 |
|------|----------|----------|
| 单个 API 失败 | `Promise.all` 整体失败，不部分成功 | 避免数据不一致，用户看到 `loading = false` 但数据为空 |
| 网络超时 | 依赖 `RequestHttp` 的超时机制（默认 30s） | 用户可手动刷新 |
| API 返回格式异常 | `?? []` 兜底，确保始终为数组 | 静默降级，不崩溃 |
| 并发加载冲突 | 无防抖，每次调用 `load()` 发起新请求 | 由调用方控制 `load()` 调用频率 |

**性能考量：**

| 场景 | 策略 | 说明 |
|------|------|------|
| 重复调用 `load()` | 无内置去重 | 调用方（`index.vue`）在 `onMounted` 中仅调用一次 |
| 数据量 | projects ≤ 500, issues ≤ 2000, bugs ≤ 2000 | 当前数据量级，无需分页 |
| 内存占用 | 3 个 ref 数组，~5000 条记录 | 估算 < 5MB，可接受 |

### Composable 2: useProjectStats — 统计聚合层

**文件：** `composables/useProjectStats.ts` (~130 行)

**职责：** 基于原始数据计算聚合统计。**纯计算逻辑，无副作用。**

```typescript
export function useProjectStats(
  projects: Ref<Project[]>,
  issues: Ref<Issue[]>,
  bugs: Ref<BugDocument[]>,
  filterDateStr?: Ref<string>
): UseProjectStatsReturn {
  const dateFilteredIssues = computed(() => {
    const raw = issues.value;
    const date = filterDateStr?.value;
    if (!date || !raw.length) return raw;
    return raw.filter(i => (i.due_date || "").slice(0, 10) === date);
  });

  const statsByKey = computed(() => {
    const map: Record<string, ProjectStats> = {};
    for (const p of projects.value) {
      const projectIssues = dateFilteredIssues.value.filter(i => i.project_key === p.key);
      const projectBugs = bugs.value.filter(b => b.project_key === p.key);
      const openIssues = projectIssues.filter(i => !CLOSED_STATUSES.has(i.status));
      map[p.key] = {
        issues: projectIssues.length,
        done: projectIssues.filter(i => CLOSED_STATUSES.has(i.status)).length,
        open: openIssues.length,
        requirements: projectIssues.filter(i => i.type === "requirement").length,
        overdue: openIssues.filter(i => i.due_date && new Date(i.due_date) < new Date()).length,
        unassigned: openIssues.filter(i => !i.assignee).length,
        cycles: p.cycles?.length ?? 0,
        activeCycles: p.cycles?.filter(c => c.status === "active").length ?? 0,
        totalBugs: projectBugs.length,
        lastActivity: p.last_activity ?? "",
        statuses: countBy(projectIssues, "status"),
        openPriorities: countBy(openIssues, "priority"),
        types: countBy(projectIssues, "type"),
      };
    }
    return map;
  });

  function statsFor(key: string): ProjectStats {
    return statsByKey.value[key] ?? { ...EMPTY_STATS };
  }

  function completionPct(key: string): number {
    const s = statsFor(key);
    return s.issues > 0 ? Math.round((s.done / s.issues) * 100) : 0;
  }

  function rollup(list: Project[]): RollupResult { /* ... */ }
  function activitySeries(list: Project[]): ActivityDay[] { /* ... */ }
  function topProjects(list: Project[], limit = 10): TopProjectRow[] { /* ... */ }

  return { statsByKey, statsFor, completionPct, rollup, activitySeries, topProjects };
}
```

**关键实现细节：**
- `CLOSED` 状态集合：`new Set(["done", "cancelled"])`
- 所有百分比使用 `Math.round()` 避免浮点累加误差
- `activitySeries` 构建 30 天零填充数组
- `EMPTY_STATS` 常量作为 `statsFor()` 的默认值模板

**computed 依赖追踪：**

```
statsByKey
  ├── 依赖：projects.value, issues.value, bugs.value
  ├── 触发条件：任一 ref 被整体替换（load() 完成后）
  └── 缓存策略：Vue computed 自动缓存，依赖不变时不重算

dateFilteredIssues
  ├── 依赖：issues.value, filterDateStr?.value
  ├── 触发条件：issues 更新 或 日期过滤变化
  └── 注意：filterDateStr 为可选 Ref，未传入时不追踪

statsFor(key)
  ├── 非 computed（普通函数），每次调用时从 statsByKey.value 取值
  └── 性能：O(1) Map 查找，无额外计算开销
```

**性能考量：**

| 操作 | 复杂度 | 数据量 | 预估耗时 |
|------|--------|--------|----------|
| `statsByKey` 计算 | O(n × m) 500 项目 × 2000 issues | 1M 次比较 | < 5ms |
| `statsFor(key)` | O(1) | Map 查找 | < 0.01ms |
| `activitySeries` | O(n) 30 天 | 30 次迭代 | < 0.1ms |
| `rollup` | O(n) 500 项目 | 500 次迭代 | < 1ms |

### Composable 3: useProjectRisk — 风险检测层

**文件：** `composables/useProjectRisk.ts` (~100 行)

**职责：** 基于项目数据和 Issue 数据检测风险信号。**纯计算逻辑，无副作用。**

```typescript
export function useProjectRisk(
  projects: Ref<Project[]>,
  issues: Ref<Issue[]>,
  statsByKey: ComputedRef<Record<string, ProjectStats>>,
  filterDateStr?: Ref<string>
): UseProjectRiskReturn {
  const risksByKey = computed(() => {
    const map: Record<string, RiskKey[]> = {};
    for (const p of projects.value) {
      const stats = statsByKey.value[p.key];
      if (!stats) { map[p.key] = []; continue; }
      const risks: RiskKey[] = [];

      const dateIssues = filterDateStr?.value
        ? issues.value.filter(i => (i.due_date || "").slice(0, 10) === filterDateStr.value)
        : issues.value;

      const projectIssues = dateIssues.filter(i => i.project_key === p.key);
      const openIssues = projectIssues.filter(i => !CLOSED_STATUSES.has(i.status));

      if (openIssues.some(i => i.due_date && new Date(i.due_date) < new Date())) {
        risks.push("overdue");
      }
      if (p.status !== "archived" && daysSince(p.last_activity) >= STALE_DAYS) {
        risks.push("stale");
      }
      if (openIssues.some(i => !i.assignee)) {
        risks.push("unassigned");
      }
      if (!p.members?.length) {
        risks.push("no_members");
      }
      if (!p.description?.trim()) {
        risks.push("no_description");
      }

      map[p.key] = risks;
    }
    return map;
  });

  function risksFor(key: string): RiskKey[] {
    return risksByKey.value[key] ?? [];
  }

  function healthFor(risks: RiskKey[]): HealthLevel {
    if (risks.includes("overdue") || risks.length >= 3) return "poor";
    if (risks.length > 0) return "warn";
    return "good";
  }

  const riskCounts = computed(() => { /* ... */ });
  const flaggedCount = computed(() => { /* ... */ });

  return { risksByKey, risksFor, healthFor, riskCounts, flaggedCount };
}
```

**风险检测规则：**

| 风险 | 条件 | 归档项目处理 |
|------|------|-------------|
| `overdue` | 有未关闭 Issue 且 `due_date < today` | 适用 |
| `stale` | `daysSince(lastActivity) >= 14` | **跳过**（归档项目预期不活跃） |
| `unassigned` | 有未关闭 Issue 且 `assignee` 为空 | 适用 |
| `no_members` | `members` 数组为空 | 适用 |
| `no_description` | `description` 为空或仅含空白字符 | 适用 |

**健康度评分：**

```typescript
function healthFor(risks: RiskKey[]): HealthLevel {
  if (risks.includes("overdue") || risks.length >= 3) return "poor";
  if (risks.length > 0) return "warn";
  return "good";
}
```

**风险检测边界条件：**

| 场景 | 处理方式 |
|------|----------|
| 项目无 Issue | 不触发 `overdue`/`unassigned`，但可触发 `stale`/`no_members`/`no_description` |
| `due_date` 为 null/undefined | 不匹配 `overdue` 条件 |
| `lastActivity` 为 null/undefined | `daysSince` 返回 `Infinity`，触发 `stale` |
| 归档项目 | 跳过 `stale` 检测，仍检测其他 4 项 |
| 空 `members` 数组 | 触发 `no_members` |
| `description` 仅含空白字符 | 触发 `no_description`（trim 后判断） |

### Composable 4: useProjectFilter — 过滤层

**文件：** `composables/useProjectFilter.ts` (~120 行)

**职责：** 管理跨维度过滤栈，支持 undo/redo 历史。**不访问数据源，不依赖其他 composable。**

**关键设计决策：** `matchesFilter` 不再内部调用 `statsFor`/`risksFor`/`healthFor`，而是接收已计算好的值作为参数。这消除了过滤层对统计层和风险层的隐式依赖。

```typescript
export function useProjectFilter(): UseProjectFilterReturn {
  const activeFilter = ref<FilterState>({});
  const filterHistory = ref<FilterState[]>([]);

  function setFilter(key: string, val: string) {
    filterHistory.value.push({ ...activeFilter.value });
    if (filterHistory.value.length > MAX_HISTORY) filterHistory.value.shift();
    activeFilter.value = { ...activeFilter.value, [key]: val };
  }

  function removeFilter(key: string) {
    filterHistory.value.push({ ...activeFilter.value });
    const next = { ...activeFilter.value };
    delete next[key];
    activeFilter.value = next;
  }

  function clearAllFilters() {
    filterHistory.value = [];
    activeFilter.value = {};
  }

  function undoLastFilter() {
    const prev = filterHistory.value.pop();
    if (prev) activeFilter.value = prev;
  }

  const hasActiveFilter = computed(() => Object.keys(activeFilter.value).length > 0);
  const canUndo = computed(() => filterHistory.value.length > 0);

  function matchesFilter(
    project: Project,
    stats: ProjectStats,
    risks: RiskKey[],
    health: HealthLevel
  ): boolean {
    const f = activeFilter.value;
    if (f.status && project.status !== f.status) return false;
    if (f.project && project.key !== f.project) return false;
    if (f.issueStatus && !(stats.statuses[f.issueStatus] > 0)) return false;
    if (f.priority && !(stats.openPriorities[f.priority] > 0)) return false;
    if (f.issueType && !(stats.types[f.issueType] > 0)) return false;
    if (f.risk && !risks.includes(f.risk as RiskKey)) return false;
    if (f.health && health !== f.health) return false;
    if (f.flagged && !risks.length) return false;
    return true;
  }

  const activeFilterPills = computed(() => { /* ... */ });

  return { activeFilter, setFilter, removeFilter, clearAllFilters, undoLastFilter,
    hasActiveFilter, canUndo, matchesFilter, activeFilterPills };
}
```

**过滤维度注册表：**

| 维度 key | 过滤逻辑 | Pill 颜色 |
|----------|----------|-----------|
| `status` | `project.status === val` | `#5470c6` |
| `issueStatus` | `stats.statuses[val] > 0` | `#73c0de` |
| `priority` | `stats.openPriorities[val] > 0` | `#fc8452` |
| `issueType` | `stats.types[val] > 0` | `#9a60b4` |
| `risk` | `risks.includes(val)` | `#ee6666` |
| `health` | `health === val` | `#91cc75` |
| `flagged` | `risks.length > 0` | `#e6a23c` |
| `project` | `project.key === val` | `#3ba272` |

**过滤历史栈设计：**

```
filterHistory: FilterState[]  (最大深度 MAX_HISTORY = 20)
  ├── push: setFilter() 时推入当前状态
  ├── pop: undoLastFilter() 时弹出恢复
  └── 边界：
      ├── 栈满时：shift 最旧记录（FIFO 淘汰）
      ├── 栈空时：undoLastFilter() 无操作
      └── clearAllFilters() 清空栈
```

### 组合入口：useProjectInsights

**文件：** `composables/useProjectInsights.ts` (重写，≤100 行)

```typescript
export function useProjectInsights(filterDateStr?: Ref<string>) {
  const { loading, lastUpdated, projects, issues, bugs, load } = useProjectData();
  const { statsByKey, statsFor, completionPct, rollup, activitySeries, topProjects } =
    useProjectStats(projects, issues, bugs, filterDateStr);
  const { risksByKey, risksFor, healthFor, riskCounts, flaggedCount } =
    useProjectRisk(projects, issues, statsByKey, filterDateStr);
  const { activeFilter, setFilter, removeFilter, clearAllFilters, undoLastFilter,
    hasActiveFilter, canUndo, matchesFilter, activeFilterPills } = useProjectFilter();

  const matches = (p: Project) =>
    matchesFilter(p, statsFor(p.key), risksFor(p.key), healthFor(p.key));

  return {
    loading, lastUpdated, projects, issues, bugs, load,
    statsByKey, statsFor, completionPct, rollup, activitySeries, topProjects,
    risksByKey, risksFor, healthFor, riskCounts, flaggedCount,
    activeFilter, setFilter, removeFilter, clearAllFilters, undoLastFilter,
    hasActiveFilter, canUndo, matchesFilter: matches, activeFilterPills
  };
}
```

**兼容性保证：** `index.vue` 中的解构赋值无需任何修改。

---

## 接口依赖

| # | 接口 | 调用方 | 说明 |
|---|------|--------|------|
| 1 | `getProjectList({ pageSize: 500 })` | useProjectData | RPC `data_service.query_documents` |
| 2 | `getIssueList({ pageSize: 2000 })` | useProjectData | RPC `data_service.query_documents` |
| 3 | `getBugList({ pageSize: 2000 })` | useProjectData | RPC `data_service.query_documents` |

> `useProjectStats`、`useProjectRisk`、`useProjectFilter` 不调用任何 API，纯计算逻辑。

---

## 迁移顺序

按依赖方向自底向上迁移，每步完成后验证。

### 步骤 1：扩展 types.ts

- 新增所有常量、类型、工具函数
- **验证：** `vue-tsc --noEmit` 通过，0 新增错误

### 步骤 2：创建 `useProjectData.ts`

- 从 `useProjectInsights.ts` 迁移数据加载逻辑
- 文件预计 ~60 行
- **验证：** `vue-tsc --noEmit` 通过，导出类型与 `UseProjectDataReturn` 匹配

### 步骤 3：创建 `useProjectStats.ts`

- 迁移统计聚合逻辑，依赖 `useProjectData` 的输出类型
- 文件预计 ~130 行
- **验证：** `vue-tsc --noEmit` 通过，`statsFor` 空 key 返回 `EMPTY_STATS`

### 步骤 4：创建 `useProjectRisk.ts` 和 `useProjectFilter.ts`

- 迁移风险检测和过滤逻辑（可并行）
- 文件预计 ~100 行 + ~120 行
- **验证：** `vue-tsc --noEmit` 通过，`matchesFilter` 签名改为参数注入

### 步骤 5：重写 `useProjectInsights.ts`

- 组合以上 4 个 composable，对外 API 与现有完全一致
- 文件预计 ≤100 行
- **验证：** `index.vue` 的解构赋值无需任何修改，`vue-tsc --noEmit` 通过

### 步骤 6：循环依赖检测

```bash
npx madge --circular --extensions ts src/views/project/composables/
```

预期输出：`No circular dependencies found!`

### 步骤 7：功能回归

- 列表页：过滤、搜索、排序、统计、风险标记全部正常
- 图表渲染正确（状态分布、优先级分布、类型分布、Top Projects、活跃度）
- 过滤历史 undo 正常
- 导出 CSV 正常

---

## 实现注意事项

### matchesFilter 解耦是核心改动

当前 `matchesFilter` 内部隐式调用 `statsFor`/`risksFor`/`healthFor`，形成紧耦合。重构后改为参数注入，使 `useProjectFilter` 成为纯状态管理。这是整个分层架构中最关键的改动，直接影响可测试性。

**重构前后对比：**

```
重构前：
  matchesFilter(project) {
    const stats = statsFor(project.key);    // 隐式依赖 useProjectStats
    const risks = risksFor(project.key);    // 隐式依赖 useProjectRisk
    const health = healthFor(risks);         // 隐式依赖 useProjectRisk
    // ...过滤逻辑
  }

重构后：
  matchesFilter(project, stats, risks, health) {
    // 仅依赖传入参数，纯函数
    // ...过滤逻辑
  }

  // 组合入口负责桥接：
  const matches = (p: Project) =>
    matchesFilter(p, statsFor(p.key), risksFor(p.key), healthFor(p.key));
```

### 兼容性保证

`useProjectInsights` 对外接口与现有完全一致。验证方式：重构前后 `index.vue` 中解构赋值的变量名和类型完全相同。

**兼容性验证脚本：**

```typescript
// 重构前后 index.vue 中的使用方式不变
const {
  loading, lastUpdated, projects, issues, bugs, load,
  statsByKey, statsFor, completionPct, rollup, activitySeries, topProjects,
  risksByKey, risksFor, healthFor, riskCounts, flaggedCount,
  activeFilter, setFilter, removeFilter, clearAllFilters, undoLastFilter,
  hasActiveFilter, canUndo, matchesFilter, activeFilterPills
} = useProjectInsights(filterDateStr);
```

### 响应式依赖追踪

- `useProjectData` 返回的 `ref` 直接传入 `useProjectStats`/`useProjectRisk`，Vue 自动追踪响应式依赖
- `statsByKey` 作为 `ComputedRef` 传入 `useProjectRisk`，`risksByKey` 依赖 `statsByKey` 的变更自动重算
- `filterDateStr` 为可选 `Ref<string>`，未传入时 `useProjectStats` 不追踪日期过滤
- 所有 `computed` 均遵循 Vue 的 lazy evaluation：依赖不变时不重算

### 文件组织规范

- 每个 composable 一个文件，文件名 `use<Name>.ts`
- 返回类型定义在 `types.ts` 中统一管理（`UseProjectDataReturn` 等）
- 常量、工具函数集中在 `types.ts`，不分散在各 composable 文件中
- 各 composable 之间通过 `import type` 引用类型，不产生运行时循环依赖

### 类型安全

- 所有 composable 返回值使用显式接口类型（`UseProjectDataReturn` 等），不使用 `ReturnType<typeof fn>`
- 组合入口的返回类型为以上接口的交叉类型，`index.vue` 解构时获得完整类型推断
- `vue-tsc --noEmit` 必须在每步完成后通过，不允许累积类型错误

---

## 可测试性

| Composable | 测试类型 | 可测试性 | 说明 |
|------------|----------|----------|------|
| `useProjectData` | 集成测试 | 需要 mock API | 涉及异步 API 调用 |
| `useProjectStats` | 纯函数单元测试 | **高** | 给定输入可验证输出 |
| `useProjectRisk` | 纯函数单元测试 | **高** | 风险检测规则可独立验证 |
| `useProjectFilter` | 纯函数单元测试 | **高** | `matchesFilter`、历史栈逻辑可独立测试 |
| `useProjectInsights` | 集成测试 | 中 | 组合入口，验证整体 API 兼容性 |

### 单元测试用例建议

**useProjectStats：**
- 空输入 → 空 statsByKey
- 单项目无 Issue → stats 全零
- 日期过滤 → 仅统计匹配日期的 Issue
- `completionPct` 计算 → 0%, 50%, 100% 边界

**useProjectRisk：**
- 无 Issue 项目 → 无 overdue/unassigned 风险
- 逾期 Issue → 触发 overdue
- 14 天未更新 → 触发 stale
- 归档项目 + stale → 不触发 stale
- 3 个风险 → health = "poor"

**useProjectFilter：**
- 空过滤 → 所有项目通过
- 单维度过滤 → 匹配项目通过
- 多维度过滤 → AND 逻辑
- undo 空栈 → 无操作
- 超过 20 个历史 → 淘汰最旧记录

---

## 风险与回滚方案

### 风险识别

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| 类型推导错误导致 `vue-tsc` 失败 | 中 | 阻塞构建 | 每步完成后立即运行 `vue-tsc --noEmit` |
| 循环依赖 | 低 | 运行时错误 | 步骤 6 用 `madge --circular` 检测 |
| 响应式断链（ref 传递后丢失响应性） | 低 | 数据不更新 | 所有 composable 接收 `Ref<T>` 而非 `.value` |
| 兼容性遗漏（某导出项缺失） | 中 | `index.vue` 运行时 undefined | 步骤 5 完成后对比重构前后的导出项列表 |
| 性能回退（computed 缓存失效） | 低 | 重复计算 | 确认 `computed` 依赖链未被破坏 |

### 回滚方案

重构以 composable 文件为单位，回滚方式为直接恢复 `useProjectInsights.ts` 的单文件版本：

```bash
git checkout HEAD -- src/views/project/composables/useProjectInsights.ts
rm src/views/project/composables/useProjectData.ts
rm src/views/project/composables/useProjectStats.ts
rm src/views/project/composables/useProjectRisk.ts
rm src/views/project/composables/useProjectFilter.ts
git checkout HEAD -- src/views/project/types.ts
```

回滚后 `index.vue` 无需任何修改，因为对外 API 完全兼容。

---

## 验收标准

- [ ] `useProjectData.ts` 文件存在，仅包含数据加载逻辑 (~60 行)
- [ ] `useProjectFilter.ts` 文件存在，仅包含过滤逻辑 (~120 行)
- [ ] `useProjectRisk.ts` 文件存在，仅包含风险检测逻辑 (~100 行)
- [ ] `useProjectStats.ts` 文件存在，仅包含统计聚合逻辑 (~130 行)
- [ ] `useProjectInsights.ts` 组合入口 ≤ 100 行
- [ ] `types.ts` 包含所有提取的常量和类型定义
- [ ] `index.vue` 无需任何修改即可正常工作
- [ ] 列表页：过滤、搜索、排序、统计、风险标记全部正常
- [ ] 图表渲染正确（状态分布、优先级分布、类型分布、Top Projects、活跃度）
- [ ] 过滤历史 undo 正常
- [ ] 导出 CSV 正常
- [ ] `vue-tsc --noEmit` 通过，0 新增错误
- [ ] 各 composable 无循环依赖（`madge --circular` 通过）
- [ ] `matchesFilter` 参数注入正确，过滤层不依赖 stats/risk 层

---

*PRD 来源: `projects/yivad/requires/2026-09/00-需求总览.md`*