---
prd_task_id: "YV-09-86"
title: "YV-09-86: 项目数据准确性修复 — 开发方案"
status: 已完成
priority: P0
owner: ""
roles: [engineer]
created: 2026-09-22
updated: 2026-09-22
project: YiVad
project_id: yivad
prd_month: "202609"
estimate_frontend: 0.25
estimate_backend: 0.25
source_prd: 86-prd-项目数据准确性修复.md
type: task
category: projects/yivad/devs
source: YiVad
tags: [yivad, dev, 项目数据准确性修复]
benefit: "开发方案：项目数据准确性修复"
lifecycle: active
---

# YV-09-86: 项目数据准确性修复 — 开发方案

## 一、根因分析

### 根因 1：服务端 Basic Stats 误加 30 天日期过滤

**文件**：`YiAi/src/services/analytics/project_dashboard.py:60`

```python
# Before（Bug）
issue_match = {**match, "createdAt": {"$gte": start.isoformat(), "$lte": end.isoformat()}}
```

`_compute_basic_stats` 的 `issue_match` 添加了 `createdAt` 日期范围过滤（默认最近 30 天），导致聚合管道只统计最近创建的 issue。

对比同函数中的 Bug 和 Module 管道（line 102, 112）使用 `{**match}` 无日期过滤，三者口径不一致。

### 根因 2：客户端合并逻辑反向

**文件**：`YiVad/src/views/project/composables/useProjectStats.ts:107`

```typescript
// Before（Bug）
if (server.issues > s.issues) {
  s.issues = server.issues;
  ...
}
```

注释声明服务端统计是"权威来源"（查询全量数据），但 `>` 比较意味着仅当服务端数量大于客户端时才生效。由于根因 1 导致服务端数据偏小，服务端统计从未被采用。

## 二、解决方案

### 修改 1：移除 Basic Stats 的日期过滤

**文件**：`YiAi/src/services/analytics/project_dashboard.py`

```python
# After
"""Compute per-project issue/bug/module counts and status breakdowns.

    Counts are all-time (no date filter) — matching the bug and module pipelines.
    The ``end`` parameter is only used for the overdue calculation.
    """
issue_match = {**match}
```

- Issue 计数改为全量，与 Bug/Module 管道一致
- `end` 参数仍用于 overdue 计算（`due_date < end`），当无日期范围时 `end = now`，语义正确
- 效率/质量指标（efficiency/quality）保持 30 天窗口不变

### 修改 2：客户端无条件使用服务端统计

**文件**：`YiVad/src/views/project/composables/useProjectStats.ts`

```typescript
// After
if (serverMap?.size) {
  for (const [key, server] of serverMap) {
    const s = ensure(key);
    // Guard: don't overwrite positive client counts with zero server counts
    const serverAllZero = server.issues === 0 && server.bugs === 0 && server.modules === 0;
    const clientHasData = s.issues > 0 || s.totalBugs > 0 || s.totalModules > 0;
    if (serverAllZero && clientHasData) continue;
    s.issues = server.issues;
    s.done = server.done;
    s.open = server.open;
    s.overdue = server.overdue;
    s.unassigned = server.unassigned;
    s.totalBugs = server.bugs;
    s.totalModules = server.modules;
  }
}
```

- 服务端统计直接覆盖客户端的 issue/bug/module 计数
- 零值守卫：服务端全零 + 客户端有数据时跳过（防止缓存预热阶段覆盖有效数据）
- 降级：服务端 dashboard 调用失败时 `serverMap` 为空，客户端本地统计作为 fallback

## 三、数据流（修复前后对比）

### Before
```
MongoDB issues (全部 200 条)
  → 服务端 _compute_basic_stats (createdAt 30d 过滤) → 仅 15 条
  → 客户端 fetch 5000 条 → 200 条
  → merge: if (15 > 200) → false → 使用客户端 200 条 ✓ (巧合正确)
```

### After
```
MongoDB issues (全部 200 条)
  → 服务端 _compute_basic_stats (无日期过滤) → 200 条
  → 客户端 fetch 5000 条 → 200 条
  → merge: 直接使用服务端 200 条 ✓ (始终精确)
```

极端场景（issues > pageSize=5000）：
```
MongoDB issues (全部 8000 条)
  → 服务端 _compute_basic_stats (无日期过滤) → 8000 条
  → 客户端 fetch 5000 条 → 5000 条（被 pageSize 截断）
  → merge: 直接使用服务端 8000 条 ✓ (修复了截断问题)
```

## 四、边界情况

| 场景 | 处理方式 |
|------|----------|
| 服务端 dashboard 不可用 | `catch(() => null)` → `serverMap` 为空 → 客户端统计作为 fallback |
| 服务端返回全零 | 零值守卫跳过 → 客户端统计保留 |
| 项目无任何 issue/bug/module | `ensure(key)` 返回 `EMPTY_STATS` → 显示全零 |
| 服务端新增项目、客户端尚未同步 | `ensure(key)` 创建空 stats → 服务端数据填充 |

## 五、回滚方案

如发现回归，依次 revert：
1. `git revert <commit-hash>` 恢复 `useProjectStats.ts`
2. `git revert <commit-hash>` 恢复 `project_dashboard.py`
3. 重启 YiAi + 刷新 YiVad 页面