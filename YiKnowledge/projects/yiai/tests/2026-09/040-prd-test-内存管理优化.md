---

doc_type: test
title: "YA-09-36: 服务内存管理策略 — Python 对象池与循环引用 GC 优化 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-36"
source_prds: ["40-需求-内存管理优化"]
source_modules: []
source_okr: [yiai-001]

type: test
---

# YA-09-36: 服务内存管理策略 — 测试规格

> **文档职责**：本文档定义内存管理优化的**怎么验证**（VERIFY），覆盖对象池复用、循环引用检测、GC 调优和内存泄漏监控。

> 来源 PRD：[40-需求-内存管理优化.md](../../prds/2026-09/40-需求-内存管理优化.md)

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元 | ObjectPool 实现、weakref 机制、GC 配置 | pytest | 对象获取/归还、池大小控制、循环引用检测 |
| L2 集成 | 真实请求内存使用测量 | pytest + psutil / tracemalloc | 内存增长的稳定性、GC 触发频率 |
| L4 性能基准 | 内存基线测量 | memory_profiler | RSS 增长 < 10MB/1000 请求 |

### 1.2 测试数据

```python
# tests/memory/conftest.py

import tracemalloc
import gc
import weakref
import psutil
import os
import pytest

@pytest.fixture(autouse=True)
def enable_tracemalloc():
    """启用 tracemalloc 进行内存追踪。"""
    tracemalloc.start()
    yield
    tracemalloc.stop()

@pytest.fixture
def object_pool():
    """返回一个简单的对象池（嵌入向量缓存）。"""
    class ObjectPool:
        def __init__(self, factory, max_size=100):
            self._factory = factory
            self._max_size = max_size
            self._pool = []
            self._created = 0

        def acquire(self):
            if self._pool:
                return self._pool.pop()
            self._created += 1
            return self._factory()

        def release(self, obj):
            if len(self._pool) < self._max_size:
                self._pool.append(obj)

        @property
        def pool_size(self):
            return len(self._pool)

    return ObjectPool(lambda: [0.0]*768, max_size=50)

@pytest.fixture
def process_memory():
    """获取当前进程内存使用。"""
    process = psutil.Process(os.getpid())
    return process.memory_info().rss / (1024 * 1024)  # MB
```

---

<a id="sec-test-cases"></a>
## 二、测试用例

### 2.1 对象池

---

#### TC-MEM-001: 对象池 acquire 复用已有对象

| 字段 | 内容 |
|------|------|
| **ID** | TC-MEM-001 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | `object_pool` fixture |
| **步骤** | 1. 首次 acquire: 创建对象 A<br/>2. release 对象 A<br/>3. 再次 acquire |
| **预期结果** | - 第二次返回对象 A（`id()` 相同）<br/>- `pool_size` 从 1 变为 0<br/>- `_created` 计数为 1<br/>- 无新对象创建 |

---

#### TC-MEM-002: 池满时 release 丢弃对象

| 字段 | 内容 |
|------|------|
| **ID** | TC-MEM-002 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **前提** | 池已满（max_size=50） |
| **步骤** | 1. acquire 50 个对象并全部 release（池满）<br/>2. 再次 acquire 1 个<br/>3. 再次 release<br/>4. 检查池大小 |
| **预期结果** | - 池大小始终 ≤ 50<br/>- 第 51 个 release 的对象被丢弃<br/>- 日志 DEBUG: "Pool full, discarding object" |

---

#### TC-MEM-003: 对象池线程安全（asyncio 并发）

| 字段 | 内容 |
|------|------|
| **ID** | TC-MEM-003 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | 使用 `asyncio.Lock` 保护池操作 |
| **步骤** | 1. 10 个协程并发 acquire + release<br/>2. 验证池不损坏 |
| **预期结果** | - 无 `IndexError` 或 `pop from empty list`<br/>- 池大小无负值<br/>- 总创建数 = 初始未池化时的创建数 |

---

### 2.2 循环引用与 GC

---

#### TC-MEM-004: 循环引用检测——weakref 避免内存泄漏

| 字段 | 内容 |
|------|------|
| **ID** | TC-MEM-004 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | Service 类使用 `weakref.WeakValueDictionary` 管理 session 引用 |
| **步骤** | 1. 创建 100 个 ChatSession<br/>2. 删除所有局部引用<br/>3. `gc.collect()` 后检查 `WeakValueDictionary` |
| **预期结果** | - `WeakValueDictionary` 为空（所有 session 被回收）<br/>- 无循环引用导致的泄漏 |

---

#### TC-MEM-005: GC 频率调优——第 3 代 GC 阈值提高

| 字段 | 内容 |
|------|------|
| **ID** | TC-MEM-005 |
| **层级** | L1 单元 |
| **优先级** | P2 |
| **前提** | `gc.set_threshold(700, 10, 10)` |
| **步骤** | 1. 设置 GC 阈值<br/>2. 运行 1000 次请求<br/>3. 检查 GC stats |
| **预期结果** | - 第 3 代 GC 触发次数 < 10<br/>- GC 暂停总时间 < 100ms |

---

### 2.3 内存监控

---

#### TC-MEM-006: 请求前后内存增长 < 1MB

| 字段 | 内容 |
|------|------|
| **ID** | TC-MEM-006 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | 测量基线内存 |
| **步骤** | 1. 记录 RPC 请求前内存<br/>2. 发送 1 次 RAG 查询<br/>3. 记录请求后内存<br/>4. 计算差值 |
| **预期结果** | - 单次请求内存增长 < 1MB<br/>- 请求完成后内存回落至基线 |

---

#### TC-MEM-007: 1000 次请求后无持续增长

| 字段 | 内容 |
|------|------|
| **ID** | TC-MEM-007 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | 持续发送请求 |
| **步骤** | 1. 记录基线 RSS<br/>2. 发送 1000 次 RPC 请求<br/>3. `gc.collect()` 后测量 RSS<br/>4. 计算差值 |
| **预期结果** | - RSS 增长 < 10MB<br/>- 无 OOM 风险<br/>- 内存拐点不明显 |

---

#### TC-MEM-008: tracemalloc Top 10 持续分配

| 字段 | 内容 |
|------|------|
| **ID** | TC-MEM-008 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **前提** | `tracemalloc` 已启用 |
| **步骤** | 1. 运行 100 次 RAG 查询<br/>2. 获取 `tracemalloc.take_snapshot()`<br/>3. Top 10 按 `statistics('lineno')` 排序 |
| **预期结果** | - Top 分配函数明确<br/>- 无意外的大量分配<br/>- MongoDB BSON 编解码和 JSON 序列化是主要来源 |

---

<a id="sec-edge-cases"></a>
## 三、边界与异常测试

### TC-EDGE-001: 池大小 = 0 时每次创建新对象

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-001 |
| **层级** | L1 单元 |
| **优先级** | P2 |
| **步骤** | 1. 创建 `max_size=0` 的对象池<br/>2. acquire -> release -> acquire |
| **预期结果** | - 每次 acquire 创建新对象<br/>- release 直接丢弃<br/>- 池始终为空 |

### TC-EDGE-002: 大并发下 GC 暂停影响

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-002 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 发送 500 并发请求<br/>2. 测量 GC 暂停总时间 |
| **预期结果** | - GC 暂停 < 50ms<br/>- 不影响 P99 延迟 |

### TC-EDGE-003: 内存警告阈值触发

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-003 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 设置内存阈值 `memory.warning_mb=500`<br/>2. 使 RSS 超过 500MB |
| **预期结果** | - WARNING 日志: "Memory usage exceeded 500MB"<br/>- 不中断服务<br/>- 触发预 GC |

---

<a id="sec-regression"></a>
## 四、回归测试

### TC-REG-001: 对象池引入后功能无退化

| 字段 | 内容 |
|------|------|
| **ID** | TC-REG-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. 运行全部现有测试<br/>2. 验证嵌入向量缓存不影响 RAG 结果 |
| **预期结果** | - 100% 测试通过<br/>- RAG 查询结果一致 |

### TC-REG-002: 内存基线回归检测

| 字段 | 内容 |
|------|------|
| **ID** | TC-REG-002 |
| **层级** | L4 性能 |
| **优先级** | P1 |
| **步骤** | 1. 记录当前 RSS 基线<br/>2. PR 后对比 |
| **预期结果** | - RSS 增长 > 20% 告警<br/>- RSS 增长 > 50% 失败 |

---

<a id="sec-traceability"></a>
## 五、需求-测试追溯矩阵

| PRD FR | 模块 | 测试用例 | 覆盖层级 |
|--------|------|---------|---------|
| FR-对象池 | ObjectPool | TC-MEM-001~003 | L1 |
| FR-循环引用 | weakref + GC | TC-MEM-004~005 | L1 |
| FR-内存监控 | tracemalloc/psutil | TC-MEM-006~008 | L2 |
| FR-边界 | 异常处理 | TC-EDGE-001~003 | L1+L2 |
| FR-回归 | 全模块 | TC-REG-001~002 | L2+L4 |

---

<a id="sec-coverage"></a>
## 六、覆盖缺口

| 缺口 | 原因 | 补救计划 |
|------|------|---------|
| 生产内存趋势分析 | 需要长时间运行 | soak test（24h）补充 |
| C 扩展内存泄漏（numpy/llama_index） | tracemalloc 不追踪 C 扩展 | valgrind / memray 补充 |
| 容器内存限制 OOM | 需 Docker/K8s 环境 | 在容器化测试中补充 |

---

<a id="sec-references"></a>
## 七、参考文档

| 资源 | 路径 |
|------|------|
| 源 PRD | [40-需求-内存管理优化.md](../../prds/2026-09/40-需求-内存管理优化.md) |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/40-需求-内存管理优化.md`*