---
title: "AI Engineer 角色索引"
tags: [index, aier, rag, llm, agent, prompt, eval]
category: aier
created: 2026-08-06
updated: 2026-09-15
last_verified: 2026-09-15
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [aier]
benefit: "AI 工程师通过 12 步分级学习路径在 5 个子目录的 19 个知识文件中快速定位 AI 基础、方法、Prompt 模板、平台选型和 ML 实践"
acceptance_criteria:
  - "5 个子目录：foundations(3)、methods(5)、prompts(7)、platform(3)、machine-learning(1)"
  - "12 步学习路径覆盖从 LLM 入门到向量数据库选型"
related:
  - ./README.md
  - ../INDEX.md
---

# AI Engineer — 角色索引

> **流水线层**：AI 赋能（跨领域）— 用 AI 专属知识加速每个流水线阶段。通用软件知识请参考 [engineer/](../engineer/)。

## 子目录

| 域 | 内容 | 文件数 |
|---|---|---|
| [foundations/](./foundations/) | AI/ML 理论基础：Transformer 架构、注意力机制、MoE、量化、RAG 设计模式 | 3 |
| [methods/](./methods/) | AI 工程方法：提示词工程、Agent 架构、LLM/Agent 评估、Harness 插件架构 | 5 |
| [methods/prompts/](./methods/prompts/) | 生产级 Prompt 模板库：7 个场景的完整 Prompt 设计 | 7 |
| [platform/](./platform/) | AI 平台选型：LLM 对比、Embedding 模型、向量数据库 | 3 |
| [machine-learning/](./machine-learning/) | 传统 ML 模式：分类、聚类、回归、异常检测 | 1 |

## 建议学习路径

### 新手入门
1. [01-基础-LLM基础.md](./foundations/01-基础-LLM基础.md) — 理解 Token、上下文窗口、Transformer 核心概念
2. [05-方法-提示词工程.md](./methods/05-方法-提示词工程.md) — 掌握 Prompt 设计基础，立即上手
3. [01-方法-Agent架构模式.md](./methods/01-方法-Agent架构模式.md) — 理解 YiAi Agent 循环的完整架构

### 进阶
4. [02-基础-RAG设计模式.md](./foundations/02-基础-RAG设计模式.md) — 混合检索、分块策略、增强技术
5. [02-平台-LLM对比.md](./platform/02-平台-LLM对比.md) — 模型选型决策框架
6. [04-方法-LLM评估.md](./methods/04-方法-LLM评估.md) — 建立 AI 输出的质量评估体系
7. [02-方法-Agent评估.md](./methods/02-方法-Agent评估.md) — Agent 任务完成率、工具准确性评估

### 全面掌握
8. [03-基础-AI安全与防护.md](./foundations/03-基础-AI安全与防护.md) — 注入攻击、越狱、防护策略
9. [03-方法-Agent-Harness插件架构.md](./methods/03-方法-Agent-Harness插件架构.md) — 理解 Agent 的工具扩展机制
10. [01-平台-Embedding模型选型.md](./platform/01-平台-Embedding模型选型.md) — RAG 检索质量的底层依赖
11. [03-平台-向量数据库选型.md](./platform/03-平台-向量数据库选型.md) — 存储和检索架构选型
12. [01-机器学习-传统机器学习模式.md](./machine-learning/01-机器学习-传统机器学习模式.md) — LLM 之外的轻量级方案

## 跨角色引用

- [../engineer/build/](../engineer/build/) — AI/ML 工程实现模式
- [../leader/decisions/yiai/](../leader/decisions/yiai/) — YiAi 架构决策记录
- [../srer/observability/](../srer/observability/) — AI 服务可观测性