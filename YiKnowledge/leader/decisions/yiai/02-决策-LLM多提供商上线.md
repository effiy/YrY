---
title: "ADR: LLM Multi-Provider Rollout Plan"
tags: [adr, yiai, llm, rollout, multi-provider]
category: leader/decisions/yiai
created: 2026-08-03
updated: 2026-09-10
last_verified: 2026-08-03
source: internal
type: decision
status: accepted
lifecycle: in-progress
review_cycle: quarterly
roles: [leader, engineer]
benefit: "理解 LLM 多提供商支持的 5 阶段渐进式上线计划，确保在不破坏现有功能的前提下安全引入"
acceptance_criteria:
  - "5 个阶段清晰定义并附有前置条件"
related:
  - ./route-llm-traffic-across-providers.md
  - ../../../engineer/learn/projects/yiai/README.md
---

# ADR: LLM 多提供商上线计划

> **状态**：已接受 (2026-08-03) — 5 阶段渐进式上线进行中
>
> 此 ADR 定义了多提供商 LLM 支持的上线策略。关于多提供商路由的架构决策，请参阅 [route-llm-traffic-across-providers.md](./route-llm-traffic-across-providers.md)。

## 上下文

在决定使用 `llama_index.llms.*` 进行多提供商 LLM 路由后，需要一个渐进式上线计划，以避免破坏现有的基于 Ollama 的聊天和 RAG 管线。直接全量切换到多提供商架构风险太大——如果路由逻辑有 bug，所有 AI 功能将同时不可用。

**核心风险**：
- 路由逻辑错误导致所有 LLM 请求失败
- 云提供商配置错误导致 API 调用失败
- 新模式与现有 Ollama 模式质量不一致
- 前端模型选择器 UI 变更混淆现有用户

## 决策

**采用 5 阶段渐进式上线策略，每个阶段可独立验证、可独立回滚：**

### 阶段 1：供应链加固（前置条件）
**目标**：确保所有 LLM 调用经过单一的、可配置的路径。不存在硬编码的提供商引用。

**具体工作**：
- 审查所有 `services/ai/` 和 `domain/ai/` 中的 LLM 调用点
- 消除任何硬编码的 `Ollama` 引用，替换为从 `config.yaml` 读取
- 统一 LLM 调用入口为 `get_llm()` 工厂函数

**验收标准**：修改 `config.yaml` 中的 `llm.default_provider` 值应能切换 LLM 提供商，无需修改代码。

### 阶段 2：路由器实现
**目标**：构建带故障切换逻辑的提供商路由器。配置驱动的提供商选择。

**具体工作**：
- 实现 `LLMRouter` 类（在 `services/ai/` 下）
- 支持主提供商 + 回退提供商的配置
- 实现健康检查：路由器定期检查各提供商的可用性
- 单元测试覆盖路由逻辑和故障切换场景

**验收标准**：手动关闭 Ollama 服务时，路由器应自动切换到配置的云提供商回退方案。

### 阶段 3：配置渐进上线
**目标**：在功能开关背后添加云提供商配置。默认保持 Ollama。

**具体工作**：
- 在 `config.yaml` 中添加 `llm.providers.<cloud>` 配置节
- 每个云提供商配置通过环境变量注入 API 密钥（不硬编码）
- 默认提供商保持为 `ollama`
- 添加功能开关 `llm.cloud_providers_enabled: false`（默认关闭）

**验收标准**：功能开关关闭时，系统行为与单提供商模式完全一致。

### 阶段 4：RAG 生成侧上线
**目标**：为 RAG 回答生成启用多提供商。嵌入模型保持在 Ollama。

**具体工作**：
- 在 RAG 管线的生成阶段使用路由器选择 LLM
- 嵌入模型保持使用 Ollama（嵌入模型通常不需要切换）
- 在 RAG 评估数据集上对比不同提供商的生成质量
- 设置质量回归告警（faithfulness、answer_relevancy 等指标下降 > 5% 时告警）

**验收标准**：RAG 查询可以使用云提供商生成回答，质量不低于 Ollama 基线。

### 阶段 5：接口 + 前端模型选择器
**目标**：在聊天接口中暴露模型选择能力。为 YiVad aiChat 和 YiPet chat 添加模型选择器。

**具体工作**：
- 聊天接口 `/chat` 和 `/rag/chat` 接受可选的 `model` 参数
- 后端 `/models` 接口返回可用模型列表及其元信息
- YiVad aiChat 页面添加下拉模型选择器
- YiPet chat 窗口添加模型选择器（反映在扩展 UI 中）

**验收标准**：用户可在前端选择模型，后端根据选择路由到不同提供商。

## 选择理由

- 每个阶段可独立验证——阶段 N 的完成不以阶段 N+1 的完成为前提
- Ollama 在整个过程中保持默认——无破坏性变更
- 任何阶段的回滚只需修改配置，无需修改代码
- 硬件依赖（Ollama GPU）不可用时，系统自动降级到云提供商

## 后果

### 正面影响
- 路由器位于 `services/ai/` 下，作为 `llama_index.llms` 上的薄封装
- 提供商配置位于 `config.yaml` 的 `llm.providers` 下
- 前端模型选择器是从后端配置填充的下拉列表
- Ollama 不可用时自动故障切换保障服务连续性

### 负面影响
- 多一层路由逻辑增加调试复杂度
- 云提供商成本不可预测（按量付费 vs 本地免费）
- 不同提供商的模型行为可能不一致（同一提示词可能得到不同质量的回答）

### 风险与缓解
| 风险 | 缓解措施 |
|---|---|
| 云 API 密钥泄露 | 通过环境变量注入，不写入 config.yaml |
| 提供商不可用导致所有请求失败 | 自动回退到 Ollama（本地）|
| 质量不一致导致 RAG 退化 | 阶段 4 的质量回归告警 |

## 反模式

- **一次性全量切换。** 5 个阶段同时上线意味着任何 bug 将同时影响所有 AI 功能。渐进式上线让每个阶段的问题可被隔离和修复
- **隐藏复杂性而不是管理它。** 多提供商路由引入的额外配置和故障模式需要可见的监控和告警，而不是隐藏在代码深处