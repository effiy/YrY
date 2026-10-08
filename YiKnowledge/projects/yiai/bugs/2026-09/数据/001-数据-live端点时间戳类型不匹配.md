---
title: "YiAi live.py: today_done/today_created 永远为 0 — 时间戳类型不匹配"
key: yiai-live-metrics-timestamp-bug-20260923
tags:
- bug-fix
- backend
- dashboard
- timestamp
- mongodb
category: projects/yiai/bugs/数据
created: "2026-09-23"
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: high
priority: p1
project: YiAi
reporter: Claude
environment: all
affectedVersion: main (pre-fix)
fixedVersion: main (2026-09-23)
frequency: always
---

## Description

Dashboard 实时 KPI 端点 `GET /dashboard/live` 和 `GET /dashboard/live-snapshot` 中的 `today_done`（今日完成数）和 `today_created`（今日创建数）两个指标**永远返回 0**，因为 MongoDB 查询中的时间戳比较使用了错误的字段值类型。

## Impact

- **前端影响**：YiVad 首页顶部"今日完成"和"今日创建"统计始终显示 0
- **实时轮询**：每 5 秒推送的 SSE 数据中这两项指标始终为 0，整个页面开着也是零
- **影响时间**：自在 `main` 分支引入该端点起，这两项指标就从未正确过

## Cause

`_snapshot()` 中两次 `_count` 调用存在**值类型不匹配**：

```python
today, _ = _today_range()          # today = "2026-09-23" (string)
today_ms_start = int(
    time.mktime(time.strptime(today, "%Y-%m-%d")) * 1000
)                                   # today_ms_start = 1750502400000 (int)

# Bug 1: 字符串 vs 数字
_count("issues", {"updated_at": {"$gte": today}})
#                        snake_case       ^^^^^ 字符串，但存储的是 ms 数字

# Bug 2: 字符串 vs 数字  
_count("issues", {"createdTime": {"$gte": today}})
#                                  ^^^^^ 字符串，但存储的是 ms 数字
```

MongoDB 中 `$gte: "2026-09-23"` 比较一个数字字段永远不会匹配——因为 `"2026-09-23"` 不是 `1750502400000`。两个查询始终返回 0。

**附加问题**：`updated_at` 字段名使用 snake_case，其他分析模块均使用 `updatedAt` (camelCase)，查找字段名 `_get_field(iss, "createdAt", "created_at")` 同时支持两种。

## Solution

```diff
-counts = await asyncio.gather(
-    _count("issues", {"status": {"$in": DONE}, "updated_at": {"$gte": today}}),
-    _count("issues", {"createdTime": {"$gte": today}}),
+    _count("issues", {"status": {"$in": DONE}, "updatedAt": {"$gte": today_ms_start}}),
+    _count("issues", {"createdTime": {"$gte": today_ms_start}}),
```

同时移除已定义但从未使用的 `t_ms` 变量。

## Files Changed

| File | Change |
|------|--------|
| `YiAi/src/server/routes/dashboard/live.py:55-77` | `today` → `today_ms_start`；`updated_at` → `updatedAt`；移除未使用的 `t_ms` 变量 |

## Verification

- Python AST 语法检查通过
- 逻辑验证：`today_ms_start` 的类型为 `int`，与 MongoDB 中存储的 `createdTime: 1750502400000` 一致

## Prevention

**规则**：MongoDB 查询中的类型必须与文档存储类型一致。时间戳比较应使用数字（毫秒），而非字符串日期。

**检查清单**：
- 查询中的值与文档字段类型一致
- `count_documents` 过滤器中的比较操作符 ($gte/$lt) 使用正确类型的参数
- 时间戳字段名使用一致的大小写约定（camelCase 为主）