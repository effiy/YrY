---
title: AI/ML Engineering
tags: [leaf, ai, ml, rag, llm, eval, vector]
category: engineer/ai-ml
created: 2026-08-10
updated: 2026-08-10
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer, aier]
benefit: "工程师在一个地方找到 AI/ML 模式、RAG 架构、LLM 部署和评估方法论"
acceptance_criteria:
  - "RAG 模式和向量索引设计已文档化"
  - "LLM 部署和评估方法论已存在"
  - "包含 AI 内容审核和边界模式"
related:
  - ../INDEX.md
  - ../development/
  - ../reliability/
  - ../../aier/
---

# AI/ML Engineering

> **作为** 工程师，**我希望**找到 AI/ML 模式、RAG 架构和 LLM 部署指南，**以便**构建高效的 AI 系统。

## AI 模式

| 文件 | 描述 |
|---|---|
| [inline-citation-rag.md](./inline-citation-rag.md) | 内联引用 RAG 模式 |
| [vector-index.md](./vector-index.md) | 向量索引设计 |
| [evaluation-driven-development.md](./evaluation-driven-development.md) | 评估驱动开发 |
| [dual-world-boundary.md](./dual-world-boundary.md) | MV3 content/background 边界 |
| [handle-content-moderation.md](./handle-content-moderation.md) | 内容审核模式 |
| [pi-agent-harness-evolution.md](./pi-agent-harness-evolution.md) | Pi Agent 框架演进 |

## LLM 部署

| 文件 | 描述 |
|---|---|
| [vllm-ollama-deployment.md](./vllm-ollama-deployment.md) | vLLM/Ollama 部署 |
| [find-ai-deployment-cases.md](./find-ai-deployment-cases.md) | AI 部署案例发现 |

## 仪表盘

| 文件 | 描述 |
|---|---|
| [dashboard-ml-operations.md](./dashboard-ml-operations.md) | ML 运维仪表盘 |

## 交叉引用

- [../development/](../development/) — 开发工具和 DX
- [../reliability/](../reliability/) — 可观测性和扩缩容
- [../../aier/](../../aier/) — AI 基础、方法论、平台