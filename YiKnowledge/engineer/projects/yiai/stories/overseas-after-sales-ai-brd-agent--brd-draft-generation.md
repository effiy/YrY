---
key: sc_brd_draft_generation
name: BRD Draft Generation
status: draft
priority: p0
createdAt: 1753920000000
updatedAt: 1753920000000
title: BRD Draft Generation (Scene)
category: engineer/projects/yiai/stories/overseas-after-sales-ai-brd-agent/brd-draft-generation
tags: []
created: 2026-08-07
updated: 2026-08-09source: internal
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

# BRD Draft Generation

> **As an** engineer, **I want to** scene, **so that** project context preserved. 

## description (description)

The business stakeholder inputs a natural-language description of the after-sales business, and the agent calls the LLM to generate a BRD draft conforming to the 12-section template, which can be directly imported into the YiVad story page for editing.

## Trigger conditions (trigger)

The business stakeholder submits the business description at the BRD agent entry point and clicks "Generate BRD".

## Prerequisites (prerequisites)

- The user has logged in to YiVad
- An available Ollama LLM service has been configured
- The business description length meets the minimum threshold (e.g. >= 50 characters)

## Expected result (expectedResult)

- A complete BRD draft is streamed out within 30 seconds
- The output content covers all 12 sections of the BRD template
- On completion, a story record is automatically created and the user is redirected to the detail page
- On generation failure, a clear error tip is shown and the input content is preserved

## Steps (steps)

| Order | Action | Description |
|-------|--------|-------------|
| 1 | Given | The user has logged in to YiVad and entered the BRD agent entry point |
| 2 | When | The user fills in the after-sales business description in the input box and clicks "Generate BRD" |
| 3 | Then | The front end calls the YiAi BRD generation interface, returning as an SSE stream |
| 4 | And | The UI renders each BRD section in real time |
| 5 | Then | On completion, calls create_document to write into the stories collection |
| 6 | And | Automatically jumps to the detail page of that story |
| 7 | When | The LLM returns empty or times out |
| 8 | Then | Shows an error tip and preserves the user input |

## tag (tags)

- AI
- BRD
- LLM
- SSE

## related file (files)

- filePath: YiVad/src/views/story/index.vue
- filePath: YiAi/src/domain/ai/chat.py
- filePath: YiAi/src/services/ai/chat_service.py
