---

doc_type: test
title: "YA-09-11: ModelRuntime 性能基准 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-11"
source_prds: ["15-需求-ModelRuntime抽象层性能基准"]
source_modules: ["15-prd-task-ModelRuntime抽象层性能基准"]
source_okr: [yiai-002]

type: test
---

# YA-09-11: ModelRuntime 性能基准 — 测试规格

> 来源 PRD：[15-需求-ModelRuntime抽象层性能基准.md](../../prds/2026-09/15-需求-ModelRuntime抽象层性能基准.md)
> 开发方案：[15-prd-task-ModelRuntime抽象层性能基准.md](../../devs/2026-09/15-prd-task-ModelRuntime抽象层性能基准.md)

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖 Ollama/DeepSeek 模型性能基准、TTFT/TPS 测量、模型自动选择策略、性能退化检测。

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元测试 | 模型选择逻辑 | pytest | 任务复杂度评估、模型路由规则 |
| L4 性能基准 | 真实 LLM 推理性能 | pytest + time.perf_counter + statistics | TTFT、TPS、延迟分布、并发吞吐 |

### 1.2 性能指标定义

| 指标 | 定义 | 计算公式 | 目标值 |
|------|------|---------|--------|
| TTFT | Time To First Token | 请求发送到首个 token 到达的延迟 | < 1000ms (Ollama 本地) |
| TPS | Tokens Per Second | 总生成 token 数 / 生成阶段耗时 | > 20 tokens/s (DeepSeek) |
| TPOT | Time Per Output Token | 两个连续 token 之间的平均间隔 | < 50ms |
| Latency P95 | 95 分位延迟 | 排序后第 95 百分位 | < 3000ms end-to-end |

### 1.3 模型选择策略

| 任务类型 | 复杂度判据 | 选择模型 |
|---------|-----------|---------|
| 简单对话 | 消息长度 < 50 字符 + 无技术关键词 | qwen2.5:0.5b (轻量) |
| 一般查询 | 消息长度 50-200 字符 | qwen2.5:1.5b (中等) |
| 复杂分析 | 消息长度 > 200 字符 + 技术关键词 | qwen2.5:7b (重量) |
| 代码生成 | 含代码块或编程术语 | deepseek-coder (专用) |

---

<a id="sec-fixtures"></a>
## 二、测试数据与 Fixtures

```python
import pytest
import time
import statistics
from unittest.mock import AsyncMock, MagicMock, patch

@pytest.fixture
def simple_messages():
    """简单对话——触发轻量模型。"""
    return [{"role": "user", "content": "你好"}]

@pytest.fixture
def normal_messages():
    """一般查询——触发中等模型。"""
    return [{"role": "user", "content": "请解释 RAG 检索增强生成的基本原理，包括检索阶段和生成阶段的主要步骤。"}]

@pytest.fixture
def complex_messages():
    """复杂分析——触发重量模型。"""
    return [{"role": "user", "content": """
请详细分析微服务架构在以下场景中的优缺点：
1. 高并发电商系统（10000 QPS）
2. 实时数据处理管道
3. 企业内部管理系统
比较单体架构和微服务架构在扩展性、运维复杂度、开发效率方面的差异。
"}]

@pytest.fixture
def code_generation_messages():
    """代码生成——触发专用模型。"""
    return [{"role": "user", "content": "用 Python 实现一个异步连接池管理器，支持自动扩缩容和健康检查。"}]

@pytest.fixture
def model_registry():
    """模型注册表 fixture。"""
    return {
        "qwen2.5:0.5b": {"type": "ollama", "size": "0.5B", "context_len": 4096, "specialty": "simple"},
        "qwen2.5:1.5b": {"type": "ollama", "size": "1.5B", "context_len": 8192, "specialty": "general"},
        "qwen2.5:7b": {"type": "ollama", "size": "7B", "context_len": 32768, "specialty": "complex"},
        "deepseek-coder": {"type": "deepseek", "size": "6.7B", "context_len": 16384, "specialty": "code"},
    }

@pytest.fixture
def performance_baseline():
    """性能基线数据——用于退化检测。"""
    return {
        "qwen2.5:0.5b": {"ttft_p50_ms": 50, "ttft_p95_ms": 150, "tps_mean": 45},
        "qwen2.5:1.5b": {"ttft_p50_ms": 100, "ttft_p95_ms": 300, "tps_mean": 30},
        "qwen2.5:7b": {"ttft_p50_ms": 300, "ttft_p95_ms": 800, "tps_mean": 15},
        "deepseek-coder": {"ttft_p50_ms": 200, "ttft_p95_ms": 500, "tps_mean": 25},
    }

@pytest.fixture
def mock_streaming_response():
    """模拟流式响应 chunks。"""
    tokens = ["RAG", "是", "检索", "增强", "生成", "的", "缩写", "，", "它", "结合", "了"]
    async def generate():
        for i, token in enumerate(tokens):
            await __import__('asyncio').sleep(0.01)  # 模拟 10ms/token
            yield {"choices": [{"delta": {"content": token}}]}
    return generate()
```

---

<a id="sec-cases"></a>
## 三、详细测试用例

### 3.1 模型自动选择

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-BM-01 | "你好" → 轻量模型 | simple_messages (3 字符) | 1. 输入 "你好"<br>2. 检查模型选择 | 选择 qwen2.5:0.5b | P1 |
| TC-BM-02 | 一般查询 → 中等模型 | normal_messages (~80 字符) | 1. 输入技术类一般查询<br>2. 检查模型选择 | 选择 qwen2.5:1.5b | P1 |
| TC-BM-03 | 复杂分析 → 重量模型 | complex_messages (~400 字符) | 1. 输入需要深度分析的问题<br>2. 检查模型选择 | 选择 qwen2.5:7b | P1 |
| TC-BM-04 | 代码生成 → 专用模型 | code_generation_messages | 1. 输入代码生成请求<br>2. 检查模型选择 | 选择 deepseek-coder | P1 |
| TC-BM-05 | 混合任务——代码 + 分析 | 代码 + 架构分析 | 1. 同时含代码和架构关键词<br>2. 选择优先级 | 代码生成模型优先（代码 > 分析） | P2 |
| TC-BM-06 | 手动指定模型覆盖自动选择 | 请求中指定 model="qwen2.5:7b" | 1. 输入 "你好"<br>2. 但指定 7b 模型 | 使用指定的 7b，忽略自动选择 | P1 |

### 3.2 性能基准测量

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-BM-07 | Ollama TTFT < 1000ms | Ollama 运行 + 模型已加载 | 1. 发送简单 chat 请求<br>2. 测量 TTFT | TTFT < 1000ms | P1 |
| TC-BM-08 | Ollama TPS > 15 | Ollama 运行 + 模型已加载 | 1. 统计流式 tokens 总数和时间<br>2. 计算 TPS | TPS > 15 tokens/s (7b 模型) | P1 |
| TC-BM-09 | DeepSeek TPS > 20 | DeepSeek API 可用 | 1. 发送 chat 请求到 deepseek-coder<br>2. 统计 TPS | TPS > 20 tokens/s | P1 |
| TC-BM-10 | 模型冷启动 TTFT | 模型未加载时首次请求 | 1. 使用未加载的模型<br>2. 测量首次 TTFT | TTFT 含模型加载时间，但应在 5000ms 内完成 | P2 |
| TC-BM-11 | P95 端到端延迟 | 100 次请求采样 | 1. 执行 100 次 chat 请求<br>2. 计算 P95 延迟 | P95 < 3000ms | P2 |

### 3.3 性能退化检测

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-BM-12 | TPS 不退化 > 20% | 性能基线数据 | 1. 本次 TPS 与基线对比<br>2. 计算退化百分比 | TPS 退化 < 20% | P1 |
| TC-BM-13 | TTFT 不退化 > 50% | 性能基线数据 | 1. 本次 P50 TTFT 与基线对比 | TTFT 退化 < 50%（首次 token 敏感度低） | P2 |
| TC-BM-14 | 并发 10 请求吞吐量 | 10 并发 chat 请求 | 1. 10 并发请求<br>2. 计算汇总 TPS | 总 TPS > 单请求 TPS × 3（并行收益） | P2 |

---

<a id="sec-edge"></a>
## 四、边界与异常测试

| ID | 用例名称 | 输入/场景 | 预期行为 | 优先级 |
|----|---------|---------|---------|--------|
| EG-BM-01 | 空消息 | messages=[] | 返回错误 "消息不能为空" | P2 |
| EG-BM-02 | 所有模型不可用 | Ollama 和 DeepSeek 均不存在 | 返回 code=2001 AI 服务不可用 | P1 |
| EG-BM-03 | 超长上下文（> 32K tokens） | 消息超过模型上下文限制 2x | 自动截断或拒绝 | P1 |
| EG-BM-04 | 首选模型不可用→降级 | qwen2.5:7b 不存在 | 降级到 qwen2.5:1.5b | P1 |
| EG-BM-05 | 单 token 响应 | LLM 仅返回 1 个 token | TTFT = 总延迟，TPS = 1/latency | P2 |
| EG-BM-06 | 网络波动导致 token 间隔大 | 某 token 延迟 5s | 不中断流式连接，正常继续 | P1 |

---

<a id="sec-regression"></a>
## 五、回归测试

| ID | 回归场景 | 触发条件 | 验证目标 | 优先级 |
|----|---------|---------|---------|--------|
| RG-BM-01 | 模型选择不影响 chat API 格式 | 自动选择后 | RPC 响应格式不变 (code/data/message) | P1 |
| RG-BM-02 | 性能基准测试工具自身不退化 | 基准测试代码执行 | 基准测试工具运行时间 < 10s | P2 |

---

<a id="sec-traceability"></a>
## 六、可追溯性矩阵

| PRD 功能需求 | 对应测试用例 | 覆盖率 |
|-------------|------------|--------|
| FR1: 模型自动选择 | TC-BM-01 ~ TC-BM-06 | 简单/一般/复杂/代码/混合/覆盖 |
| FR2: TTFT 测量 | TC-BM-07, TC-BM-10, TC-BM-13 | 热/冷启动/退化 |
| FR3: TPS 测量 | TC-BM-08, TC-BM-09, TC-BM-14 | Ollama/DeepSeek/并发 |
| FR4: 性能退化检测 | TC-BM-12, TC-BM-13 | TPS/TTFT 退化 |
| FR5: 模型降级 | EG-BM-02, EG-BM-04 | 不可用/降级 |

---

<a id="sec-gaps"></a>
## 七、覆盖缺口

| 缺口 | 影响 | 建议 |
|------|------|------|
| GPU vs CPU 推理对比 | 开发环境通常 CPU 推理 | 添加 GPU 环境性能基准测试 |
| 不同并发级别退化曲线 | 仅测试 1 和 10 并发 | 添加 1/5/10/20/50 并发阶梯测试 |
| 长时间运行性能稳定性 | 无 1h+ 持续运行测试 | 添加 1 小时持续推理性能监控 |
| 不同 prompt 长度对 TTFT 的影响 | 短 vs 长 prompt 的 TTFT 差异 | 添加 prompt 长度-TTFT 相关性测试 |
| 模型量化版本性能对比 | q4/q8/fp16 推理速度差异 | 添加量化级别性能对比矩阵 |