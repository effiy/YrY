---

doc_type: test
title: "YA-09-41: 服务端请求限速令牌预生成 — 令牌池批量预热与高并发优化 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-41"
source_prds: ["45-需求-令牌预生成优化"]
source_modules: []
source_okr: [yiai-001]

type: test
---

# YA-09-41: 服务端请求限速令牌预生成 — 测试规格

> **文档职责**：本文档定义令牌预生成优化的**怎么验证**（VERIFY），覆盖批量生成、并发获取、超发保护和性能基准。

> 来源 PRD：[45-需求-令牌预生成优化.md](../../prds/2026-09/45-需求-令牌预生成优化.md)

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元 | 令牌池算法、批量生成逻辑 | pytest | 池大小、消耗率、填充策略 |
| L2 集成 | 高并发获取令牌 | pytest + asyncio | 并发吞吐、等待队列 |
| L4 性能 | 预生成 vs 实时生成对比 | time.perf_counter | 预生成吞吐 > 10K/s |

### 1.2 测试数据

```python
@pytest.fixture
def token_pool():
    class TokenPool:
        def __init__(self, capacity=1000):
            self._tokens = asyncio.Queue(maxsize=capacity)
            self._capacity = capacity
        async def fill(self, count):
            for _ in range(count):
                await self._tokens.put(str(uuid.uuid4()))
        async def acquire(self):
            return await self._tokens.get()
        def pool_size(self):
            return self._tokens.qsize()
    return TokenPool(capacity=1000)

@pytest.fixture
def prefill_token_pool(token_pool):
    """预填充 500 个令牌。"""
    asyncio.run(token_pool.fill(500))
    return token_pool
```

---

## 二、测试用例

### 2.1 预生成策略

#### TC-TKN-001: 启动时预填充令牌池达到 init_size

| **ID** | TC-TKN-001 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **步骤** | 1. 初始化 TokenPool(init_size=100)<br/>2. 检查 `pool_size()` |
| **预期结果** | - `pool_size() = 100`<br/>- 预生成耗时 < 10ms |

#### TC-TKN-002: 池低于 low_watermark 时触发补充

| **ID** | TC-TKN-002 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **步骤** | 1. low_watermark=200<br/>2. 消耗令牌使池降至 150<br/>3. 检查后台补充任务 |
| **预期结果** | - 自动补充到 high_watermark (500)<br/>- 日志: "Token pool refilled: 150 -> 500" |

#### TC-TKN-003: 令牌消耗速度与补充速度平衡

| **ID** | TC-TKN-003 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 以 1000/s 速率消耗<br/>2. 以 500/s 速率补充<br/>3. 持续 10s |
| **预期结果** | - 池不枯竭<br/>- 补充速度自动提升至 >= 1000/s |

### 2.2 并发获取

#### TC-TKN-004: 1000 并发同时获取令牌

| **ID** | TC-TKN-004 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. `asyncio.gather(*[pool.acquire() for _ in range(1000)])`<br/>2. 检查所有获取的令牌唯一性 |
| **预期结果** | - 1000 个令牌全部唯一<br/>- 无超时或死锁<br/>- 获取总耗时 < 100ms |

#### TC-TKN-005: 池空时 acquire 等待补充

| **ID** | TC-TKN-005 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **步骤** | 1. 池空<br/>2. 调用 `acquire()` |
| **预期结果** | - 不立即返回<br/>- 等待补充任务生成新令牌<br/>- 超时（5s）后抛出 `TokenPoolExhaustedError` |

### 2.3 性能基准

#### TC-TKN-006: 预生成池吞吐 > 10,000 tokens/s

| **ID** | TC-TKN-006 |
| **层级** | L4 性能 |
| **优先级** | P1 |
| **步骤** | 1. 预填充池<br/>2. 测量 10,000 次 acquire |
| **预期结果** | - 吞吐 > 10,000 tokens/s<br/>- P99 延迟 < 0.5ms |

#### TC-TKN-007: 内存占用——1000 个令牌 < 500KB

| **ID** | TC-TKN-007 |
| **层级** | L1 单元 |
| **优先级** | P2 |
| **步骤** | 1. 填充 1000 个令牌<br/>2. `sys.getsizeof(pool)` |
| **预期结果** | - 内存 < 500KB |

---

## 三、边界与异常测试

### TC-EDGE-001: init_size > capacity
**步骤**：设置 `init_size=2000, capacity=1000`。  
**预期结果**：自动调整为 `init_size=1000`，WARNING 日志。

### TC-EDGE-002: UUID 碰撞概率
**步骤**：生成 100 万个令牌。  
**预期结果**：零碰撞。

### TC-EDGE-003: 补充任务失败后的降级
**步骤**：Mock `uuid.uuid4()` 失败。  
**预期结果**：使用 `os.urandom(16).hex()` 降级方案。

---

## 四、回归测试

### TC-REG-001: 令牌池不影响现有限流逻辑
**步骤**：运行全部限流测试。  
**预期结果**：100% 通过。

---

## 五、需求-测试追溯矩阵

| PRD FR | 测试用例 | 覆盖层级 |
|--------|---------|---------|
| FR-预生成 | TC-TKN-001~003 | L1+L2 |
| FR-并发获取 | TC-TKN-004~005 | L1+L2 |
| FR-性能 | TC-TKN-006~007 | L1+L4 |
| FR-边界 | TC-EDGE-001~003 | L1 |
| FR-回归 | TC-REG-001 | L2 |

## 六、覆盖缺口

| 缺口 | 原因 | 补救计划 |
|------|------|---------|
| 分布式令牌池（多实例） | 单实例实现 | Redis 集成测试中补充 |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/45-需求-令牌预生成优化.md`*