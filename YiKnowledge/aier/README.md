---
title: AI Engineer
aliases: [tech category, technology knowledge]
tags: [leaf, aier, ai, machine-learning]
category: aier
created: 2026-08-03
updated: 2026-09-10
last_verified: 2026-09-10
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [aier]
benefit: "AI 工程师查找 AI 专属知识：基础理论、方法论、平台工具和 ML 实践"
acceptance_criteria:
  - "叶子目录的范围有清晰边界"
  - "存在到相关叶子和父级 INDEX 的交叉引用"
related:
  - ./INDEX.md
  - ../INDEX.md
---

# AI Engineer（AI 工程师）

> **流水线层：AI 赋能（跨领域）** — 用 AI 专属知识加速每个流水线阶段。
>
> **作为** AI 工程师，**我希望**浏览 AI 基础理论、工程方法、平台工具和 ML 实践资源，**以便**构建高效、可靠、可评估的 AI 系统。
>
> Aier 是 AI 专属知识域。不覆盖通用软件工程（→ [engineer/](../engineer/)）、架构决策（→ [leader/](../leader/)）或生产运维（→ [srer/](../srer/)）。

## 子目录

| 域 | 内容 |
|---|---|
| [foundations/](./foundations/) | AI/ML 理论基础：Transformer 架构、注意力机制、MoE、RLHF、模型量化、RAG 设计模式 |
| [methods/](./methods/) | AI 工程方法：提示词工程、Agent 架构模式、LLM 评估、Agent 评估、Harness 插件架构 |
| [methods/prompts/](./methods/prompts/) | 生产级 Prompt 模板：Agent 工具调用、思维链推理、代码审查、多语言翻译、RAG 系统、SQL 生成、周报生成 |
| [platform/](./platform/) | AI 平台选型：LLM 模型对比与选型、Embedding 模型选型、向量数据库选型 |
| [machine-learning/](./machine-learning/) | 传统 ML 模式：分类、聚类、回归、异常检测 — LLM 之外的轻量级方案 |

## 核心观点

- **AI 知识是跨领域的加速层，不是流水线阶段** — aier 为每个角色提供 AI 能力支撑，不处于流水线之间
- **理论指导实践** — Transformer、Attention、MoE 等基础理论直接决定 RAG、Agent 等上层方法的设计选择
- **评估是生产环境守门人** — 任何 AI 功能上线前必须通过双重评估循环（自动评分 + 人工抽检）。没有评估的 AI 系统是不可靠的
- **Prompt 即代码** — Prompt 模板存放在版本控制中，遵循与业务代码相同的评审周期和回归测试流程
- **模型选型每季度重审** — LLM 提供商、推理引擎和向量数据库演进迅速，持续评估是 AI 工程师的核心职责
- **本地优先，云端兜底** — 数据隐私和固定成本优先考虑本地部署，云端 API 作为弹性补充

## 范围

### 在范围内（aier 拥有）
- AI/ML 理论和模型架构（Transformer、Attention、MoE、量化）
- 提示词工程方法论和 Prompt 模板库
- RAG 设计模式、检索策略、分块方案、增强技术
- Agent 架构设计、工具使用模式、韧性模式
- LLM 评估方法论（人工评估、自动指标、LLM-as-Judge、A/B 测试）
- Agent 评估框架（任务完成率、工具准确性、安全合规、效率指标）
- AI 平台选型与推理基础设施
- Embedding 模型和向量数据库选型
- 传统 ML 模式（分类、聚类、回归、异常检测）

### 超出范围（委托给其他角色）
- 通用数据库设计和迁移 → [engineer/ship/](../engineer/ship/)
- 通用 API 设计和系统架构 → [engineer/build/](../engineer/build/)
- AI 产品需求和用户故事 → [producter/discovery/](../producter/discovery/)
- AI 相关架构决策记录（ADR） → [leader/decisions/](../leader/decisions/)
- AI 服务事件响应和可观测性 → [srer/incident-response/](../srer/incident-response/)
- 通用代码质量和测试策略 → [engineer/ship/](../engineer/ship/)

## 跨角色引用

- [INDEX.md](./INDEX.md) — 此分类的完整文件索引
- [../engineer/build/](../engineer/build/) — 工程工具和模式
- [../leader/decisions/yiai/](../leader/decisions/yiai/) — YiAi 架构决策记录
- [../srer/observability/](../srer/observability/) — 生产可观测性