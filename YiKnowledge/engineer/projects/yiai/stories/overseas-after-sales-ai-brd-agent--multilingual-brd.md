---
key: sc_multilingual_brd
name: multilingual BRD generated
status: planning
priority: p1
createdAt: 1753920000000
updatedAt: 1753920000000
title: multilingual BRD generated (Scene)
category: engineer/projects/yiai/stories/overseas-after-sales-ai-brd-agent/multilingual-brd
source: internal
type: original
lifecycle: active
review_cycle: quarterly
roles:
- engineer
benefit: project context preserved
acceptance_criteria:
  - "source URL or path is preserved in frontmatter"
  - "content is unmodified from the original source"
  - "retrieval date is recorded in last_verified"
related:
- ../story.md
- ../../../../../../new-hire/onboarding/yiai--onboarding.md
tacit: false
---

# multilingual BRD generated

> **As an** engineer, **I want to** scene, **so that** project context preserved.

## description (description)

The agent translates and adapts the already-generated BRD to the target language version according to the selected target country/language, preserving all structured fields and tables, and outputs a BRD that meets local compliance requirements.

## trigger condition (trigger)

The user clicks "generate multilingual version" on the story detail page and selects the target country/language.

## prerequisites (prerequisites)

- The story already has a BRD draft
- The target language is within the supported list (zh-CN / en / de / fr / es / it etc.)
- The user has edit permission for the story

## expected result (expectedResult)

- The target language BRD is structurally consistent with the original language (section, table, field mapped one-to-one)
- Involving country, brand, and compliance clauses are localized per target country
- The generation record is written into the story's attachments field
- When switching languages, the already-generated version is loaded with zero latency

## steps (steps)

| Order | Action | Description |
|-------|--------|-------------|
| 1 | Given | The story already has a Chinese BRD draft, user on detail page |
| 2 | When | User clicks "generate multilingual version" and selects target country Germany / en |
| 3 | Then | Frontend calls YiAi multilingual generation interface |
| 4 | And | LLM translates each section by streaming in the target language |
| 5 | Then | After translation completes, writes into story.attachments |
| 6 | And | Detail page multilingual switcher shows new version entry |
| 7 | When | User switches to en version |
| 8 | Then | Detail page loads and displays en version BRD |

## tags (tags)

- AI
- BRD
- i18n
- LLM

## Related files (files)

- filePath: YiVad/src/views/story/index.vue
- filePath: YiVad/src/api/modules/story.ts
- filePath: YiAi/src/domain/ai/chat.py
