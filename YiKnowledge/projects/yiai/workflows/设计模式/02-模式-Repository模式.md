---
title: Repository 模式
tags: [yiai, patterns, repository, mongodb, motor]
category: projects/yiai/workflows
created: 2026-09-07
updated: 2026-09-15
source: internal
type: pattern
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "MongoDB Repository 完整模式：单例管理、查询构建、分页排序和索引策略"
---

# Repository 模式

> **读完你将能够**：掌握 MongoDB 数据访问的 Repository 模式

> YiAi 使用 Repository 模式封装 MongoDB 数据访问，通过 Motor 异步驱动实现非阻塞操作。

## 一、MongoDB 单例

```python
# src/data/database.py
class MongoDB:
    _instance = None
    _lock = threading.Lock()
    _client: AsyncIOMotorClient | None = None
    _db = None

    def __new__(cls):  # 线程安全单例
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance

    async def connect(self, uri, db_name):
        self._client = AsyncIOMotorClient(uri, maxPoolSize=50, minPoolSize=10,
                                           maxIdleTimeMS=30000, connectTimeoutMS=5000)
        self._db = self._client[db_name]

db = MongoDB()  # 全局单例
```

## 二、Repository 实现

```python
class Repository:
    async def query(self, collection, filter=None, page_num=1, page_size=20,
                    order_by=None, order_type="desc", fields=None, exclude_fields=None):
        mongo_filter = self._build_filter(filter or {})
        total = await self._db[collection].count_documents(mongo_filter)
        cursor = self._db[collection].find(mongo_filter, projection)
        if order_by:
            cursor = cursor.sort(order_by, -1 if order_type == "desc" else 1)
        items = await cursor.skip((page_num-1)*page_size).limit(page_size).to_list(page_size)
        for item in items:
            if "_id" in item: item["_id"] = str(item["_id"])
        return {"list": items, "total": total, "pageNum": page_num,
                "pageSize": page_size, "totalPages": ceil(total/page_size)}
```

## 三、_build_filter 查询构建

支持：精确匹配、`$regex` 模糊、`$gte`/`$lte` 范围、`$in` 列表、`$ne` 排除、空值处理。

```python
def _build_filter(self, params):
    query = {}
    for key, value in params.items():
        if value is None or value == "": continue
        if isinstance(value, str) and value.startswith("!"):  # 排除
            query[key] = {"$ne": value[1:]}
        elif isinstance(value, list) and len(value) == 2:  # 范围
            query[key] = {"$gte": value[0], "$lte": value[1]}
        elif isinstance(value, list):  # $in
            query[key] = {"$in": value}
        elif isinstance(value, str):  # 模糊
            query[key] = {"$regex": value, "$options": "i"}
        else:  # 精确
            query[key] = value
    return query
```

## 四、CRUD 方法

```python
async def insert_one(self, collection, doc) -> str   # → inserted_id
async def insert_many(self, collection, docs) -> list
async def update_one(self, collection, filter, update, upsert=False) -> int
async def delete_one(self, collection, filter) -> int
async def find_one(self, collection, filter) -> dict | None
async def find_many(self, collection, filter, sort=None, skip=0, limit=0) -> list
async def count(self, collection, filter=None) -> int
```

## 五、连接池调优

| 配置 | 默认 | 说明 |
|------|------|------|
| `minPoolSize` | 10 | 避免冷启动延迟 |
| `maxPoolSize` | 50 | 不超过 MongoDB 最大连接数 |
| `maxIdleTimeMS` | 30000 | 30s 空闲回收 |
| `connectTimeoutMS` | 5000 | 连接超时 |

## 六、约束

- ObjectId 返回前序列化为 `str`
- `pageSize` 限制最大 100
- 不直接使用 `AsyncIOMotorClient`，通过单例 `db` 访问
- Repository 不导入 `server/`、`services/`、`domain/`