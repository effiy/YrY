# 提示词 / Prompts

收录可复用的 Prompt 资产：系统提示词、任务提示词、Agent 提示词、Prompt 模板。

## 收录范围

- 代码审查 / 生成 Prompt
- 文档生成（PRD / BRD / 周报）
- RAG 系统提示词
- Agent 角色与工具调用 Prompt
- 多语言、多区域适配 Prompt

## 文件类型与命名

- `{用途}-prompt.md`：可复用 Prompt
- `{用途}-template.md`：变量化模板
- 命名采用英文 kebab-case

## Frontmatter 模板

```yaml
---
title: 某用途 Prompt
tags: [Prompt, 用途]
category: resources/prompts
created: YYYY-MM-DD
updated: YYYY-MM-DD
source: internal
type: prompt
status: stable
---
```

## 写作推荐结构

1. 适用场景与版本
2. 输入变量说明
3. 系统提示词正文（代码块）
4. 用户提示词模板（含变量占位符）
5. 期望输出格式
6. 调试笔记（temperature、few-shot、防注入）

## 已收录

- `code-review-prompt.md` — 代码审查 Prompt
- `brd-generation-prompt.md` — BRD 章节生成 Prompt
- `rag-system-prompt.md` — RAG 系统提示词
- `weekly-report-prompt.md` — 周报 / 复盘生成 Prompt
- `multilingual-translation-prompt.md` — 多语言翻译 Prompt（含术语表）
- `agent-tool-use-prompt.md` — Agent 工具调用 Prompt
- `sql-generation-prompt.md` — Text-to-SQL 生成 Prompt

## 待收录
