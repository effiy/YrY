---
title: "YA-09-11: ModelRuntime 抽象层性能基准 — 多 Provider 延迟对比与模型选择策略"
tags: [需求文档, ModelRuntime, 性能基准, LLM, 多Provider, 延迟优化, 后端]
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
prd_task_id: YA-09-11
estimate_backend: 1.5
review_status: 待评审
issue_type: 架构
roles: [engineer, aier]
---

# YA-09-11: ModelRuntime 抽象层性能基准 — 多 Provider 延迟对比与模型选择策略

> 需求编号：YA-09-11 · 优先级：P2 · 人天：1.5d · 状态：需求已编写
> 依赖：YA-08-15（ModelRuntime 抽象层）、YA-09-09（上下文压缩）

## 背景

YiAi 八月迭代完成 Multi-Provider LLM 架构设计（YA-08-15），实现了统一的 `ModelRuntime` 抽象层，支持 Ollama（本地）、OpenAI-compatible API（云端）等多种 LLM 后端。用户可通过配置切换模型和 Provider。

当前缺少系统化的性能基准：

| 问题 | 影响 |
|------|------|
| 无 Provider 延迟对比——用户选择模型时无数据支撑 | 盲目选择——可能选了慢模型 |
| 无 Token 吞吐率基准——不知道模型处理速度 | 无法预估长对话耗时 |
| 无冷启动 vs 热启动延迟数据——首次推理延迟不可预测 | 用户体验不一致 |
| 无 Embeding 模型性能对比——RAG 检索延迟优化无方向 | RAG 检索延迟可能偏高 |
| 不同任务类型（聊天/总结/代码生成）的最优模型无推荐 | 所有任务用同一个模型 |

目标：建立 ModelRuntime 性能基准框架，支持多 Provider × 多模型 × 多任务类型的延迟和吞吐率对比，提供模型选择策略。

---

## 一、现状分析

### 1.1 ModelRuntime 架构

```
请求: { model: "qwen3:14b", provider: "ollama", messages: [...] }
  │
  ▼
ModelRuntime.select(provider, model_name)
  ├── OllamaProvider      → Ollama Chat API (localhost:11434)
  ├── OpenAIProvider      → OpenAI-compatible Chat API (可配置 base_url)
  └── AnthropicProvider   → Anthropic Messages API (可配置)
  │
  ▼
Provider.chat(messages, **options)
  │
  ▼
SSE 流式 → 前端 (YiVad/YiPet)
```

### 1.2 当前模型列表

| Provider | 模型 | 参数量 | 部署方式 | 推理硬件 |
|----------|------|--------|----------|----------|
| Ollama | `qwen3:4b` | 4B | 本地 | CPU/GPU |
| Ollama | `qwen3:14b` | 14B | 本地 | GPU (8GB+) |
| Ollama | `llama3.2:3b` | 3B | 本地 | CPU |
| Ollama | `deepseek-r1:8b` | 8B | 本地 | GPU (6GB+) |
| Ollama | `nomic-embed-text` | 137M | 本地 (Embedding) | CPU |
| OpenAI-compat | `gpt-4o-mini` | — | 云端 API | — |
| OpenAI-compat | `deepseek-v3` | — | 云端 API | — |

### 1.3 待测量任务类型

| 任务类型 | 典型 Prompt 长度 | 典型 Response 长度 | 评估指标 |
|----------|-----------------|-------------------|----------|
| **短对话** (Chat) | ~200 tokens | ~200 tokens | Time-to-First-Token (TTFT), Total Time |
| **长文本生成** (Generate) | ~500 tokens | ~2000 tokens | Tokens/sec, Total Time |
| **总结** (Summarize) | ~3000 tokens | ~500 tokens | Prefill Time, TTFT, Tokens/sec |
| **代码生成** (Code) | ~400 tokens | ~800 tokens | TTFT, Tokens/sec, 语法正确率 |
| **RAG 上下文生成** (RAG) | ~2000 tokens | ~500 tokens | Prefill Time, TTFT, Source Utilization Rate |
| **Embedding** (Embed) | ~200 tokens/chunk | 768-4096 dims | Embeddings/sec, 维度, 语义准确度 |

### 1.4 改造前数据流

```
用户发起聊天 (无模型推荐)
  → 使用默认模型 (config.yaml 中配置)
  → 模型可能是 qwen3:14b (GPU) 或 qwen3:4b (CPU)
  → 首次推理: 冷启动, 模型加载 5-30s
  → 后续推理: 热启动, 延迟取决于模型大小和硬件
  → 用户: 不知道为什么有时候快有时候慢
  → 开发者: 不知道瓶颈在 Provider、模型还是网络
```

---

## 二、设计决策

### 决策 1：性能基准框架 — 独立脚本 vs CI 集成 vs 运行时自动

| 选项 | 数据精度 | 执行频率 | 环境一致性 |
|------|----------|----------|-----------|
| 独立基准脚本 | 高（可控环境） | 按需 | 高 |
| CI 集成（每次 PR） | 中（CI runner 资源不固定） | 每次 PR | 低 |
| 运行时自动采集 | 高（真实环境） | 每次推理 | 最高 |

**选择：独立基准脚本（结构化对比） + 运行时自动采集（趋势监控）。** 基准脚本用于一次性 Provider/模型对比，运行时采集用于长期性能退化检测。

### 决策 2：评估指标 — TTFT vs Total Time vs Tokens/sec

| 指标 | 含义 | 用户感知 | 适用场景 |
|------|------|----------|----------|
| **TTFT** (Time-to-First-Token) | 首个 token 生成前的延迟 | 响应感——"AI 在想什么？" | 聊天、RAG |
| **Total Time** | 完整响应的总耗时 | 总体速度 | 所有场景 |
| **Tokens/sec** | 生成速度 | 流畅度——"内容出来得快吗？" | 长文本生成 |
| **Prefill Time** | Prompt 处理阶段耗时 | 长上下文感知 | 总结、RAG |
| **End-to-End Latency** | 请求发出 → 最后 token | 端到端体验 | 所有场景 |

**选择：全量采集，按任务类型选择主指标。** 聊天关注 TTFT（响应感），生成关注 Tokens/sec（流畅度）。

### 决策 3：模型选择策略 — 静态规则 vs 动态路由 vs 混合

| 选项 | 响应延迟 | 成本 | 实现 |
|------|----------|------|------|
| 静态规则（基于任务类型） | 固定 | 固定 | 低 |
| 动态路由（基于实时负载+延迟） | 最优 | 动态 | 高 |
| **混合（静态默认 + 动态 fallback）** | 中-优 | 中 | 中 |

**选择：混合。** 默认按任务类型推荐模型，当推荐模型不可用或延迟超预算时自动 fallback 到备选模型。

### 设计决策记录

| 决策 | 选项 A | 选项 B | 选项 C | 选择 | 理由 |
|------|--------|--------|--------|------|------|
| 基准框架 | 独立脚本 | CI | 运行时 | **独立脚本+运行时** | 对比精度+趋势监控 |
| 指标选择 | TTFT | Total Time | Tokens/sec | **全量** | 按任务类型选主指标 |
| 模型路由 | 静态规则 | 动态路由 | — | **混合** | 默认推荐+fallback |

---

## 三、目标架构

### 3.1 性能基准脚本

```python
# YiAi/tools/benchmark_model_runtime.py

import asyncio
import time
import json
from dataclasses import dataclass, field

@dataclass
class BenchmarkResult:
    provider: str
    model: str
    task_type: str
    prompt_tokens: int
    response_tokens: int
    ttft_ms: float          # Time-to-First-Token (ms)
    total_time_ms: float     # 总耗时 (ms)
    tokens_per_sec: float    # 生成速度
    prefill_time_ms: float   # Prompt 处理时间
    success: bool
    error: str | None = None

class ModelRuntimeBenchmark:
    """Multi-Provider ModelRuntime 性能基准测试。"""

    BENCHMARK_TASKS = {
        "chat": {
            "prompt": "Explain what RAG (Retrieval-Augmented Generation) is in 3 sentences.",
            "expected_tokens": (100, 300),
            "primary_metric": "ttft_ms",
        },
        "generate": {
            "prompt": "Write a comprehensive guide on FastAPI middleware patterns...",
            "expected_tokens": (1000, 3000),
            "primary_metric": "tokens_per_sec",
        },
        "summarize": {
            "prompt": "Summarize the following article in 200 words:\n\n" + "Lorem " * 500,
            "expected_tokens": (150, 400),
            "primary_metric": "prefill_time_ms",
        },
        "code": {
            "prompt": "Write a Python async context manager for MongoDB connection pooling...",
            "expected_tokens": (300, 1000),
            "primary_metric": "tokens_per_sec",
        },
        "rag": {
            "prompt": "Based on the following knowledge base context...\n\n" + "Context " * 200,
            "expected_tokens": (200, 600),
            "primary_metric": "ttft_ms",
        },
    }

    async def run_all(self) -> list[BenchmarkResult]:
        """运行所有 Provider × 模型 × 任务类型的基准测试。"""
        results = []

        for provider_name in ["ollama", "openai_compat"]:
            provider = ModelRuntime.get_provider(provider_name)
            models = provider.list_models()

            for model in models:
                for task_type, task_config in self.BENCHMARK_TASKS.items():
                    result = await self._benchmark_single(
                        provider, model, task_type, task_config
                    )
                    results.append(result)

                    # 避免 Ollama 过载
                    await asyncio.sleep(2)

        return results

    async def _benchmark_single(
        self, provider, model: str, task_type: str, config: dict
    ) -> BenchmarkResult:
        """单个模型 × 任务的性能测量。"""
        try:
            # 1. 预热（冷启动 → 热启动过渡）
            await provider.chat([{"role": "user", "content": "Hello"}], model=model)

            # 2. 正式测量
            start_time = time.perf_counter()
            first_token_time = None
            token_count = 0

            async for chunk in provider.stream_chat(
                [{"role": "user", "content": config["prompt"]}],
                model=model,
            ):
                if first_token_time is None and chunk.get("content"):
                    first_token_time = time.perf_counter()
                if chunk.get("content"):
                    token_count += len(chunk["content"].split())  # 粗略估算

            end_time = time.perf_counter()

            return BenchmarkResult(
                provider=provider.name,
                model=model,
                task_type=task_type,
                prompt_tokens=len(config["prompt"].split()),
                response_tokens=token_count,
                ttft_ms=(first_token_time - start_time) * 1000 if first_token_time else 0,
                total_time_ms=(end_time - start_time) * 1000,
                tokens_per_sec=token_count / max(end_time - start_time, 0.001),
                prefill_time_ms=(
                    (first_token_time - start_time) * 1000 if first_token_time else
                    (end_time - start_time) * 1000
                ),
                success=True,
            )

        except Exception as e:
            return BenchmarkResult(
                provider=provider.name, model=model, task_type=task_type,
                prompt_tokens=0, response_tokens=0, ttft_ms=0, total_time_ms=0,
                tokens_per_sec=0, prefill_time_ms=0, success=False, error=str(e),
            )
```

### 3.2 模型选择策略

```python
# YiAi/src/services/ai/model_selector.py

class ModelSelector:
    """基于任务类型 + 性能基准的模型推荐。"""

    # 预定义推荐策略（基于基准测试结果，可定期更新）
    TASK_MODEL_RECOMMENDATIONS = {
        "chat": {
            "primary": {"provider": "ollama", "model": "qwen3:14b"},
            "fallback": {"provider": "ollama", "model": "qwen3:4b"},
            "budget": {"ttft_ms": 500, "tokens_per_sec": 20},
        },
        "generate": {
            "primary": {"provider": "openai_compat", "model": "deepseek-v3"},
            "fallback": {"provider": "ollama", "model": "deepseek-r1:8b"},
            "budget": {"ttft_ms": 1000, "tokens_per_sec": 30},
        },
        "summarize": {
            "primary": {"provider": "ollama", "model": "qwen3:14b"},
            "fallback": {"provider": "openai_compat", "model": "gpt-4o-mini"},
            "budget": {"ttft_ms": 800, "tokens_per_sec": 25},
        },
        "code": {
            "primary": {"provider": "openai_compat", "model": "deepseek-v3"},
            "fallback": {"provider": "ollama", "model": "deepseek-r1:8b"},
            "budget": {"ttft_ms": 1000, "tokens_per_sec": 25},
        },
        "rag": {
            "primary": {"provider": "ollama", "model": "qwen3:14b"},
            "fallback": {"provider": "ollama", "model": "qwen3:4b"},
            "budget": {"ttft_ms": 600, "tokens_per_sec": 20},
        },
    }

    def select(self, task_type: str, user_preference: dict | None = None) -> dict:
        """选择最佳模型。"""
        if user_preference:
            return user_preference  # 用户显式选择优先

        rec = self.TASK_MODEL_RECOMMENDATIONS.get(task_type)
        if not rec:
            return self.TASK_MODEL_RECOMMENDATIONS["chat"]["primary"]

        return rec["primary"]

    async def select_with_fallback(
        self, task_type: str, user_preference: dict | None = None
    ) -> dict:
        """选择模型，失败时自动 fallback。"""
        primary = self.select(task_type, user_preference)

        # 检查 primary 模型是否可用
        if await self._is_available(primary):
            return primary

        # Fallback
        rec = self.TASK_MODEL_RECOMMENDATIONS.get(task_type, {})
        fallback = rec.get("fallback", {})
        if fallback and await self._is_available(fallback):
            logger.warning(
                f"[ModelSelector] {primary['provider']}/{primary['model']} "
                f"不可用, fallback 到 {fallback['provider']}/{fallback['model']}"
            )
            return fallback

        raise ModelUnavailableError("所有可用的模型均不可用")

    async def _is_available(self, model_spec: dict) -> bool:
        """检查模型是否可用（健康检查）。"""
        try:
            provider = ModelRuntime.get_provider(model_spec["provider"])
            return await provider.health_check(model_spec["model"])
        except Exception:
            return False
```

### 3.3 运行时性能采集

```python
# YiAi/src/services/ai/model_runtime.py

class MonitoredProvider:
    """带性能监控的 Provider 包装器。"""

    def __init__(self, provider, metrics_collector):
        self._provider = provider
        self._metrics = metrics_collector

    async def stream_chat(self, messages, **kwargs):
        start = time.perf_counter()
        first_token_time = None
        token_count = 0

        try:
            async for chunk in self._provider.stream_chat(messages, **kwargs):
                if first_token_time is None and chunk.get("content"):
                    first_token_time = time.perf_counter()
                if chunk.get("content"):
                    token_count += 1
                yield chunk
        finally:
            end = time.perf_counter()
            self._metrics.record({
                "provider": self._provider.name,
                "model": kwargs.get("model", "unknown"),
                "ttft_ms": (first_token_time - start) * 1000 if first_token_time else None,
                "total_time_ms": (end - start) * 1000,
                "tokens": token_count,
                "tokens_per_sec": token_count / max(end - start, 0.001),
                "timestamp": time.time(),
            })
```

---

## 四、具体改动

### 4.1 新增文件

| 文件 | 说明 |
|------|------|
| `YiAi/tools/benchmark_model_runtime.py` | 性能基准测试脚本 |
| `YiAi/src/services/ai/model_selector.py` | 任务类型 → 模型推荐策略 |
| `YiAi/src/services/ai/metrics_collector.py` | 运行时性能指标采集 |

### 4.2 修改文件

| 文件 | 改动 |
|------|------|
| `YiAi/src/services/ai/model_runtime.py` | 集成 `MonitoredProvider` 包装器 |

---

## 五、性能基准参考数据（预期）

| Provider | Model | 任务 | TTFT (ms) | Tokens/sec | Total (s) |
|----------|-------|------|-----------|------------|-----------|
| Ollama | qwen3:4b (CPU) | chat | 800-1500 | 15-25 | 8-15 |
| Ollama | qwen3:14b (GPU) | chat | 200-500 | 30-50 | 3-6 |
| Ollama | deepseek-r1:8b (GPU) | code | 300-800 | 25-40 | 15-30 |
| OpenAI-compat | gpt-4o-mini | chat | 300-600 | 40-80 | 2-5 |
| OpenAI-compat | deepseek-v3 | generate | 400-800 | 50-90 | 10-25 |
| Ollama | nomic-embed-text | embed | — | ~50 chunks/s | < 0.1/chunk |

---

## 六、可观测性

| 指标 | 采集方式 | 告警阈值 | 说明 |
|------|----------|----------|------|
| TTFT P95 | `MonitoredProvider` 采样 | > 2000ms (本地), > 3000ms (云端) | 模型响应感 |
| Tokens/sec P50 | 同上 | < 10 (本地), < 20 (云端) | 生成速度 |
| 模型可用性 | 健康检查 | < 99% | Provider 稳定性 |
| Fallback 触发率 | ModelSelector 计数 | > 5% | Primary 模型不稳定 |

---

*PRD 来源: `projects/yiai/requirements/2026-09/11-需求-ModelRuntime性能基准.md`*

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
