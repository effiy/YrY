---

doc_type: test
title: "YA-09-13: SSE 流式背压控制 — 测试规格"
status: 待开始
priority: P1
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-13"
source_prds: ["17-需求-SSE流式背压控制与缓冲策略"]
source_modules: ["17-prd-task-SSE流式背压控制与缓冲策略"]
source_okr: [yiai-001]

type: test
---

# YA-09-13: SSE 流式背压控制 — 测试规格

> 来源 PRD：[17-需求-SSE流式背压控制与缓冲策略.md](../../prds/2026-09/17-需求-SSE流式背压控制与缓冲策略.md)
> 开发方案：[17-prd-task-SSE流式背压控制与缓冲策略.md](../../devs/2026-09/17-prd-task-SSE流式背压控制与缓冲策略.md)
> 需求编号：YA-09-13 · 优先级：P1

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖 BackpressureStreamingResponse 替换、Queue 背压、生成器异常处理、超时控制、慢客户端不 OOM。

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元测试 | Queue 背压逻辑、生成器包装 | pytest + asyncio | Queue put/get 背压、生成器异常传播、超时触发 |
| L2 集成测试 | 真实 SSE 连接 | pytest-asyncio + httpx | chat_stream/rag_chat_stream/agent_chat_stream 替换 |
| L4 压力测试 | 并发 + 内存监控 | pytest + memory_profiler | 100 并发 30min 无 OOM、慢客户端内存稳定 |

### 1.2 BackpressureStreamingResponse 架构

```
LLM 生成器（生产者）
  → asyncio.Queue(max_buffer=64)  ← 有限缓冲，背压点
  → SSE 消费者（网络发送）
  → 客户端接收

chunk_timeout: 30s  → 生成器单帧超时
client_timeout: 300s → 消费者无读取超时
```

---

<a id="sec-fixtures"></a>
## 二、测试数据与 Fixtures

```python
import pytest
import asyncio
from unittest.mock import AsyncMock

@pytest.fixture
def backpressure_config():
    """背压控制配置。"""
    return {
        "max_buffer": 64,
        "chunk_timeout": 30,     # 单帧超时 30s
        "client_timeout": 300,   # 客户端超时 300s
        "enabled": True,
    }

@pytest.fixture
async def fast_generator():
    """快速生成器——50ms/帧。"""
    async def gen():
        for i in range(10):
            await asyncio.sleep(0.05)
            yield f"data: chunk_{i}\n\n"
    return gen()

@pytest.fixture
async def slow_generator():
    """慢速生成器——200ms/帧。"""
    async def gen():
        for i in range(10):
            await asyncio.sleep(0.2)
            yield f"data: chunk_{i}\n\n"
    return gen()

@pytest.fixture
async def error_generator():
    """会抛异常的生成器。"""
    async def gen():
        for i in range(5):
            yield f"data: chunk_{i}\n\n"
            if i == 2:
                raise RuntimeError("模拟生成器异常")
    return gen()

@pytest.fixture
async def never_ending_generator():
    """永不结束的生成器——用于超时测试。"""
    async def gen():
        while True:
            await asyncio.sleep(60)  # 永远不会在 30s 内完成一帧
            yield "data: slow\n\n"
    return gen()

@pytest.fixture
async def fast_consumer():
    """快速消费者——处理速度 > 生成速度。"""
    async def consume(queue):
        frames = []
        while True:
            frame = await queue.get()
            if frame is None:
                break
            frames.append(frame)
            queue.task_done()
        return frames
    return consume

@pytest.fixture
async def slow_consumer():
    """慢速消费者——模拟慢客户端。"""
    async def consume(queue):
        frames = []
        while True:
            frame = await queue.get()
            if frame is None:
                break
            frames.append(frame)
            await asyncio.sleep(0.5)  # 500ms 消费一帧
            queue.task_done()
        return frames
    return consume
```

---

<a id="sec-cases"></a>
## 三、详细测试用例

### 3.1 Queue 基本行为（L1 单元测试）

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-BP-01 | Queue 正常写入消费 | Queue(maxsize=64) | 1. 生成器写入 5 帧<br>2. 消费者正常读取 | 5 帧全部正确传递，Queue 最终空 | P0 |
| TC-BP-02 | Queue 满时背压触发 | max_buffer=2，生成器写 5 帧 | 1. 消费者慢速读取<br>2. 第 3 帧 `put()` 阻塞 | 第 3 帧阻塞直到消费者读取一帧释放空间 | P0 |
| TC-BP-03 | 生成器正常结束 | 生成器 yield 5 帧后结束 | 1. 消费者读取<br>2. 检查结束信号 | 消费者收到 5 帧 + None 结束信号 | P0 |
| TC-BP-04 | 生成器异常传播 | 第 3 帧抛 RuntimeError | 1. 生成器异常<br>2. 检查消费者行为 | 消费者收到前 2 帧 + None 结束信号，日志记录异常 | P0 |
| TC-BP-05 | chunk_timeout 30s 触发 | 生成器单帧耗时 > 30s | 1. never_ending_generator<br>2. 检查超时行为 | asyncio.TimeoutError → 日志记录 → 流结束，发送 error 帧 | P0 |
| TC-BP-06 | client_timeout 300s 触发 | 消费者 300s 内未读取新帧 | 1. 消费者暂停读取<br>2. 达到 300s | asyncio.TimeoutError → 生产者 task 被 cancel | P1 |

### 3.2 集成测试——现有 SSE 端点

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-BP-07 | chat_stream 使用背压 | 正常对话请求 | 1. 发送 chat SSE 请求<br>2. 检查流式响应 | SSE 流正常返回，格式不变 | P0 |
| TC-BP-08 | rag_chat_stream 使用背压 | RAG 查询 + 流式 | 1. 发送 RAG 流式请求<br>2. 检查检索结果嵌入 | 检索结果正确嵌入流式回答 | P0 |
| TC-BP-09 | agent_chat_stream 使用背压 | Agent 工具调用 + 流式 | 1. Agent 调用工具<br>2. 检查工具调用结果 | 工具调用结果正确嵌入流式输出 | P0 |
| TC-BP-10 | 慢客户端不导致 OOM | 客户端 500ms 消费一帧 | 1. 服务端 50ms 生成一帧<br>2. 监控内存 30min | 内存稳定在基线 ± 10%，无持续增长 | P1 |
| TC-BP-11 | 客户端断开后生成器停止 | 流式进行中客户端关闭连接 | 1. 客户端断连<br>2. 检查生成器状态 | 3s 内生成器 task 被 cancel，资源释放 | P0 |

### 3.3 压力测试

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-BP-12 | 10 并发 SSE 正常 | 10 个 SSE 连接 | 1. 同时建立 10 个 SSE 连接<br>2. 监控内存 | 无异常，内存 < 100MB | P1 |
| TC-BP-13 | 5 慢客户端并发 | 5 连接各 500ms/frame | 1. 5 个慢客户端<br>2. 运行 10min | 无 OOM，内存 < 200MB | P1 |
| TC-BP-14 | 50 混合并发 | 10 慢 + 40 正常 | 1. 混合负载<br>2. 运行 10min | 内存 < 512MB | P2 |
| TC-BP-15 | 100 极限并发 | 100 连接 | 1. 100 并发 SSE<br>2. 运行 5min | 内存 < 1GB，无连接丢失 | P2 |

---

<a id="sec-edge"></a>
## 四、边界与异常测试

| ID | 用例名称 | 输入/场景 | 预期行为 | 优先级 |
|----|---------|---------|---------|--------|
| EG-BP-01 | max_buffer=1 背压 | 极端小缓冲 | 每帧都阻塞直到消费，功能正常 | P2 |
| EG-BP-02 | 配置禁用背压 | enabled=false | 回退到原始 StreamingResponse 行为 | P1 |
| EG-BP-03 | config.yaml 开关热切换 | 运行中修改 enabled | 新连接使用新配置，已有连接不变 | P2 |
| EG-BP-04 | 零帧生成器 | 生成器 yield 0 帧 | 立即发送 None 结束信号 | P2 |

---

<a id="sec-regression"></a>
## 五、回归测试

| ID | 回归场景 | 触发条件 | 验证目标 | 优先级 |
|----|---------|---------|---------|--------|
| RG-BP-01 | 现有 76 个 pytest 全部通过 | BackpressureStreamingResponse 替换后 | 零回归失败 | P0 |
| RG-BP-02 | Prometheus 指标正确暴露 | 启用后 | connections_active/buffer_utilization/disconnects/timeouts | P1 |

---

<a id="sec-traceability"></a>
## 六、可追溯性矩阵

| PRD 功能需求 | 对应测试用例 | 覆盖率 |
|-------------|------------|--------|
| FR1: BackpressureStreamingResponse | TC-BP-01 ~ TC-BP-06 | 基本/背压/结束/异常/超时 |
| FR2: 现有 SSE 端点替换 | TC-BP-07 ~ TC-BP-09 | chat/rag/agent |
| FR3: 慢客户端内存保护 | TC-BP-10, TC-BP-13 | 不 OOM |
| FR4: 客户端断开资源释放 | TC-BP-11 | 3s 内释放 |
| FR5: 并发压力 | TC-BP-12 ~ TC-BP-15 | 10/5-slow/50-mix/100-extreme |
| FR6: Prometheus 指标 | RG-BP-02 | 4 个核心指标 |

---

<a id="sec-gaps"></a>
## 七、覆盖缺口

| 缺口 | 影响 | 建议 |
|------|------|------|
| 网络层 TCP 背压 | asyncio.Queue 背压之上还有 TCP 发送缓冲背压 | 添加 TCP 缓冲满时的行为测试 |
| 不同 LLM 模型输出速率 | 不同模型 token 生成速率差异 | 添加 qwen2.5:0.5b vs 7b 的速率差异背压测试 |
| 代理/负载均衡器缓冲 | Nginx 反向代理可能自带缓冲层 | 添加 Nginx 代理场景下的 SSE 背压测试 |
| 生产环境监控告警 | Prometheus 指标 → AlertManager 链路 | 添加告警规则触发端到端测试 |