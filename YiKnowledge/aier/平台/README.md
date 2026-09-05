---
title: AI Platform Directory
tags: [leaf, tech, ai-platform]
category: aier/平台
created: 2026-08-03
updated: 2026-08-10
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: monthly
roles: [aier]
benefit: "platform reliable"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "file inventory table is complete with one-liner descriptions"
  - cross-references to related leaves and parent INDEX are present
related:
  - ../../aier/机器学习/find-ai-deployment-cases.md
  - ../基础/README.md
  - ../方法/README.md
  - ../../engineer/build/vllm-ollama-deployment.md
---

# AI Platform Directory

> **作为** AI 工程师，**我希望**理解 AI 平台选项和部署模式，**以便**为 AI 工作负载选择合适的基础设施。

覆盖 AI 平台层技术、模型服务、推理引擎和平台工程实践。

## 范围

- 主流大模型对比（能力、定价、上下文）
- 推理服务（vLLM、TGI、SGLang、TensorRT-LLM）
- 模型网关和路由（LiteLLM、Portkey）
- 向量数据库和检索（Qdrant、Milvus、pgvector）
- AI 网关和可观测性（LangSmith、Langfuse、Helicone）
- Embedding 模型选型

## 文件类型和命名

- `{topic}-summary.md`：平台技术摘要
- `{engine/tool}-comparison.md`：对比文档
- 命名使用英文 kebab-case

## Frontmatter 模板

```yaml
---
title: some platform technology
tags: [AI Platform, topic]
created: YYYY-MM-DD
updated: YYYY-MM-DD
source: <link or internal>
type: summary
lifecycle: active
last_verified: YYYY-MM-DD
review_cycle: monthly
related:
  - ./ai-workbench-user-guide.md
  - ./dashboard-ai-performance.md
  - ./dashboard-llm-cost.md
  - ../README.md
  - ../INDEX.md
---
```

## 推荐结构

1. 技术背景和解决的问题
2. 核心概念和组件
3. 主流方案对比表
4. 选型决策树
5. 部署和运维要点
6. 内部团队落地情况

## 已包含

### 平台工具与对比

- `llm-comparison.md` — 主流大语言模型对比
- `inference-engine-comparison.md` — 推理引擎对比（vLLM / TGI / SGLang / TensorRT-LLM）
- `vector-db-comparison.md` — 向量数据库对比（Qdrant / Milvus / pgvector / Weaviate）
- `llm-observability-comparison.md` — LLM 可观测性平台对比（LangSmith / Langfuse / Helicone）
- `embedding-model-selection.md` — Embedding 模型选型
- `pick-a-vector-database.md` — 向量数据库选型指南
- `pick-an-llm-provider.md` — LLM 提供商选型指南
- `evaluate-an-llm-app.md` — LLM 应用评估

### 平台架构

- `ai-gateway-design.md` — 多提供商 LLM 路由的 AI 网关架构
- `ai-workbench-user-guide.md` — AI 桌面工作台使用指南摘要
- `multimodal-model-services.md` — 多模态 AI 模型部署
- `model-routing-strategy.md` — LLM 请求路由策略
- `llama-index-evolution.md` — LlamaIndex 框架演进
- `orchestrate-agents-with-adk-and-agents-cli.md` — 使用 ADK 和 Agents CLI 进行 Agent 编排

## 相关叶子

- [../foundations](../基础) — 基础理论
- [../methodology](../方法) — 方法论
- [../../engineer/build/vllm-ollama-deployment.md](../../engineer/build/vllm-ollama-deployment.md) — 部署
- [../data/](../data/) — 数据维度
- [../../aier/机器学习/find-ai-deployment-cases.md](../../aier/机器学习/find-ai-deployment-cases.md) — 场景入口