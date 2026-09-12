---
title: "ADR: Multi-Provider LLM Routing"
tags: [adr, yiai, llm, multi-provider, routing]
category: leader/decisions/yiai
created: 2026-08-03
updated: 2026-09-10
last_verified: 2026-08-03
source: internal
type: decision
status: accepted
lifecycle: implemented
review_cycle: quarterly
roles: [leader, engineer]
benefit: "理解 YiAi 为什么通过 llama_index 在多提供商之间路由 LLM 流量，以及为什么不引入额外的抽象层"
acceptance_criteria:
  - "决策的上下文、选项和理由清晰陈述"
related:
  - ./llm-multi-provider-rollout.md
  - ../../../engineer/learn/projects/yiai/README.md
---

# ADR: 多提供商 LLM 路由

> **状态**：已接受 (2026-08-03) — 已通过 `llama_index.llms.*` 实现
>
> 此 ADR 定义了 LLM 提供商路由的架构基础。关于分阶段上线计划，请参阅 [llm-multi-provider-rollout.md](./llm-multi-provider-rollout.md)。

## 上下文

YiAi 需要为不同使用场景支持多个 LLM 提供商：聊天、RAG、Agent、代码审查。不同场景对模型的要求不同——聊天需要流畅的中文对话能力、Agent 需要可靠的工具调用、代码审查需要精确的代码理解。

单一提供商（仅 Ollama 本地模型）的策略限制了模型选择并造成供应商锁定：
- 本地 Ollama 模型受限模型大小（受 GPU VRAM 限制）
- 云 API 可访问更大、更强的模型
- 无法为不同场景选择最优模型（成本/性能/质量权衡）
- Ollama 不可用时（GPU 故障、模型更新）所有 AI 功能不可用

## 决策

**使用 `llama_index.llms.*` 作为 LLM 抽象层。不引入 `pi-ai` 作为额外依赖。**

### 为什么是 llama_index

`llama_index` 库已提供统一的 LLM 接口，YiAi 在 RAG 引擎中已在使用。将此接口扩展到覆盖所有 LLM 调用可避免引入第二套抽象层。llama_index 的 `llms` 模块支持：
- 通过统一的 `LLM` 类调用不同提供商的模型
- 自定义提供商注册（继承 `CustomLLM` 基类）
- 内置支持 Ollama、OpenAI、Anthropic 等主流提供商
- 与 llama_index 的其他模块（嵌入模型、检索器）无缝集成

## 选项对比

| 方案 | 优势 | 劣势 |
|--------|------|------|
| `llama_index.llms.*` | 已是依赖项；统一接口；支持 Ollama + 云提供商 | 仅限 llama_index 支持的提供商 |
| `pi-ai` | 专为多提供商设计 | 新依赖；第二层抽象；与 llama_index 功能重叠 |
| 直接调用各提供商 API | 无抽象层开销 | 重复的提供商逻辑；无统一接口；错误处理分散 |

### 详细分析各方案

**`pi-ai`**：虽然是专为多提供商设计的工具，但在 YiAi 的场景中引入了不必要的复杂性。`llama_index` 已支持 YiAi 所需的所有 LLM 集成场景——添加 `pi-ai` 会创建两个并行的 LLM 抽象层，增加维护负担而非减轻它。

**直接调用各提供商 API**：代码量最少但维护成本最高。每个提供商需要独立的调用逻辑、错误处理、重试策略。随着提供商增多，代码重复将呈线性增长。更重要的是，没有统一接口会给未来的路由和监控逻辑增加巨大复杂度。

**`llama_index.llms.*`（选择的方案）**：利用已有基础设施，零新依赖。一个接口兼容所有提供商。虽然它限定了可用的提供商范围（必须是 llama_index 支持的），但此范围已经覆盖了所有 YiAi 可能需要的提供商。

## 选择理由

- `llama_index` 已是 RAG 的硬依赖——零新依赖
- `llm` 抽象层支持自定义提供商注册
- 避免维护两套并行 LLM 抽象层的复杂性
- 所有 LLM 调用通过同一接口，统一了日志、监控和错误处理

## 后果

### 正面影响
- 所有 LLM 调用通过 `llama_index.llms` 接口
- 添加新提供商只需在 llama_index 中注册
- 路由逻辑集中在 `services/ai/` 下
- URL 提供商通过 `config.yaml` 配置，可热切换

### 负面影响
- 提供商选择受限于 llama_index 的支持范围
- 如果 llama_index 对某提供商的支持滞后或不完善，无法直接绕过

### 缓解措施
- 通过 `CustomLLM` 基类可自行实现任何提供商的集成
- 如果未来 llama_index 不再满足需求，迁移到其他方案的变化是集中在一个抽象层上的，而非分散在多处

## 适用场景

- 评估新 LLM 提供商接入时的架构参考
- 理解 YiAi 中 LLM 调用路径的单一入口设计
- 供应商锁定风险评估

## 反模式

- **为每个提供商引入不同的调用库。** 不同提供商用不同的 SDK（Ollama 用 ollama-python、OpenAI 用 openai-python 等），虽看似灵活，但导致错误处理、日志、重试逻辑的重复和不一致。通过统一接口调用避免了这一问题
- **过度抽象。** 在已有的 llama_index 抽象层之上再加一层自定义抽象（如一个 `UniversalLLM` 包装器），增加了调用链深度而无实际价值。直接使用 `llama_index.llms` 已足够