---
title: projects/ INDEX
tags:
- projects
- index
- MOC
category: engineer/projects
created: 2026-08-03
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: index
status: stable
lifecycle: reference
review_cycle: quarterly
roles:
- engineer
- new-hire
benefit: project context preserved
acceptance_criteria:
  - "all entries in the index map to existing files"
  - "entries are grouped by logical category or domain"
  - "one-liner descriptions are specific enough to disambiguate"
related:
- ./README.md
- ../../new-hire/onboarding/yiai/onboarding.md
- ../../new-hire/onboarding/yipet/onboarding.md
- ../../new-hire/onboarding/yivad/onboarding.md
- ../../new-hire/onboarding/handoff-project.md
---

# projects/ INDEX — Project Index

> **As an** engineer, **I want to** navigate project-level engineering docs, stories, and BRDs, **so that** project context is preserved.

PARA: Projects. Each project contains stories/ (business content, BRD driven) + engineering/ (engineering docs mirror) + onboarding.md (new-hire onboarding).

## Project index table

| Project | Positioning | Port | Architecture overview | Functional modules | Dev standards | PM | Onboarding | stories/ | engineering/ |
|---|---|---|---|---|---|---|---|---|---|
| [YiAi](./yiai/) | AI + BRD agent (FastAPI backend) | 10086 | [arch](./yiai/architecture.md) | [modules](./yiai/functional-modules.md) | [standards](./yiai/dev-standards.md) | [pm](../../product-manager/projects/yiai/project-management.md) | [onboarding.md](../../new-hire/onboarding/yiai/onboarding.md) | [2 stories / 5 scenes](./yiai/stories/) | [claude](./yiai/engineering/claude.md) · [readme](./yiai/engineering/readme.md) · [adr-multi-provider](../../tech-lead/decisions/yiai/route-llm-traffic-across-providers.md) · [adr-llm-rollout](../../tech-lead/decisions/yiai/llm-multi-provider-rollout.md) · [adr-pytest](../../tech-lead/decisions/yiai/pytest-introduction.md) · [adr-rag-eval](../../tech-lead/decisions/yiai/rag-evaluation-infra.md) · [adr-brd-agent](../../tech-lead/decisions/yiai/brd-agent-launch.md) · [adr-knowledge-watcher](../../tech-lead/decisions/yiai/knowledge-watcher-deployment.md) |
| [YiPet](./yipet/) | Browser extension + desktop app (MV3) | — | [arch](./yipet/architecture.md) | [modules](./yipet/functional-modules.md) | [standards](./yipet/dev-standards.md) | [pm](../../product-manager/projects/yipet/project-management.md) | [onboarding.md](../../new-hire/onboarding/yipet/onboarding.md) | _none yet_ | [claude](./yipet/engineering/claude.md) · [readme](./yipet/engineering/readme.md) · [adr-biome](../../tech-lead/decisions/yipet/biome-lint-format.md) · [adr-mv3](../../tech-lead/decisions/yipet/chrome-manifest-dual-world-boundary.md) · [adr-aicr-port](../../tech-lead/decisions/yipet/aicr-port-rollout.md) |
| [YiVad](./yivad/) | Main Web app (Vue 3.5) | 8848 | [arch](./yivad/architecture.md) | [modules](./yivad/functional-modules.md) | [standards](./yivad/dev-standards.md) | [pm](../../product-manager/projects/yivad/project-management.md) | [onboarding.md](../../new-hire/onboarding/yivad/onboarding.md) | _none yet_ | [claude](./yivad/engineering/claude.md) · [readme](./yivad/engineering/readme.md) · [changelog](./yivad/engineering/changelog.md) · [adr-vitest](../../tech-lead/decisions/yivad/vitest-introduction.md) · [adr-vitest-rollout](../../tech-lead/decisions/yivad/vitest-rollout.md) · [adr-aicr](../../tech-lead/decisions/yivad/aicr-phase-port.md) |

## YiAi stories detail

| Story | Scenes |
|---|---|
| [ai-chat-function](./yiai/stories/ai-chat-function/) | [user-send-message](./yiai/stories/ai-chat-function/user-send-message/scene.md) · [conversation-history-management](./yiai/stories/ai-chat-function/conversation-history-management/scene.md) |
| [overseas-after-sales-ai-brd-agent](./yiai/stories/overseas-after-sales-ai-brd-agent/) | [brd-draft-generation](./yiai/stories/overseas-after-sales-ai-brd-agent/brd-draft-generation/scene.md) · [multilingual-brd](./yiai/stories/overseas-after-sales-ai-brd-agent/multilingual-brd/scene.md) · [brd-approval-flow](./yiai/stories/overseas-after-sales-ai-brd-agent/brd-approval-flow/scene.md) |

## YiVad additional references

- [rag-system-pages-reference.md](./yivad/rag-system-pages-reference.md) — RAG five-page menu + UI quick reference
- [manage-menu-catalog.md](./yivad/manage-menu-catalog.md) — menu catalog management: data model, management UI, CRUD operations, static vs dynamic routes

## Frequently referenced

- [YiAi onboarding](../../new-hire/onboarding/yiai/onboarding.md) — AI + BRD agent onboarding
- [YiVad onboarding](../../new-hire/onboarding/yivad/onboarding.md) — main Web app onboarding
- [YiPet onboarding](../../new-hire/onboarding/yipet/onboarding.md) — browser extension onboarding

## Cross-category exits

- [Project handoff](../../new-hire/onboarding/handoff-project.md)
- [AI landing cases](../../ai-engineer/foundations/README.md) — YiAi deployment
- [Onboarding templates](../../new-hire/onboarding/) — new-hire onboarding

## Category explanation

The division between stories/ and engineering/, design principles, templates and sync conventions, see [README.md](./README.md).
