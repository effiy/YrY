---
title: Prompts
aliases: [prompts, resources-prompts]
tags: [leaf, resources, prompts, moc]
category: ai-engineer/methodology/prompts
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: reference
review_cycle: quarterly
roles: [ai-engineer, product-manager]
benefit: "ai methodology sound"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "file inventory table is complete with one-liner descriptions"
  - "cross-references to related leaves and parent INDEX are present
related:
  - ./brd-generation.md
  - ./rag-system.md
  - ./agent-tool-use.md
  - ./sql-generation.md
  - ./multilingual-translation.md
  - ./weekly-report.md
  - ./code-review.md
  - ../../../engineer/engineering/find-templates-and-prompts.md
  - ../prompt-engineering-guide.md
  - ../../../knowledge-curator/templates/README.md
---

# Prompts

> **As an** AI engineer, **I want to** apply proven AI methodologies and prompt engineering patterns, **so that** I can build reliable and effective AI features.

> Captures reusable Prompt assets: system prompts, task prompts, Agent prompts. All Prompt leaves follow the `knowledge-leaf-template.md` seven-section structure; the body includes "Prompt body + variable description + usage recommendation + Anti-pattern".

## Included scope

- Code review / generation prompts
- Documentation generation (BRD / weekly report)
- RAG system prompts
- Agent role and tool-call prompts
- Multilingual translation prompts (with terminology table)
- Text-to-SQL generation prompts

## Already included

| File | One-liner |
|---|---|
| [brd-generation-prompt.md](./brd-generation.md) | BRD single-section generator (multilingual + terminology table) |
| [rag-system-prompt.md](./rag-system.md) | Answer based on retrieval context, enforce references, prevent fabrication |
| [agent-tool-use-prompt.md](./agent-tool-use.md) | Agent decision loop + tool call + security constraints |
| [sql-generation-prompt.md](./sql-generation.md) | Natural language to read-only SQL (with dialect + terminology table) |
| [multilingual-translation-prompt.md](./multilingual-translation.md) | Terminology-locked multilingual translation |
| [weekly-report-prompt.md](./weekly-report.md) | Weekly report and retrospective draft generation |
| [code-review-prompt.md](./code-review.md) | Code review (basic / enhancement / PR / multilingual variants) |
| [chain-of-thought-prompting.md](./chain-of-thought-prompting.md) | CoT patterns: zero-shot, few-shot, structured, and self-consistency |

## Recommended writing structure

Each Prompt leaf should include:

1. **Summary**: one line describing what this Prompt does
2. **Prompt body**: System Prompt / User Prompt Template (code block, with variable placeholders)
3. **Variable description**: variable name, meaning, example
4. **Usage recommendation**: temperature, max_tokens, few-shot, injection defense, debug notes
5. **Anti-pattern**: failure symptoms + defense
6. **Related**: related Prompts, methodology, templates

## Related leaf

- [../../../knowledge-curator/templates](../../../knowledge-curator/templates) — companion documentation templates
- [../prompt-engineering-guide.md](../prompt-engineering-guide.md) — Prompt engineering methodology
- [../prompt-injection-defense.md](../prompt-injection-defense.md) — Prompt security
- [../agent-architecture-patterns.md](../agent-architecture-patterns.md) — Agent architecture
- [../../../engineer/projects/yiai](../../../engineer/projects/yiai) — BRD agent implementation
- [../../../engineer/engineering/find-templates-and-prompts.md](../../../engineer/engineering/find-templates-and-prompts.md) — scenario entry
