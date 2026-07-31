# AI 平台 / AI Platform

收录 AI 平台层技术、模型服务、推理引擎、平台工程实践。

## 收录范围

- 主流大模型对比（能力、定价、上下文）
- 推理服务（vLLM、TGI、SGLang、TensorRT-LLM）
- 模型网关与路由（LiteLLM、Portkey）
- 向量库与检索（Qdrant、Milvus、pgvector）
- AI 网关与可观测（LangSmith、Langfuse、Helicone）

## 文件类型与命名

- `{主题}-summary.md`：平台技术摘要
- `{引擎/工具}-comparison.md`：对比文档
- 命名采用英文 kebab-case

## Frontmatter 模板

```yaml
---
title: 某平台技术
tags: [AI 平台, 主题]
category: tech/ai-platform
created: YYYY-MM-DD
updated: YYYY-MM-DD
source: <链接或 internal>
type: summary
status: stable
last_verified: YYYY-MM-DD
---
```

## 写作推荐结构

1. 技术背景与解决的问题
2. 核心概念与组件
3. 主流方案对比表
4. 选型决策树
5. 部署与运维要点
6. 本团队落地情况

## 已收录

- `llm-comparison-summary.md` — 主流大语言模型对比
- `inference-engine-comparison-summary.md` — 推理引擎对比（vLLM / TGI / SGLang / TensorRT-LLM）
- `vector-db-comparison-summary.md` — 向量库对比（Qdrant / Milvus / pgvector / Weaviate）
- `llm-observability-comparison-summary.md` — LLM 可观测平台对比（LangSmith / Langfuse / Helicone）
- `embedding-model-selection-summary.md` — Embedding 模型选型

## 待收录

- AI 网关设计
- 多模态模型服务
