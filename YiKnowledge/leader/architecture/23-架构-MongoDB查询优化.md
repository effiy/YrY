---
title: "MongoDB Query Patterns and Optimization — Practical Recipes for YrY Collections"
aliases: [mongodb-queries, query-optimization, aggregation, indexes]
tags: [architecture, mongodb, query, optimization, leader]
category: leader/architecture
created: 2026-09-15
updated: 2026-09-15
source: internal
type: reference
status: stable
lifecycle: active
review_cycle: quarterly
roles: [leader, engineer]
benefit: "技术负责人和工程师通过实用的 MongoDB 查询模式和优化技巧提升数据库操作性能"
acceptance_criteria:
  - "覆盖 YrY 6 个集合的典型查询模式"
  - "包含索引优化和慢查询排查方法"
  - "每个模式有代码示例"
related:
  - ./12-架构-数据模型设计原则.md
  - ./17-架构-数据库迁移指南.md
---

# MongoDB 查询模式与优化

> 最常见的性能问题根因：**缺少索引**。第二常见：**查询了不需要的字段**。第三：**N+1 查询**。本文覆盖 YrY 各集合的实际查询模式和优化方法。

## 查询优化四步法

```
1. 用 explain() 看查询计划 → 2. 识别全表扫描 → 3. 建索引 → 4. 验证再用 explain()
```

## YrY 集合查询模式

### `sessions` — 聊天会话

```python
# ✅ 按 key 精确查找（有唯一索引——最优）
session = await db.sessions.find_one({"key": session_key})

# ✅ 按标签筛选 + 按时间排序（需要复合索引）
sessions = await db.sessions.find(
    {"tags": "important"}
).sort("updated_at", -1).limit(20).to_list(20)
# 需要索引: {tags: 1, updated_at: -1}

# ✅ 搜索纯文本内容（$text 索引）
sessions = await db.sessions.find(
    {"$text": {"$search": "RPC 信封"}}
).to_list(10)
# 需要索引: db.sessions.create_index([("pageContent", "text")])

# ❌ 无索引的范围查询——全表扫描
sessions = await db.sessions.find({
    "created_at": {"$gte": start_date}
}).to_list(None)
# 需要索引: {created_at: 1}
```

**优化技巧**：
- 列表查询用 `limit()` + `skip()` 分页，不要一次加载全部
- 如果不需要 `messages` 数组，用 projection 排除：`find({}, {"messages": 0})`

### `knowledge_files` — 知识库文件

```python
# ✅ 按分类 + 标签组合查询
files = await db.knowledge_files.find({
    "category": "leader",
    "tags": {"$in": ["adr", "architecture"]}
}).to_list(50)
# 需要索引: {category: 1, tags: 1}

# ✅ 正则搜索文件路径
import re
files = await db.knowledge_files.find({
    "path": {"$regex": "^leader/architecture/"}
}).to_list(None)

# ✅ 按索引时间排序——获取最近更新的文件
files = await db.knowledge_files.find().sort(
    "indexed_at", -1
).limit(10).to_list(10)
# 需要索引: {indexed_at: -1}
```

### `bugs` — 缺陷追踪

```python
# ✅ 按项目 + 状态筛选（最频繁查询）
bugs = await db.bugs.find({
    "project": "YiAi",
    "status": {"$in": ["open", "in_progress"]}
}).sort("severity", 1).to_list(20)
# 需要复合索引: {project: 1, status: 1, severity: 1}

# ✅ 聚合：按项目统计缺陷数
pipeline = [
    {"$match": {"status": {"$ne": "closed"}}},
    {"$group": {"_id": "$project", "count": {"$sum": 1}}},
    {"$sort": {"count": -1}}
]
result = await db.bugs.aggregate(pipeline).to_list(None)
```

### `menus` — 菜单配置

```python
# ✅ 按父菜单查询子菜单（递归加载菜单树）
children = await db.menus.find(
    {"parent": "SystemManagement"}
).to_list(None)
# 需要索引: {parent: 1}

# 加载完整菜单树的模式
async def load_menu_tree(db):
    all_menus = await db.menus.find().to_list(None)
    return build_tree(all_menus, parent=None)  # 内存中构建树
```

### `users` — 用户

```python
# ✅ 登录查询——按 username 精确查找
user = await db.users.find_one({"username": username})
# 唯一索引: {username: 1}

# ❌ 不要在 users 集合上做模糊搜索——用 $regex 前确认有索引
```

### `static_files` — 文件备份

```python
# ✅ 按路径查找
file = await db.static_files.find_one({"path": file_path})
# 需要索引: {path: 1}

# ✅ 按标签查询
files = await db.static_files.find(
    {"tags": {"$in": ["backup", "config"]}}
).to_list(None)
# 需要索引: {tags: 1}
```

## 用 explain() 检查查询

```python
# 在 mongosh 或 Python driver 中
result = await db.sessions.find({"tags": "important"}).explain()

# 关注这两个字段：
# "stage": "IXSCAN" → 用了索引 ✅
# "stage": "COLLSCAN" → 全表扫描 ❌（需要建索引）
# "executionTimeMillis": 实际耗时

# Python 封装
async def explain_query(collection, query):
    plan = await collection.find(query).explain()
    stage = plan.get("queryPlanner", {}).get("winningPlan", {}).get("stage")
    ms = plan.get("executionStats", {}).get("executionTimeMillis")
    return {"stage": stage, "time_ms": ms}
```

## 常见慢查询信号

| 信号 | 含义 | 解决 |
|---|---|---|
| `COLLSCAN` (全表扫描) | 无可用索引 | 为查询条件建索引 |
| `SORT` stage 在 `FETCH` 之后 | 排序未用索引 | 建包含排序字段的复合索引 |
| `executionTimeMillis > 100` | 单查询超过 100ms | 检查索引和查询 |
| `nReturned >> 需要的行数` | 返回了多余数据 | 加 `limit()` 和 projection |
| `.to_list(None)` | 无限制加载 | 改为 `.to_list(limit)` |

## 索引优化检查清单

```bash
# 在 mongosh 中运行

# 1. 查看当前索引
db.sessions.getIndexes()

# 2. 查看慢查询（如果 profiler 开启）
db.system.profile.find().sort({ts: -1}).limit(5)

# 3. 查看索引使用统计
db.sessions.aggregate([{$indexStats: {}}])

# 4. 找出未使用的索引（ops 为 0）
# 如果某个索引 accesses 为 0——可以安全删除
```

## 聚合管道实用模式

```python
# 按日期统计聊天量
pipeline = [
    {"$group": {
        "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
        "count": {"$sum": 1}
    }},
    {"$sort": {"_id": -1}},
    {"$limit": 30}
]

# 按标签分组统计文件数
pipeline = [
    {"$unwind": "$tags"},
    {"$group": {"_id": "$tags", "count": {"$sum": 1}}},
    {"$sort": {"count": -1}}
]

# 查找消息最多的前 10 个会话
pipeline = [
    {"$project": {
        "title": 1,
        "message_count": {"$size": "$messages"}
    }},
    {"$sort": {"message_count": -1}},
    {"$limit": 10}
]
```

## 反模式

| 反模式 | 为什么失败 | 正确做法 |
|---|---|---|
| `.to_list(None)` 无限制 | 一次加载 100K 文档到内存 | 始终加 limit；大结果集用游标分页 |
| 无索引的 `$regex` 搜索 | 全表扫描——O(n) | 建 text 索引；或用 Elasticsearch 替代 |
| N+1 查询：循环中逐条 `find_one` | 1000 次 round-trip | 用 `$in` 一次查出所有 |
| 在查询中返回 `messages` 全数组 | 每次列表查询加载所有聊天内容 | 列表查询用 projection 排除大字段 |
| 在生产环境执行聚合管道不设 `allowDiskUse` | 大数据集超出内存限制→失败 | 必要时 `allowDiskUse: true` 或优化管道 |