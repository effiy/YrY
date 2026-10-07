---

doc_type: test
title: "YA-09-96: 服务端数据库分片策略 — 按集合/按时间的数据水平扩展与路由层设计 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-96"
source_prds: ["100-需求-数据库分片策略"]
source_modules: []
source_okr: [yiai-001]

type: test
---

# YA-09-96: 数据库分片策略 — 测试规格

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

> 来源 PRD：[100-需求-数据库分片策略.md](../../prds/2026-09/100-需求-数据库分片策略.md)
> 提取日期：2026-09-11 · 更新日期：2026-09-23

---

## 一、测试范围与策略

### 测试范围

- **核心模块**：`src/data/shard_router.py`（新建）— 分片路由核心，包括 `ShardRouter` 类、`ShardConfig` 配置类、跨分片并行查询
- **集成模块**：`src/data/repository.py`（修改）— 所有 MongoDB 操作入口，需验证 `get_shard(cname)` 调用正确
- **配置模块**：`src/shared/config.py`（修改）— 分片连接 URI 配置，连接池参数
- **排除范围**：数据迁移脚本（`scripts/migrate_shards.py`）、YiVad/YiPet 前端适配（当前版本不做）

### 测试策略

| 层级 | 策略 | 工具 |
|------|------|------|
| 单元测试 | 针对 `ShardRouter` 的纯逻辑方法（`get_shard`、`get_shard_name`、`register_collection`、`migrate_collection`、`get_stats`）使用 mock Motor client | pytest + unittest.mock |
| 集成测试 | 针对 `connect`/`disconnect`、`cross_shard_query`、Repository 层适配，使用真实或 docker-compose MongoDB 多实例 | pytest-asyncio + motor |
| 配置测试 | 验证 `ShardConfig.SHARD_MAP` 完整性、`POOL_CONFIG` 参数正确性、默认分片回退 | pytest |
| 性能测试 | 验证并行查询延迟为 max 而非 sum、连接池大小符合配置 | pytest-benchmark（可选） |

### 测试环境

- Python 3.10+
- pytest 8.x + pytest-asyncio
- 3 个 MongoDB 实例（端口 27017/27018/27019）模拟 hot/warm/cold 分片
- 或使用 mongomock 模拟多实例（用于纯逻辑测试）

---

## 二、测试数据 / Fixtures

### Fixture: `shard_router`（mock 模式）

```python
@pytest.fixture
def shard_config_override():
    """覆盖分片映射表用于测试。"""
    return {
        'test_hot': 'shard-hot',
        'test_warm': 'shard-warm',
        'test_cold': 'shard-cold',
    }

@pytest.fixture
async def shard_router_mocked(shard_config_override):
    """使用 mock Motor client 的 ShardRouter。"""
    router = ShardRouter()
    # 注入 mock clients
    for shard_name in ['shard-hot', 'shard-warm', 'shard-cold', 'shard-default']:
        mock_client = AsyncMock(spec=AsyncIOMotorClient)
        mock_db = AsyncMock(spec=AsyncIOMotorDatabase)
        mock_client.get_default_database.return_value = mock_db
        router._clients[shard_name] = mock_client
        router._databases[shard_name] = mock_db
    router._shard_map = dict(shard_config_override)
    return router
```

### Fixture: `shard_router_real`（真实多实例，集成测试用）

```python
@pytest.fixture
async def shard_router_real():
    """使用真实 MongoDB 多实例的 ShardRouter（需要 docker-compose）。"""
    router = ShardRouter()
    await router.connect()
    yield router
    await router.disconnect()
```

### 测试数据

| 集合 | 分片 | 测试文档 |
|------|------|----------|
| `test_hot` | shard-hot | `[{"_id": "h1", "val": 1}, {"_id": "h2", "val": 2}]` |
| `test_warm` | shard-warm | `[{"_id": "w1", "val": 3}]` |
| `test_cold` | shard-cold | `[{"_id": "c1", "val": 4}]` |
| `unknown_col` | shard-default | `[]` |

---

## 三、详细测试用例

### TC-01: 正确路由到热分片
- **优先级**：P0
- **前置条件**：ShardRouter 已初始化，SHARD_MAP 中 `test_hot` 映射到 `shard-hot`
- **步骤**：
  1. 调用 `shard_router.get_shard('test_hot')`
  2. 调用 `shard_router.get_shard_name('test_hot')`
- **预期结果**：
  - `get_shard` 返回 `shard-hot` 对应的数据库实例
  - `get_shard_name` 返回字符串 `'shard-hot'`
- **验证点**：返回对象为 `AsyncIOMotorDatabase` 实例，非 None

### TC-02: 未配置集合路由到默认分片
- **优先级**：P1
- **前置条件**：集合 `'unmapped_collection'` 不在 SHARD_MAP 中
- **步骤**：
  1. 调用 `shard_router.get_shard('unmapped_collection')`
  2. 调用 `shard_router.get_shard_name('unmapped_collection')`
- **预期结果**：
  - 返回 `shard-default` 的数据库实例
  - `get_shard_name` 返回 `ShardConfig.DEFAULT_SHARD`（即 `'shard-default'`）
- **验证点**：不抛异常，使用默认分片而非 None

### TC-03: 跨分片并行查询
- **优先级**：P0
- **前置条件**：3 个分片连接正常，`test_hot` 中有 2 条文档，`test_warm` 中有 1 条文档
- **步骤**：
  1. 调用 `cross_shard_query(['test_hot', 'test_warm'], {})`
  2. 测量总延迟
- **预期结果**：
  - 返回合并后 3 条文档
  - 总延迟约等于 `max(hot_query_time, warm_query_time)`，而非两者之和
  - 查询使用 `asyncio.gather` 并行执行
- **验证点**：`asyncio.gather` 被调用，结果列表包含所有分片的结果

### TC-04: 跨分片查询部分分片失败
- **优先级**：P1
- **前置条件**：`shard-hot` 正常，`shard-cold` 连接异常（mock 抛出 `ServerSelectionTimeoutError`）
- **步骤**：
  1. Mock `shard-cold` 数据库的 `find` 抛出异常
  2. 调用 `cross_shard_query(['test_hot', 'test_cold'], {})`
- **预期结果**：
  - `test_hot` 的结果正常返回
  - `test_cold` 的异常被捕获，记录 WARNING 日志
  - 不抛出异常，返回部分结果（最多 `test_hot` 的数据）
- **验证点**：`return_exceptions=True` 生效，日志包含 `"跨分片查询失败"`

### TC-05: 动态注册集合映射
- **优先级**：P1
- **前置条件**：ShardRouter 运行中，`'new_col'` 未在 SHARD_MAP 中
- **步骤**：
  1. 调用 `register_collection('new_col', 'shard-hot')`
  2. 调用 `get_shard('new_col')`
  3. 调用 `get_shard_name('new_col')`
- **预期结果**：
  - `get_shard` 返回 `shard-hot` 数据库实例
  - `get_shard_name` 返回 `'shard-hot'`
  - 日志记录 INFO `"集合分片注册"`
- **验证点**：映射表动态更新，后续查询使用新映射

### TC-06: 集合迁移
- **优先级**：P2
- **前置条件**：`'test_hot'` 当前映射到 `shard-hot`
- **步骤**：
  1. 调用 `migrate_collection('test_hot', 'shard-warm')`
  2. 调用 `get_shard('test_hot')`
- **预期结果**：
  - 返回 `shard-warm` 数据库实例（而非之前的 `shard-hot`）
  - 日志记录 INFO `"集合分片迁移"`，包含 `from_shard` 和 `to_shard`
- **验证点**：映射更新后旧分片不再路由该集合

### TC-07: 连接池按分片差异化配置
- **优先级**：P1
- **前置条件**：`ShardConfig.POOL_CONFIG` 包含 `shard-hot: {maxPoolSize: 50}` 和 `shard-cold: {maxPoolSize: 5}`
- **步骤**：
  1. 检查 `ShardRouter.connect()` 创建 `AsyncIOMotorClient` 时的参数
- **预期结果**：
  - `shard-hot` 的 `maxPoolSize=50`，`minPoolSize=10`
  - `shard-cold` 的 `maxPoolSize=5`，`minPoolSize=2`
  - `shard-default` 的 `maxPoolSize=10`，`minPoolSize=3`
- **验证点**：使用 `assert_called_with` 验证 AsyncIOMotorClient 参数

### TC-08: Repository 层适配验证
- **优先级**：P0
- **前置条件**：`repository.py` 已修改为使用 `shard_router.get_shard(cname)`
- **步骤**：
  1. Mock `shard_router.get_shard` 返回 mock_db
  2. 调用 `query_documents('sessions', {'status': 'active'})`
- **预期结果**：
  - `shard_router.get_shard('sessions')` 被调用
  - mock_db 上的 `sessions.find({'status': 'active'})` 被调用
  - 不再使用旧的 `db` 全局变量
- **验证点**：旧连接 `src.data.connection.db` 不再被 Repository 使用

### TC-09: 获取所有分片列表
- **优先级**：P2
- **前置条件**：ShardRouter 已连接 hot/warm/cold/default 四个分片
- **步骤**：
  1. 调用 `get_all_shards()`
- **预期结果**：返回 `['shard-hot', 'shard-warm', 'shard-cold', 'shard-default']`
- **验证点**：列表元素与 `_databases.keys()` 一致

### TC-10: 获取分片统计信息
- **优先级**：P2
- **前置条件**：ShardRouter 已初始化 3 个分片
- **步骤**：
  1. 调用 `get_stats()`
- **预期结果**：返回 dict 包含：
  - `shards`：分片名称列表
  - `collection_map`：集合到分片的映射
  - `pool_configs`：各分片的连接池配置
- **验证点**：`collection_map` 与 `SHARD_MAP` 一致

---

## 四、边界与异常测试

### EC-01: 空集合名
- **步骤**：调用 `get_shard('')`
- **预期**：返回 `shard-default`（空字符串不在 SHARD_MAP 中，走默认路由）

### EC-02: 无分片连接时查询
- **步骤**：ShardRouter 未调用 `connect()`，直接调用 `get_shard('test_hot')`
- **预期**：抛出 `KeyError`（`_databases` 为空字典）

### EC-03: 跨分片查询空集合列表
- **步骤**：调用 `cross_shard_query([], {})`
- **预期**：返回空列表 `[]`，不抛异常，不发起任何数据库查询

### EC-04: 重复注册已存在的集合映射
- **步骤**：两次调用 `register_collection('test_hot', 'shard-cold')`
- **预期**：第二次覆盖第一次，`get_shard_name('test_hot')` 返回 `'shard-cold'`

### EC-05: 迁移到不存在的分片
- **步骤**：调用 `migrate_collection('test_hot', 'shard-nonexistent')`
- **预期**：映射更新成功（仅修改内存映射），但后续 `get_shard` 会因数据库不存在而 KeyError

---

## 五、回归测试

### RG-01: 单实例退化模式
- **场景**：配置中仅 `shard-default` URI 可用（其他分片 URI 为空）
- **步骤**：
  1. `ShardRouter.connect()` 仅建立 default 连接
  2. 查询任意集合
- **预期**：所有集合路由到 `shard-default`，行为与改造前单实例一致
- **验证点**：不应因缺少分片配置而崩溃

### RG-02: 热分片集合查询性能不退化
- **场景**：改造后 `sessions` 查询从直接 `db[cname]` 变为 `shard_router.get_shard(cname)`
- **步骤**：
  1. 测量改造前后 `query_documents('sessions', {})` 的 P50 延迟
- **预期**：P50 延迟增长 < 0.5ms（路由开销可忽略）
- **验证点**：`get_shard` 是 O(1) 字典查找

---

## 六、可追溯性矩阵

| 测试用例 | 对应需求场景 | PRD 章节 |
|----------|-------------|----------|
| TC-01 | 场景 1: 正确路由到热分片 | 七、场景 1 |
| TC-02 | 场景 2: 未配置集合路由到默认分片 | 七、场景 2 |
| TC-03 | 场景 3: 跨分片并行查询 | 七、场景 3 |
| TC-04 | 场景 4: 跨分片查询部分失败 | 七、场景 4 |
| TC-05 | 场景 5: 动态注册集合映射 | 七、场景 5 |
| TC-06 | 集合迁移 | 四、migrate_collection |
| TC-07 | 场景 6: 连接池按分片配置 | 七、场景 6 |
| TC-08 | Repository 适配 | 四、4.2 |
| TC-09 | 获取所有分片 | 四、get_all_shards |
| TC-10 | 统计信息 | 四、get_stats |
| EC-01~05 | 边界/异常情况 | 八、风险与缓解 |
| RG-01~02 | 回归验证 | 九、回滚策略 |

---

## 七、覆盖率缺口

| 缺口 | 原因 | 建议 |
|------|------|------|
| 多实例真实环境集成测试 | 需要 docker-compose 3 个 MongoDB 实例，CI 环境可能不支持 | 使用 mongomock 或 testcontainers-python 补充 |
| 数据迁移脚本测试 | `scripts/migrate_shards.py` 未在本 PRD 范围内实现 | 待迁移脚本实现后补充 |
| 冷分片 HDD 延迟测试 | 需要真实 HDD 环境 | 使用 `tc`（traffic control）模拟磁盘延迟 |
| 分片连接泄漏测试 | 需要长时间运行监控 | 加入 soak test（24h 运行） |
| 分布式锁测试 | 当前为单实例部署，无分布式锁需求 | 多实例部署时补充 |

---

*测试规格基于 PRD [100-需求-数据库分片策略](../../prds/2026-09/100-需求-数据库分片策略.md) 提取，覆盖 10 个详细用例 + 5 个边界测试 + 2 个回归测试。*