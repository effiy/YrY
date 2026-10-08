---

doc_type: test
title: "YA-09-25: 数据查询缓存层 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-25"
source_prds: ["29-需求-数据查询缓存层"]
source_modules: []
source_okr: [yiai-003]

type: test
---

# YA-09-25: 数据查询缓存层 — 测试规格

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖 Redis/Memory 多级缓存、查询结果缓存、缓存失效策略、缓存穿透防护。

> 来源 PRD：[29-需求-数据查询缓存层.md](../../prds/2026-09/29-需求-数据查询缓存层.md)

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元测试 | 缓存逻辑纯函数 | pytest | 缓存 key 生成、TTL 管理、LRU 淘汰 |
| L2 集成测试 | 真实 Redis + MongoDB | pytest-asyncio + motor + redis | 多级缓存、缓存失效、写穿透 |

### 1.2 多级缓存架构

```
L1: 内存 LRU Cache (maxsize=1000, TTL=10s)
  ↓ miss
L2: Redis Cache (TTL=60s)
  ↓ miss
L3: MongoDB 查询
```

### 1.3 缓存失效策略

| 触发条件 | 失效范围 | 方式 |
|---------|---------|------|
| `create_document` | 对应集合的所有缓存 key | key pattern 删除 |
| `update_document` | 对应集合 + 文档 ID | 精确 key 删除 |
| `delete_document` | 对应集合 + 文档 ID | 精确 key 删除 |
| TTL 过期 | 自动 | Redis EXPIRE |

---

<a id="sec-fixtures"></a>
## 二、测试数据与 Fixtures

```python
import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock

@pytest.fixture
def cache_config():
    """缓存配置。"""
    return {
        "l1": {"type": "memory", "maxsize": 1000, "ttl": 10},
        "l2": {"type": "redis", "url": "redis://localhost:6379", "ttl": 60},
        "enabled": True,
        "cache_null": False,  # 不缓存空结果
    }

@pytest.fixture
def mock_redis():
    """Mock Redis 客户端。"""
    redis = MagicMock()
    redis.get = AsyncMock(return_value=None)
    redis.set = AsyncMock(return_value=True)
    redis.delete = AsyncMock(return_value=1)
    redis.keys = AsyncMock(return_value=[])
    return redis

@pytest.fixture
def query_cache_keys():
    """缓存 key 生成示例。"""
    return {
        "list": "cache:query:bugs:filter_status_open:page_1:size_10",
        "single": "cache:query:bugs:doc_bug_001",
        "aggregate": "cache:agg:bugs:group_by_status",
    }

@pytest.fixture
def cached_query_result():
    """缓存的查询结果。"""
    return {
        "list": [{"_id": "bug_001", "title": "RAG Bug"}],
        "total": 1,
        "pageNum": 1,
        "pageSize": 10,
    }
```

---

<a id="sec-cases"></a>
## 三、详细测试用例

### 3.1 L1 内存缓存

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-CA-01 | 内存缓存命中 | 第 1 次查询已缓存 | 1. 第 2 次相同查询<br>2. 检查数据源访问 | 不访问 Redis/MongoDB，直接返回内存缓存 | P0 |
| TC-CA-02 | 内存缓存 TTL 10s 过期 | 缓存后等待 11s | 1. 缓存结果<br>2. 等待 11s<br>3. 再次查询 | 缓存过期，查询 L2 Redis | P1 |
| TC-CA-03 | 内存缓存 LRU 淘汰 | 缓存满 1000 条 | 1. 插入第 1001 条<br>2. 检查淘汰行为 | 淘汰最久未使用条目 | P2 |
| TC-CA-04 | 内存缓存清空 | clear() 调用 | 1. 清空所有 L1 缓存<br>2. 查询 | L1 miss → L2 Redis → MongoDB | P2 |

### 3.2 L2 Redis 缓存

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-CA-05 | Redis 缓存命中 | 结果已在 Redis | 1. L1 miss<br>2. L2 Redis 命中<br>3. 回填 L1 | 返回 Redis 结果，同时写入 L1 | P0 |
| TC-CA-06 | Redis TTL 60s 过期 | 缓存过期 | 1. L1 miss → L2 miss (expired)<br>2. 查询 MongoDB | MongoDB 查询执行，结果回填 L1+L2 | P1 |
| TC-CA-07 | Redis 不可用→降级 MongoDB | Redis 连接拒绝 | 1. L1 miss<br>2. L2 Redis 不可达<br>3. 检查行为 | 降级到 MongoDB，日志 WARNING | P0 |

### 3.3 缓存失效

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-CA-08 | 创建文档→缓存失效 | bugs 集合有缓存 | 1. create_document 执行<br>2. 检查缓存 | 对应集合的列表缓存被清除 | P0 |
| TC-CA-09 | 更新文档→精确缓存失效 | 文档 bug_001 有缓存 | 1. update_document("bug_001")<br>2. 检查缓存 | 仅 bug_001 的单文档缓存失效 | P1 |
| TC-CA-10 | 删除文档→缓存失效 | 文档 bug_001 有缓存 | 1. delete_document("bug_001")<br>2. 检查缓存 | bug_001 缓存失效 + 列表缓存失效 | P1 |
| TC-CA-11 | 批量删除→集合缓存失效 | 删除 10 个文档 | 1. 批量删除<br>2. 检查缓存 | 集合级列表缓存全部失效 | P2 |

### 3.4 缓存穿透防护

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-CA-12 | 查询不存在的数据 | filter 匹配 0 条 | 1. cache_null=false<br>2. 查询不匹配数据 | 不缓存空结果，每次查询 MongoDB | P1 |
| TC-CA-13 | 布隆过滤器预判断 | key 不在布隆过滤器中 | 1. 查询不存在的数据<br>2. L1 miss → 布隆过滤器判断 | 布隆过滤器返回 "不存在"，跳过 MongoDB | P2 |

---

<a id="sec-edge"></a>
## 四、边界与异常测试

| ID | 用例名称 | 输入/场景 | 预期行为 | 优先级 |
|----|---------|---------|---------|--------|
| EG-CA-01 | 缓存被禁用 | cache.enabled=false | 所有查询直通 MongoDB | P1 |
| EG-CA-02 | 超大缓存值 | 查询结果 > 10MB | 不入缓存，日志 WARNING | P2 |
| EG-CA-03 | 缓存 key 碰撞 | 不同查询生成相同 key | 缓存 key 设计保证唯一性（含完整查询参数哈希） | P1 |
| EG-CA-04 | 缓存雪崩——大量 key 同时过期 | 100 个 key 同时 TTL 过期 | 过期时间加随机偏移（±5s） | P2 |

---

<a id="sec-regression"></a>
## 五、回归测试

| ID | 回归场景 | 触发条件 | 验证目标 | 优先级 |
|----|---------|---------|---------|--------|
| RG-CA-01 | 缓存不影响数据正确性 | 缓存层上线 | 查询结果与直查 MongoDB 一致 | P0 |
| RG-CA-02 | 缓存不影响数据实时性 | 数据更新后 | 缓存失效后查询返回最新数据 | P0 |

---

<a id="sec-traceability"></a>
## 六、可追溯性矩阵

| PRD 功能需求 | 对应测试用例 | 覆盖率 |
|-------------|------------|--------|
| FR1: L1 内存缓存 | TC-CA-01 ~ TC-CA-04 | 命中/TTL/LRU/清空 |
| FR2: L2 Redis 缓存 | TC-CA-05 ~ TC-CA-07 | 命中/TTL/降级 |
| FR3: 缓存失效 | TC-CA-08 ~ TC-CA-11 | 创建/更新/删除/批量 |
| FR4: 缓存穿透防护 | TC-CA-12, TC-CA-13 | 空结果/布隆过滤器 |

---

<a id="sec-gaps"></a>
## 七、覆盖缺口

| 缺口 | 影响 | 建议 |
|------|------|------|
| Redis Cluster 模式 | 单机 Redis vs Cluster 行为差异 | 添加 Redis Cluster 环境缓存测试 |
| 缓存预热 | 冷启动时所有查询 miss | 添加缓存预热策略测试 |
| 缓存一致性窗口 | 更新和缓存失效之间的时间窗口 | 添加时间内数据一致性测试 |