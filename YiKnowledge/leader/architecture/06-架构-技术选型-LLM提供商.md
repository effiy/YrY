---
title: "Tech Selection: LLM Provider"
tags: [tech-selection, llm, yiai, provider]
category: leader/architecture
created: 2026-08-21
updated: 2026-09-10
source: internal
type: reference
status: stable
lifecycle: active
review_cycle: quarterly
roles: [leader]
benefit: "YiAi 中 LLM 提供商选择的标准和理由，为未来提供商评估提供决策框架"
related:
  - ../decisions/yiai/route-llm-traffic-across-providers.md
  - ../decisions/yiai/llm-multi-provider-rollout.md
---

# 技术选型：LLM 提供商

> **背景**：YiAi 需要 LLM 推理能力来支撑聊天、RAG、agent 和代码审查等场景。选择正确的提供商策略直接影响推理质量、延迟、成本和系统灵活性。

## 当前提供商

| 提供商 | 角色 | 接口 |
|----------|------|-----------|
| Ollama（本地）| 默认推理引擎 | `llama_index.llms.ollama` |
| Qwen3-Coder（Ollama）| Agent 执行器回退方案 | 同 Ollama |
| 云提供商（规划中）| 横向扩展、专业模型 | `llama_index.llms.*` |

### 提供商角色分配逻辑

- **Ollama（默认）**：处理常规聊天、RAG 查询等对延迟不敏感的请求。成本为零（本地 GPU），适合离线开发
- **Qwen3-Coder**：Agent 模式的代码生成回退方案。当默认模型无法完成任务时切换到此模型
- **云 API 提供商（规划中）**：处理对模型能力有更高要求的请求（如复杂推理、多语言翻译），或作为 Ollama 不可用时的灾备方案

## 选择标准

1. **llama_index 兼容性** —— 必须被 `llama_index.llms` 支持（不引入新的抽象层）。YiAi 的 RAG 引擎已深度绑定 llama_index，任何新的 LLM 提供商都需通过此接口接入
2. **工具调用 (Tool Calling) 支持** —— Agent 模式需要原生的工具调用能力。模型必须能正确理解和输出结构化工具调用格式
3. **中文语言质量** —— 主要用户群体为中文用户，中文理解和生成质量是基本要求
4. **延迟** —— 聊天 < 3 秒，Agent 工具调用 < 10 秒。超出此范围将影响用户体验
5. **成本** —— 本地 Ollama 免费；云提供商按 $/百万 token 评估

### 选择标准权重

| 标准 | 权重 | 说明 |
|---|---|---|
| llama_index 兼容性 | 门槛条件 | 不满足则直接排除——不能为单一提供商引入新的抽象层 |
| 工具调用支持 | 门槛条件 | Agent 模式是核心功能，无工具调用的模型只能用于聊天 |
| 中文质量 | 30% | 用户群的语言需求 |
| 延迟 | 30% | 用户体验直接影响 |
| 成本 | 25% | 本地免费 vs 云 API 按量付费 |
| 社区/文档 | 15% | 集成和排查问题的易用性 |

## 决策

**使用 `llama_index.llms.*` 作为统一的 LLM 接口。** Ollama 是当前默认提供商。多提供商路由通过 `config.yaml` 配置驱动。

### 决策理由

- `llama_index` 已是 RAG 的核心依赖，无需新增依赖
- 其 `llm` 抽象层支持自定义提供商注册
- 避免了维护两套并行 LLM 抽象层的复杂性
- 所有 LLM 调用的单一入口路径简化了监控和日志

### 配置结构示例

```yaml
# config.yaml
llm:
  default_provider: ollama
  providers:
    ollama:
      base_url: http://localhost:11434
      model: qwen2.5
      timeout: 30
    cloud_provider_name:
      api_key: ${API_KEY}
      model: model-name
      timeout: 15
  routing:
    rules:
      - condition: "request.type == 'agent'"
        provider: ollama
        fallback: cloud_provider_name
```

## 适用场景

- 评估新 LLM 提供商时作为评估清单
- 向新成员解释 YiAi 的 LLM 集成策略
- 为云 API 提供商引入决策提供参考框架

## 常见问题

**Q: 为什么不直接使用 OpenAI 兼容 API，而要绑定 llama_index？**
A: llama_index 是 YiAi RAG 引擎的核心组件。YiAi 需要的不只是 LLM 调用，还包括嵌入模型管理、检索器编排等功能——这些都是 llama_index 内置的。统一的抽象层比多套独立 API 更容易维护。

**Q: 如果某个提供商的 llama_index 集成不完善怎么办？**
A: llama_index 支持自定义 LLM 类注册。即使某提供商没有官方集成，可以通过实现 `CustomLLM` 接口来接入。

## 反模式

- **为每个场景选择不同接口。** 聊天用 OpenAI SDK、RAG 用 llama_index、Agent 用第三方库——这会创建多个调用路径，增加维护成本和不一致的错误处理。统一接口（`llama_index.llms.*`）避免了这个问题
- **忽视提供商锁定风险。** 仅支持 Ollama 意味着本地 GPU 必须始终可用。多提供商策略（通过 `config.yaml`）降低了单点依赖
- **仅按成本排序选择。** 最便宜的提供商不一定是总成本最低的。需同时考虑集成工作、维护负担和故障切换能力

## 审查计划

每季度审查：检查是否有新提供商值得评估，或现有提供商是否需要调整权重。