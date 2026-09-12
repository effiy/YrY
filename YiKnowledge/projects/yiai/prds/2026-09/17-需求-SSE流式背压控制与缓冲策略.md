---
title: "YA-09-13: SSE 流式传输背压控制与缓冲策略 — 生产环境可靠性增强"
tags: [需求文档, SSE, 流式传输, 背压, 缓冲, 可靠性, 后端]
category: 项目/管理后台/需求
created: 2026-09-09
updated: 2026-09-10
source: 内部
type: 需求
status: 需求已编写
priority: P2
project: YiAi
project_id: yiai
owner: 陈铭
prd_month: "202609"
prd_task_id: YA-09-13
estimate_backend: 1.5
review_status: 待评审
issue_type: 架构
roles: [engineer]
---

# YA-09-13: SSE 流式传输背压控制与缓冲策略 — 生产环境可靠性增强

> 需求编号：YA-09-13 · 优先级：P2 · 人天：1.5d · 状态：需求已编写
> 依赖：YA-09-03（Agent 可靠性）

## 背景

YiAi 通过 SSE (Server-Sent Events) 向 YiVad/YiPet 流式传输 AI 聊天和 Agent 执行过程。当前实现直接将 LLM token 逐字写入 SSE 通道，存在三个可靠性缺口：

| 问题 | 影响 |
|------|------|
| **无背压控制** — LLM 生成速度 > 网络发送速度时，缓冲区膨胀 | 内存增长、OOM 风险（长 Agent 循环） |
| **无缓冲策略** — 每个 token 独立发送（每次 1-3 字节 payload） | 网络包碎片化——TCP 效率低 |
| **断连数据丢失** — 客户端断连后，SSE 通道中未发送的 token 丢失 | 需要重新生成完整响应 |

---

## 一、现状分析

### 1.1 当前 SSE 发送路径

```python
# 当前实现——每个 token 立即发送
async for token in llm.stream_chat(messages):
    yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"
    # 问题 1: 无缓冲——1 个 token ≈ 10 bytes payload + 50 bytes HTTP 头部
    # 问题 2: 无背压——socket 发送缓冲区满时不感知
```

### 1.2 Token 生成速度 vs 网络发送速度

| 场景 | LLM 生成速度 | 典型网络带宽 | 缓冲区风险 |
|------|-------------|-------------|-----------|
| 本地 Ollama (qwen3:4b CPU) | ~15 tokens/s | localhost (无限) | 低 |
| 本地 Ollama (qwen3:14b GPU) | ~40 tokens/s | localhost | 低 |
| 云端 API (gpt-4o-mini) | ~80 tokens/s | ~1-5 MB/s | 低 |
| **Agent 循环 (工具调用 + LLM)** | **爆发式**: 工具输出 10KB → SSE 瞬间写入 | 远程客户端 (< 1MB/s) | **高** |

**风险场景**：Agent 执行 `search_knowledge` 后瞬间向 SSE 写入 10KB 搜索结果 + 后续 LLM 推理——缓冲区积压。

---

## 二、设计决策

### 决策 1：缓冲策略 — 无缓冲 vs 固定时间 vs 固定大小 vs 混合

| 选项 | 延迟 | 吞吐 | TCP 效率 |
|------|------|------|----------|
| 无缓冲 (当前) | 最低 (每 token) | 低（包碎片化） | 差 |
| 固定时间 (50ms 刷新) | +50ms | 中 | 中 |
| 固定大小 (512 bytes) | 不定 | 高 | 好 |
| **混合（50ms 或 256 bytes，先到为准）** | ≤ 50ms | 高 | 好 |

**选择：混合缓冲。** 256 bytes 或 50ms 间隔，先到先刷新。用户感知延迟 ≤ 50ms（人类感知阈值），TCP 包效率提升。

### 决策 2：背压检测 — socket 缓冲区监控 vs 应用层队列

**选择：应用层队列 + 高水位线。** 维护 `asyncio.Queue(maxsize=100)`，队列满时暂停 LLM 迭代（`await` 背压传播）。

### 决策 3：断连数据恢复 — 无 vs 重新生成 vs 缓存

**选择：缓存最近 10 条 SSE 帧 + `Last-Event-ID` 重连恢复。** YP-09-03 已有 SSE 断点续传，只需扩展缓存到最近 N 帧。

---

## 三、目标架构

### 3.1 带背压控制的 SSE 缓冲发送器

```python
# YiAi/src/shared/sse_buffer.py

import asyncio
import json
import time
from dataclasses import dataclass, field

@dataclass
class SseBufferConfig:
    flush_interval_ms: int = 50      # 最大缓冲时间
    flush_size_bytes: int = 256      # 最大缓冲字节
    high_watermark: int = 100        # 队列高水位线
    recent_frame_cache: int = 10     # 断连恢复缓存帧数

class BufferedSseEmitter:
    """带背压控制和缓冲的 SSE 发送器。"""

    def __init__(self, config: SseBufferConfig = SseBufferConfig()):
        self.config = config
        self._buffer: list[str] = []
        self._buffer_size = 0
        self._last_flush = time.monotonic()
        self._queue: asyncio.Queue[str | None] = asyncio.Queue(
            maxsize=config.high_watermark
        )
        self._recent_frames: list[str] = []    # 断连恢复缓存
        self._drain_task: asyncio.Task | None = None

    async def send(self, event_type: str, data: dict) -> None:
        """发送 SSE 事件——自动缓冲和背压控制。"""
        frame = f"data: {json.dumps({'type': event_type, **data})}\n\n"
        await self._queue.put(frame)  # 队列满时自动 await（背压传播到 LLM 迭代）

    async def start_draining(self, response):
        """开始消费队列→写入 HTTP 响应。"""
        self._drain_task = asyncio.create_task(self._drain(response))

    async def _drain(self, response):
        """后台任务——从队列取帧→缓冲→批量写入。"""
        while True:
            try:
                # 从队列取帧（带超时——确保定时刷新）
                frame = await asyncio.wait_for(
                    self._queue.get(), timeout=0.05  # 50ms
                )

                if frame is None:  # 结束信号
                    await self._flush(response)
                    break

                self._buffer.append(frame)
                self._buffer_size += len(frame)

                # 缓存最近帧（断连恢复）
                self._recent_frames.append(frame)
                if len(self._recent_frames) > self.config.recent_frame_cache:
                    self._recent_frames.pop(0)

                # 达到大小阈值 → 立即刷新
                if self._buffer_size >= self.config.flush_size_bytes:
                    await self._flush(response)

            except asyncio.TimeoutError:
                # 50ms 无新帧 → 超时刷新
                if self._buffer:
                    await self._flush(response)

    async def _flush(self, response):
        """批量写入缓冲区到 HTTP 响应。"""
        if not self._buffer:
            return

        batch = ''.join(self._buffer)
        await response.write(batch.encode())
        # await response.drain()  # 可选——启用 TCP 背压传播

        self._buffer.clear()
        self._buffer_size = 0
        self._last_flush = time.monotonic()

    async def close(self):
        """关闭 SSE 流。"""
        await self._queue.put(None)  # 发送结束信号
        if self._drain_task:
            await self._drain_task

    def get_recent_frames(self, last_event_id: str | None) -> list[str]:
        """断连恢复——返回 Last-Event-ID 之后的帧。"""
        if not last_event_id:
            return list(self._recent_frames)

        # 查找 last_event_id 之后的帧
        for i, frame in enumerate(self._recent_frames):
            if last_event_id in frame:
                return self._recent_frames[i + 1:]
        return list(self._recent_frames)  # 未找到——返回全部缓存
```

### 3.2 集成到 Chat Service

```python
# YiAi/src/services/ai/chat_service.py

from shared.sse_buffer import BufferedSseEmitter, SseBufferConfig

async def stream_chat(messages: list[dict], model: str = "qwen3:14b"):
    """流式聊天——带缓冲和背压控制。"""
    emitter = BufferedSseEmitter(SseBufferConfig(
        flush_interval_ms=50,
        flush_size_bytes=256,
    ))

    async def generate():
        await emitter.start_draining(response)

        try:
            async for token in llm.stream_chat(messages, model=model):
                await emitter.send("token", {"content": token})
                # 注意: emitter.send 内部 await queue.put()
                # 队列满时自动阻塞 → 背压传播到 LLM 迭代

            await emitter.send("done", {})
        except asyncio.CancelledError:
            # 客户端断连
            await emitter.send("error", {
                "code": "CLIENT_DISCONNECTED",
                "message": "客户端已断开连接",
            })
        finally:
            await emitter.close()

    return StreamingHttpResponse(generate(), media_type="text/event-stream")
```

---

## 四、性能分析

| 指标 | 无缓冲 (当前) | 混合缓冲 (优化后) | 改善 |
|------|-------------|-----------------|------|
| 网络包数 (500 tokens 响应) | ~500 个 | ~20 个 | **25× 减少** |
| 内存占用 (缓冲区) | 0 | < 1KB | — |
| 用户感知延迟 | 0ms (即时) | ≤ 50ms | 可忽略 |
| 背压内存保护 | 无 | Queue(maxsize=100) | 从 OOM 风险到有界 |

---

## 五、测试规格

#### Scenario: 缓冲区达到大小阈值自动刷新
- **Given** `flush_size_bytes=256`, 当前 buffer 有 200 bytes
- **When** 新帧 80 bytes 加入 buffer → 总计 280 > 256
- **Then** 立即刷新缓冲区

#### Scenario: 50ms 超时自动刷新
- **Given** buffer 中有 100 bytes（未达到 256 阈值），距上次刷新 55ms
- **When** `_drain()` 中 `asyncio.wait_for` 超时
- **Then** 刷新缓冲区

#### Scenario: 队列满——背压传播
- **Given** `high_watermark=100`, 队列已有 100 帧
- **When** `send("token", {...})` 被调用
- **Then** `queue.put()` 阻塞 → LLM 迭代暂停（背压传播）

#### Scenario: 断连恢复——返回最近帧缓存
- **Given** `recent_frame_cache=10`, 已发送 15 帧
- **When** `get_recent_frames(last_event_id="frame_8")`
- **Then** 返回 "frame_8" 之后的帧

#### Scenario: 客户端断连——发送错误帧后关闭
- **Given** SSE 流正在进行, 客户端断开
- **When** `asyncio.CancelledError` 被捕获
- **Then** 发送 `{type: "error", code: "CLIENT_DISCONNECTED"}` 帧
- **And** emitter.close() 被调用

---

## 六、代码审查检查清单

- [ ] `BufferedSseEmitter` 使用 `asyncio.Queue` 而非无界列表
- [ ] 队列 `maxsize=high_watermark` 防止内存溢出
- [ ] 缓冲刷新策略：大小阈值 256 bytes 或时间阈值 50ms
- [ ] `_drain()` 正确处理 `asyncio.TimeoutError`（正常超时刷新）
- [ ] `close()` 发送 None 结束信号并 await drain_task
- [ ] 最近帧缓存保留最近 N 帧（支持断连恢复）
- [ ] Agent 工具输出（大 payload）也经过缓冲器

---

## 七、风险与缓解

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| 50ms 缓冲增加用户感知延迟 | 低 | 低 | 50ms < 人类感知阈值 (100ms) |
| 队列水线设置过低导致频繁背压 | 低 | 中 | `high_watermark=100` ≈ 5s LLM 输出 |
| `_drain_task` 异常退出未被感知 | 低 | 高 | `add_done_callback` 记录异常日志 |

---

*PRD 来源: `projects/yiai/requirements/2026-09/13-需求-SSE背压控制.md`*

## 影响范围

- **影响模块**：待补充
- **涉及文件**：
- 待补充
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 在相关函数中添加参数校验和边界检查 |
| 测试 | 添加对应的自动化测试用例 |
| 流程 | 代码审查时重点检查此类模式 |
| 监控 | 添加日志告警，异常发生时及时发现 |
| 文档 | 在编码规范中记录此类反模式 |

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
