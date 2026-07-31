# AI 专项方法论 / AI-Specific Methodology

收录 AI 产品研发专用的方法论：Prompt 工程、RAG 设计、Agent 架构、评估体系。

## 收录范围

- Prompt 工程最佳实践
- RAG 检索增强生成设计模式
- Agent 架构模式（ReAct、Plan-Execute、Reflexion）
- 模型评估方法（人工标注、自动评测、红队测试）
- 幻觉抑制、安全护栏、对齐策略

## 文件类型与命名

- `{主题}-summary.md`：方法论摘要
- `{主题}-template.md`：可复用模板
- 命名采用英文 kebab-case

## Frontmatter 模板

```yaml
---
title: 某方法论
tags: [AI, 方法论, 主题]
category: methodology/ai-specific
created: YYYY-MM-DD
updated: YYYY-MM-DD
source: <链接或 internal>
type: summary
status: stable
---
```

## 写作推荐结构

1. 方法论定义与适用场景
2. 关键概念与术语
3. 步骤 / 模式拆解
4. 反模式与陷阱
5. 评估指标
6. 本团队落地案例

## 已收录

- `prompt-engineering-guide-summary.md` — Prompt Engineering 最佳实践指南
- `rag-design-patterns-summary.md` — RAG 设计模式（chunking / reranking / hybrid search）
- `agent-architecture-patterns-summary.md` — Agent 架构模式（ReAct / Plan-Execute / Reflexion / Tool Use）
- `llm-evaluation-methods-summary.md` — LLM 评估方法（HELM / MT-Bench / 自洽性 / 人工标注）
- `hallucination-mitigation-summary.md` — 幻觉检测与抑制
- `prompt-injection-defense-summary.md` — Prompt 安全与 Prompt Injection 防御
- `model-finetuning-decision-tree-summary.md` — 模型微调决策树（LoRA / QLoRA）

## 待收录
