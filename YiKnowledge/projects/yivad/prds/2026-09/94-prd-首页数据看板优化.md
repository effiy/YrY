---
title: YiVad 首页数据看板优化 — 正负指标平衡、零值消除、统计准确性修复
tags:
- 需求文档
- 首页优化
- 数据看板
- 统计修复
category: 项目/管理后台/需求
created: '2026-09-23'
updated: '2026-09-23'
source: 内部
type: 需求
status: 已完成
implementation_progress: 全部完成（5 文件修改）
implementation_updated: '2026-09-23'
priority: P1
project: YiVad
project_id: yivad
owner: Chengliang.Yi
prd_month: '202609'
prd_task_id: YV-09-94
estimate_frontend: 0.15
review_status: 已评审
issue_type: 体验优化
roles:
- engineer
source_okr: [yivad-003]
related_modules: ["YV-09-94-1"]
related_tests: ["YV-09-94"]
benefit: "产品需求：首页数据看板优化"
lifecycle: active
---

# YiVad 首页数据看板优化

> 需求编号：YV-09-94 · 总人天：~0.15d · 涉及模块：home/index.vue、useHomeData.ts、i18n (zh/en)

> **文档职责**：本文档定义**要做什么、为什么做、做到什么程度算完成**（WHAT / WHY）。
> 实现方案见 [开发方案](../../devs/2026-09/94-prd-task-首页数据看板优化.md)，验证方案见 [测试方案](../../tests/2026-09/94-prd-test-首页数据看板优化.md)。

---

## 目录

- [1. 背景与动机](#sec-1)
- [2. 现状分析](#sec-2)
- [3. 需求范围](#sec-3)
- [4. 功能需求](#sec-4)
- [5. 设计决策](#sec-5)
- [6. 验收标准](#sec-6)
- [7. 数据影响](#sec-7)

---

<a id="sec-1"></a>
## 1. 背景与动机

### 1.1 问题

首页统计看板存在三个核心问题：

**问题 1：全负面指标**。3 张统计卡片均为"坏消息"（活跃 Issue、缺陷、逾期），用户打开首页即被负面数据包围。系统已拉取 `todayDoneCount`、`todayBugResolvedCount` 等正向指标但未展示。

**问题 2：正向指标归零**。`todayDoneCount` 使用单日窗口（当日完成 0~2 件），`todayBugResolvedCount` 使用近期窗口（近 18 天无修复 → 0），两张正向卡片显示 "0" 毫无信息量。

**问题 3：积压项污染统计**。178 条 backlog/Backlog 状态的 Issue 被计入"活跃 Issue"、"阻塞项"、"团队负载"和"完成率分母"。积压项本质是"停车场"而非"进行中"，不应稀释各项指标。

### 1.2 目标

- 首页统计卡片正负指标交错排列，视觉平衡
- 正向指标显示有意义的非零数值
- 积压项从活跃/阻塞/负载/完成率统计中排除
- 侧边栏不再重复主卡片数据

---

<a id="sec-2"></a>
## 2. 现状分析

### 2.1 改造前数据（2026-09-23 实测）

| 指标 | 数值 | 问题 |
|------|------|------|
| 活跃 Issue | 531 | 含 178 积压项，虚高 |
| 今日完成 | 2 | 单日窗口，几乎无活动 |
| 今日修复 | 0 | 近 18 天无 bug 修复 |
| 完成率 | 18% | 分母含积压，严重偏低 |
| 逾期 delta | 硬编码 0 | 不反映真实变化 |
| 侧边栏 | 重复活跃/缺陷 | 与主卡片数据完全重复 |
| 统计卡片 | 仅 3 张全负面 | 无正向指标 |

### 2.2 数据库实况

```
issues: 总计 653
  done/Done: 120 (18%)    backlog/Backlog: 178 (27%)
  todo/To Do: 127 (19%)   in_progress/In Progress: 123 (19%)
  Review: 103 (16%)       cancelled/Cancelled: 2 (0.3%)

bugs: 总计 206
  resolved: 81 (39%)    closed: 68 (33%)
  in_progress: 32 (16%) open: 24 (12%)
  fixed: 1 (0.5%)
```

---

<a id="sec-3"></a>
## 3. 需求范围

| 编号 | 需求项 | 优先级 | 估算 |
|------|--------|--------|------|
| FR-1 | 正负指标平衡：新增 2 张正向统计卡片 | P0 | 0.05d |
| FR-2 | 零值消除：done 扩至 7 日窗口，bugs 改为累计值 | P0 | 0.03d |
| FR-3 | 积压项排除：从活跃/阻塞/负载/完成率统计中排除 | P0 | 0.02d |
| FR-4 | 侧边栏去重：改为今日/昨日完成对比 | P1 | 0.02d |
| FR-5 | 今日摘要横幅：新增近期摘要蓝色横幅 | P1 | 0.02d |
| FR-6 | 逾期 delta 修复：硬编码 0 → 真实变化量 | P1 | 0.01d |

**范围外**：不新增后端 API、不改动其他页面、不涉及数据库迁移。

---

<a id="sec-4"></a>
## 4. 功能需求

### FR-1：正负指标平衡 (P0)

**目标**：统计卡片从 3 张全负面扩展为 5 张正负交错 + 1 仪表盘。

| 位置 | 指标 | 颜色 | Delta | 左边框 |
|------|------|------|-------|--------|
| 1 | 活跃 Issue | 蓝色 primary | 5min 变化 | — |
| 2 | 近期完成 | 绿色 success | — | **绿色 is-good** |
| 3 | 缺陷 | 红色 danger | 5min 变化 | — |
| 4 | 已修复 | 翠绿 #10b981 | — | **绿色 is-good** |
| 5 | 逾期 | 橙色 warning | 5min 变化 | 橙色 is-warn |
| 6 | 完成率仪表盘 | 动态（阈值着色） | — | — |

**视觉布局**：

```
┌─────────┬──────────┬─────────┬──────────┬─────────┬──────────┐
│ 活跃 353 │ ✓ 近期完成 6│ 缺陷 24  │ ✓ 已修复 149│ 逾期 1  │ 完成率 25% │
│ (蓝色)   │ (绿色)    │ (红色)   │ (翠绿)    │ (橙色)   │ 120/473   │
└─────────┴──────────┴─────────┴──────────┴─────────┴──────────┘
```

**技术实现**：
- `index.vue`: `StatCard` 接口新增 `good?: boolean`；`statCards` 数组扩展为 5 项
- `index.vue`: 新增 `animDoneToday`、`animResolvedToday` 动画数字
- CSS: `&.is-good { border-left: 3px solid var(--el-color-success); }`

### FR-2：零值消除 (P0)

**目标**：正向指标不再显示 0。

| 指标 | 之前 | 之后 | 查询变更 |
|------|------|------|---------|
| 近期完成 | 2 (单日) | **6** (7 日) | `updated_at: { $gte: weekAgo }` |
| 已修复 | 0 (近期) | **149** (累计) | 去掉时间过滤，查全量 resolved+closed |

**技术实现**：
- `useHomeData.ts`: 新增 `weekAgoStr()` 辅助函数
- `todayDoneCount` filter: `issueToday` → `issueWeek`
- `todayBugResolvedCount` filter: 移除 `updatedAt` 时间条件
- i18n: `doneToday`: "近期完成" / "Recent Done"，`resolvedToday`: "已修复" / "Fixed"

### FR-3：积压项排除 (P0)

**目标**：backlog/Backlog 状态的 Issue 不再计入活跃、阻塞、负载和完成率统计。

**变更**：
- `NOT_DONE` 数组从 `["done","Done","cancelled","Cancelled"]` 扩展为追加 `"backlog"`/`"Backlog"`
- 影响范围：`activeIssueCount`、`blockedCount`、`assigneeGroups` 三处 `$nin` 过滤器
- `completionTotal` 从 `totalIssues - cancelledCount` 改为 `totalIssues - cancelledCount - backlogCount`

**数据影响**：

| 指标 | 修复前 | 修复后 | 变化 |
|------|--------|--------|------|
| 活跃 Issue | 531 | 353 | −178 (−34%) |
| 完成率 | 18% (120/651) | 25% (120/473) | +7pp |
| 团队负载 | 含积压分配 | 仅活跃任务 | 更准确 |

### FR-4：侧边栏去重 (P1)

**目标**：侧边栏快照不再重复主卡片数据（活跃 Issue、缺陷），改为时间维度的独立数据。

| 位置 | 之前 | 之后 |
|------|------|------|
| 1 | 活跃 Issue (蓝色) | 今日完成 (绿色 animDoneToday) |
| 2 | 缺陷 (红色) | 昨日完成 (灰色 yesterdayDoneCount) |
| 3 | 文档 | 文档 (不变) |
| 4 | 对话 | 对话 (不变) |

**新增 i18n**: `yesterdayLabel`: "昨日完成" / "Y-day Done"

### FR-5：近期摘要横幅 (P1)

**目标**：统计卡片下方显示紧凑横幅，提供关键信息一览。

**格式**：`近期: 完成 {done} · 新建 {created} · 缺陷修复 {bugs}`

**样式**：浅蓝背景 `var(--el-color-primary-light-9)`，8px 圆角

**新增 i18n**: `recentSummary`

### FR-6：逾期 delta 修复 (P1)

**目标**：逾期卡片 delta 不再硬编码为 0。

**变更**：
- `HomeDeltas` 接口新增 `overdueCount`
- `EMPTY_DELTAS` 新增 `overdueCount: 0`
- `DELTA_KEYS` 数组追加 `"overdueCount"`

---

<a id="sec-5"></a>
## 5. 设计决策

### 决策 1：done 窗口 — 7 日 vs 30 日 vs 累计

| 窗口 | 当前数据 | 优 | 劣 |
|------|---------|-----|-----|
| 1 日 | 2 | 精准 | **常为 0** |
| 7 日 | 6 | 有统计意义 | 略宽 |
| 30 日 | ~15 | 数值更大 | 失去"近期"含义 |
| 累计 | 120 | 数值最大 | 与"近期"语义冲突 |

**选择 7 日**：兼顾数据非零和"近期"语义。

### 决策 2：bugs 修复 — 近期 vs 累计

| 窗口 | 当前数据 | 问题 |
|------|---------|------|
| 1 日 | 0 | — |
| 7 日 | 0 | **仍为 0**（近 18 天无修复） |
| 30 日 | 0 | **仍为 0** |
| 累计 | 149 | — |

**选择累计**：数据源中 bugs 的 `updatedAt` 最近值为 9 月 5 日（18 天前），任何近期窗口都返回 0。累计值是唯一有意义的展示方式。

### 决策 3：积压项定位

积压项（backlog）是项目管理的"停车场"——已记录但未承诺在当前周期处理。它们不应：
- 计入"活跃"（不在当前工作流中）
- 计入"阻塞"（不应紧急关注）
- 稀释"完成率"（未承诺完成的项不应算入分母）
- 影响"团队负载"（未分配当前周期的工作）

唯一应保留的积压相关指标是独立的 `backlogCount`，用于触发 "积压项需要处理" 的建议提示（阈值 >20）。

---

<a id="sec-6"></a>
## 6. 验收标准

- [x] **AC-01**：首页统计卡片 5 张 + 1 仪表盘，正负指标交错排列
- [x] **AC-02**：第 2/4 位正向卡片有绿色左边框（`is-good`）
- [x] **AC-03**："近期完成"显示 7 日内 done 数量（非 0）
- [x] **AC-04**："已修复"显示累计 resolved+closed 总数（非 0）
- [x] **AC-05**：活跃 Issue 数不含 backlog/Backlog 状态
- [x] **AC-06**：完成率分母排除积压和取消
- [x] **AC-07**：逾期卡片 delta 显示真实 5 分钟变化量
- [x] **AC-08**：侧边栏快照显示今日完成 + 昨日完成（不重复主卡片数据）
- [x] **AC-09**：近期摘要横幅显示"近期: 完成 X · 新建 Y · 缺陷修复 Z"
- [x] **AC-10**：`vue-tsc --noEmit` 通过，无新增类型错误

---

<a id="sec-7"></a>
## 7. 数据影响

### 7.1 改造前后对比（2026-09-23 实测）

| 指标 | 改造前 | 改造后 | 改善 |
|------|--------|--------|------|
| 活跃 Issue | 531 | **353** | −34% |
| 完成率 | 18% | **25%** | +7pp |
| 近期完成 | 2 | **6** | +200% |
| 已修复 Bug | 0 | **149** | 0→149 |
| 逾期 delta | 硬编码 0 | **真实变化** | 修复 |

### 7.2 文件变更清单

| 操作 | 文件 | 变更类型 | 行数 |
|------|------|---------|------|
| 修改 | `src/views/home/index.vue` | 数据呈现 + 侧边栏 + 横幅 | +38/−8 |
| 修改 | `src/hooks/useHomeData.ts` | Delta + backlog + 窗口 | +6/−4 |
| 修改 | `src/languages/modules/home/zh.ts` | i18n 补充 | +4/−0 |
| 修改 | `src/languages/modules/home/en.ts` | i18n 补充 | +4/−0 |