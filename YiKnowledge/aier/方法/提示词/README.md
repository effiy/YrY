---
title: Prompts
aliases: [prompts, resources-prompts]
tags: [leaf, resources, prompts, moc]
category: aier/方法/提示词
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: reference
review_cycle: quarterly
roles: [aier, producter]
benefit: "ai methodology sound"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "file inventory table is complete with one-liner descriptions"
  - cross-references to related leaves and parent INDEX are present
related:
  - ./BRD生成.md
  - ./RAG系统.md
  - ./智能体工具调用.md
  - ./SQL生成.md
  - ./多语言翻译.md
  - ./周报生成.md
  - ./代码审查.md
  - ../../../engineer/build/find-templates-and-prompts.md
  - ../提示词工程.md
  - ../../../curator/templates/README.md
---

# Prompts

> **作为** AI 工程师，**我希望**应用经过验证的 AI 方法论和提示词工程模式，**以便**构建可靠有效的 AI 功能。

> 收集可复用的 Prompt 资产：系统提示词、任务提示词、Agent 提示词。所有 Prompt 叶子遵循 `knowledge-leaf-template.md` 七段式结构；正文包含「Prompt 正文 + 变量说明 + 使用建议 + 反模式」。

## 包含范围

- 代码审查/生成提示词
- 文档生成（BRD / 周报）
- RAG 系统提示词
- Agent 角色和工具调用提示词
- 多语言翻译提示词（含术语表）
- Text-to-SQL 生成提示词

## 已包含

| 文件 | 一句话描述 |
|---|---|
| [BRD生成.md](./BRD生成.md) | BRD 单章节生成器（多语言 + 术语表） |
| [RAG系统.md](./RAG系统.md) | 基于检索上下文回答，强制引用，防止编造 |
| [智能体工具调用.md](./智能体工具调用.md) | Agent 决策循环 + 工具调用 + 安全约束 |
| [SQL生成.md](./SQL生成.md) | 自然语言转只读 SQL（含方言 + 术语表） |
| [多语言翻译.md](./多语言翻译.md) | 术语锁定的多语言翻译 |
| [周报生成.md](./周报生成.md) | 周报和复盘草稿生成 |
| [代码审查.md](./代码审查.md) | 代码审查（基础/增强/PR/多语言变体） |
| [思维链.md](./思维链.md) | CoT 模式：zero-shot、few-shot、结构化、自一致性 |

## 推荐撰写结构

每个 Prompt 叶子应包含：

1. **摘要**：一句话描述此 Prompt 做什么
2. **Prompt 正文**：System Prompt / User Prompt 模板（代码块，含变量占位符）
3. **变量说明**：变量名、含义、示例
4. **使用建议**：temperature、max_tokens、few-shot、注入防御、调试注意事项
5. **反模式**：失败症状 + 防御
6. **相关**：相关 Prompts、方法论、模板

## 相关叶子

- [../../../curator/templates](../../../curator/templates) — 配套文档模板
- [../提示词工程.md](../提示词工程.md) — 提示词工程方法论
- [../提示词注入防御.md](../提示词注入防御.md) — 提示词安全
- [../智能体架构模式.md](../智能体架构模式.md) — Agent 架构
- [../../../engineer/learn/projects/yiai](../../../engineer/learn/projects/yiai) — BRD Agent 实现
- [../../../engineer/build/find-templates-and-prompts.md](../../../engineer/build/find-templates-and-prompts.md) — 场景入口