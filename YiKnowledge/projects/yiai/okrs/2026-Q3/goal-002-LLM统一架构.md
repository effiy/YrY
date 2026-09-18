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
updated: 2026-09-14
kr1: "ModelRuntime 抽象层 — 统一流式接口 astream()/astream_events()，三模式覆盖 chat/completion/embedding"
kr1_completion: 100
kr2: "OpenAI 兼容 API — `/v1/chat/completions` 端点 + base_url/api_key 多客户端适配"
kr2_completion: 95
kr3: "LLM 并发调度 — 多模型负载均衡 + 优先级队列 + 自适应速率限制"
kr3_completion: 90
kr4: "Provider 热切换 — 运行时无重启切换 LLM Provider + 模型版本回滚"
kr4_completion: 85
metric1_id: "yiai-m04"
metric1_desc: "支持的 LLM Provider 数"
metric1_current: "4"
metric1_target: "≥6"
metric2_id: "yiai-m05"
metric2_desc: "Provider 切换延迟"
metric2_current: "<2s"
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

> Q3 架构目标。建立统一的 LLM Provider 抽象层，使 Ollama、DeepSeek、OpenAI、Anthropic 等多厂商模型支持即插即用的流式切换。**核心抽象层已交付，OpenAI 兼容端点在位，剩余 Provider 热切换优化收尾中。**

---

## 背景

YiAi 最初仅支持 Ollama 自托管推理。随着模型生态发展，需要接入 DeepSeek API、OpenAI 兼容 API、Anthropic Claude 等多种外部 LLM 服务。直接为每个 Provider 写适配代码会产生三个问题：

**代码重复**：每个 Provider 需要独立的流式处理（SSE 解析、token 累积、中断处理），Ollama 的 `async for line in response.content` 和 OpenAI 的 `async for chunk in stream` 是同一模式的不同实现。

**接口分裂**：不同 Provider 的调用接口不一致——Ollama 用 REST `/api/chat`、OpenAI 用 `/v1/chat/completions`、Anthropic 用 Messages API。上层 Agent 和 Chat Service 需要感知 Provider 差异。

**运维耦合**：切换模型需要修改代码（`runtime = OllamaRuntime()` → `runtime = OpenAIRuntime()`）、重启服务。无法运行时热切换或按模型特性动态路由（如简单问题用 Ollama、复杂推理用 Claude）。

Q3 建立 ModelRuntime 抽象层，将三个问题收敛为统一接口 + 配置驱动的 Provider 管理。

---

## 季度演进

### 八月 — 架构设计与核心实现

完成了 ModelRuntime 抽象层的接口设计（参考 langchain BaseChatModel 的 Pi 风格）和 Ollama/OpenAI 两个 Provider 的核心实现。

**设计决策**：

| 决策 | 选项 A | 选项 B | 选择 | 理由 |
|------|--------|--------|------|------|
| 接口风格 | `generate()` / `agenerate()` | `astream()` / `astream_events()` | **Pi 风格** | 与 FastAPI SSE 天然对齐，`astream_events` 支持 token 级回调 |
| Provider 注册 | 硬编码 if/elif | 注册表 + 配置驱动 | **注册表** | 新增 Provider 零改动现有代码 |
| 同步/异步 | 仅异步 | 双模式 | **仅异步** | FastAPI 异步生态，同/异步混用是已知 bug 源 |

### 九月 — Provider 扩展与性能基准

在 Ollama/OpenAI 基础上扩展了 DeepSeek（兼容 OpenAI API，仅 base_url 不同）和 Anthropic（独立实现，Messages API 适配）。建立了性能基准和并发调度能力。

**当前 Provider 矩阵**：

| Provider | 实现方式 | 模型示例 | 流式 | Embedding |
|----------|---------|---------|------|-----------|
| Ollama | 原生 REST API | qwen3.5:4b | `async for line` | nomic-embed-text |
| OpenAI 兼容 | `/v1/chat/completions` | gpt-4o, deepseek-v4 | `async for chunk` | text-embedding-3-small |
| Anthropic | Messages API | claude-sonnet-4-6 | SSE events | —（使用独立 Embedding Provider） |
| 自定义 OpenAI 兼容 | base_url 配置 | 任意兼容端点 | 同 OpenAI | 同 OpenAI |

**并发调度**（`src/services/ai/llm_provider.py`）：
- 多模型负载均衡：按 Provider 当前并发数 + 延迟加权轮询
- 优先级队列：紧急请求（如 SSE 续流）优先于批处理
- 自适应速率限制：检测 429 响应 → 自动降速 → 恢复后回升

---

## 关键结果

| KR | 描述 | 完成度 |
|---|------|--------|
| KR1 | ModelRuntime 抽象层 — 统一流式接口 | 100% |
| KR2 | OpenAI 兼容 API | 95% |
| KR3 | LLM 并发调度 | 90% |
| KR4 | Provider 热切换 | 85% |

---

## KR1 — ModelRuntime 抽象层

**代码落地**：`src/services/ai/model_runtime.py`（~280 行）

统一接口：

```python
class BaseModelRuntime(ABC):
    @abstractmethod
    async def astream(self, messages: list[Message], **kwargs) -> AsyncIterator[StreamEvent]:
        """流式 chat/completion，yield token 级事件"""
    
    @abstractmethod
    async def astream_events(self, messages: list[Message], **kwargs) -> AsyncIterator[StreamEvent]:
        """增强流式——yield token + tool_call + reasoning 等富事件"""
    
    @abstractmethod
    async def aembed(self, texts: list[str], **kwargs) -> list[list[float]]:
        """批量 Embedding"""
```

三个方法覆盖 chat/completion/embedding 全场景。`StreamEvent` 统一了不同 Provider 的事件格式——上层（Agent、Chat Service）不感知底层 Provider。

---

## KR2 — OpenAI 兼容 API

**代码落地**：`src/server/routes/openai_compat.py`（~150 行）

提供 `/v1/chat/completions` 端点，响应格式与 OpenAI API 完全一致，使 `openai-python` SDK 和其他第三方工具可直接对接 YiAi：

```python
# 第三方客户端示例
from openai import OpenAI
client = OpenAI(base_url="http://localhost:10086/v1", api_key="sk-local")
response = client.chat.completions.create(
    model="qwen3.5:4b",  # 实际路由到 Ollama
    messages=[{"role": "user", "content": "Hello"}],
    stream=True
)
```

多客户端适配：通过 `base_url` + `api_key` 配置接入任意 OpenAI 兼容端点。DeepSeek 仅需两行配置：

```yaml
providers:
  deepseek:
    type: openai_compatible
    base_url: https://api.deepseek.com/v1
    api_key: ${DEEPSEEK_API_KEY}
    models: [deepseek-chat, deepseek-reasoner]
```

---

## KR3 — LLM 并发调度

**代码落地**：`src/services/ai/llm_provider.py`（~200 行）

三层调度策略：

| 层级 | 策略 | 配置 |
|------|------|------|
| Provider 选择 | 加权轮询（权重 = 1/当前并发数 × 延迟修正） | `routing_strategy: weighted_round_robin` |
| 优先级 | 三队列：REALTIME > NORMAL > BATCH | `priority_queues: 3` |
| 速率限制 | 令牌桶 + 自适应（429 → 减半 → 线性恢复） | `rate_limit: {tokens_per_sec: 10, adaptive: true}` |

实现了跨 Provider fallback：Ollama 超时/不可用 → 自动 fallback 到 DeepSeek（如配置了 fallback 链）。

---

## KR4 — Provider 热切换

**代码落地**：配置热加载 + Provider 注册表更新（`src/services/ai/provider_registry.py`）

当前可达：修改 `config.yaml` → `kill -SIGHUP <pid>` → 注册表重载（不中断进行中的请求）。剩余 15% 为 Web 管理界面——通过 `/admin/providers` 端点运行时切换，无需发送信号。

---

## 影响

| 维度 | 修复前 | 修复后 |
|------|--------|--------|
| 支持 Provider 数 | 1 (Ollama) | 4 + 任意 OpenAI 兼容 |
| 新增 Provider 成本 | ~3d（写适配 + 改调用方） | ~0.5d（配置 + 注册） |
| LLM 调用 P99 延迟 | 60s+（无超时） | <30s（60s 超时 + fallback） |
| 模型切换 | 改代码 + 重启 | 配置热加载（目标：Web UI） |

---

## 未竟事项（Q4 延续）

| 事项 | Q4 归属 |
|------|---------|
| Provider 热切换 Web 管理界面 | yiai-q4-002（API 平台化） |
| 多模型 A/B 评测框架 | yiai-q4-003（多模态 AI） |
| Token 用量统计与成本追踪 | yiai-q4-001（可观测性） |