---

doc_type: test
title: "YA-09-17: 数据访问层查询优化 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-17"
source_prds: ["21-需求-数据访问层查询优化"]
source_modules: []
source_okr: [yiai-001]

type: test
---

# YA-09-17: 数据访问层查询优化 — 测试规格

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖 MongoDB 聚合管道优化、索引策略、查询性能基准。

> 来源 PRD：[21-需求-数据访问层查询优化.md](../../prds/2026-09/21-需求-数据访问层查询优化.md)

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元测试 | 查询构建逻辑 | pytest | 聚合管道构建、索引建议、explain 解析 |
| L2 集成测试 | 真实 MongoDB + 索引 | pytest-asyncio + motor | 查询 explain 验证、索引使用率、聚合优化效果 |
| L4 性能基准 | 查询延迟对比 | pytest + time.perf_counter | 优化前后延迟对比 |

### 1.2 优化方向

| 优化 | 目标 | 指标 |
|------|------|------|
| 聚合管道优化 | 减少 $lookup/$unwind 开销 | 延迟减少 30%+ |
| 索引覆盖 | 查询走索引而非全表扫描 | IXSCAN > 95% |
| 投影优化 | 减少网络传输 | 返回字段精简 |
| 批量操作 | 批量读写替代逐条 | insert_many/bulk_write |

---

<a id="sec-fixtures"></a>
## 二、测试数据与 Fixtures

```python
import pytest
import pytest_asyncio
from motor.motor_asyncio import AsyncIOMotorCollection

@pytest_asyncio.fixture
async def large_collection(test_db):
    """10000 条测试数据的集合——用于性能测试。"""
    docs = [{"_id": f"doc_{i}", "category": f"cat_{i % 10}", "status": "active" if i % 3 else "inactive",
             "score": i % 100, "tags": [f"tag_{i % 20}"], "created_at": f"2026-09-{(i % 28) + 1:02d}"}
            for i in range(10000)]
    await test_db.perf_test.insert_many(docs)
    yield test_db.perf_test
    await test_db.perf_test.delete_many({})

@pytest.fixture
def slow_aggregation_pipeline():
    """模拟慢聚合管道——用于优化前后对比。"""
    return [
        {"$match": {"status": "active"}},
        {"$group": {"_id": "$category", "count": {"$sum": 1}, "avg_score": {"$avg": "$score"}}},
        {"$sort": {"count": -1}},
        {"$limit": 10},
    ]

@pytest.fixture
def optimized_aggregation_pipeline():
    """优化后的聚合管道——提前过滤 + 索引利用。"""
    return [
        {"$match": {"status": "active"}},  # 走 status 索引
        {"$sort": {"category": 1}},         # 利用 category 索引排序
        {"$group": {"_id": "$category", "count": {"$sum": 1}, "avg_score": {"$avg": "$score"}}},
        {"$sort": {"count": -1}},
        {"$limit": 10},
    ]

@pytest.fixture
def index_definitions():
    """索引定义 fixture。"""
    return [
        {"collection": "perf_test", "keys": [("status", 1)], "name": "idx_status"},
        {"collection": "perf_test", "keys": [("category", 1)], "name": "idx_category"},
        {"collection": "perf_test", "keys": [("status", 1), ("category", 1)], "name": "idx_status_category"},
        {"collection": "perf_test", "keys": [("tags", 1)], "name": "idx_tags"},
    ]
```

---

<a id="sec-cases"></a>
## 三、详细测试用例

### 3.1 聚合管道优化

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-DQ-01 | $match 前置减少文档量 | large_collection 10000 docs | 1. explain 分析聚合管道<br>2. 检查 $match 过滤后文档数 | $match 优先执行，减少后续阶段输入 | P1 |
| TC-DQ-02 | 索引覆盖 $match 阶段 | idx_status 索引 | 1. explain 检查 $match 阶段<br>2. 验证是否使用索引 | IXSCAN（非 COLLSCAN） | P1 |
| TC-DQ-03 | 优化后延迟减少 30%+ | slow vs optimized pipeline | 1. 对比两种管道的执行时间<br>2. 计算优化比例 | optimized 延迟 < slow 延迟 × 0.7 | P1 |
| TC-DQ-04 | $lookup 替换为嵌入式文档 | 关联查询优化 | 1. 对比 $lookup vs 预嵌入文档<br>2. 测量延迟差异 | 嵌入式文档查询延迟 < $lookup 延迟 × 0.5 | P2 |
| TC-DQ-05 | 聚合管道缓存 | 相同管道重复执行 | 1. 第 1 次执行（冷）<br>2. 第 2 次执行（热） | 热执行延迟 < 冷执行延迟（MongoDB 内部缓存） | P2 |

### 3.2 索引策略

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-DQ-06 | 复合索引覆盖查询 | idx_status_category 索引 | 1. 查询 {status, category}<br>2. explain 检查 | 使用 idx_status_category 复合索引 | P1 |
| TC-DQ-07 | 缺失索引建议 | 查询未索引字段 | 1. explain 检测 COLLSCAN<br>2. 检查索引建议 | 自动建议创建索引（字段 + 方向） | P2 |
| TC-DQ-08 | 索引选择性评估 | 高/低基数字段 | 1. 对比 status (3 values) vs score (100 values) 索引 | 高基数字段索引更高效 | P2 |

### 3.3 查询投影优化

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-DQ-09 | 投影减少传输量 | projection={title:1} | 1. 查询含 projection vs 不含<br>2. 对比返回字节数 | 投影查询返回字节数显著减少 | P2 |
| TC-DQ-10 | 覆盖索引查询 | 索引含所有投影字段 | 1. explain 检查是否覆盖查询<br>2. 验证无 FETCH 阶段 | totalDocsExamined=0（仅索引扫描） | P2 |

### 3.4 批量操作

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-DQ-11 | insert_many vs 逐条 insert | 1000 条文档 | 1. insert_many 批量插入<br>2. 对比逐条 insert | insert_many 延迟 < 逐条延迟 × 0.1 | P1 |
| TC-DQ-12 | bulk_write 混合操作 | 100 条 update + 50 条 insert + 10 条 delete | 1. bulk_write 一次执行<br>2. 检查结果 | 所有操作正确执行，单次网络往返 | P2 |

---

<a id="sec-edge"></a>
## 四、边界与异常测试

| ID | 用例名称 | 输入/场景 | 预期行为 | 优先级 |
|----|---------|---------|---------|--------|
| EG-DQ-01 | 空集合聚合 | 0 文档集合 | 返回空结果，不报错 | P2 |
| EG-DQ-02 | 聚合管道超长 | 20 个阶段的管道 | 性能不显著退化 | P2 |
| EG-DQ-03 | 索引内存超限 | 索引大小 > RAM | 性能下降但功能正常，日志 WARNING | P1 |

---

<a id="sec-regression"></a>
## 五、回归测试

| ID | 回归场景 | 触发条件 | 验证目标 | 优先级 |
|----|---------|---------|---------|--------|
| RG-DQ-01 | 优化后查询结果不变 | 聚合管道重写 | 优化前后查询结果完全一致 | P0 |
| RG-DQ-02 | 现有 API 响应格式不变 | 数据层优化后 | query_documents 响应不变 | P1 |

---

<a id="sec-traceability"></a>
## 六、可追溯性矩阵

| PRD 功能需求 | 对应测试用例 | 覆盖率 |
|-------------|------------|--------|
| FR1: 聚合管道优化 | TC-DQ-01 ~ TC-DQ-05 | 前置/索引/延迟/$lookup/缓存 |
| FR2: 索引策略 | TC-DQ-06 ~ TC-DQ-08 | 复合索引/建议/选择性 |
| FR3: 投影优化 | TC-DQ-09, TC-DQ-10 | 传输量/覆盖索引 |
| FR4: 批量操作 | TC-DQ-11, TC-DQ-12 | insert_many/bulk_write |

---

<a id="sec-gaps"></a>
## 七、覆盖缺口

| 缺口 | 影响 | 建议 |
|------|------|------|
| 真实生产数据量级 | 10000 文档 vs 生产 100K+ | 添加 100K+ 数据量级性能测试 |
| Atlas Search $search 优化 | 本地 MongoDB 无 Atlas Search | 添加 Atlas 环境下的 $search 聚合测试 |
| 慢查询日志分析 | 未验证慢查询 profile 数据 | 添加 db.setProfilingLevel 慢查询捕获测试 |