---
title: AI Engineer
aliases: [tech category, technology knowledge]
tags: [leaf, aier, ai, machine-learning]
category: aier
created: 2026-08-03
updated: 2026-08-14
last_verified: 2026-08-14
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [aier]
benefit: "AI 工程师查找 AI 专属知识：基础、方法、平台和 ML"
acceptance_criteria:
  - "叶子目录的范围有清晰边界"
  - "存在到相关叶子和父级 INDEX 的交叉引用"
related:
  - ./INDEX.md
  - ../INDEX.md
---

# AI Engineer

> **流水线层：AI 赋能（跨领域）** — 用 AI 专属知识加速每个流水线阶段。
>
> **作为** AI 工程师，**我希望**浏览 AI 基础、方法、平台和 ML 资源，**以便**构建高效的 AI 系统。
>
> Aier 是 AI 专属的。不覆盖通用软件工程（→ [engineer/](../engineer/)）、架构决策（→ [leader/](../leader/)）或生产运维（→ [srer/](../srer/)）。

## 子目录

| 域 | 内容 |
|---|---|
| [基础/](./基础/) | AI/ML 理论：transformer、attention、MoE、RLHF、量化 |
| [方法/](./方法/) | 提示词工程、RAG 模式、Agent 架构、评估、安全 |
| [方法/提示词/](./方法/提示词/) | 提示词模板：Agent 工具调用、代码审查、SQL 生成 |
| [平台/](./平台/) | AI 平台：LLM 对比、推理引擎、向量数据库、AI 网关 |
| [机器学习/](./机器学习/) | ML 运维：模型部署、评估基础设施 |

## 核心观点

- **AI 知识是跨领域的，不是流水线阶段** — aier 加速每个阶段，不处于阶段之间
- **理论指导实践** — 基础（Transformer、Attention、MoE）支撑方法（RAG、Agent）和平台选择
- **评估是生产环境守门人** — 任何 AI 功能上线前必须通过双循环评估（自动 + 人工）
- **提示词即代码** — 提示词模板存放在版本控制中，遵循与代码相同的评审周期
- **平台决策每季度重审** — LLM 提供商、推理引擎和向量数据库演进迅速

## 范围

### 在范围内（aier 拥有）
- AI/ML 理论和模型架构
- 提示词工程和提示词模板
- RAG 设计模式和架构
- Agent 架构和工具使用模式
- LLM 评估方法论和红队测试
- AI 平台和推理基础设施
- ML 运维和模型部署

### 超出范围（委托给其他角色）
- 通用数据库设计和迁移 → [engineer/ship/](../engineer/ship/)
- 通用 API 设计和系统架构 → [engineer/build/](../engineer/build/)
- AI 产品需求 → [producter/discovery/](../producter/discovery/)
- AI 架构决策（ADR） → [leader/decisions/](../leader/decisions/)
- AI 服务事件响应 → [srer/incident-response/](../srer/incident-response/)
- 通用代码质量和测试 → [engineer/ship/](../engineer/ship/)

## 跨角色引用

- [INDEX.md](./INDEX.md) — 此分类的完整文件列表
- [../engineer/build/](../engineer/build/) — 工程工具和模式
- [../leader/decisions/yiai/](../leader/decisions/yiai/) — YiAi ADR
- [../srer/observability/](../srer/observability/) — 生产可观测性