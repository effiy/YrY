---
prd_task_id: "YV-09-94"
title: "YV-09-94-1: 首页数据看板优化 — 开发方案"
status: 已完成
priority: P1
owner: Chengliang.Yi
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiVad
project_id: yivad
prd_month: "202609"
estimate_frontend: 0.15
source_prd: "94-prd-首页数据看板优化.md"
source_okr: [yivad-003]
type: task
category: projects/yivad/devs
source: YiVad
tags: [yivad, dev, 首页数据看板优化]
related_tests: ["YV-09-94"]
implementation_progress: "6/6 子任务完成，4 文件修改"
benefit: "开发方案：task-首页数据看板优化"
lifecycle: active
---

# YV-09-94-1: 首页数据看板优化 — 开发方案

> 来源 PRD：[94-prd-首页数据看板优化](../../prds/2026-09/94-prd-首页数据看板优化.md)
> 来源 Test：[94-prd-test-首页数据看板优化](../../tests/2026-09/94-prd-test-首页数据看板优化.md)
> 需求编号：YV-09-94 · 优先级：P1 · 人天：0.15d · 状态：全部完成（6/6 子任务，4 文件修改）

---

## 源码索引

| 文件 | 说明 | 行数 |
|------|------|------|
| `src/views/home/index.vue` | 首页 — 5卡布局 + 横幅 + 侧边栏去重 + 完成率修正 | +38/−8 |
| `src/hooks/useHomeData.ts` | Delta 扩展 + backlog 排除 + 7日窗口 | +6/−4 |
| `src/languages/modules/home/zh.ts` | 4 个新 i18n key | +4/−0 |
| `src/languages/modules/home/en.ts` | 4 个新 i18n key | +4/−0 |

---

## 任务拆解

### Task 1: 正负指标平衡

| 属性 | 值 |
|------|-----|
| 文件 | `src/views/home/index.vue` |
| 优先级 | P0 |
| 状态 | ✅ 完成 |

**实现**：
- `StatCard` 接口新增 `good?: boolean`
- `statCards` 从 3 项扩展为 5 项：Active / Done Today / Bugs / Resolved Today / Overdue
- 新增 `animDoneToday`、`animResolvedToday` 动画数字
- 第 2/4 位正向卡片设 `good: true` → 绿色左边框
- CSS 新增 `.is-good { border-left: 3px solid var(--el-color-success); }`
- 统计卡片 grid `minmax` 从 180px 缩至 170px（适配 6 列）

### Task 2: 零值消除

| 属性 | 值 |
|------|-----|
| 文件 | `src/hooks/useHomeData.ts` + i18n |
| 优先级 | P0 |
| 状态 | ✅ 完成 |

**实现**：
- 新增 `weekAgoStr()` 辅助函数（`dayStr(-7)`）
- `todayDoneCount` filter: `issueToday` → `issueWeek`（1天→7天）
- `todayBugResolvedCount` filter: 移除 `updatedAt` 时间条件，查全量 resolved+closed
- i18n: `doneToday`="近期完成"/"Recent Done"，`resolvedToday`="已修复"/"Fixed"

**数据验证**：

| 指标 | 旧查询结果 | 新查询结果 |
|------|-----------|-----------|
| done (issueWeek) | 2 (单日) | 6 (7日) |
| resolved bugs (全量) | 0 (近期) | 149 (累计) |

### Task 3: 积压项排除

| 属性 | 值 |
|------|-----|
| 文件 | `src/hooks/useHomeData.ts` + `src/views/home/index.vue` |
| 优先级 | P0 |
| 状态 | ✅ 完成 |

**实现**：
- `useHomeData.ts`: `NOT_DONE` 新增 `"backlog"`/`"Backlog"`
- 影响：`activeIssueCount`、`blockedCount`、`assigneeGroups` 的 `$nin` 过滤器
- `index.vue`: `completionTotal = totalIssues - cancelledCount - backlogCount`

**数据影响**：活跃 Issue 531→353 (−178)，完成率 18%→25% (+7pp)

### Task 4: 侧边栏去重

| 属性 | 值 |
|------|-----|
| 文件 | `src/views/home/index.vue` + i18n |
| 优先级 | P1 |
| 状态 | ✅ 完成 |

**实现**：
- 侧边栏快照原显示 活跃 Issue + 缺陷（与主卡片重复）
- 改为：今日完成 (animDoneToday) + 昨日完成 (yesterdayDoneCount)
- i18n 新增 `yesterdayLabel`="昨日完成"/"Y-day Done"

### Task 5: 近期摘要横幅

| 属性 | 值 |
|------|-----|
| 文件 | `src/views/home/index.vue` + i18n |
| 优先级 | P1 |
| 状态 | ✅ 完成 |

**实现**：
- 新增 `.ho-today-bar` 横幅组件（统计卡片下方）
- 使用 `recentSummary` i18n key：`"近期: 完成 {done} · 新建 {created} · 缺陷修复 {bugs}"`
- 样式：`background: var(--el-color-primary-light-9)` + 8px 圆角

### Task 6: 逾期 Delta 修复

| 属性 | 值 |
|------|-----|
| 文件 | `src/hooks/useHomeData.ts` |
| 优先级 | P1 |
| 状态 | ✅ 完成 |

**实现**：
- `HomeDeltas` 接口新增 `overdueCount: number`
- `EMPTY_DELTAS` 新增 `overdueCount: 0`
- `DELTA_KEYS` 数组追加 `"overdueCount"`
- 逾期卡片 delta 从硬编码 0 改为 `deltas.value.overdueCount`

---

## 代码清理

- 移除未使用的 `weekAgoMs()` 函数和 `bugWeek`/`wMs` 变量

---

## 质量门禁

- [x] `vue-tsc --noEmit` 通过（0 新增错误）
- [x] 所有 6 个子任务完成
- [x] 4 个文件变更可审查
- [x] 无控制台错误
- [x] 无未使用的变量/函数