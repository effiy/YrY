---
title: Repository 模式
tags: [yiai, patterns, repository, mongodb, motor]
category: projects/yiai/workflows
created: 2026-09-07
updated: 2026-09-20
source: internal
type: pattern
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "MongoDB 数据访问的完整模式：单例、$facet 分页、build_filter、写关注分级——与 src/data/ 一致"
---

# Repository 模式

> YiAi 使用**模块级函数**（非 Class）封装 MongoDB 数据访问，通过 Motor 异步驱动实现非阻塞操作。以下代码均来自 `src/data/` 实际源文件。

## 一、MongoDB 单例（database.py）

```python
# src/data/database.py — 实际代码
class MongoDB:
    _instance: Optional['MongoDB'] = None
    _lock: threading.Lock = threading.Lock()
    _client: AsyncIOMotorClient | None = None
    _db = None
    _initialized: bool = False

    def __new__(cls): ...  # 线程安全双重检查

    async def initialize(self):
        """从 settings 读取配置，创建连接池 + 索引"""
        if self._initialized:
            return
        self._client = AsyncIOMotorClient(
            settings.mongodb_url,
            appname="YiAi",
            maxPoolSize=settings.mongodb_max_pool_size,    # 默认 50
            minPoolSize=settings.mongodb_pool_size,        # 默认 10
            maxIdleTimeMS=30000,
            waitQueueTimeoutMS=10000,
            socketTimeoutMS=30000,
            connectTimeoutMS=5000,
            serverSelectionTimeoutMS=5000,
            retryWrites=True, retryReads=True,
            maxConnecting=2,
        )
        self._db = self._client[settings.mongodb_db_name]
        await self._ensure_indexes()    # 15+ 个复合索引
        self._initialized = True

db = MongoDB()  # 全局单例
```

**访问方式**：`db.db[collection_name]` — 先调 `await db.initialize()`，再通过 `db.db` 属性获取 Motor Database 对象。

## 二、查询方法（repository.py — 模块级函数）

实际代码是**模块级 `async def` 函数**，不是 `class Repository`：

```python
# src/data/repository.py — 实际签名
async def query_documents(params: dict[str, Any]) -> dict[str, Any]:
    """
    params = {
        'cname' | 'collection_name': str,  # 必填
        'filter': dict,                     # 可选，合并到查询参数
        'pageNum': int,                     # 默认 1
        'pageSize': int,                    # 默认 20，受 pagination_min/max_size 约束
        'orderBy': str,                     # 默认 'order'
        'orderType': 'asc' | 'desc',       # 默认 'asc'
        'fields': str,                      # 逗号分隔，如 'name,status'
        'excludeFields': str,               # 逗号分隔
    }
    → {list, total, pageNum, pageSize, totalPages}
    """
```

**关键实现细节**：

1. **双参数名**：支持 `cname` 和 `collection_name`
2. **filter 合并**：`filter` dict 内容合并到查询参数中（`filter={"status": "active"}` → `{"status": "active"}` 传给 `build_filter`）
3. **`$facet` 分页**：单次 MongoDB 往返（替代 `find()` + `count_documents()` 两次往返）
4. **自动投影**：`sessions` 排除 `pageContent`，`users` 排除 `password`
5. **排序**：`orderBy` + `orderType`（asc/desc），特殊处理 `'order'` 字段（加 `updatedTime` 决胜键）

```python
# $facet 聚合管道 — 单次查询分页
pipeline = [
    {'$match': filter_dict},
    {'$sort': {sort_param: sort_order}},
    {'$facet': {
        'list': [{'$skip': (page_num - 1) * page_size}, {'$limit': page_size}],
        'total': [{'$count': 'count'}]
    }}
]
result = await collection.aggregate(pipeline, maxTimeMS=_QUERY_MAX_TIME_MS).to_list(1)
```

## 三、build_filter 查询构建（filter_helpers.py）

```python
# src/data/filter_helpers.py
def build_filter(params: dict) -> dict:
    """将 RPC 参数转为 MongoDB 查询条件"""
```

支持的查询模式：

| 参数值 | MongoDB 条件 | 示例 |
|--------|-------------|------|
| 普通值 | `{key: value}` | `{"status": "open"}` |
| 字符串 | `{$regex: value, $options: "i"}` | `{"name": "proj"}` |
| `[a, b]`（2 元素，非日期） | `{$in: [a, b]}` | `{"tags": ["work", "personal"]}` |
| `[d1, d2]`（日期范围） | `{$gte: d1, $lte: d2}` | 日期范围查询 |
| `!value` | `{$ne: value}` | `{"status": "!archived"}` |
| `None` / `""` | 跳过该字段 | — |

## 四、CRUD 方法（database.py 单例方法）

```python
# db 单例的公共方法 — 写操作自动应用 w=0/1
await db.insert_one(collection_name, document)   # → inserted_id
await db.insert_many(collection_name, documents) # → [inserted_id, ...]
await db.find_one(collection_name, query)        # → dict | None
await db.find_many(collection_name, query, projection=None)  # → [dict, ...]
await db.delete_one(collection_name, query)      # → deleted_count

# 写操作自动添加 createdTime
# 自动应用 write_concern（非关键集合 w=0，关键集合 w=1）
```

**关键差异 vs 旧文档**：
- 不存在 `class Repository` — 是模块级函数 `query_documents(params)`
- 不存在 `self._build_filter` — 是 `data/filter_helpers.py` 中的 `build_filter()`
- 不存在 `db.connect(uri, db_name)` — 是 `db.initialize()`（从 settings 读取配置）

## 五、连接池配置

| 配置 | 默认 | 来源 |
|------|------|------|
| `minPoolSize` | 10 | `settings.mongodb_pool_size` |
| `maxPoolSize` | 50 | `settings.mongodb_max_pool_size` |
| `maxIdleTimeMS` | 30000 | 硬编码 |
| `connectTimeoutMS` | 5000 | 硬编码 |
| `socketTimeoutMS` | 30000 | 硬编码 |
| `serverSelectionTimeoutMS` | 5000 | 硬编码 |
| `waitQueueTimeoutMS` | 10000 | 硬编码 |
| cursor `batch_size` | 500 | `settings.mongodb_cursor_batch_size` |
| query `maxTimeMS` | 30000 | `settings.mongodb_query_timeout_ms` |

## 六、写关注分级

```python
# 非关键集合使用 w=0 (fire-and-forget)
_LIGHTWRITE_COLLECTIONS = frozenset({
    "audit_logs", "state_records", "chat_records"
})
# 可通过 mongodb_lightwrite_enabled: false 关闭
```

## 七、约束

- `_id` 通过 projection `{'_id': 0}` 排除，不返回给前端
- `pageSize` 受 `settings.pagination_min_size` 和 `settings.pagination_max_size` 约束
- 数据访问通过 `db` 单例，不直接使用 `AsyncIOMotorClient`
- Repository 函数不导入 `server/`、`services/`、`domain/`