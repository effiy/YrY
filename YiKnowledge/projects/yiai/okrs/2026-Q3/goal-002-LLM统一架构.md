---
type: okr-goal
id: yiai-002
title: "Multi-Provider LLM 统一架构"
status: completed
period: "2026 Q3"
owner: 陈铭
project: YiAi
project_id: yiai
progress: 95
updated: 2026-09-23
kr1: "ModelRuntime 抽象层 — 统一流式接口 astream()/astream_events()/aembed()，三模式覆盖 chat/completion/embedding"
kr1_completion: 100
kr2: "OpenAI 兼容 API — `/v1/chat/completions` 端点 + base_url/api_key 多客户端适配，第三方 SDK 零改动接入"
kr2_completion: 95
kr3: "LLM 并发调度 — 多模型加权轮询 + 三队列优先级 + 自适应速率限制，P99 延迟 <30s"
kr3_completion: 90
kr4: "Provider 热切换 — 运行时无重启切换 LLM Provider + 配置驱动的模型注册，新增 Provider 0.5 天"
kr4_completion: 85
metric1_id: "yiai-m04"
metric1_desc: "支持的 LLM Provider 数"
metric1_current: "4 (Ollama/DeepSeek/OpenAI/Anthropic)"
metric1_target: "≥6"
metric2_id: "yiai-m05"
metric2_desc: "Provider 切换延迟"
metric2_current: "<2s (SIGHUP 热加载)"
metric2_target: "<3s"
metric3_id: "yiai-m06"
metric3_desc: "新增 Provider 接入成本"
metric3_current: "0.5天"
metric3_target: "<1天"
metric4_id: "yiai-m07"
metric4_desc: "LLM 调用延迟 P99"
metric4_current: "<28s"
metric4_target: "<30s"
related_prds:
  - projects/yiai/prds/2026-08/02-需求-Multi-Provider-LLM.md
  - projects/yiai/prds/2026-08/14-需求-ModelRuntime抽象层.md
  - projects/yiai/prds/2026-08/09-需求-OpenAI兼容API.md
  - projects/yiai/prds/2026-09/15-需求-ModelRuntime抽象层性能基准.md
  - projects/yiai/prds/2026-09/189-需求-多模型路由与fallback.md
  - projects/yiai/prds/2026-09/215-需求-模型热切换.md
---

# Multi-Provider LLM 统一架构

> Q3 架构目标。建立统一的 LLM Provider 抽象层，使 Ollama、DeepSeek、OpenAI、Anthropic 等多厂商模型支持即插即用的流式切换。**核心抽象层已交付，OpenAI 兼容端点在位，4 个 Provider 就绪，新增 Provider 仅需 0.5 天。**

---

## 背景

YiAi 最初仅支持 Ollama 自托管推理。随着模型生态发展，需要接入 DeepSeek API、OpenAI 兼容 API、Anthropic Claude 等多种外部 LLM 服务。直接为每个 Provider 写适配代码会产生三个结构性问题：

**代码重复**：每个 Provider 需要独立的流式处理——SSE 解析、token 累积、中断处理、错误重试。Ollama 的 `async for line in response.content`、OpenAI 的 `async for chunk in stream`、Anthropic 的 `async for event in sse_events`——三者是同一种模式（"从 HTTP 流中逐块读取并标准化为内部事件"）的三种不同实现。没有抽象层时，代码重复率 >60%。

**接口分裂**：不同 Provider 的调用接口、请求格式、响应结构各不相同——Ollama 用 REST `/api/chat`（纯 JSON 请求/响应）、OpenAI 用 `/v1/chat/completions`（SSE 流式）、Anthropic 用 Messages API（SSE events with `data:` prefix）。上层 Agent 循环和 Chat Service 需要感知 Provider 差异，`if provider == "ollama": ... elif provider == "openai": ...` 的分支散落在 5+ 个文件中。

**运维耦合**：切换模型需要修改代码（`runtime = OllamaRuntime()` → `runtime = OpenAIRuntime()`）并重启服务。无法运行时热切换或按模型特性动态路由。Q2 期间一次 Ollama 服务不可用导致整站聊天功能中断 2 小时——如果有 Provider fallback 机制，完全可以自动切换到 DeepSeek。

Q3 建立 ModelRuntime 抽象层，将三个问题收敛为统一接口 + 配置驱动的 Provider 管理。核心设计原则：**上层不感知 Provider，Provider 不感知上层**。

---

## 季度演进

### 八月 — 架构设计与核心实现

完成了 ModelRuntime 抽象层的接口设计、Ollama 和 OpenAI 两个 Provider 的核心实现，以及 Provider 注册表机制。

**关键设计决策**：

| 决策 | 选项 A | 选项 B | 选择 | 理由 |
|------|--------|--------|------|------|
| 接口风格 | `generate()` / `agenerate()`（langchain 风格） | `astream()` / `astream_events()`（Pi 风格） | **Pi 风格** | `astream_events` 支持 token 级事件回调，与 FastAPI StreamingResponse 天然对齐；langchain 风格的全量返回不适合 SSE 场景 |
| Provider 注册 | 硬编码 if/elif 分支 | 注册表 + 配置驱动 | **注册表** | 新增 Provider 零改动现有调用代码；配置 `providers.xxx.type` 即可激活 |
| 同步/异步 | 双模式（sync + async） | 仅异步 | **仅异步** | FastAPI 全异步生态，sync/async 混用是已知 bug 源；`aembed()` 批量场景通过 `asyncio.gather` 天然并发 |
| StreamingEvent 设计 | 纯文本 chunk | 结构化 StreamEvent（type + data + metadata） | **结构化** | 富事件（token/tool_call/reasoning/error/done）支持 Agent 工具调用注入和流式中断，纯文本无法区分事件类型 |
| 错误处理 | 各 Provider 自行处理 | 统一 ErrorMapper + 按 Provider 映射 | **统一映射** | 上层只处理 `LLMTimeoutError`/`LLMRateLimitError`/`LLMProviderError`，不感知 Provider 原生错误码 |

**Provider 注册表**（`src/services/ai/provider_registry.py`）：
```python
@ProviderRegistry.register("ollama")
class OllamaRuntime(BaseModelRuntime): ...

@ProviderRegistry.register("openai")
class OpenAIRuntime(BaseModelRuntime): ...

# 运行时获取
runtime = ProviderRegistry.get("ollama")(config=config)
```

新增 Provider 只需：实现 `astream()`/`astream_events()`/`aembed()` → 加 `@ProviderRegistry.register("xxx")` → 在 `config.yaml` 中配置。无需改动任何调用方代码。

### 九月 — Provider 扩展与性能基准

在 Ollama/OpenAI 基础上扩展了 DeepSeek（兼容 OpenAI API，仅 `base_url` 不同 — 验证了 OpenAI 兼容模式的可复用性）和 Anthropic（独立实现，Messages API + SSE events 适配）。建立了性能基准和并发调度能力。

**当前 Provider 矩阵**：

| Provider | 实现方式 | 代码量 | 模型示例 | 流式 | Embedding | Vision |
|----------|---------|--------|---------|------|-----------|--------|
| Ollama | 原生 REST `/api/chat` | ~120 行 | qwen2.5:14b | `async for line` | nomic-embed-text | — |
| DeepSeek | OpenAI 兼容（仅改 base_url） | ~20 行配置 | deepseek-chat | 同 OpenAI | — | — |
| OpenAI | `/v1/chat/completions` | ~150 行 | gpt-4o, gpt-4o-mini | `async for chunk` (SSE) | text-embedding-3-small | gpt-4o |
| Anthropic | Messages API | ~180 行 | claude-sonnet-4-6, claude-haiku-4-5 | SSE events (`data:` prefix) | —（独立 Provider） | claude-sonnet-4-6 |

**性能基准**（`src/services/ai/benchmark.py`）：

| 指标 | Ollama (qwen2.5:14b) | DeepSeek (deepseek-chat) | OpenAI (gpt-4o) | Anthropic (claude-sonnet-4-6) |
|------|----------------------|--------------------------|-----------------|------------------------------|
| TTFT (Time to First Token) | 0.8s | 0.3s | 0.4s | 0.5s |
| 吞吐 (tokens/s) | 45 t/s | 80 t/s | 60 t/s | 55 t/s |
| P99 延迟 (100 token 响应) | 2.5s | 1.2s | 1.8s | 2.0s |
| Embedding (1K texts) | 3.2s (nomic-embed-text) | — | 1.5s (text-embedding-3-small) | — |

---

## 关键结果

| KR | 描述 | 完成度 |
|---|------|--------|
| KR1 | ModelRuntime 抽象层 — 统一流式接口 + 注册表 + StreamEvent | 100% |
| KR2 | OpenAI 兼容 API — `/v1/chat/completions` + 多客户端适配 | 95% |
| KR3 | LLM 并发调度 — 加权轮询 + 三队列 + 自适应速率限制 + Fallback | 90% |
| KR4 | Provider 热切换 — SIGHUP 热加载 + Provider 注册表动态更新 | 85% |

---

## KR1 — ModelRuntime 抽象层

### 设计

**代码落地**：`src/services/ai/model_runtime.py`（~280 行）+ `src/services/ai/provider_registry.py`（~60 行）

```python
class StreamEvent(TypedDict, total=False):
    type: Literal["token", "tool_call", "reasoning", "error", "done"]
    data: str | dict  # token 文本 或 tool_call JSON 或 error 详情
    metadata: dict    # provider, model, token_count, finish_reason

class BaseModelRuntime(ABC):
    @abstractmethod
    async def astream(self, messages: list[Message], **kwargs) -> AsyncIterator[StreamEvent]:
        """流式 chat/completion，yield token 级 StreamEvent"""
    
    @abstractmethod
    async def astream_events(self, messages: list[Message], **kwargs) -> AsyncIterator[StreamEvent]:
        """增强流式 — 除 token 外还 yield tool_call、reasoning、error 等富事件"""
    
    @abstractmethod
    async def aembed(self, texts: list[str], **kwargs) -> list[list[float]]:
        """批量 Embedding，返回 List[Vector]"""
```

三个方法覆盖 chat/completion/embedding 全场景。`StreamEvent` 统一不同 Provider 的原生事件格式——Ollama 的 `{"message": {"content": "..."}}`、OpenAI 的 `{"choices": [{"delta": {"content": "..."}}]}`、Anthropic 的 `{"delta": {"text": "..."}}`——被各自 Provider 适配器映射为统一的 `StreamEvent` 结构。

### 验证

- Ollama `astream("Hello")` → yield `StreamEvent(type="token", data="你")` → `type="token", data="好")` → `type="done"`
- 4 个 Provider 的 `astream()` 对同一输入返回结构完全一致的 StreamEvent 序列
- 新增假 Provider（`@ProviderRegistry.register("mock")`）→ `ProviderRegistry.get("mock")` 成功 → `astream()` 返回预设事件流

---

## KR2 — OpenAI 兼容 API

### 设计

**代码落地**：`src/server/routes/openai_compat.py`（~150 行）

提供 `/v1/chat/completions` 端点，响应格式与 OpenAI API 完全一致。使 `openai-python` SDK 和任何 OpenAI 兼容客户端（Continue.dev、Cursor、Aider 等）可直接对接 YiAi：

```python
# 第三方客户端零改动接入
from openai import OpenAI
client = OpenAI(base_url="http://localhost:10086/v1", api_key="sk-local")
stream = client.chat.completions.create(
    model="qwen2.5:14b",  # 实际通过 ModelRuntime 路由到 Ollama
    messages=[{"role": "user", "content": "Hello"}],
    stream=True
)
for chunk in stream:
    print(chunk.choices[0].delta.content)
```

**请求转换流程**：
```
OpenAI-format request → openai_compat.py
  → 提取 model name → ProviderRegistry 路由
  → 转换 messages 格式 (OpenAI → internal Message)
  → runtime.astream() → StreamEvent
  → 转换回 OpenAI SSE chunk format
  → StreamingResponse
```

**多客户端适配**：DeepSeek 仅需两行 YAML 配置即可接入——验证了 OpenAI 兼容模式的设计正确性：

```yaml
providers:
  deepseek:
    type: openai_compatible
    base_url: https://api.deepseek.com/v1
    api_key: ${DEEPSEEK_API_KEY}
    models: [deepseek-chat, deepseek-reasoner]
```

### 验证

- `curl -X POST /v1/chat/completions` 使用标准 OpenAI JSON body → 返回 SSE 流，格式与 OpenAI API 逐 chunk 一致
- 使用 `openai-python` SDK 调用 → 流式输出正常，无格式解析错误
- 使用 Continue.dev VS Code 插件配置 YiAi 为 LLM backend → 代码补全正常工作

---

## KR3 — LLM 并发调度

### 问题

Q2 期间多个 Agent 并发调用 Ollama 时无调度机制——第 6 个并发请求直接超时（Ollama 默认并行限制 4），而 DeepSeek API 完全空闲。缺乏跨 Provider 的负载感知和调度能力。

### 方案

**代码落地**：`src/services/ai/llm_provider.py`（~200 行）

三层调度策略：

| 层级 | 策略 | 配置项 | 说明 |
|------|------|--------|------|
| Provider 选择 | 加权轮询（权重 = 1/(当前并发+1) × 延迟修正因子） | `routing_strategy: weighted_round_robin` | 并发低 + 延迟低 = 权重高；Ollama 4 并发满 → 自动倾斜到 DeepSeek |
| 请求优先级 | 三队列：REALTIME（SSE 续流） > NORMAL（用户请求） > BATCH（Embedding/评估） | `priority_queues: 3` | REALTIME 队列保证流式连接的连续性，不被 Batch 阻塞 |
| 速率限制 | 令牌桶（10 tokens/s）+ 自适应（429 → 减半 → 1min 线性恢复） | `rate_limit: {tokens_per_sec: 10, adaptive: true}` | 避免打爆外部 API 的 rate limit；429 响应自动降速 |

**Fallback 机制**：
```
Primary Provider 超时/不可用
  → check fallback_chain 配置
    → Secondary Provider（如 DeepSeek）
      → 不可用？
        → Ollama 本地模型（最终兜底，保证不中断）
```

Fallback 触发条件：连接超时（5s）、5xx 响应、连续 3 次超时。每次 fallback 记录日志 + 递增 `fallback_count` 指标。

### 验证

- 6 个 Agent 同时启动 → 前 4 个路由到 Ollama，后 2 个自动路由到 DeepSeek → 全部在 30s 内完成
- 断开 DeepSeek API 网络 → 请求自动 fallback 到 Ollama → 响应时间增加但服务不中断
- 模拟 429 响应 → 令牌桶速率从 10 t/s → 5 t/s → 30s 后恢复到 10 t/s

---

## KR4 — Provider 热切换

### 问题

Q2 模型切换流程：修改代码 → 重启服务 → 中断所有进行中的 SSE 连接和 Agent 任务。一次模型切换影响所有在线用户。

### 方案

**代码落地**：`src/services/ai/provider_registry.py` + `src/shared/config.py` 热加载

**两阶段热切换**：

| 阶段 | 触发方式 | 效果 | 状态 |
|------|---------|------|------|
| 阶段 1 | `kill -SIGHUP <pid>` | 重载 `config.yaml` → Provider 注册表更新 → 新请求使用新配置，进行中的请求不受影响 | 已完成 |
| 阶段 2 | Web UI (`/admin/providers` 端点) | 浏览器中切换 Provider → 实时生效，无需 SSH/信号 | Q4 (yiai-q4-002) |

**阶段 1 实现细节**：
```python
# src/shared/config.py
import signal

def reload_config(signum, frame):
    settings = Settings()  # 重新加载 config.yaml
    ProviderRegistry.reload(settings.providers)  # 更新注册表
    logger.info("Config reloaded, providers updated")

signal.signal(signal.SIGHUP, reload_config)
```

进行中的 `astream()` 请求保持原有 Provider 引用——只有新请求通过 `ProviderRegistry.get()` 获取更新后的 Provider 实例。实现零中断热切换。

### 验证

- 修改 `config.yaml` 将默认 Provider 从 Ollama 切换为 DeepSeek → `kill -SIGHUP` → 新聊天请求路由到 DeepSeek，已建立的 SSE 连接不受影响
- 添加新 Provider 配置（如 `groq`）→ SIGHUP → `ProviderRegistry.list()` 包含新 Provider

---

## 影响

| 维度 | 修复前 | 修复后 |
|------|--------|--------|
| 支持 Provider 数 | 1 (Ollama) | 4 + 任意 OpenAI 兼容端点 |
| 新增 Provider 成本 | ~3d（写适配 + 改所有调用方） | ~0.5d（实现 3 方法 + 配置） |
| LLM 调用 P99 延迟 | 60s+（无超时/fallback，挂起无限等） | <30s（60s 超时 + 自动 fallback） |
| 模型切换方式 | 改代码 + 重启服务（中断所有连接） | SIGHUP 热加载（零中断） |
| 并发调度 | 无（先到先得，后到超时） | 加权轮询 + 三队列 + 自适应限速 |
| 第三方集成 | 不可用（自研 RPC 协议） | OpenAI 兼容端点，任意 SDK 可接入 |

---

## 未竟事项（Q4 延续）

| 事项 | 原因 | Q4 归属 |
|------|------|---------|
| Provider 热切换 Web 管理界面 | Web UI 开发依赖 YiVad 前端资源 | yiai-q4-002（API 平台化） |
| 智能模型路由（任务复杂度 → 模型选择） | 当前仅基于并发/延迟调度，未考虑任务语义 | yiai-q4-003（多模态 AI） |
| Token 用量统计与成本追踪 | 成本优化需积累至少 1 个月的用量基线 | yiai-q4-003（多模态 AI） |
| 多模态 Provider 支持（GPT-4V/Claude Vision） | ModelRuntime 接口需扩展 ContentPart 类型 | yiai-q4-003（多模态 AI） |
| Provider 健康度指标接入 Dashboard | 依赖 Q4 可观测性基础设施 | yiai-q4-001（可观测性） |