---

doc_type: test
title: "YA-09-05: 数据层稳定性修复 — 测试规格"
status: 已完成
priority: P0
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-05"
source_prds: ["06-需求-数据层"]
source_modules: ["06-prd-task-数据层"]
source_okr: [yiai-001]

type: test
---

# YA-09-05: 数据层稳定性修复 — 测试规格

> 来源 PRD：[06-需求-数据层.md](../../prds/2026-09/06-需求-数据层.md)
> 开发方案：[06-prd-task-数据层.md](../../devs/2026-09/06-prd-task-数据层.md)
> 需求编号：YA-09-05 · 优先级：P0

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖连接池优化（minPoolSize 预热）、Cursor 泄漏修复（try/finally 显式关闭）、超时控制（maxTimeMS + connectTimeoutMS）。

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元测试 | Motor 连接池配置单元验证 | pytest + unittest.mock | 连接参数正确性、Cursor 关闭装饰器、超时参数 |
| L2 集成测试 | 真实 MongoDB test db | pytest-asyncio + motor | 连接池并发行为、Cursor 生命周期、聚合超时 |
| L4 性能基准 | 连接池压力测试 | pytest + time.perf_counter + asyncio | 并发查询延迟、连接数稳定性、内存使用 |

### 1.2 修复前后对比

| 配置项 | 修复前 | 修复后 | 预期效果 |
|--------|--------|--------|---------|
| `minPoolSize` | 0（默认，无预热） | 10 | 冷启动延迟消除 |
| `maxIdleTimeMS` | 无限制 | 30000 | 空闲连接及时释放 |
| `connectTimeoutMS` | 30s（默认） | 5000 | 连接超时快速失败 |
| `serverSelectionTimeoutMS` | 30s（默认） | 5000 | 服务器选择超时快速感知 |
| `waitQueueTimeoutMS` | 无限制 | 10000 | 等待队列溢出保护 |
| Cursor 关闭策略 | GC 回收 | try/finally 显式关闭 | 零连接泄漏 |
| 聚合超时 | 无限制 | maxTimeMS=15s | 慢查询不阻塞连接池 |

---

<a id="sec-fixtures"></a>
## 二、测试数据与 Fixtures

```python
import pytest
import pytest_asyncio
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from unittest.mock import MagicMock, AsyncMock

@pytest_asyncio.fixture
async def test_db():
    """创建测试数据库实例——使用独立 test database。"""
    client = AsyncIOMotorClient(
        "mongodb://localhost:27017/yiai_test",
        maxPoolSize=100,
        minPoolSize=2,  # 测试用小连接池
        connectTimeoutMS=5000,
        serverSelectionTimeoutMS=5000,
    )
    db = client.get_default_database()
    yield db
    # 清理所有测试集合
    collections = await db.list_collection_names()
    for coll in collections:
        if coll != "system.indexes":
            await db[coll].delete_many({})
    client.close()

@pytest_asyncio.fixture
async def seeded_db(test_db):
    """预填充 1000 条测试数据的数据库。"""
    docs = [
        {"_id": f"doc_{i}", "title": f"文档 {i}", "category": "test",
         "status": "open" if i % 2 == 0 else "closed",
         "priority": i % 5, "created_at": f"2026-09-{1 + (i % 28):02d}"}
        for i in range(1000)
    ]
    await test_db.test_collection.insert_many(docs)
    yield test_db
    await test_db.test_collection.delete_many({})

@pytest.fixture
def mock_async_cursor():
    """Mock Motor AsyncIOMotorCursor。"""
    cursor = AsyncMock()
    cursor.close = AsyncMock()
    # 模拟迭代 100 个文档
    cursor.__aiter__.return_value = [
        {"_id": f"doc_{i}", "title": f"文档 {i}"} for i in range(100)
    ]
    return cursor

@pytest.fixture
def mock_collection(mock_async_cursor):
    """Mock Motor AsyncIOMotorCollection。"""
    coll = AsyncMock()
    coll.find.return_value = mock_async_cursor
    coll.aggregate.return_value = mock_async_cursor
    return coll

@pytest.fixture
def connection_pool_config():
    """修复后的连接池配置。"""
    return {
        "maxPoolSize": 100,
        "minPoolSize": 10,
        "maxIdleTimeMS": 30000,
        "connectTimeoutMS": 5000,
        "serverSelectionTimeoutMS": 5000,
        "waitQueueTimeoutMS": 10000,
        "retryWrites": True,
        "retryReads": True,
    }

@pytest.fixture
def slow_aggregation_pipeline():
    """模拟慢聚合管道——用于超时测试。"""
    return [
        {"$match": {"category": "test"}},
        {"$group": {"_id": "$status", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
```

---

<a id="sec-cases"></a>
## 三、详细测试用例

### 3.1 连接池配置

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-DL-01 | minPoolSize=10 预热连接 | 服务启动 | 1. 启动服务<br>2. 检查 MongoDB `db.serverStatus().connections` | 启动后立即有 10 个连接，无需等待 | P0 |
| TC-DL-02 | 并发 101 请求——连接池上限 | maxPoolSize=100 | 1. 发送 101 个并发请求<br>2. 检查第 101 个请求行为 | 第 101 请求在 waitQueue 中等待而非崩溃 | P0 |
| TC-DL-03 | waitQueueTimeoutMS=10s 溢出保护 | 连接池满 + 请求堆积 | 1. 阻塞所有连接（模拟慢查询）<br>2. 发送超过 waitQueueTimeout 的请求 | 等待超时后返回错误，不无限阻塞 | P1 |
| TC-DL-04 | connectTimeoutMS=5s 快速失败 | MongoDB 不可达 | 1. 配置错误的 MongoDB 地址<br>2. 尝试连接 | 5s 内返回连接错误，不等待 30s | P1 |
| TC-DL-05 | maxIdleTimeMS 空闲连接释放 | 无请求 30s 后 | 1. 预热 10 个连接<br>2. 停止所有请求 30s<br>3. 检查连接数 | 空闲连接释放，连接数降至 minPoolSize | P2 |
| TC-DL-06 | serverSelectionTimeoutMS=5s | MongoDB 集群节点不可用 | 1. 模拟服务器选择超时<br>2. 检查超时时间 | 5s 内超时，不等待默认 30s | P1 |

### 3.2 Cursor 泄漏修复

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-DL-07 | try/finally 显式关闭 Cursor | Mock collection.find() | 1. `find()` 返回 cursor<br>2. `try` 块中迭代<br>3. `finally` 调用 `cursor.close()` | cursor.close() 必定被调用 | P0 |
| TC-DL-08 | 异常路径也关闭 Cursor | find 迭代中抛异常 | 1. 迭代到第 50 个文档时抛异常<br>2. 检查 finally 是否执行 | cursor.close() 在异常路径也被调用 | P0 |
| TC-DL-09 | 1000 次查询后连接数稳定 | 预填充 1000 文档 | 1. 执行 1000 次 `find()` 操作<br>2. 每次操作后检查连接池状态 | 连接数保持稳定（基线 ± 2），无持续增长 | P0 |
| TC-DL-10 | 长时间运行 1h 无泄漏 | 持续查询 | 1. 每小时 1000 次查询<br>2. 1h 后检查连接数 | 连接数 <= maxPoolSize，无泄漏趋势 | P1 |
| TC-DL-11 | 嵌套 Cursor 场景 | 外层 find + 内层 find | 1. 外层遍历结果<br>2. 每条结果执行内层 find<br>3. 检查 Cursor 关闭情况 | 两个 Cursor 均正确关闭 | P2 |

### 3.3 聚合超时控制

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-DL-12 | 聚合 maxTimeMS=15s 超时 | 复杂聚合管道 | 1. 执行模拟慢聚合 > 15s<br>2. 检查超时行为 | `asyncio.TimeoutError`，日志 WARNING | P0 |
| TC-DL-13 | 普通聚合正常完成 | 标准 count/group 聚合 | 1. 执行简单聚合（< 3s）<br>2. 检查结果 | 正常返回聚合结果，无超时 | P1 |
| TC-DL-14 | 聚合超时降级返回 | 超时场景 | 1. 聚合超时<br>2. 检查是否降级返回 | 返回部分结果 + WARNING 日志，不抛异常给调用方 | P1 |
| TC-DL-15 | $lookup 大表关联超时 | 10000 文档跨集合关联 | 1. 两个 10000 文档集合做 $lookup<br>2. 检查超时行为 | 超时后不阻塞其他查询 | P2 |

---

<a id="sec-edge"></a>
## 四、边界与异常测试

| ID | 用例名称 | 输入/场景 | 预期行为 | 优先级 |
|----|---------|---------|---------|--------|
| EG-DL-01 | MongoDB 短暂不可用恢复 | kill mongod 10s 后重启 | 连接恢复后自动重连，无手动干预 | P0 |
| EG-DL-02 | 零文档集合查询 | 空集合 find() | 返回空列表，不抛异常 | P1 |
| EG-DL-03 | 连接池满 + 突发流量 | 100 慢查询阻塞 + 50 新请求 | waitQueue 排队，超时后返回错误 | P1 |
| EG-DL-04 | 聚合管道空阶段列表 | `aggregate([])` | 返回所有文档（等同于 find），不抛异常 | P2 |
| EG-DL-05 | retryWrites 在连接中断时重试 | 写入时连接中断 | 自动重试，写入最终成功 | P1 |
| EG-DL-06 | 多数据库并发操作 | 同时操作 3 个 database | 连接池正确隔离，互不影响 | P2 |

---

<a id="sec-regression"></a>
## 五、回归测试

| ID | 回归场景 | 触发条件 | 验证目标 | 优先级 |
|----|---------|---------|---------|--------|
| RG-DL-01 | 现有 CRUD 操作不受影响 | 连接池优化后 | query_documents/create/update/delete 行为不变 | P0 |
| RG-DL-02 | YiVad 列表页加载正常 | 修复后 YiVad Issues/Bugs 列表 | 数据加载延迟 < 500ms | P0 |
| RG-DL-03 | 批量操作（bulk_write）正常 | 知识库监视器批量同步 | bulk_write 性能不退化 | P1 |

---

<a id="sec-traceability"></a>
## 六、可追溯性矩阵

| PRD 功能需求 | 对应测试用例 | 覆盖率 |
|-------------|------------|--------|
| FR1: minPoolSize=10 预热 | TC-DL-01, TC-DL-02 | 预热 + 上限验证 |
| FR2: Cursor try/finally 显式关闭 | TC-DL-07 ~ TC-DL-11 | 正常 + 异常 + 嵌套 + 长运行 |
| FR3: 聚合 maxTimeMS=15s | TC-DL-12 ~ TC-DL-15 | 超时 + 正常 + 降级 + $lookup |
| FR4: 连接超时参数优化 | TC-DL-03 ~ TC-DL-06 | waitQueue + connect + idle + serverSelection |
| FR5: retryWrites/retryReads | EG-DL-05 | 连接中断重试 |
| 决策1: minPoolSize=10 | TC-DL-01 | 预热值验证 |
| 决策2: try/finally | TC-DL-07, TC-DL-08 | 显式关闭 |
| 决策3: maxTimeMS=15s | TC-DL-12, TC-DL-13 | 超时值验证 |

---

<a id="sec-gaps"></a>
## 七、覆盖缺口

| 缺口 | 影响 | 建议 |
|------|------|------|
| MongoDB 副本集故障转移 | 单节点测试无法验证 failover | 添加 replica set 环境下的连接池恢复测试 |
| Atlas 环境连接池行为 | 本地开发与 Atlas 连接行为差异 | 添加 Atlas CI 工作流测试连接参数 |
| Motor 版本升级兼容性 | Motor 3.x → 4.x API 变更 | 添加 Motor 版本兼容性测试矩阵 |
| 真实生产流量负载模拟 | 单元/集成测试无法模拟真实负载模式 | 使用 k6/locust 进行生产级连接池压测 |
| retryWrites 幂等性 | 部分重试可能导致重复写入 | 添加重试幂等性测试（如 insert 重复） |