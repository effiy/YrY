---
title: AI Methodology Directory
tags: [leaf, methodology, ai-specific]
category: aier/方法
created: 2026-08-03
updated: 2026-08-10
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [aier, engineer]
benefit: "ai methodology sound"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "file inventory table is complete with one-liner descriptions"
  - cross-references to related leaves and parent INDEX are present
related:
  - ../../aier/机器学习/find-ai-deployment-cases.md
  - ../../engineer/build/find-templates-and-prompts.md
  - ../../producter/frameworks/README.md
  - ../平台/README.md
  - ./提示词/README.md
---

# AI Methodology Directory

> **作为** AI 工程师，**我希望**应用经过验证的 AI 方法论和提示词工程模式，**以便**构建可靠有效的 AI 功能。

包含 AI 产品研发专属方法论：提示词工程、RAG 设计、Agent 架构、评估体系。

## 目录结构

| 子目录 | 内容 | 文件数 |
|---|---|---|
| `./`（根目录） | 核心方法论：提示词工程、RAG、Agent 模式、评估、安全、微调 | 16 |
| [提示词/](./提示词/) | 可复用提示词模板（Agent 工具调用、代码审查、SQL 等） | 9 |

## 包含范围

- 提示词工程最佳实践
- RAG 检索增强生成设计模式
- Agent 架构模式（ReAct、Plan-Execute、Reflexion）
- 模型评估方法（人工标注、自动评估、红队测试）
- 幻觉缓解、安全护栏、对齐策略
- 模型微调决策树

## 核心方法论文件

- `prompt-engineering-guide.md` — 提示词工程最佳实践指南
- `rag-design-patterns.md` — RAG 设计模式（分块 / 重排序 / 混合搜索）
- `agent-architecture-patterns.md` — Agent 架构模式（ReAct / Plan-Execute / Reflexion / Tool Use）
- `llm-evaluation-methods.md` — LLM 评估方法（HELM / MT-Bench / 自一致性 / 人工标注）
- `hallucination-mitigation.md` — 幻觉检测和缓解
- `prompt-injection-defense.md` — 提示词安全和 Prompt Injection 防御
- `model-finetuning-decision-tree.md` — 模型微调决策树（LoRA / QLoRA）
- `llm-red-teaming.md` — LLM 红队测试方法论
- `ai-alignment-strategy.md` — 企业级 AI 对齐策略
- `agent-evaluation.md` — AI Agent 评估框架
- `multimodal-rag.md` — 多模态 RAG 模式
- `finetune-a-model.md` — 模型微调指南
- `blueprint-an-enterprise-rag.md` — 企业级 RAG 蓝图
- `tune-prompts.md` — 提示词调优方法论
- `run-a-two-loop-llm-evaluation.md` — 双循环 LLM 评估流程
- `agent-harness-plugin-architecture.md` — 基于插件的 Agent 框架架构（Cordis / profiles / 能力接缝 / 事件），映射到 YiAi 的 Agent 循环

## 文件类型和命名

- `{topic}.md`：方法论摘要
- 命名使用英文 kebab-case

## Frontmatter 模板

```yaml
---
title: Some methodology
tags: [AI, methodology, topic]
created: YYYY-MM-DD
updated: YYYY-MM-DD
source: <link or internal>
type: summary
lifecycle: reference
last_verified: YYYY-MM-DD
review_cycle: quarterly
related:
  - ./智能体架构模式.md
  - ../README.md
  - ../INDEX.md
---
```

## 推荐撰写结构

1. 方法论定义和适用场景
2. 关键概念和术语
3. 步骤/模式分解
4. 反模式和陷阱
5. 评估指标
6. 本团队实施案例

## 相关叶子

- [../../producter/frameworks](../../producter/frameworks) — PM 框架
- [../../curator/templates/thinking](../../curator/templates/thinking) — 思维模型
- [../platform](../平台) — 平台技术
- [../foundations](../基础) — 基础理论
- [./prompts](./提示词) — 提示词
- [../../producter/industry-cases](../../producter/strategy) — 实施案例
- [../../engineer/learn/projects/yiai](../../engineer/learn/projects/yiai) — YiAi 实施
- [../../aier/机器学习/find-ai-deployment-cases.md](../../aier/机器学习/find-ai-deployment-cases.md) — 场景入口