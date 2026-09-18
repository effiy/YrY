---
doc_type: module
prd_task_id: "YA-09-13"
title: "YA-09-13: SSE 流式背压控制 — 生产环境可靠性增强 — 开发方案"
status: 需求已编写
priority: P1
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 2.0
source_prd: "17-需求-SSE流式背压控制与缓冲策略.md"
source_okr: [yiai-001]
related_tests: ["17-prd-test-SSE流式背压控制与缓冲策略"]
---

# YA-09-13: SSE 流式背压控制 — 生产环境可靠性增强 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[17-需求-SSE流式背压控制与缓冲策略.md](../../prds/2026-09/17-需求-SSE流式背压控制与缓冲策略.md)
> 需求编号：YA-09-13 · 优先级：P1 · 人天：2.0d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、问题

SSE 流式响应中，客户端消费速度低于服务端生成速度时，ASGI 发送队列积压导致内存增长。当前 `StreamingResponse` 无背压机制。

---

<a id="sec-2"></a>
## 二、方案

```python
class BackpressureStreamingResponse(StreamingResponse):
    def __init__(self, generator, max_buffer: int = 100):
        self._buffer = asyncio.Queue(maxsize=max_buffer)
        self._generator = generator

    async def _produce(self):
        async for chunk in self._generator:
            await self._buffer.put(chunk)  # 队列满时阻塞
        await self._buffer.put(None)       # 结束信号
```

### 策略

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `max_buffer` | 100 | 最大缓冲帧数 |
| `chunk_timeout` | 30s | 单帧超时 |
| `client_timeout` | 300s | 客户端总超时 |

---

<a id="sec-3"></a>
## 三、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | `asyncio.Queue` 背压实现 | 慢客户端不导致 OOM | 1.0 |
| 2 | 超时 + 客户端断开检测 | 客户端断开后生成器停止 | 0.5 |
| 3 | 集成到 chat/rag 流式端点 + 测试 | 流式响应稳定 | 0.5 |

**合计：2.0d**。

---

<a id="sec-4"></a>
## 四、关联模块

- 集成：[YA-07-04 AI 聊天服务](../2026-07/04-prd-task-AI聊天服务.md)

---

## 五、已知缺口与技术债

| # | 技术债 | 优先级 | 说明 | 状态 |
|---|--------|--------|------|------|
| 1 | Queue 大小硬编码 1000 | P3 | 高并发时可能满 | 待配置化 |
| 2 | 背压无客户端反压信号 | P3 | 无法通知 LLM 减速生成 | 待实施 |
- 集成：[YA-07-01 混合检索引擎](../2026-07/01-prd-task-混合检索引擎.md)