---

doc_type: test
title: "YA-09-37: 数据库连接池监控与动态伸缩 — 基于负载的自适应调整 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-37"
source_prds: ["41-需求-连接池动态伸缩"]
source_modules: []
source_okr: [yiai-001]

type: test
---

# YA-09-37: 数据库连接池监控与动态伸缩 — 测试规格

> **文档职责**：本文档定义连接池动态伸缩的**怎么验证**（VERIFY），覆盖连接数监控、伸缩策略、自动扩缩容和连接泄漏检测。

> 来源 PRD：[41-需求-连接池动态伸缩.md](../../prds/2026-09/41-需求-连接池动态伸缩.md)

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元 | 伸缩策略引擎、连接计数 | pytest | 阈值判断、扩缩容决策 |
| L2 集成 | Motor 连接池实际行为 + 高并发负载 | pytest + httpx | 连接数随负载变化、等待队列行为 |

### 1.2 测试数据

```python
# tests/pool/conftest.py

@pytest.fixture
def pool_config():
    """连接池配置。"""
    return {
        "min_pool_size": 10,
        "max_pool_size": 100,
        "scale_up_threshold": 0.7,   # 70% 使用率触发扩容
        "scale_down_threshold": 0.3,  # 30% 使用率触发缩容
        "check_interval_seconds": 30,
        "scale_step": 10,
    }

@pytest.fixture
def pool_monitor(pool_config):
    """连接池监控器。"""
    return PoolMonitor(pool_config)

@pytest.fixture
def simulate_load(pool_monitor):
    """模拟不同负载下的连接使用率。"""
    async def _load(active_connections: int):
        pool_monitor._active = active_connections
        pool_monitor._total = pool_monitor.max_size
        return pool_monitor.evaluate_scaling()
    return _load
```

---

<a id="sec-test-cases"></a>
## 二、测试用例

### 2.1 连接监控

---

#### TC-POOL-001: 连接池状态正常上报

| 字段 | 内容 |
|------|------|
| **ID** | TC-POOL-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | Motor 客户端已初始化 |
| **步骤** | 1. 查询连接池状态<br/>2. 检查监控指标 |
| **预期结果** | - `active_connections` >= min_pool_size<br/>- `idle_connections` >= 0<br/>- `waiting_queue` 计数<br/>- `total_created` 历史总数 |

---

#### TC-POOL-002: 连接使用率准确计算

| 字段 | 内容 |
|------|------|
| **ID** | TC-POOL-002 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | `min=10, max=100` |
| **步骤** | 1. 活跃连接 75 个<br/>2. 计算使用率<br/>3. 活跃连接 25 个<br/>4. 计算使用率 |
| **预期结果** | - 75/100 = 75% -> 触发扩容阈值 (70%)<br/>- 25/100 = 25% -> 低于缩容阈值 (30%) |

---

### 2.2 自动伸缩

---

#### TC-POOL-003: 使用率 > 70% 自动扩容

| 字段 | 内容 |
|------|------|
| **ID** | TC-POOL-003 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | 并发负载使活跃连接达到 75（75%） |
| **步骤** | 1. 发送高并发请求<br/>2. 检查连接池状态变化<br/>3. 检查日志 |
| **预期结果** | - `max_pool_size` 从 100 增加到 110<br/>- 日志: "Pool scaled up: max_size 100 -> 110 (usage 75%)"<br/>- 新连接在 5s 内建立 |

---

#### TC-POOL-004: 使用率 < 30% 自动缩容

| 字段 | 内容 |
|------|------|
| **ID** | TC-POOL-004 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | 低负载，活跃连接仅 25 个（25%） |
| **步骤** | 1. 减少并发负载<br/>2. 等待缩容决策周期<br/>3. 检查连接池状态 |
| **预期结果** | - `max_pool_size` 从 100 降低到 90<br/>- 日志: "Pool scaled down: max_size 100 -> 90 (usage 25%)"<br/>- 不低于 `min_pool_size`（10） |

---

#### TC-POOL-005: 不超过 max_pool_size 硬上限

| 字段 | 内容 |
|------|------|
| **ID** | TC-POOL-005 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | `max_pool_size_cap=500` |
| **步骤** | 1. 连续触发扩容，池大小达到 500<br/>2. 再次触发扩容 |
| **预期结果** | - 池大小保持 500<br/>- 日志: "Pool at maximum capacity (500), consider scaling horizontally" |

---

#### TC-POOL-006: 缩容不低于 min_pool_size

| 字段 | 内容 |
|------|------|
| **ID** | TC-POOL-006 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **前提** | 当前池大小 = 20, min_pool_size = 10 |
| **步骤** | 1. 低负载触发缩容<br/>2. 多次触发 |
| **预期结果** | - 第一次: 20 -> 10<br/>- 第二次: 保持 10<br/>- 不缩减到 min 以下 |

---

### 2.3 连接泄漏检测

---

#### TC-POOL-007: 连接保持时间过长告警

| 字段 | 内容 |
|------|------|
| **ID** | TC-POOL-007 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | `leak_threshold_seconds=60` |
| **步骤** | 1. 获取连接并持有 65 秒不释放<br/>2. 监控器检测 |
| **预期结果** | - WARNING: "Possible connection leak: connection #45 held for 65s"<br/>- 泄漏连接数 > 5 时升级为 ERROR |

---

#### TC-POOL-008: 请求后连接正常归还池中

| 字段 | 内容 |
|------|------|
| **ID** | TC-POOL-008 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | 使用 `async with` 管理连接 |
| **步骤** | 1. 发送 100 个请求<br/>2. 请求停止后等待 10s<br/>3. 检查活跃连接数 |
| **预期结果** | - 活跃连接数回落到 min_pool_size 附近<br/>- 无连接累积 |

---

<a id="sec-edge-cases"></a>
## 三、边界与异常测试

### TC-EDGE-001: 突增流量——连接耗尽时的等待队列

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. 瞬间发送 200 个并发请求（超过 max_pool_size）<br/>2. 测量 P99 延迟 |
| **预期结果** | - 请求排队等待连接<br/>- P99 延迟 < 5s（排队 + 处理）<br/>- 无连接超时错误 |

### TC-EDGE-002: MongoDB 连接中断后自动重连

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-002 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. 重启 MongoDB<br/>2. 检查连接池恢复 |
| **预期结果** | - Motor 自动重连<br/>- `serverSelectionTimeoutMS` 内恢复<br/>- 等待队列中的请求恢复处理 |

### TC-EDGE-003: 伸缩检查间隔内重复抖动防护

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-003 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **步骤** | 1. 快速切换高低负载（每 5 秒一次）<br/>2. 检查伸缩次数 |
| **预期结果** | - 伸缩间隔最少 30 秒<br/>- 不出现频繁扩缩容（flapping）<br/>- 冷却期保护 |

---

<a id="sec-regression"></a>
## 四、回归测试

### TC-REG-001: 现有数据库操作不受影响

| 字段 | 内容 |
|------|------|
| **ID** | TC-REG-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. 运行全部数据库相关测试<br/>2. 验证查询功能正常 |
| **预期结果** | - 100% 通过<br/>- Motor 连接池行为无退化 |

---

<a id="sec-traceability"></a>
## 五、需求-测试追溯矩阵

| PRD FR | 模块 | 测试用例 | 覆盖层级 |
|--------|------|---------|---------|
| FR-连接监控 | PoolMonitor | TC-POOL-001~002 | L1+L2 |
| FR-自动伸缩 | AutoScaler | TC-POOL-003~006 | L1+L2 |
| FR-泄漏检测 | LeakDetector | TC-POOL-007~008 | L2 |
| FR-边界 | 异常处理 | TC-EDGE-001~003 | L1+L2 |
| FR-回归 | 全模块 | TC-REG-001 | L2 |

---

<a id="sec-coverage"></a>
## 六、覆盖缺口

| 缺口 | 原因 | 补救计划 |
|------|------|---------|
| 生产环境 MongoDB Atlas 连接池 | Atlas 的连接限制可能不同 | 在部署环境测试中验证 |
| 跨副本集连接池分布 | 需多节点 MongoDB | 在分片策略测试中补充 |

---

<a id="sec-references"></a>
## 七、参考文档

| 资源 | 路径 |
|------|------|
| 源 PRD | [41-需求-连接池动态伸缩.md](../../prds/2026-09/41-需求-连接池动态伸缩.md) |
| MongoDB 分片策略 | [../2026-09/100-prd-test-数据库分片策略.md](../2026-09/100-prd-test-数据库分片策略.md) |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/41-需求-连接池动态伸缩.md`*