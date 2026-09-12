---
title: Repository 模式
tags: [yiai, patterns, repository, mongodb, motor, data-access, query-builder]
category: projects/yiai/specs
created: 2026-09-07
updated: 2026-09-10
source: YiAi
type: pattern
status: active
---

# Pattern: Repository

> MongoDB Repository 完整模式：Motor 异步客户端、单例管理、查询构建、分页排序、聚合管道、索引策略、种子数据、连接池调优、迁移策略、反模式。

## 概述

YiAi 使用 **Repository 模式** 封装 MongoDB 数据访问。Repository 是唯一直接操作 MongoDB 的模块，通过 Motor 异步驱动实现非阻塞数据库操作。上层 Domain 通过依赖注入获取 Repository 实例。

**核心设计**：
- 单例 MongoDB 连接（全应用共享连接池）
- 通用查询构建器（`_build_filter` 将 HTTP 参数转为 Mongo 查询）
- 分页查询封装（`list, total, pageNum, pageSize, totalPages`）
- ObjectId 自动序列化

**相关规范**：
- [领域服务模式](./功能模式/01-模式-领域服务模式.md)
- [数据库规范](./开发规范/07-规范-数据库设计.md)
- [核心模块](./架构设计/04-架构-核心模块.md)

---

## MongoDB 连接管理

### 单例模式

```python
# src/data/database.py
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional

class MongoDB:
    """MongoDB 单例 — Motor async driver"""

    client: AsyncIOMotorClient | None = None
    db: AsyncIOMotorDatabase | None = None

    async def connect(self, uri: str, db_name: str):
        self.client = AsyncIOMotorClient(
            uri,
            maxPoolSize=50,
            minPoolSize=10,
            maxIdleTimeMS=30000,
            connectTimeoutMS=5000,
            serverSelectionTimeoutMS=5000,
        )
        self.db = self.client[db_name]

        # 验证连接
        await self.client.admin.command("ping")

    async def disconnect(self):
        if self.client:
            self.client.close()

# 全局单例
db = MongoDB()
```

### 连接池调优

| 配置项 | 默认值 | 说明 | 调优建议 |
|--------|--------|------|----------|
| `minPoolSize` | 10 | 最小连接数 | 保持默认，避免冷启动延迟 |
| `maxPoolSize` | 50 | 最大连接数 | 并发高时增大，但不超过 MongoDB 最大连接数 |
| `maxIdleTimeMS` | 30000 | 空闲连接超时 | 30s 足够，过短导致频繁重连 |
| `connectTimeoutMS` | 5000 | 连接超时 | 5s 合理，内网环境可降到 2s |
| `serverSelectionTimeoutMS` | 5000 | 服务器选择超时 | 副本集环境适当增大 |

---

## Repository 实现

### 查询方法

```python
# src/data/repository.py
from math import ceil
from typing import Optional, Dict, Any, List

class Repository:
    def __init__(self, db: AsyncIOMotorDatabase):
        self._db = db

    async def query(
        self,
        collection: str,
        filter: Dict[str, Any] = None,
        page_num: int = 1,
        page_size: int = 20,
        order_by: str = None,
        order_type: str = "desc",
        fields: List[str] = None,
        exclude_fields: List[str] = None
    ) -> Dict[str, Any]:
        coll = self._db[collection]

        # 构建查询过滤条件
        mongo_filter = self._build_filter(filter or {})

        # 字段投影
        projection = None
        if fields:
            projection = {f: 1 for f in fields}
        if exclude_fields:
            projection = projection or {}
            projection.update({f: 0 for f in exclude_fields})

        # 执行查询
        total = await coll.count_documents(mongo_filter)
        cursor = coll.find(mongo_filter, projection)

        # 排序
        if order_by:
            direction = -1 if order_type == "desc" else 1
            cursor = cursor.sort(order_by, direction)

        # 分页
        skip = (page_num - 1) * page_size
        cursor = cursor.skip(skip).limit(page_size)

        items = await cursor.to_list(length=page_size)

        # 序列化 ObjectId
        for item in items:
            if "_id" in item:
                item["_id"] = str(item["_id"])

        return {
            "list": items,
            "total": total,
            "pageNum": page_num,
            "pageSize": page_size,
            "totalPages": ceil(total / page_size) if total > 0 else 0
        }
```

### _build_filter 查询构建

```python
def _build_filter(self, params: Dict[str, Any]) -> Dict[str, Any]:
    """将前端传来的过滤条件转换为 MongoDB 查询

    支持的查询模式：
    - 精确值: {"status": "open"} → {"status": "open"}
    - 字符串模糊: {"name": "proj"} → {"name": {"$regex": "proj", "$options": "i"}}
    - 范围查询: {"created_at": ["2024-01-01", "2024-12-31"]} → {"$gte": ..., "$lte": ...}
    - IN 查询: {"tags": ["work", "personal"]} → {"tags": {"$in": ["work", "personal"]}}
    - 排除: {"status": "!archived"} → {"status": {"$ne": "archived"}}
    - 空值: {"assignee": "!null"} → {"assignee": {"$exists": True, "$ne": None}}
    """
    query = {}

    for key, value in params.items():
        if value is None or value == "":
            continue

        # 排除条件：!value
        if isinstance(value, str) and value.startswith("!"):
            actual = value[1:]
            if actual == "null":
                query[key] = {"$exists": True, "$ne": None}
            else:
                query[key] = {"$ne": actual}

        # 范围查询：[min, max]
        elif isinstance(value, list) and len(value) == 2 and not isinstance(value[0], dict):
            query[key] = {"$gte": value[0], "$lte": value[1]}

        # 列表包含：$in
        elif isinstance(value, list):
            query[key] = {"$in": value}

        # 字符串模糊匹配
        elif isinstance(value, str):
            query[key] = {"$regex": value, "$options": "i"}

        # 精确匹配
        else:
            query[key] = value

    return query
```

### 写入方法

```python
async def insert(self, collection: str, document: Dict[str, Any]) -> str:
    result = await self._db[collection].insert_one(document)
    return str(result.inserted_id)

async def insert_many(self, collection: str, documents: List[Dict[str, Any]]):
    return await self._db[collection].insert_many(documents)

async def update(
    self, collection: str, filter: Dict[str, Any], update: Dict[str, Any],
    upsert: bool = False
) -> int:
    result = await self._db[collection].update_many(
        self._build_filter(filter),
        update,
        upsert=upsert
    )
    return result.modified_count

async def update_one(
    self, collection: str, filter: Dict[str, Any], update: Dict[str, Any],
    upsert: bool = False
) -> int:
    result = await self._db[collection].update_one(
        self._build_filter(filter),
        update,
        upsert=upsert
    )
    return result.modified_count

async def delete(self, collection: str, filter: Dict[str, Any]) -> int:
    result = await self._db[collection].delete_many(self._build_filter(filter))
    return result.deleted_count

async def delete_one(self, collection: str, filter: Dict[str, Any]) -> int:
    result = await self._db[collection].delete_one(self._build_filter(filter))
    return result.deleted_count

async def find_one(self, collection: str, filter: Dict[str, Any]) -> Optional[Dict]:
    doc = await self._db[collection].find_one(self._build_filter(filter))
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

async def find_many(
    self, collection: str, filter: Dict[str, Any],
    sort: List[tuple] = None, skip: int = 0, limit: int = 0,
    projection: Dict = None
) -> List[Dict]:
    cursor = self._db[collection].find(self._build_filter(filter), projection)
    if sort:
        cursor = cursor.sort(sort)
    if skip:
        cursor = cursor.skip(skip)
    if limit:
        cursor = cursor.limit(limit)
    return await cursor.to_list(length=None)

async def count(self, collection: str, filter: Dict[str, Any] = None) -> int:
    return await self._db[collection].count_documents(filter or {})

async def aggregate(self, collection: str, pipeline: List[Dict]) -> List[Dict]:
    cursor = self._db[collection].aggregate(pipeline)
    return await cursor.to_list(length=None)
```

---

## 聚合管道

### 常用聚合示例

```python
# 按状态统计
pipeline = [
    {"$match": {"project_id": "proj-001"}},
    {"$group": {"_id": "$status", "count": {"$sum": 1}}},
    {"$sort": {"count": -1}}
]
results = await repo.aggregate("issues", pipeline)
# → [{_id: "open", count: 15}, {_id: "resolved", count: 30}]

# 按项目统计 Bug 严重程度
pipeline = [
    {"$match": {"status": {"$ne": "closed"}}},
    {"$group": {
        "_id": {"project": "$project", "severity": "$severity"},
        "count": {"$sum": 1}
    }},
    {"$sort": {"count": -1}}
]
results = await repo.aggregate("bugs", pipeline)

# 知识文件按分类统计
pipeline = [
    {"$match": {"status": "active"}},
    {"$group": {
        "_id": "$category",
        "count": {"$sum": 1},
        "latest": {"$max": "$scanned_at"}
    }},
    {"$sort": {"count": -1}}
]
results = await repo.aggregate("knowledge_files", pipeline)
```

---

## 索引策略

### 索引定义

```python
# src/data/indexes.py
async def create_indexes(db: AsyncIOMotorDatabase):
    """应用启动时自动创建索引"""

    # sessions 集合
    await db.sessions.create_index("session_id", unique=True)
    await db.sessions.create_index("user_id")
    await db.sessions.create_index([("updated_at", -1)])

    # knowledge_files 集合
    await db.knowledge_files.create_index("file_path", unique=True)
    await db.knowledge_files.create_index("category")
    await db.knowledge_files.create_index("tags")
    await db.knowledge_files.create_index("status")
    await db.knowledge_files.create_index([("title", "text"), ("content", "text")])

    # bugs 集合
    await db.bugs.create_index([("status", 1), ("severity", 1)])
    await db.bugs.create_index("project")
    await db.bugs.create_index([("created_at", -1)])

    # issues 集合
    await db.issues.create_index([("project_id", 1), ("status", 1)])
    await db.issues.create_index("assignee")

    # projects 集合
    await db.projects.create_index("key", unique=True)
```

### 索引设计原则

| 原则 | 说明 | 反例 |
|------|------|------|
| 唯一索引 | `key`/`session_id`/`file_path` 字段使用 unique 索引 | 允许重复导致数据不一致 |
| 查询字段索引 | 常用过滤字段（`status`, `project`, `category`）建单字段索引 | 在大集合上无索引查询 |
| 复合索引 | 经常一起查询的字段建复合索引（`project_id` + `status`） | 为每个字段单独建索引 |
| 文本索引 | `title` + `content` 建复合文本索引，支持全文搜索 | 使用 `$regex` 全文搜索 |
| 排序字段索引 | `updated_at`, `created_at` 建降序索引加速排序 | 无索引排序（内存限制 32MB） |
| 避免过多索引 | 每个集合索引数不超过 5 个 | 索引过多影响写入性能 |

---

## 查询模式

### 常见查询示例

```python
# 精确匹配
await repo.query("projects", {"status": "active"})

# 正则搜索（不区分大小写）
await repo.query("bugs", {"title": "登录"})

# IN 查询
await repo.query("projects", {"status": ["active", "pending"]})

# 范围查询
await repo.query("sessions", {
    "created_at": ["2026-08-01", "2026-08-31"]
})

# 排除查询
await repo.query("issues", {"status": "!closed"})

# 字段投影（仅返回指定字段）
await repo.query("knowledge_files", {"category": "engineer"}, fields=["title", "tags", "file_path"])

# 排除大字段
await repo.query("sessions", {}, exclude_fields=["messages"])

# 排序 + 分页
await repo.query("bugs", {"project": "YiVad"}, order_by="created_at", order_type="desc", page_num=1, page_size=20)
```

---

## 种子数据

### 种子数据模式

```python
# src/data/seeds/__init__.py
import json
import os

async def seed_database(db: AsyncIOMotorDatabase):
    """导入种子数据 — 仅当集合为空时"""
    seeds_dir = os.path.dirname(__file__)

    for filename in sorted(os.listdir(seeds_dir)):
        if not filename.endswith(".json"):
            continue

        collection = filename.replace(".json", "")
        count = await db[collection].count_documents({})

        if count == 0:
            with open(os.path.join(seeds_dir, filename), "r") as f:
                data = json.load(f)

            if isinstance(data, list) and len(data) > 0:
                await db[collection].insert_many(data)
                logger.info(f"Seeded {collection}: {len(data)} documents")
```

### 种子数据文件

```
seeds/
├── menus.json              # 菜单配置
├── users.json              # 初始用户
├── projects.json           # 默认项目
├── issues.json             # 示例 Issue
├── cycles.json             # 迭代周期
├── releases.json           # 发布版本
├── modules.json            # 模块
├── pages.json              # 页面/Wiki
├── labels.json             # 标签
├── bugs.json               # 示例 Bug
├── dict_status.json        # 状态字典
├── dict_priority.json      # 优先级字典
└── dict_role.json          # 角色字典
```

---

## 迁移策略

### 无迁移工具的策略

YiAi 不使用 formal migration 工具（如 Alembic），而是采用以下策略：

1. **索引在启动时创建**：`create_indexes()` 在应用启动时执行，幂等安全
2. **种子数据幂等导入**：仅在集合为空时导入
3. **Schema 柔性**：MongoDB 无 Schema，新增字段自动兼容
4. **破坏性变更**：手动脚本处理，记录在 `docs/migrations/` 中

```python
# 示例迁移脚本：为已有文档添加新字段
async def migrate_add_status_field(db: AsyncIOMotorDatabase):
    """为 issues 集合中缺少 status 的文档添加默认值"""
    result = await db.issues.update_many(
        {"status": {"$exists": False}},
        {"$set": {"status": "open"}}
    )
    logger.info(f"Migrated {result.modified_count} issues: added status field")
```

---

## 反模式

| 反模式 | 错误示例 | 正确做法 | 原因 |
|--------|----------|----------|------|
| 直接操作 MongoDB | 在 Service 中 `db.collection.find()` | 通过 Repository 方法 | 数据访问逻辑散落，无法统一管理 |
| 不校验参数 | 直接透传用户输入到 MongoDB 查询 | `_build_filter` 做类型转换和空值过滤 | MongoDB 注入风险 |
| 不限制 pageSize | 允许 `pageSize=10000` | 限制 `pageSize ≤ 100` | 单次查询过大导致内存和性能问题 |
| 不加索引 | 对高频查询字段不加索引 | 应用启动时 `create_indexes` | 全表扫描，性能差 |
| 同步阻塞 | 使用 `pymongo` 而非 `motor` | 使用 `motor` 异步驱动 | 阻塞事件循环 |
| 不处理连接池 | 每次请求新建连接 | 应用启动时初始化单例，复用连接池 | 连接数膨胀 |
| 忽略 ObjectId 序列化 | 直接返回 `doc["_id"]` (ObjectId) | 转为字符串 `str(doc["_id"])` | JSON 序列化失败 |
| N+1 查询 | 循环中逐个查询 | 使用 `$in` 或聚合管道 | 性能差 |
| 无超时配置 | 不设置 `connectTimeoutMS` | 设置连接超时和服务器选择超时 | 连接失败时长时间阻塞 |

---

## 约束

### 必须遵守
- Repository 是唯一直接操作 MongoDB 的模块
- 使用 Motor 异步驱动，所有方法为 `async`
- 查询参数通过 `_build_filter` 构建，过滤空值和无效参数
- `pageSize` 限制在 1-100 之间
- 应用启动时自动创建索引（`create_indexes`）
- MongoDB 连接使用单例模式，连接池复用
- 返回前将 ObjectId 转为字符串
- 文档大小控制在 16MB 以内

### 禁止
- 不在 Service 或路由中直接操作 MongoDB
- 不使用同步的 `pymongo`（使用 `motor`）
- 不跳过 `_build_filter` 参数校验
- 不创建不必要的索引（每个集合 ≤ 5 个）
- 不在循环中逐个查询（N+1 问题）
- 不在大集合上做无索引的排序或查询
- 不忽略 MongoDB 连接错误