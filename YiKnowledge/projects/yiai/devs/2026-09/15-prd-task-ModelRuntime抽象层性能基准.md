---

doc_type: module
prd_task_id: "YA-09-11"
title: "YA-09-11: ModelRuntime 抽象层性能基准 — TTFT/TPS/E2E 延迟对比 + 模型选择策略 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 1.5
source_prd: "15-需求-ModelRuntime抽象层性能基准.md"
source_okr: [yiai-002]
related_tests: ["15-prd-test-ModelRuntime抽象层性能基准"]

type: task
---

# YA-09-11: ModelRuntime 抽象层性能基准 — TTFT/TPS/E2E 延迟对比 + 模型选择策略 — 开发方案

> 来源 PRD：[15-需求-ModelRuntime抽象层性能基准.md](../../prds/2026-09/15-需求-ModelRuntime抽象层性能基准.md)
> 需求编号：YA-09-11 · 优先级：P2 · 人天：1.5d
> 类型：性能工具 · 状态：需求已编写

---

## 一、架构概述

为 YiAi 的多 Provider LLM 运行时（Ollama、DeepSeek、OpenAI）建立标准化性能基准测试框架。通过统一的基准套件，测量三个核心延迟指标（TTFT/TPS/E2E），生成 Provider 延迟对比矩阵，驱动模型选择策略——简单任务路由到轻量模型，复杂任务路由到重量模型。

```mermaid
graph TD
  subgraph Benchmark"基准测试框架 (新增)"
    SUITE["BenchmarkSuite<br/>标准测试用例集 (10 条)"]
    RUNNER["BenchmarkRunner<br/>逐 Provider 执行 + 指标采集"]
    COLLECTOR["MetricsCollector<br/>TTFT / TPS / E2E Latency"]
    REPORTER["BenchmarkReporter<br/>Markdown 报告 + JSON 数据"]
  end

  subgraph Providers["LLM Provider"]
    OLLAMA["Ollama (本地)<br/>qwen3.5:4b, qwen3.5:14b"]
    DEEPSEEK["DeepSeek API<br/>deepseek-chat"]
    OPENAI["OpenAI API<br/>gpt-4o-mini"]
  end

  subgraph Strategy["模型选择策略"]
    ROUTER["ModelRouter<br/>任务复杂度 → 最优模型"]
    CACHE["基准数据缓存<br/>JSON 持久化 + 历史对比"]
  end

  SUITE --> RUNNER
  RUNNER --> OLLAMA
  RUNNER --> DEEPSEEK
  RUNNER --> OPENAI
  RUNNER --> COLLECTOR
  COLLECTOR --> REPORTER
  REPORTER --> CACHE
  CACHE --> ROUTER

  style Benchmark fill:#d4edda,stroke:#28a745
```

### 基准指标定义

| 指标 | 全称 | 采集方式 | 说明 |
|------|------|---------|------|
| TTFT | Time to First Token | SSE 第一个 `data:` 帧时间 | 衡量模型加载 + 首 token 延迟 |
| TPS | Tokens per Second | 总 token 数 / (结束时间 - TTFT) | 衡量推理速度 |
| E2E | End-to-End Latency | 请求发送 → 最后一个 token 时间 | 衡量整体用户体验延迟 |

---

## 二、文件清单

| # | 文件 | 操作 | 说明 | 预估行数 |
|---|------|------|------|----------|
| 1 | `tools/benchmark/suite.py` | 新增 | 标准测试用例集 (10 条) + BenchmarkCase 定义 | ~40 |
| 2 | `tools/benchmark/runner.py` | 新增 | BenchmarkRunner: 逐 Provider 执行 + 指标采集 | ~120 |
| 3 | `tools/benchmark/collector.py` | 新增 | MetricsCollector: TTFT/TPS/E2E 精确计时 | ~60 |
| 4 | `tools/benchmark/reporter.py` | 新增 | Markdown 报告 + JSON 数据 + 历史对比 | ~70 |
| 5 | `tools/benchmark/__init__.py` | 新增 | 模块导出 | ~5 |
| 6 | `domain/ai/model_router.py` | 新增 | ModelRouter: 任务复杂度 → 最优模型选择 | ~60 |

**改动汇总：** 6 新增 = **6 文件，~355 行**

---

## 三、模块设计

### 3.1 基准用例 — `tools/benchmark/suite.py`

```python
from dataclasses import dataclass
from typing import List

@dataclass
class BenchmarkCase:
    """单个基准测试用例。"""
    id: str
    name: str
    prompt: str
    category: str          # "simple" | "medium" | "complex"
    expected_tokens: int   # 预期 token 数 (粗略)

# 10 条标准测试用例，覆盖三种任务复杂度
BENCHMARK_CASES: List[BenchmarkCase] = [
    BenchmarkCase("S01", "简单问答", "什么是 RAG?", "simple", 50),
    BenchmarkCase("S02", "简单翻译", "Translate 'Hello' to Chinese", "simple", 20),
    BenchmarkCase("M01", "代码解释", "解释这段 Python 代码: async def fetch(): ...", "medium", 100),
    BenchmarkCase("M02", "技术概念", "解释 MongoDB 的聚合管道和 $lookup 操作", "medium", 120),
    BenchmarkCase("M03", "中等推理", "给定 A>B, B>C, A<D, 问 C 和 D 的关系", "medium", 80),
    BenchmarkCase("C01", "复杂推理", "设计一个分布式系统的限流策略...请详细说明", "complex", 250),
    BenchmarkCase("C02", "代码生成", "写一个 Python async 上下文管理器用于...", "complex", 200),
    BenchmarkCase("C03", "综合分析", "分析以下三个架构方案的优劣: ...", "complex", 300),
    BenchmarkCase("E01", "极长生成", "写一篇关于 AI Agent 的技术综述 (1000 字)", "complex", 500),
    BenchmarkCase("E02", "多步推理", "解决以下数学问题并解释每一步: ...", "complex", 180),
]
```

### 3.2 基准执行器 — `tools/benchmark/runner.py`

```python
import time
import asyncio
from typing import List, Dict, Optional
from dataclasses import dataclass

@dataclass
class BenchmarkMetrics:
    """单次基准测试的采集指标。"""
    case_id: str
    provider: str
    model: str
    category: str

    ttft_ms: float            # Time to First Token (ms)
    total_tokens: int         # 总 token 数
    tps: float                # Tokens per Second
    e2e_ms: float             # End-to-End 延迟 (ms)
    success: bool             # 测试是否成功
    error: Optional[str] = None

@dataclass
class BenchmarkReport:
    """完整基准测试报告。"""
    timestamp: float
    providers: Dict[str, List[BenchmarkMetrics]]  # provider → metrics[]
    summary: Dict[str, Dict]  # provider → {avg_ttft, avg_tps, avg_e2e, ...}

class BenchmarkRunner:
    """基准测试执行器——逐 Provider 执行标准用例集，采集性能指标。

    使用方式:
      runner = BenchmarkRunner(runtimes={"ollama": ollama_rt, "deepseek": ds_rt})
      report = await runner.run_all()
    """

    WARMUP_ROUNDS = 2        # 预热轮次 (不记录)
    MEASURE_ROUNDS = 3       # 记录轮次

    def __init__(self, runtimes: Dict[str, ModelRuntime]):
        self._runtimes = runtimes
        self._collector = MetricsCollector()

    async def run_all(self) -> BenchmarkReport:
        """对所有 Provider 执行完整基准测试。"""
        all_metrics: Dict[str, List[BenchmarkMetrics]] = {}

        for provider_name, runtime in self._runtimes.items():
            logger.info(f"[Benchmark] 开始测试 {provider_name}...")
            provider_metrics = []

            for case in BENCHMARK_CASES:
                # 预热
                for _ in range(self.WARMUP_ROUNDS):
                    await self._run_single(case, runtime, provider_name, record=False)

                # 采集
                for _ in range(self.MEASURE_ROUNDS):
                    metrics = await self._run_single(case, runtime, provider_name, record=True)
                    if metrics:
                        provider_metrics.append(metrics)

                # Provider 间休息 (避免 rate limit)
                await asyncio.sleep(0.5)

            all_metrics[provider_name] = provider_metrics

        # 汇总
        summary = self._summarize(all_metrics)
        return BenchmarkReport(
            timestamp=time.time(),
            providers=all_metrics,
            summary=summary,
        )

    async def _run_single(
        self, case: BenchmarkCase, runtime: ModelRuntime,
        provider: str, record: bool = True,
    ) -> Optional[BenchmarkMetrics]:
        """执行单个测试用例，采集 TTFT/TPS/E2E。"""
        try:
            start = time.monotonic()
            first_token_time = None
            token_count = 0

            async for chunk in runtime.stream_chat(
                [{"role": "user", "content": case.prompt}],
                model=runtime.default_model,
            ):
                if first_token_time is None and "data" in chunk:
                    first_token_time = time.monotonic()

                if "data" in chunk and "message" in chunk["data"]:
                    token_count += 1

            end = time.monotonic()

            if first_token_time is None:
                return None  # 无 token 输出

            ttft = (first_token_time - start) * 1000
            e2e = (end - start) * 1000
            tps = token_count / max((end - first_token_time), 0.001)

            return BenchmarkMetrics(
                case_id=case.id,
                provider=provider,
                model=runtime.default_model,
                category=case.category,
                ttft_ms=round(ttft, 1),
                total_tokens=token_count,
                tps=round(tps, 1),
                e2e_ms=round(e2e, 1),
                success=True,
            )
        except Exception as e:
            return BenchmarkMetrics(
                case_id=case.id, provider=provider, model=runtime.default_model,
                category=case.category,
                ttft_ms=0, total_tokens=0, tps=0, e2e_ms=0,
                success=False, error=str(e)[:200],
            )
```

### 3.3 模型路由策略 — `domain/ai/model_router.py`

```python
from enum import Enum

class TaskComplexity(str, Enum):
    SIMPLE = "simple"
    MEDIUM = "medium"
    COMPLEX = "complex"

class ModelRouter:
    """基于任务复杂度的模型选择——使用基准数据驱动最优选择。

    策略:
      - simple → 轻量模型 (低延迟、低 token: OLLAMA/qwen3.5:4b)
      - medium → 平衡模型 (OLLAMA/qwen3.5:14b 或 DEEPSEEK)
      - complex → 重量模型 (DEEPSEEK/deepseek-chat 或 OPENAI/gpt-4o)
    """

    # 基于基准数据的推荐 (可随基准数据更新)
    DEFAULT_RECOMMENDATIONS = {
        TaskComplexity.SIMPLE: "ollama/qwen3.5:4b",
        TaskComplexity.MEDIUM: "ollama/qwen3.5:14b",
        TaskComplexity.COMPLEX: "deepseek/deepseek-chat",
    }

    def __init__(self, benchmark_data: Optional[Dict] = None):
        self._benchmark = benchmark_data or {}

    def classify(self, prompt: str) -> TaskComplexity:
        """启发式任务复杂度分类。

        规则:
          - 长度 < 50 + 简单关键词 (翻译/是什么/定义) → SIMPLE
          - 包含 "设计/分析/架构/优化/review" → COMPLEX
          - 其他 → MEDIUM
        """
        prompt_lower = prompt.lower()
        if len(prompt) < 50 and any(
            kw in prompt_lower for kw in ("什么是", "翻译", "translate", "定义", "define")
        ):
            return TaskComplexity.SIMPLE
        if any(kw in prompt_lower for kw in ("设计", "分析", "架构", "优化", "review", "写", "生成")):
            return TaskComplexity.COMPLEX
        return TaskComplexity.MEDIUM

    def select(self, prompt: str) -> str:
        """选择最优模型——任务复杂度 → Provider/Model。"""
        complexity = self.classify(prompt)
        return self.DEFAULT_RECOMMENDATIONS.get(complexity, "ollama/qwen3.5:4b")
```

---

## 四、实施路线图

| 步骤 | 内容 | 涉及文件 | 验证方式 | 人天 |
|------|------|---------|---------|------|
| 1 | 基准测试框架 + 10 条标准用例 | `suite.py`, `runner.py` | 对 Ollama 执行基准，输出 TTFT/TPS/E2E | 0.5 |
| 2 | MetricsCollector 精确计时 (SSE 帧级别) | `collector.py` | TTFT 误差 < 5ms | 0.25 |
| 3 | Ollama/DeepSeek 延迟对比矩阵 | `runner.py` | 生成 Markdown 对比报告 | 0.25 |
| 4 | ModelRouter 模型选择策略 | `model_router.py` | simple→4b, complex→deepseek | 0.3 |
| 5 | 报告持久化 + 历史对比 | `reporter.py` | JSON 文件可对比历史基准 | 0.2 |
| **合计** | | | | **1.5d** |

---

## 五、代码审查检查清单

- [ ] TTFT 从 SSE 第一个 `data:` 帧精确计时
- [ ] TPS = total_tokens / (E2E - TTFT) (排除首 token 延迟)
- [ ] 预热轮次 2 轮，采集轮次 3 轮，取中位数
- [ ] Provider 间有 0.5s 冷却间隔
- [ ] 异常场景: Provider 不可达 → `success=False, error=...`
- [ ] 基准数据 JSON 持久化到 `data/benchmarks/`
- [ ] ModelRouter 复杂度分类覆盖 SIMPLE/MEDIUM/COMPLEX
- [ ] ruff + mypy 通过

---

## 六、技术风险评估

| 风险 | 概率 | 影响 | 等级 | 缓解措施 | 应急预案 |
|------|------|------|------|---------|---------|
| 基准数据因网络波动不稳定 | 中 | 中 | 中 | 3 轮采集取中位数；标注标准差 | 增加采集轮次至 5 |
| DeepSeek/OpenAI API rate limit | 中 | 中 | 中 | Provider 间 0.5s 冷却；单 Provider 顺序执行 | 减小采集轮次 |
| ModelRouter 启发式分类不准确 | 中 | 低 | 低 | 基于关键词的简单分类，未来可升级为 LLM 分类 | 默认使用 MEDIUM |

---

## 七、已知缺口与技术债务

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------|
| 1 | 基准数据无持久化 + 历史对比 | P3 | 0.3 | 每次手动运行，无法观察性能退化 | 待实施 |
| 2 | ModelRouter 复杂度分类为启发式 (关键词) | P3 | 0.2 | 未来可用 LLM 分类提升准确率 | 待实施 |
| 3 | 仅 10 条用例，覆盖度有限 | P3 | 0.3 | 可扩展到 50+ 条覆盖更多场景 | 待扩展 |

---

## 八、关联模块

- 上游：[YA-08-02 Multi-Provider LLM](../2026-08/02-prd-task-Multi-Provider-LLM.md)（被基准测试的 Provider）
- 上游：[YA-08-14 ModelRuntime 抽象层](../2026-08/14-prd-task-ModelRuntime抽象层.md)（`stream_chat()` 接口）
- 下游消费：所有 AI 聊天/Agent 调用点 (通过 ModelRouter 选择模型)