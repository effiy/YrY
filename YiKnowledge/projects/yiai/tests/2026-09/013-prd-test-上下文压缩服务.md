---

doc_type: test
title: "YA-09-07: 上下文压缩服务 — 测试规格"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-07"
source_prds: ["13-需求-上下文压缩服务"]
source_modules: ["13-prd-task-上下文压缩服务"]
source_okr: [yiai-003]

type: test
---

# YA-09-07: 上下文压缩服务 — 测试规格

> 来源 PRD：[13-需求-上下文压缩服务.md](../../prds/2026-09/13-需求-上下文压缩服务.md)
> 开发方案：[13-prd-task-上下文压缩服务.md](../../devs/2026-09/13-prd-task-上下文压缩服务.md)

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖上下文窗口检测、滑动窗口摘要压缩、压缩比控制、关键信息保留验证。

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元测试 | Token 计数、压缩触发逻辑 | pytest + tiktoken | 窗口使用率计算、摘要生成决策、压缩比验证 |
| L2 集成测试 | 真实 LLM 摘要生成 | pytest-asyncio + Ollama | 摘要质量评估、关键信息保留、多轮对话压缩 |

### 1.2 压缩策略

```
超窗口 80% 触发 → 自动摘要前 N-2 轮 → 保留最近 2 轮完整消息
摘要后 token < 窗口 50% → 压缩比 > 50%
滑动窗口保留最近 2 轮 → 不参与摘要，保持上下文连贯性
```

---

<a id="sec-fixtures"></a>
## 二、测试数据与 Fixtures

```python
import pytest
import tiktoken

@pytest.fixture
def tokenizer():
    """GPT-4 tokenizer——用于 token 计数。"""
    return tiktoken.get_encoding("cl100k_base")

@pytest.fixture
def short_conversation():
    """短对话——不触发压缩（< 窗口 80%）。"""
    return [
        {"role": "system", "content": "你是一个 AI 助手。"},
        {"role": "user", "content": "什么是 RAG？"},
        {"role": "assistant", "content": "RAG 是 Retrieval-Augmented Generation 的缩写..."},
        {"role": "user", "content": "它的优点是什么？"},
        {"role": "assistant", "content": "RAG 的优点包括：1. 减少幻觉 2. 知识实时更新..."},
    ]

@pytest.fixture
def long_conversation():
    """长对话——触发压缩（10 轮，约 6000 tokens）。"""
    messages = [{"role": "system", "content": "你是一个技术专家 AI 助手。"}]
    topics = [
        ("什么是微服务架构？", "微服务架构是一种将应用拆分为小型独立服务的设计模式...\n" + "详细说明" * 50),
        ("微服务之间如何通信？", "微服务通信主要有同步（HTTP/gRPC）和异步（消息队列）两种方式...\n" + "详细说明" * 50),
        ("什么是服务发现？", "服务发现是微服务架构中的关键组件，用于动态定位服务实例...\n" + "详细说明" * 50),
        ("如何保证数据一致性？", "在微服务中，数据一致性通过 Saga 模式、事件溯源等方式保证...\n" + "详细说明" * 50),
        ("如何处理分布式事务？", "分布式事务处理可以使用两阶段提交（2PC）或 TCC 模式...\n" + "详细说明" * 50),
        ("如何进行服务监控？", "微服务监控通过指标收集、日志聚合、链路追踪实现...\n" + "详细说明" * 50),
        ("容器化部署方案？", "使用 Docker + Kubernetes 进行容器编排和部署...\n" + "详细说明" * 50),
        ("CI/CD 流水线设计？", "CI/CD 流水线包含代码检查、构建、测试、部署等阶段...\n" + "详细说明" * 50),
        ("数据库选型建议？", "微服务中数据库选型需考虑数据模型、一致性需求、扩展性...\n" + "详细说明" * 50),
        ("安全最佳实践？", "微服务安全包括认证授权、API 网关、密钥管理等方面...\n" + "详细说明" * 50),
    ]
    for q, a in topics:
        messages.append({"role": "user", "content": q})
        messages.append({"role": "assistant", "content": a})
    return messages

@pytest.fixture
def conversation_with_key_info():
    """含关键信息的对话——验证摘要是否保留关键信息。"""
    return [
        {"role": "system", "content": "你是一个 AI 助手。"},
        {"role": "user", "content": "我的服务器 IP 是 192.168.1.100，端口是 8080。"},
        {"role": "assistant", "content": "好的，已记录。服务器 IP: 192.168.1.100:8080。"},
        {"role": "user", "content": "数据库密码是 SecretDBPass123!。"},
        {"role": "assistant", "content": "已记录数据库凭据。"},
        {"role": "user", "content": "API Key 是 sk-abc123def456。"},
        {"role": "assistant", "content": "已记录 API Key。"},
        {"role": "user", "content": "请用 IP 192.168.1.100 连接服务器并检查状态。"},
    ]

@pytest.fixture
def empty_conversation():
    """空对话——仅系统提示。"""
    return [{"role": "system", "content": "你是一个 AI 助手。"}]

@pytest.fixture
def compression_config():
    """压缩配置。"""
    return {
        "max_context_tokens": 4096,    # 上下文窗口大小
        "compression_threshold": 0.8,  # 80% 触发压缩
        "keep_recent_rounds": 2,       # 保留最近 2 轮
        "target_compression_ratio": 0.5,  # 目标压缩比 50%
    }
```

---

<a id="sec-cases"></a>
## 三、详细测试用例

### 3.1 压缩触发判断

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-CP-01 | Token 使用 < 80% 不压缩 | short_conversation (~500 tokens) | 1. 计算 token 使用率<br>2. 判断是否触发压缩 | 不触发压缩，所有消息完整保留 | P1 |
| TC-CP-02 | Token 使用 > 80% 触发压缩 | long_conversation (~6000 tokens) | 1. 计算 token 使用率<br>2. 判断是否触发压缩 | 触发压缩，前 N-2 轮被摘要替代 | P0 |
| TC-CP-03 | Token 使用 = 80% 边界 | 恰好 80% token 使用 | 1. 边界值测试<br>2. 检查触发行为 | 触发压缩（>= 阈值） | P2 |
| TC-CP-04 | 空对话不触发 | empty_conversation (仅 system prompt) | 1. 计算 token 使用率<br>2. 判断触发 | 不触发压缩 | P2 |

### 3.2 压缩行为

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-CP-05 | 前 N-2 轮被摘要替代 | long_conversation (10 轮) | 1. 触发压缩<br>2. 检查压缩后结构 | 前 8 轮浓缩为 1 条 summary 消息，最近 2 轮完整保留 | P0 |
| TC-CP-06 | 最近 2 轮完整保留 | long_conversation | 1. 检查压缩后消息列表<br>2. 验证最后 2 轮 | 最后 2 轮（4 条消息）未被压缩 | P0 |
| TC-CP-07 | 压缩比 > 50% | long_conversation 6000 tokens | 1. 压缩前 token 数 vs 压缩后<br>2. 计算压缩比 | 压缩后 token < 3000（50% 以下） | P1 |
| TC-CP-08 | System prompt 始终保留 | long_conversation | 1. 压缩后检查首条消息<br>2. 验证是否为 system prompt | system prompt 未被压缩 | P1 |
| TC-CP-09 | 压缩后 token 计数更新 | 压缩完成后 | 1. 重新计算 token 使用率<br>2. 检查是否 < 50% | token 使用率下降至 50% 以下 | P1 |

### 3.3 关键信息保留

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-CP-10 | 摘要保留关键数字 | conversation_with_key_info (IP 192.168.1.100) | 1. 压缩对话<br>2. 检查摘要是否含 IP 信息 | 摘要中保留 "服务器 IP: 192.168.1.100:8080" | P1 |
| TC-CP-11 | 摘要保留凭据信息 | conversation_with_key_info (密码/API Key) | 1. 压缩对话<br>2. 检查摘要是否含凭据 | 摘要中保留数据库密码和 API Key | P1 |
| TC-CP-12 | 后续问题依赖摘要信息 | conversation_with_key_info | 1. 压缩后添加新问题<br>2. 验证 LLM 能否用摘要信息回答 | LLM 可基于摘要正确回答 "请连接 192.168.1.100" | P1 |

### 3.4 多轮连续压缩

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-CP-13 | 二次压缩——摘要 + 新消息再超 | 第 1 次压缩后继续添加消息 | 1. 压缩后再加 5 轮新消息<br>2. 重新触发压缩 | 旧的摘要 + 新前 N-2 轮 → 新的更大的摘要 | P2 |
| TC-CP-14 | 极端长对话 | 50 轮对话 | 1. 多轮压缩<br>2. 验证最终状态 | 最终消息数合理（system + summary + 2 rounds），不 OOM | P2 |

---

<a id="sec-edge"></a>
## 四、边界与异常测试

| ID | 用例名称 | 输入/场景 | 预期行为 | 优先级 |
|----|---------|---------|---------|--------|
| EG-CP-01 | 仅 1 轮对话触发压缩 | 1 轮对话超窗口（不现实但边界） | 不压缩（保留最近的规则优先） | P2 |
| EG-CP-02 | 窗口大小 = 0 | max_context_tokens=0 | 配置校验拒绝，抛异常 | P2 |
| EG-CP-03 | keep_recent_rounds > 总轮数 | 5 轮对话，keep_recent=10 | 保留所有轮次，不压缩 | P2 |
| EG-CP-04 | 摘要生成失败 | LLM 摘要调用超时 | 降级：截断旧消息（保留最近 N 轮） | P1 |
| EG-CP-05 | 纯系统提示超窗口 | 单条 system prompt 超过窗口 | 截断 system prompt，日志 WARNING | P2 |

---

<a id="sec-regression"></a>
## 五、回归测试

| ID | 回归场景 | 触发条件 | 验证目标 | 优先级 |
|----|---------|---------|---------|--------|
| RG-CP-01 | 短对话不受压缩影响 | 压缩服务启用 | 短对话行为完全不变 | P1 |
| RG-CP-02 | 压缩后 LLM 回答质量 | 长对话压缩后继续对话 | LLM 回答连贯，无明显上下文丢失 | P0 |

---

<a id="sec-traceability"></a>
## 六、可追溯性矩阵

| PRD 功能需求 | 对应测试用例 | 覆盖率 |
|-------------|------------|--------|
| FR1: 窗口检测与触发 | TC-CP-01 ~ TC-CP-04 | < 80% / > 80% / = 80% / 空 |
| FR2: 摘要压缩 | TC-CP-05 ~ TC-CP-09 | 结构/保留轮次/压缩比/system |
| FR3: 关键信息保留 | TC-CP-10 ~ TC-CP-12 | 数字/凭据/依赖摘要 |
| FR4: 多轮连续压缩 | TC-CP-13, TC-CP-14 | 二次压缩/极端长对话 |

---

<a id="sec-gaps"></a>
## 七、覆盖缺口

| 缺口 | 影响 | 建议 |
|------|------|------|
| 摘要质量自动评估 | 仅手工检查摘要是否保留关键信息 | 添加 ROUGE/BERTScore 自动摘要质量评估 |
| 不同 LLM 模型摘要效果 | 仅测试单个模型 | 添加多模型摘要对比测试 |
| 压缩对 Agent 工具调用的影响 | Agent 压缩后工具调用参数正确性 | 添加 Agent 场景下压缩回归测试 |
| Token 计数准确性 | tiktoken 与实际 API 计数差异 | 对比 tiktoken 计数与 Ollama API 实际 token 数 |